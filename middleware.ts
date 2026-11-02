import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Armazenamento em memória para Rate Limiting na borda (Edge / Node runtime)
const rateLimits = new Map<string, RateLimitRecord>();

// Limpeza periódica de entradas antigas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  rateLimits.forEach((record, key) => {
    if (now > record.resetTime) {
      rateLimits.delete(key);
    }
  });
}, 5 * 60 * 1000);

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

function checkRateLimit(key: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimits.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count++;
  rateLimits.set(key, record);

  return record.count <= limit;
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const ip = getClientIp(req);

  // 1. Anti-Carding: Limita tentativas no endpoint de cartão de crédito (máximo 5 por minuto por IP)
  if (path === '/api/orders/card' && req.method === 'POST') {
    const allowed = checkRateLimit(`card_${ip}`, 5, 60);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Muitas tentativas de pagamento em sequência. Por favor, aguarde um minuto antes de tentar novamente.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // 2. Proteção contra força bruta em Login (máximo 10 tentativas por minuto por IP)
  if (path === '/api/auth/login' && req.method === 'POST') {
    const allowed = checkRateLimit(`login_${ip}`, 10, 60);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Muitas tentativas de login com erro. Aguarde 60 segundos antes de tentar novamente.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // 3. Proteção contra spam de pedidos Pix (máximo 15 por minuto por IP)
  if (path === '/api/orders' && req.method === 'POST') {
    const allowed = checkRateLimit(`orders_${ip}`, 15, 60);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Limite de geração de pedidos atingido. Aguarde alguns instantes.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // 4. Proteção contra injeção massiva de votos no bolão (máximo 10 por minuto por IP)
  if (path === '/api/poll' && req.method === 'POST') {
    const allowed = checkRateLimit(`poll_${ip}`, 10, 60);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Você já enviou vários palpites recentemente. Aguarde um minuto.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/orders/card',
    '/api/orders',
    '/api/auth/login',
    '/api/poll',
  ],
};
