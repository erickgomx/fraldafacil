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
  // 1. Headers autoritativos de borda da infraestrutura (Vercel, Cloudflare, Next.js nativo)
  const edgeIp = req.ip || req.headers.get('x-vercel-ip') || req.headers.get('cf-connecting-ip');
  if (edgeIp && edgeIp.trim() !== '') {
    return edgeIp.trim();
  }

  // 2. Header x-real-ip injetado por proxy reverso local seguro
  const realIp = req.headers.get('x-real-ip');
  if (realIp && realIp.trim() !== '') {
    return realIp.trim();
  }

  // 3. x-forwarded-for: seleciona o ÚLTIMO IP da cadeia (anexado pelo proxy de borda mais próximo),
  // impedindo spoofing do primeiro IP que pode ser manipulado pelo cliente HTTP.
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) {
      return hops[hops.length - 1];
    }
  }

  return '127.0.0.1';
}

function checkInMemoryRateLimit(key: string, limit: number, windowSeconds: number): boolean {
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

/**
 * Rate Limiting Híbrido e Resiliente (Distribuído via Upstash Redis REST ou Memória Local).
 * Se as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN estiverem presentes,
 * realiza controle atômico e sincronizado entre todas as regiões de Edge/Serverless.
 * Caso contrário, executa fallback imediato para memória de borda com zero latência.
 */
async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', `rl:${key}`],
          ['EXPIRE', `rl:${key}`, windowSeconds, 'NX'],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const currentCount = data?.[0]?.result;
        if (typeof currentCount === 'number') {
          return currentCount <= limit;
        }
      }
    } catch {
      // Falha silenciosa com fallback imediato para in-memory
    }
  }

  return checkInMemoryRateLimit(key, limit, windowSeconds);
}

function base64UrlToUint8Array(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Validação criptográfica do JWT na borda (Edge-safe via Web Crypto API nativa).
 * Não depende de módulos do Node e roda tanto no Edge quanto no Node runtime.
 */
async function verifyEdgeJwt(
  token: string,
  secretStr: string
): Promise<{ userId: string; role?: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secretStr),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToUint8Array(signatureB64);

    const isValid = await crypto.subtle.verify('HMAC', key, signature as unknown as BufferSource, data);
    if (!isValid) return null;

    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);

    // Valida expiração do token
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const ip = getClientIp(req);
  const jwtSecret = process.env.JWT_SECRET || 'fralda-facil-dev-secret-key-must-be-changed-in-prod-32chars!';

  // 1. Anti-Carding: Limita tentativas no endpoint de cartão de crédito (máximo 5 por minuto por IP)
  if (path === '/api/orders/card' && req.method === 'POST') {
    const allowed = await checkRateLimit(`card_${ip}`, 5, 60);
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
    const allowed = await checkRateLimit(`login_${ip}`, 10, 60);
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

  // 3. Proteção contra criação massiva de contas (máximo 10 a cada 2 minutos por IP)
  if (path === '/api/auth/register' && req.method === 'POST') {
    const allowed = await checkRateLimit(`reg_${ip}`, 10, 120);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Muitos cadastros recentes originados deste IP. Por favor, aguarde dois minutos.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '120',
          },
        }
      );
    }
  }

  // 4. Proteção contra spam de e-mails em Recuperação de Senha (máximo 5 a cada 3 minutos por IP)
  if (path === '/api/auth/forgot-password' && req.method === 'POST') {
    const allowed = await checkRateLimit(`forgot_${ip}`, 5, 180);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Muitas solicitações de recuperação de senha recentes. Aguarde 3 minutos antes de tentar novamente.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '180',
          },
        }
      );
    }
  }

  // 5. Proteção contra spam de pedidos Pix (máximo 15 por minuto por IP)
  if (path === '/api/orders' && req.method === 'POST') {
    const allowed = await checkRateLimit(`orders_${ip}`, 15, 60);
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

  // 6. Proteção contra polling excessivo de status de pedidos (máximo 30 por minuto por IP)
  // Evita estresse e esgotamento da cota da API de consulta do Mercado Pago
  if (path.startsWith('/api/orders/') && req.method === 'GET') {
    const allowed = await checkRateLimit(`order_status_${ip}`, 30, 60);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Muitas consultas de status em sequência. Aguarde alguns instantes.',
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

  // 7. Proteção contra força bruta em Redefinição de Senha (máximo 5 por minuto por IP)
  if (path === '/api/auth/reset-password' && req.method === 'POST') {
    const allowed = await checkRateLimit(`reset_pwd_${ip}`, 5, 60);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Muitas tentativas de redefinição de senha. Aguarde 60 segundos.',
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

  // 8. Proteção contra injeção massiva de votos no bolão (máximo 10 por minuto por IP)
  if (path === '/api/poll' && req.method === 'POST') {
    const allowed = await checkRateLimit(`poll_${ip}`, 10, 60);
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

  // 9. Proteção Criptográfica de Rota Administrativa (Borda / Edge Level)
  if (path.startsWith('/admin')) {
    const token = req.cookies.get('auth_token')?.value;
    const payload = token ? await verifyEdgeJwt(token, jwtSecret) : null;

    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/painel', req.url));
    }

    // Rate limiting para evitar ataques na área administrativa (60 requisições/min)
    const allowed = await checkRateLimit(`admin_${ip}`, 60, 60);
    if (!allowed) {
      return new NextResponse('Muitas requisições na área administrativa. Aguarde um momento.', {
        status: 429,
      });
    }
  }

  // 10. Proteção Criptográfica de Endpoints de API Administrativos
  if (path.startsWith('/api/admin')) {
    // O endpoint de setup é protegido por chave secreta dedicada (ADMIN_SETUP_SECRET) e rate limiting rigoroso
    if (path === '/api/admin/setup') {
      const allowed = await checkRateLimit(`api_setup_${ip}`, 5, 60);
      if (!allowed) {
        return new NextResponse(
          JSON.stringify({ error: 'Muitas tentativas de configuração. Aguarde 60 segundos.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.next();
    }

    const token = req.cookies.get('auth_token')?.value;
    const payload = token ? await verifyEdgeJwt(token, jwtSecret) : null;

    if (!payload || payload.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Acesso não autorizado.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const allowed = await checkRateLimit(`api_admin_${ip}`, 60, 60);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Limite de requisições excedido.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/orders/card',
    '/api/orders',
    '/api/orders/:path*',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/poll',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
