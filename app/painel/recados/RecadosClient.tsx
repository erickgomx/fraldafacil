'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, MessageCircle, Trash2 } from 'lucide-react';
import { buildThankYouWhatsAppUrl } from '@/lib/share';
import { formatEventDateBR } from '@/lib/validation';

export interface GuestbookMessageRow {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  amount: number;
  paymentMethod: string;
  pollGuess: string | null;
  payerPhone: string | null;
  giftTitle: string;
}

interface RecadosClientProps {
  event: {
    slug: string;
    parentsNames: string;
    babyName: string | null;
    boyName: string | null;
    girlName: string | null;
    revealedGender: string | null;
    eventDate: string;
  };
  initialMessages: GuestbookMessageRow[];
}

function sanitizePdfText(text: string): string {
  return String(text || '')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export default function RecadosClient({ event, initialMessages }: RecadosClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<GuestbookMessageRow[]>(initialMessages);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const handleDeleteMessage = async (messageId: string) => {
    if (
      !confirm(
        'Remover este recado do mural público e do livro de recados? O valor recebido do presente permanece intacto.'
      )
    ) {
      return;
    }

    setDeletingId(messageId);
    setFeedbackError('');
    try {
      const res = await fetch(`/api/events/messages?id=${encodeURIComponent(messageId)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível remover o recado.');
      }
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      router.refresh();
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : 'Erro ao remover recado.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (messages.length === 0 || exportingPdf) return;
    setExportingPdf(true);
    setFeedbackError('');

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;

      const resolvedBabyLabel =
        event.revealedGender === 'BOY'
          ? event.boyName || event.babyName
          : event.revealedGender === 'GIRL'
          ? event.girlName || event.babyName
          : event.boyName && event.girlName
          ? `${event.boyName} ou ${event.girlName}`
          : event.babyName;

      // Cabeçalho editorial na página 1
      doc.setFillColor(250, 247, 242);
      doc.roundedRect(margin, 14, contentWidth, 38, 4, 4, 'F');
      doc.setDrawColor(231, 226, 218);
      doc.roundedRect(margin, 14, contentWidth, 38, 4, 4, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(194, 118, 91);
      doc.text('FRALDA ONLINE  |  RECORDACAO DA FAMILIA', margin + 6, 23);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(28, 25, 23);
      doc.text(
        sanitizePdfText(`Livro de Recados — ${event.parentsNames}`),
        margin + 6,
        32
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(87, 83, 78);
      const subtitleParts: string[] = [];
      if (resolvedBabyLabel) subtitleParts.push(`Bebe: ${sanitizePdfText(resolvedBabyLabel)}`);
      const formattedDate = formatEventDateBR(event.eventDate);
      if (formattedDate) subtitleParts.push(`Data do cha: ${formattedDate}`);
      subtitleParts.push(`${messages.length} recado(s)`);
      doc.text(subtitleParts.join('  •  '), margin + 6, 42);

      let y = 60;

      for (const item of messages) {
        const cleanMsg = sanitizePdfText(item.message) || '(Sem texto)';
        const cleanName = sanitizePdfText(item.name) || 'Convidado';
        const cleanGift = sanitizePdfText(item.giftTitle) || 'Presente';
        const dateLabel = new Date(item.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const guessLabel =
          item.pollGuess === 'BOY'
            ? ' | Palpite: Menino'
            : item.pollGuess === 'GIRL'
            ? ' | Palpite: Menina'
            : '';

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        const msgLines = doc.splitTextToSize(`"${cleanMsg}"`, contentWidth - 14) as string[];
        const cardHeight = 14 + msgLines.length * 4.8 + 8;

        if (y + cardHeight > pageHeight - 20) {
          doc.addPage();
          y = 18;
        }

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(231, 226, 218);
        doc.roundedRect(margin, y, contentWidth, cardHeight, 3, 3, 'FD');

        // Faixa lateral decorativa terracota
        doc.setFillColor(194, 118, 91);
        doc.rect(margin, y + 2, 1.4, cardHeight - 4, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(28, 25, 23);
        doc.text(cleanName, margin + 6, y + 7.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(120, 113, 108);
        doc.text(`${sanitizePdfText(dateLabel)}${guessLabel}`, margin + 6, y + 12.5);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(68, 64, 60);
        doc.text(msgLines, margin + 6, y + 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 113, 108);
        doc.text(`Mimo escolhido: ${cleanGift}`, margin + 6, y + cardHeight - 3.5);

        y += cardHeight + 5;
      }

      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(168, 162, 158);
        doc.text(
          sanitizePdfText(
            `Fralda Online • Livro de Recados de ${event.parentsNames} — Pagina ${p} de ${totalPages}`
          ),
          pageWidth / 2,
          pageHeight - 9,
          { align: 'center' }
        );
      }

      doc.save(`livro-de-recados-${event.slug}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF do livro de recados:', err);
      setFeedbackError('Não foi possível gerar o PDF no momento. Tente novamente.');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-warm-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-normal text-charcoal-900">
            Livro de Recados dos Convidados
          </h1>
          <p className="text-xs text-charcoal-500 font-sans mt-0.5">
            Todas as mensagens de carinho deixadas pelos convidados durante a confirmação de presentes
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle disabled:opacity-60 self-start sm:self-auto shrink-0"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Livro de Recados (PDF)</span>
              </>
            )}
          </button>
        )}
      </div>

      {feedbackError && (
        <div className="p-3 rounded-xl bg-dusty-rose-light border border-dusty-rose/30 text-xs text-dusty-rose font-sans">
          {feedbackError}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-warm-border shadow-subtle max-w-md mx-auto">
          <h3 className="font-serif text-base text-charcoal-800 font-normal">Nenhum recado ainda</h3>
          <p className="text-xs text-charcoal-500 font-sans mt-1">
            Assim que os convidados presentearem e deixarem uma mensagem, ela aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map((m) => {
            const thankYouUrl = buildThankYouWhatsAppUrl({
              phone: m.payerPhone,
              guestName: m.name,
              giftTitle: m.giftTitle,
              parentsNames: event.parentsNames,
            });

            return (
              <div
                key={m.id}
                className="bg-white rounded-xl p-5 border border-warm-border shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-serif text-sm font-medium text-charcoal-900">{m.name}</h3>
                      <span className="text-[11px] font-mono text-charcoal-400">
                        {new Date(m.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {m.pollGuess && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            m.pollGuess === 'BOY'
                              ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                              : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
                          }`}
                        >
                          {m.pollGuess === 'BOY' ? 'Apostou: Menino' : 'Apostou: Menina'}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        disabled={deletingId === m.id}
                        title="Remover recado do mural"
                        className="w-7 h-7 rounded-lg text-charcoal-400 hover:text-dusty-rose hover:bg-dusty-rose-light/60 flex items-center justify-center transition disabled:opacity-50"
                      >
                        {deletingId === m.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-700 italic bg-cream-50/70 p-3.5 rounded-lg border border-warm-border/60 leading-relaxed font-sans">
                    &ldquo;{m.message}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-warm-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-charcoal-500 text-[11px] font-sans truncate">
                      {m.paymentMethod === 'CREDIT_CARD'
                        ? 'Presente no Cartão:'
                        : 'Presente via Pix:'}{' '}
                      <strong className="font-medium text-charcoal-700">{m.giftTitle}</strong>
                    </span>
                    <span className="font-mono text-xs font-semibold text-charcoal-900 tabular-nums shrink-0">
                      R$ {m.amount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {thankYouUrl && (
                    <div className="pt-1">
                      <a
                        href={thankYouUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Agradecer no WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
