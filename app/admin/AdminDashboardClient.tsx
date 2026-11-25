/**
 * ============================================================================
 * CLIENTE DO DASHBOARD ADMINISTRATIVO (AdminDashboardClient)
 * ============================================================================
 * Interface visual rica para supervisão de faturamento, transações e auditoria:
 * - Cards de resumo financeiro (Faturamento Bruto, Lucro da Plataforma, Repasse aos Pais).
 * - Gráfico interativo com barras dos últimos 30 dias de movimentação.
 * - Tabela completa de auditoria com busca em tempo real por nome, e-mail, CPF ou evento.
 * - Exportação de relatórios para CSV e PDF no idioma selecionado.
 * - Lista ranqueada dos Chás de Bebê com maior arrecadação.
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Download,
  FileText,
  RefreshCw,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useI18n } from '@/components/LanguageProvider';
import { adminDict } from '@/lib/i18n/dictionaries/admin';
import { commonDict } from '@/lib/i18n/dictionaries/common';

export interface AdminMetricsData {
  totalGross: number;
  totalPlatformFee: number;
  totalParentsNet: number;
  totalGatewayFee: number;
  grossToday: number;
  earningsToday: number;
  grossWeek: number;
  earningsWeek: number;
  grossMonth: number;
  earningsMonth: number;
  totalOrdersCount: number;
  approvedOrdersCount: number;
  pendingOrdersCount: number;
  rejectedOrdersCount: number;
  conversionRate: number;
  averageTicket: number;
  pixOrdersCount: number;
  pixGrossAmount: number;
  cardOrdersCount: number;
  cardGrossAmount: number;
  guestFeeCount: number;
  parentsFeeCount: number;
  totalUsers: number;
  totalEvents: number;
  mpConnectedCount: number;
  mpPendingCount: number;
  revelacaoCount: number;
  fraldaCount: number;
  ambosCount: number;
  totalPollVotes: number;
  totalGuestMessages: number;
}

export interface AdminOrderRow {
  id: string;
  createdAt: string;
  amount: number;
  netAmount: number;
  platformFee: number;
  gatewayFee: number;
  status: string;
  paymentMethod: string;
  feePayer: string;
  payerName: string;
  payerEmail: string;
  payerPhone: string | null;
  payerCpf: string | null;
  pollGuess: string | null;
  payerMessage: string | null;
  eventSlug: string;
  babyName: string | null;
  parentsNames: string;
  ownerEmail: string;
  mpPaymentId?: string | null;
}

export interface AdminEventSummary {
  id: string;
  slug: string;
  babyName: string | null;
  parentsNames: string;
  eventType: string;
  eventDate: string;
  mpConnected: boolean;
  ownerName: string;
  ownerEmail: string;
  ordersCount: number;
  grossRaised: number;
  platformEarnings: number;
  createdAt: string;
}

export interface DailyChartPoint {
  date: string;
  label: string;
  gross: number;
  earnings: number;
  orders: number;
}

interface AdminDashboardClientProps {
  admin: {
    id: string;
    name: string;
    email: string;
  };
  metrics: AdminMetricsData;
  orders: AdminOrderRow[];
  topEvents: AdminEventSummary[];
  chartData: DailyChartPoint[];
}

export default function AdminDashboardClient({
  admin,
  metrics,
  orders,
  topEvents,
  chartData,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { locale, intlLocale, t, formatCurrency, formatDate } = useI18n();
  const copy = adminDict[locale];
  const common = commonDict[locale];

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'REFUNDED' | 'CHARGED_BACK'
  >('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'PIX' | 'CREDIT_CARD'>('ALL');
  const [timePeriod, setTimePeriod] = useState<'ALL' | 'MONTH' | 'WEEK' | 'TODAY'>('ALL');

  const [ordersList, setOrdersList] = useState<AdminOrderRow[]>(orders);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    setOrdersList(orders);
  }, [orders]);

  const handleVerifyPayment = async (orderId: string) => {
    if (verifyingId) return;
    setVerifyingId(orderId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({
          type: 'error',
          message: data.message || data.error || copy.audit.verifyMessages.genericError,
        });
        return;
      }

      if (data.status && data.status !== 'PENDING') {
        setOrdersList((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: data.status } : o))
        );
        setFeedback({
          type: data.status === 'APPROVED' ? 'success' : 'info',
          message: data.message,
        });
        router.refresh();
      } else {
        setFeedback({
          type: 'info',
          message: data.message || copy.audit.verifyMessages.stillPending,
        });
      }
    } catch (err: unknown) {
      console.error('Erro na verificação de pagamento:', err);
      setFeedback({
        type: 'error',
        message: copy.audit.verifyMessages.connectionError,
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const formatBRL = (val: number) => formatCurrency(val || 0);

  const formatDateTime = (dateStr: string) =>
    formatDate(dateStr, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const translateOrderStatus = (status: string): string => {
    if (status === 'APPROVED') return copy.audit.statuses.APPROVED;
    if (status === 'PENDING') return copy.audit.statuses.PENDING;
    if (status === 'REFUNDED') return copy.audit.statuses.REFUNDED;
    if (status === 'CHARGED_BACK') return copy.audit.statuses.CHARGED_BACK;
    if (status === 'REJECTED') return copy.audit.statuses.REJECTED;
    return status;
  };

  const translatePdfOrderStatus = (status: string): string => {
    const pdfStatuses = copy.exports.pdf.statuses;
    if (status === 'APPROVED') return pdfStatuses.APPROVED;
    if (status === 'PENDING') return pdfStatuses.PENDING;
    if (status === 'REFUNDED') return pdfStatuses.REFUNDED;
    if (status === 'CHARGED_BACK') return pdfStatuses.CHARGED_BACK;
    if (status === 'REJECTED') return pdfStatuses.REJECTED;
    return status;
  };

  const translateEventType = (eventType: string): string => {
    if (eventType === 'REVELACAO') return copy.topEvents.eventTypes.REVELACAO;
    if (eventType === 'FRALDA') return copy.topEvents.eventTypes.FRALDA;
    if (eventType === 'AMBOS') return copy.topEvents.eventTypes.AMBOS;
    return eventType;
  };

  const translatePdfEventType = (eventType: string): string => {
    if (eventType === 'REVELACAO') return copy.exports.pdf.eventTypes.REVELACAO;
    if (eventType === 'FRALDA') return copy.exports.pdf.eventTypes.FRALDA;
    if (eventType === 'AMBOS') return copy.exports.pdf.eventTypes.AMBOS;
    return eventType;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Exportar Relatório em CSV
  const handleExportCSV = () => {
    if (ordersList.length === 0) {
      alert(copy.exports.noOrdersAlert);
      return;
    }

    const headers = copy.exports.csvHeaders;

    const rows = ordersList.map((o) => {
      const methodLabel =
        o.paymentMethod === 'PIX'
          ? copy.audit.methods.PIX
          : copy.audit.methods.CREDIT_CARD;
      const feePayerLabel =
        o.feePayer === 'GUEST'
          ? copy.exports.feePayerGuest
          : copy.exports.feePayerParents;
      const statusLabel = translateOrderStatus(o.status);
      const pollGuessLabel =
        o.pollGuess === 'BOY'
          ? common.genders.boy
          : o.pollGuess === 'GIRL'
            ? common.genders.girl
            : o.pollGuess || '';

      return [
        `"${o.id}"`,
        `"${formatDateTime(o.createdAt)}"`,
        `"${o.eventSlug}"`,
        `"${(o.babyName || '').replace(/"/g, '""')}"`,
        `"${o.parentsNames.replace(/"/g, '""')}"`,
        `"${o.payerName.replace(/"/g, '""')}"`,
        `"${o.payerEmail}"`,
        `"${o.payerPhone || ''}"`,
        `"${o.payerCpf || ''}"`,
        `"${methodLabel}"`,
        o.amount.toFixed(2),
        o.platformFee.toFixed(2),
        o.netAmount.toFixed(2),
        o.gatewayFee.toFixed(2),
        `"${feePayerLabel}"`,
        `"${statusLabel}"`,
        `"${pollGuessLabel.replace(/"/g, '""')}"`,
        `"${(o.payerMessage || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${copy.exports.csvFilePrefix}${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtragem dinâmica de pedidos
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;

      if (methodFilter === 'PIX' && order.paymentMethod !== 'PIX') return false;
      if (methodFilter === 'CREDIT_CARD' && order.paymentMethod === 'PIX') return false;

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = order.payerName.toLowerCase().includes(query);
        const matchesEmail = order.payerEmail.toLowerCase().includes(query);
        const matchesSlug = order.eventSlug.toLowerCase().includes(query);
        const matchesBaby = (order.babyName || '').toLowerCase().includes(query);
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesCpf = (order.payerCpf || '').includes(query);

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesSlug &&
          !matchesBaby &&
          !matchesId &&
          !matchesCpf
        ) {
          return false;
        }
      }

      return true;
    });
  }, [ordersList, statusFilter, methodFilter, searchTerm]);

  // Referências temporais para cálculos reativos em tempo real
  const now = useMemo(() => new Date(), []);
  const startOfToday = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    [now]
  );
  const sevenDaysAgo = useMemo(
    () => new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    [now]
  );
  const thirtyDaysAgo = useMemo(
    () => new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    [now]
  );
  const hasTruncatedAuditList = metrics.totalOrdersCount > ordersList.length;

  // Pedidos aprovados no período selecionado
  const approvedInPeriod = useMemo(() => {
    return ordersList.filter((o) => {
      if (o.status !== 'APPROVED') return false;
      const orderDate = new Date(o.createdAt);
      if (timePeriod === 'TODAY') return orderDate >= startOfToday;
      if (timePeriod === 'WEEK') return orderDate >= sevenDaysAgo;
      if (timePeriod === 'MONTH') return orderDate >= thirtyDaysAgo;
      return true;
    });
  }, [ordersList, timePeriod, startOfToday, sevenDaysAgo, thirtyDaysAgo]);

  const periodGross = useMemo(() => {
    if (hasTruncatedAuditList) {
      if (timePeriod === 'TODAY') return metrics.grossToday;
      if (timePeriod === 'WEEK') return metrics.grossWeek;
      if (timePeriod === 'MONTH') return metrics.grossMonth;
      return metrics.totalGross;
    }
    return approvedInPeriod.reduce((sum, o) => sum + o.amount, 0);
  }, [approvedInPeriod, hasTruncatedAuditList, timePeriod, metrics]);

  const periodEarnings = useMemo(() => {
    if (hasTruncatedAuditList) {
      if (timePeriod === 'TODAY') return metrics.earningsToday;
      if (timePeriod === 'WEEK') return metrics.earningsWeek;
      if (timePeriod === 'MONTH') return metrics.earningsMonth;
      return metrics.totalPlatformFee;
    }
    return approvedInPeriod.reduce(
      (sum, o) => sum + (o.platformFee ?? o.amount * 0.0499),
      0
    );
  }, [approvedInPeriod, hasTruncatedAuditList, timePeriod, metrics]);

  // Valores calculados de acordo com o seletor de período rápido
  const currentPeriodData = useMemo(() => {
    return {
      gross: periodGross,
      earnings: periodEarnings,
      label: copy.header.periods[timePeriod],
    };
  }, [timePeriod, periodGross, periodEarnings, copy.header.periods]);

  // Geração dinâmica dos pontos do gráfico sincronizados com a lista de pedidos e o período selecionado
  const computedChartData = useMemo(() => {
    if (
      hasTruncatedAuditList &&
      (timePeriod === 'ALL' || timePeriod === 'MONTH') &&
      chartData.length > 0
    ) {
      return chartData;
    }

    const numDays = timePeriod === 'WEEK' ? 7 : timePeriod === 'TODAY' ? 1 : 30;
    const points: DailyChartPoint[] = [];

    if (timePeriod === 'TODAY') {
      for (let h = 0; h < 24; h += 3) {
        const slotStart = new Date(startOfToday.getTime() + h * 60 * 60 * 1000);
        const slotEnd = new Date(slotStart.getTime() + 3 * 60 * 60 * 1000 - 1);

        const slotOrders = ordersList.filter((o) => {
          if (o.status !== 'APPROVED') return false;
          const d = new Date(o.createdAt);
          return d >= slotStart && d <= slotEnd;
        });

        const gross = slotOrders.reduce((sum, o) => sum + o.amount, 0);
        const earnings = slotOrders.reduce(
          (sum, o) => sum + (o.platformFee ?? o.amount * 0.0499),
          0
        );

        points.push({
          date: slotStart.toISOString(),
          label: `${String(h).padStart(2, '0')}:00`,
          gross: Math.round(gross * 100) / 100,
          earnings: Math.round(earnings * 100) / 100,
          orders: slotOrders.length,
        });
      }
      return points;
    }

    for (let i = numDays - 1; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

      const dayOrders = ordersList.filter((o) => {
        if (o.status !== 'APPROVED') return false;
        const d = new Date(o.createdAt);
        return d >= dayStart && d <= dayEnd;
      });

      const dayGross = dayOrders.reduce((sum, o) => sum + o.amount, 0);
      const dayEarnings = dayOrders.reduce(
        (sum, o) => sum + (o.platformFee ?? o.amount * 0.0499),
        0
      );

      const dayStr = String(targetDate.getDate()).padStart(2, '0');
      const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');

      points.push({
        date: targetDate.toISOString().slice(0, 10),
        label: `${dayStr}/${monthStr}`,
        gross: Math.round(dayGross * 100) / 100,
        earnings: Math.round(dayEarnings * 100) / 100,
        orders: dayOrders.length,
      });
    }

    return points;
  }, [ordersList, timePeriod, now, startOfToday, hasTruncatedAuditList, chartData]);

  // Altura máxima proporcional para as barras do gráfico
  const maxChartValue = useMemo(() => {
    const max = Math.max(...computedChartData.map((d) => d.gross), 0);
    return max > 0 ? max : 100;
  }, [computedChartData]);

  // Intervalo de exibição dos rótulos no eixo horizontal
  const labelInterval = useMemo(() => {
    if (timePeriod === 'TODAY' || timePeriod === 'WEEK') return 1;
    return 4;
  }, [timePeriod]);

  // Exportar Relatório em PDF
  const handleExportPDF = () => {
    if (ordersList.length === 0) {
      alert(copy.exports.noOrdersAlert);
      return;
    }

    const pdfCopy = copy.exports.pdf;

    try {
      setIsExportingPDF(true);

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor: [number, number, number] = [15, 23, 42];
      const secondaryColor: [number, number, number] = [71, 85, 105];
      const borderColor: [number, number, number] = [226, 232, 240];

      // Header do Relatório
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(...primaryColor);
      doc.text(pdfCopy.brand, 14, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.text(pdfCopy.subtitle, 14, 21);

      // Metadados à direita
      doc.setFontSize(8);
      const generatedAt = new Date().toLocaleString(intlLocale);
      doc.text(t(pdfCopy.generatedAt, { date: generatedAt }), 283, 13, { align: 'right' });
      doc.text(t(pdfCopy.responsible, { name: admin.name, email: admin.email }), 283, 18, {
        align: 'right',
      });
      doc.text(t(pdfCopy.periodFilter, { period: currentPeriodData.label }), 283, 23, {
        align: 'right',
      });

      // Linha horizontal elegante
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.4);
      doc.line(14, 26, 283, 26);

      let currentY = 32;

      // Seção 1: Resumo Financeiro & KPIs
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(pdfCopy.section1Title, 14, currentY);

      currentY += 4;

      const summaryHead = [pdfCopy.section1Headers];

      const summaryBody = [
        [
          formatBRL(currentPeriodData.gross),
          formatBRL(currentPeriodData.earnings),
          formatBRL(metrics.totalParentsNet),
          formatBRL(metrics.totalGatewayFee),
          formatBRL(metrics.averageTicket),
          `${metrics.conversionRate.toFixed(1)}%`,
          String(metrics.approvedOrdersCount),
          String(metrics.totalOrdersCount),
          String(metrics.totalEvents),
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        head: summaryHead,
        body: summaryBody,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 7.5,
          halign: 'center',
          textColor: primaryColor,
        },
        styles: {
          cellPadding: 2.5,
          lineColor: borderColor,
          lineWidth: 0.2,
        },
        margin: { left: 14, right: 14 },
      });

      currentY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

      // Seção 2: Métodos de Pagamento e Taxas
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(pdfCopy.section2Title, 14, currentY);

      currentY += 4;

      const paymentHead = [pdfCopy.section2Headers];

      const paymentBody = [
        [
          String(metrics.pixOrdersCount),
          formatBRL(metrics.pixGrossAmount),
          String(metrics.cardOrdersCount),
          formatBRL(metrics.cardGrossAmount),
          t(pdfCopy.ordersUnit, { count: metrics.guestFeeCount }),
          t(pdfCopy.ordersUnit, { count: metrics.parentsFeeCount }),
          t(pdfCopy.eventsUnit, { count: metrics.mpConnectedCount }),
          t(pdfCopy.eventsUnit, { count: metrics.mpPendingCount }),
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        head: paymentHead,
        body: paymentBody,
        theme: 'grid',
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 7.5,
          halign: 'center',
          textColor: primaryColor,
        },
        styles: {
          cellPadding: 2.5,
          lineColor: borderColor,
          lineWidth: 0.2,
        },
        margin: { left: 14, right: 14 },
      });

      currentY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

      // Seção 3: Ranking de Chás / Top Eventos
      if (topEvents && topEvents.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text(pdfCopy.section3Title, 14, currentY);

        currentY += 4;

        const eventsHead = [pdfCopy.section3Headers];

        const eventsBody = topEvents.slice(0, 10).map((e, idx) => [
          String(idx + 1),
          `${e.babyName ? e.babyName + ' ' : ''}(${e.slug})`,
          e.parentsNames,
          e.ownerEmail,
          translatePdfEventType(e.eventType),
          e.mpConnected ? pdfCopy.mpConnected : pdfCopy.mpPending,
          String(e.ordersCount),
          formatBRL(e.grossRaised),
          formatBRL(e.platformEarnings),
        ]);

        autoTable(doc, {
          startY: currentY,
          head: eventsHead,
          body: eventsBody,
          theme: 'striped',
          headStyles: {
            fillColor: [51, 65, 85],
            textColor: [255, 255, 255],
            fontSize: 7,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fontSize: 7,
            textColor: primaryColor,
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            4: { halign: 'center', cellWidth: 24 },
            5: { halign: 'center', cellWidth: 20 },
            6: { halign: 'center', cellWidth: 16 },
            7: { halign: 'right', fontStyle: 'bold' },
            8: { halign: 'right' },
          },
          styles: {
            cellPadding: 2,
            lineColor: borderColor,
            lineWidth: 0.1,
          },
          margin: { left: 14, right: 14 },
        });

        currentY =
          (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
      }

      // Seção 4: Tabela de Pedidos e Auditoria
      const ordersToExport = filteredOrders.length > 0 ? filteredOrders : ordersList;

      if (currentY > 145) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(
        ordersToExport.length === 1
          ? t(pdfCopy.section4TitleSingular, { count: 1 })
          : t(pdfCopy.section4TitlePlural, { count: ordersToExport.length }),
        14,
        currentY
      );

      currentY += 4;

      const ordersHead = [pdfCopy.section4Headers];

      const ordersBody = ordersToExport.map((o) => [
        o.id.slice(-8),
        formatDateTime(o.createdAt),
        o.babyName ? `${o.babyName} (${o.eventSlug})` : o.eventSlug,
        o.payerName,
        o.payerCpf || '-',
        o.paymentMethod === 'PIX' ? pdfCopy.methods.PIX : pdfCopy.methods.CREDIT_CARD,
        formatBRL(o.amount),
        formatBRL(o.platformFee),
        formatBRL(o.netAmount),
        translatePdfOrderStatus(o.status),
      ]);

      autoTable(doc, {
        startY: currentY,
        head: ordersHead,
        body: ordersBody,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 7,
          textColor: primaryColor,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 20 },
          1: { cellWidth: 26 },
          4: { cellWidth: 24 },
          5: { halign: 'center', cellWidth: 16 },
          6: { halign: 'right', fontStyle: 'bold', cellWidth: 24 },
          7: { halign: 'right', cellWidth: 24 },
          8: { halign: 'right', cellWidth: 24 },
          9: { halign: 'center', cellWidth: 20 },
        },
        styles: {
          cellPadding: 2,
          lineColor: borderColor,
          lineWidth: 0.1,
        },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 9) {
            const rawStatus = ordersToExport[data.row.index]?.status;
            if (rawStatus === 'APPROVED') {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = 'bold';
            } else if (rawStatus === 'PENDING' || rawStatus === 'REFUNDED') {
              data.cell.styles.textColor = [245, 158, 11];
            } else {
              data.cell.styles.textColor = [239, 68, 68];
            }
          }
        },
      });

      // Rodapé em todas as páginas com número de página e aviso
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.line(14, 198, 283, 198);
        doc.text(pdfCopy.footerConfidential, 14, 203);
        doc.text(t(pdfCopy.footerPage, { page: i, total: totalPages }), 283, 203, {
          align: 'right',
        });
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`${copy.exports.pdfFilePrefix}${dateStr}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar relatorio em PDF:', err);
      alert(copy.exports.pdfErrorAlert);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho e recorte de período */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 border border-warm-border shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900">
              {copy.header.title}
            </h1>
            <p className="text-sm text-charcoal-500 mt-1 max-w-2xl">
              {copy.header.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-warm-border bg-white hover:bg-cream-100 text-charcoal-800 text-xs sm:text-sm font-medium transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-charcoal-500 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? copy.header.refreshing : copy.header.refresh}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-warm-border bg-white hover:bg-cream-100 text-charcoal-800 text-xs sm:text-sm font-medium transition"
              title={copy.header.exportCsvTitle}
            >
              <Download className="w-3.5 h-3.5 text-charcoal-500" />
              <span>{copy.header.exportCsv}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs sm:text-sm font-medium transition disabled:opacity-50"
              title={copy.header.exportPdfTitle}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPDF ? copy.header.exportingPdf : copy.header.exportPdf}</span>
            </button>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-warm-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-medium text-charcoal-500">
            {copy.header.periodRangeLabel}
          </span>

          <div className="grid grid-cols-2 sm:inline-flex gap-1 p-1 bg-cream-100 rounded-xl border border-warm-border/60 w-full sm:w-auto">
            {(['ALL', 'MONTH', 'WEEK', 'TODAY'] as const).map((period) => {
              const isSelected = timePeriod === period;
              return (
                <button
                  key={period}
                  type="button"
                  onClick={() => setTimePeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium text-center transition ${
                    isSelected
                      ? 'bg-charcoal-900 text-white font-semibold'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  {copy.header.periods[period]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Faixa unificada de resumo financeiro */}
      <section
        id="relatorios-financeiros"
        className="bg-white rounded-2xl border border-warm-border shadow-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-warm-border"
      >
        <div className="p-5 sm:p-6">
          <span className="text-xs font-medium text-charcoal-500 block">
            {t(copy.kpis.totalRaisedWithPeriod, { period: currentPeriodData.label })}
          </span>
          <strong className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 tabular-nums block mt-1.5">
            {formatBRL(currentPeriodData.gross)}
          </strong>
          <p className="text-xs text-charcoal-500 mt-1.5">
            {copy.kpis.averageTicketLabel}{' '}
            <span className="font-medium text-charcoal-800 tabular-nums">
              {formatBRL(metrics.averageTicket)}
            </span>
          </p>
        </div>

        <div className="p-5 sm:p-6 sm:border-l lg:border-l-0 border-warm-border">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-charcoal-500">
              {copy.kpis.platformEarnings}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {copy.kpis.platformFeeRate}
            </span>
          </div>
          <strong className="font-serif text-2xl sm:text-3xl font-semibold text-emerald-700 tabular-nums block mt-1.5">
            {formatBRL(currentPeriodData.earnings)}
          </strong>
          <p className="text-xs text-charcoal-500 mt-1.5">{copy.kpis.netProfitLabel}</p>
        </div>

        <div className="p-5 sm:p-6 sm:border-t lg:border-t-0 border-warm-border">
          <span className="text-xs font-medium text-charcoal-500 block">
            {copy.kpis.parentsNet}
          </span>
          <strong className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 tabular-nums block mt-1.5">
            {formatBRL(metrics.totalParentsNet)}
          </strong>
          <p className="text-xs text-charcoal-500 mt-1.5">{copy.kpis.netPayoutLabel}</p>
        </div>

        <div className="p-5 sm:p-6 sm:border-t sm:border-l lg:border-t-0 lg:border-l-0 border-warm-border">
          <span className="text-xs font-medium text-charcoal-500 block">
            {copy.kpis.gatewayFee}
          </span>
          <strong className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 tabular-nums block mt-1.5">
            {formatBRL(metrics.totalGatewayFee)}
          </strong>
          <p className="text-xs text-charcoal-500 mt-1.5">{copy.kpis.gatewayRatesLabel}</p>
        </div>
      </section>

      {/* Indicadores operacionais sem caixas aninhadas */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Conversão de pedidos */}
        <div className="bg-white border border-warm-border rounded-2xl p-5 sm:p-6 shadow-subtle flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-serif text-lg font-medium text-charcoal-900">
              {copy.panels.funnelTitle}
            </h2>
            <span className="text-xs font-medium text-charcoal-500 tabular-nums">
              {t(copy.panels.funnelApprovedPct, { pct: metrics.conversionRate.toFixed(1) })}
            </span>
          </div>

          <div className="space-y-4">
            <div className="h-2.5 w-full bg-cream-100 rounded-full flex overflow-hidden">
              <div
                style={{
                  width: `${
                    metrics.totalOrdersCount > 0
                      ? (metrics.approvedOrdersCount / metrics.totalOrdersCount) * 100
                      : 0
                  }%`,
                }}
                className="bg-emerald-500 h-full transition-all"
                title={t(copy.panels.funnelApprovedTooltip, { count: metrics.approvedOrdersCount })}
              />
              <div
                style={{
                  width: `${
                    metrics.totalOrdersCount > 0
                      ? (metrics.pendingOrdersCount / metrics.totalOrdersCount) * 100
                      : 0
                  }%`,
                }}
                className="bg-amber-400 h-full transition-all"
                title={t(copy.panels.funnelPendingTooltip, { count: metrics.pendingOrdersCount })}
              />
              <div
                style={{
                  width: `${
                    metrics.totalOrdersCount > 0
                      ? (metrics.rejectedOrdersCount / metrics.totalOrdersCount) * 100
                      : 0
                  }%`,
                }}
                className="bg-rose-400 h-full transition-all"
                title={t(copy.panels.funnelRejectedTooltip, { count: metrics.rejectedOrdersCount })}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 divide-x divide-warm-border/70">
              <div className="pr-2 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-charcoal-500 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{copy.panels.funnelApproved}</span>
                </div>
                <strong className="font-serif text-xl font-medium text-charcoal-900 tabular-nums block mt-1">
                  {metrics.approvedOrdersCount}
                </strong>
              </div>
              <div className="px-2 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-charcoal-500 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">{copy.panels.funnelPending}</span>
                </div>
                <strong className="font-serif text-xl font-medium text-charcoal-900 tabular-nums block mt-1">
                  {metrics.pendingOrdersCount}
                </strong>
              </div>
              <div className="pl-2 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-charcoal-500 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                  <span className="truncate">{copy.panels.funnelCanceled}</span>
                </div>
                <strong className="font-serif text-xl font-medium text-charcoal-900 tabular-nums block mt-1">
                  {metrics.rejectedOrdersCount}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Métodos de pagamento e taxa */}
        <div className="bg-white border border-warm-border rounded-2xl p-5 sm:p-6 shadow-subtle">
          <h2 className="font-serif text-lg font-medium text-charcoal-900 mb-3">
            {copy.panels.methodsTitle}
          </h2>

          <div className="divide-y divide-warm-border/70 text-xs sm:text-sm">
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-charcoal-600">
                {t(copy.panels.methodsPix, { count: metrics.pixOrdersCount })}
              </span>
              <strong className="font-medium text-charcoal-900 tabular-nums">
                {formatBRL(metrics.pixGrossAmount)}
              </strong>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-charcoal-600">
                {t(copy.panels.methodsCard, { count: metrics.cardOrdersCount })}
              </span>
              <strong className="font-medium text-charcoal-900 tabular-nums">
                {formatBRL(metrics.cardGrossAmount)}
              </strong>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-charcoal-600">{copy.panels.methodsFeeGuest}</span>
              <strong className="font-medium text-charcoal-900 tabular-nums">
                {t(copy.panels.methodsOrdersCount, { count: metrics.guestFeeCount })}
              </strong>
            </div>

            <div className="pt-2.5 flex items-center justify-between gap-2">
              <span className="text-charcoal-600">{copy.panels.methodsFeeParents}</span>
              <strong className="font-medium text-charcoal-900 tabular-nums">
                {t(copy.panels.methodsOrdersCount, { count: metrics.parentsFeeCount })}
              </strong>
            </div>
          </div>
        </div>

        {/* Base da plataforma */}
        <div className="bg-white border border-warm-border rounded-2xl p-5 sm:p-6 shadow-subtle flex flex-col justify-between">
          <h2 className="font-serif text-lg font-medium text-charcoal-900 mb-4">
            {copy.panels.communityTitle}
          </h2>

          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <span className="text-xs text-charcoal-500 block">{copy.panels.communityUsers}</span>
              <strong className="font-serif text-2xl font-medium text-charcoal-900 tabular-nums block mt-0.5">
                {metrics.totalUsers}
              </strong>
            </div>

            <div>
              <span className="text-xs text-charcoal-500 block">{copy.panels.communityEvents}</span>
              <strong className="font-serif text-2xl font-medium text-charcoal-900 tabular-nums block mt-0.5">
                {metrics.totalEvents}
              </strong>
            </div>

            <div className="pt-3 border-t border-warm-border/70">
              <span className="text-xs text-charcoal-500 block">
                {copy.panels.communityMpConnected}
              </span>
              <strong className="font-serif text-xl font-medium text-emerald-700 tabular-nums block mt-0.5">
                {metrics.mpConnectedCount}{' '}
                <span className="font-sans text-xs font-normal text-charcoal-500">
                  (
                  {metrics.totalEvents > 0
                    ? Math.round((metrics.mpConnectedCount / metrics.totalEvents) * 100)
                    : 0}
                  %)
                </span>
              </strong>
            </div>

            <div className="pt-3 border-t border-warm-border/70">
              <span className="text-xs text-charcoal-500 block">
                {copy.panels.communityMessagesAndPolls}
              </span>
              <strong className="font-serif text-xl font-medium text-charcoal-900 tabular-nums block mt-0.5">
                {metrics.totalGuestMessages} / {metrics.totalPollVotes}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Gráfico de evolução de arrecadação */}
      <section
        id="evolucao-receita"
        className="bg-white border border-warm-border rounded-2xl p-5 sm:p-7 shadow-subtle"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900">
              {t(copy.chart.title, { period: currentPeriodData.label })}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">{copy.chart.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-charcoal-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              {t(copy.chart.legendGross, { amount: formatBRL(currentPeriodData.gross) })}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
              {t(copy.chart.legendEarnings, { amount: formatBRL(currentPeriodData.earnings) })}
            </span>
          </div>
        </div>

        <div className="relative pt-2">
          {/* Linhas de grade de fundo */}
          <div className="absolute inset-x-0 top-6 h-48 flex flex-col justify-between pointer-events-none opacity-60">
            <div className="border-b border-dashed border-warm-border w-full flex justify-end">
              <span className="text-[11px] tabular-nums text-charcoal-400 -mt-2.5 bg-white px-1">
                {formatBRL(maxChartValue)}
              </span>
            </div>
            <div className="border-b border-dashed border-warm-border w-full flex justify-end">
              <span className="text-[11px] tabular-nums text-charcoal-400 -mt-2.5 bg-white px-1">
                {formatBRL(maxChartValue / 2)}
              </span>
            </div>
            <div className="border-b border-dashed border-warm-border w-full flex justify-end">
              <span className="text-[11px] tabular-nums text-charcoal-400 -mt-2.5 bg-white px-1">
                {formatBRL(0)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className={computedChartData.length > 10 ? 'min-w-[600px]' : 'w-full'}>
              {/* Área das barras */}
              <div className="relative h-48 flex items-end gap-1.5 sm:gap-2.5 pt-6 pb-0 border-b border-warm-border">
                {computedChartData.map((pt, idx) => {
                  const maxBarHeight = 150;
                  const grossHeight =
                    pt.gross > 0
                      ? Math.max(8, Math.round((pt.gross / maxChartValue) * maxBarHeight))
                      : 4;
                  const earningsHeight =
                    pt.earnings > 0
                      ? Math.max(4, Math.round((pt.earnings / maxChartValue) * maxBarHeight))
                      : 2;

                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[16px] h-full flex items-end justify-center group relative z-10"
                    >
                      <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                        <div className="bg-charcoal-900 text-white rounded-xl p-2.5 shadow-lg text-xs space-y-1">
                          <p className="font-semibold border-b border-charcoal-700 pb-1">{pt.label}</p>
                          <p className="text-amber-300 tabular-nums">
                            {t(copy.chart.tooltipGross, { amount: formatBRL(pt.gross) })}
                          </p>
                          <p className="text-emerald-300 tabular-nums">
                            {t(copy.chart.tooltipEarnings, { amount: formatBRL(pt.earnings) })}
                          </p>
                          <p className="text-stone-300">
                            {t(copy.chart.tooltipOrders, { count: pt.orders })}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-charcoal-900 rotate-45 -mt-1" />
                      </div>

                      <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1">
                        <div
                          style={{ height: `${grossHeight}px` }}
                          className={`w-full max-w-[10px] sm:max-w-[14px] rounded-t-sm transition-all duration-200 ${
                            pt.gross > 0
                              ? 'bg-amber-400 group-hover:bg-amber-500'
                              : 'bg-cream-200 group-hover:bg-cream-300'
                          }`}
                        />
                        <div
                          style={{ height: `${earningsHeight}px` }}
                          className={`w-full max-w-[6px] sm:max-w-[10px] rounded-t-sm transition-all duration-200 ${
                            pt.earnings > 0
                              ? 'bg-emerald-600 group-hover:bg-emerald-500'
                              : 'bg-cream-200 group-hover:bg-cream-300'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rótulos do eixo X */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 pt-2">
                {computedChartData.map((pt, idx) => (
                  <div key={idx} className="flex-1 min-w-[16px] text-center">
                    {idx % labelInterval === 0 ? (
                      <span className="text-[11px] tabular-nums text-charcoal-400 block truncate">
                        {pt.label}
                      </span>
                    ) : (
                      <span className="text-[11px] block opacity-0 select-none">--</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {currentPeriodData.gross === 0 && (
            <div className="text-center py-4 px-3 text-xs text-charcoal-500 mt-3 bg-cream-50 rounded-xl border border-warm-border/70">
              {copy.chart.emptyPeriodPrefix}{' '}
              <strong className="text-charcoal-700">{currentPeriodData.label.toLowerCase()}</strong>.
              {ordersList.some((o) => o.status === 'PENDING') && (
                <span className="ml-1 text-amber-700 font-medium">
                  {t(copy.chart.pendingNotice, {
                    count: ordersList.filter((o) => o.status === 'PENDING').length,
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Ranking dos chás */}
      <section
        id="top-eventos"
        className="bg-white border border-warm-border rounded-2xl shadow-subtle overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-warm-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900">
              {copy.topEvents.title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">{copy.topEvents.subtitle}</p>
          </div>
          <span className="text-xs text-charcoal-500 tabular-nums shrink-0">
            {t(copy.topEvents.monitoredCount, { count: topEvents.length })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-warm-border/70 text-xs font-medium text-charcoal-500 bg-cream-50/50">
                <th className="py-3 px-4">{copy.topEvents.columns.rank}</th>
                <th className="py-3 px-4">{copy.topEvents.columns.event}</th>
                <th className="py-3 px-4">{copy.topEvents.columns.type}</th>
                <th className="py-3 px-4">{copy.topEvents.columns.mp}</th>
                <th className="py-3 px-4">{copy.topEvents.columns.gifts}</th>
                <th className="py-3 px-4">{copy.topEvents.columns.gross}</th>
                <th className="py-3 px-4 text-right">{copy.topEvents.columns.earnings}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border/60 text-charcoal-700">
              {topEvents.slice(0, 10).map((ev, index) => (
                <tr key={ev.id} className="hover:bg-cream-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-charcoal-400 tabular-nums">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-charcoal-900 flex items-center gap-1.5">
                      <span>
                        {ev.babyName
                          ? t(copy.topEvents.showerOfBaby, { name: ev.babyName })
                          : ev.parentsNames}
                      </span>
                      <Link
                        href={`/${ev.slug}`}
                        target="_blank"
                        title={copy.topEvents.viewPublicPage}
                        className="text-charcoal-400 hover:text-terracotta inline-flex items-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <span className="text-xs text-charcoal-400 block">
                      /{ev.slug} · {ev.ownerEmail}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cream-100 text-charcoal-700">
                      {translateEventType(ev.eventType)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {ev.mpConnected ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {copy.topEvents.mpConnected}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {copy.topEvents.mpPending}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-charcoal-600 tabular-nums whitespace-nowrap">
                    {t(copy.topEvents.ordersSuffix, { count: ev.ordersCount })}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-charcoal-900 tabular-nums whitespace-nowrap">
                    {formatBRL(ev.grossRaised)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 tabular-nums whitespace-nowrap">
                    {formatBRL(ev.platformEarnings)}
                  </td>
                </tr>
              ))}

              {topEvents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-sm text-charcoal-400">
                    {copy.topEvents.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Auditoria geral de pedidos */}
      <section
        id="transacoes-gerais"
        className="bg-white border border-warm-border rounded-2xl shadow-subtle overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-warm-border/70 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900">
              {copy.audit.title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">{copy.audit.subtitle}</p>
          </div>

          <div className="text-xs text-charcoal-500 md:text-right">
            <span className="tabular-nums font-medium text-charcoal-700">
              {t(copy.audit.showingCount, {
                shown: filteredOrders.length,
                total: ordersList.length,
              })}
            </span>
            {hasTruncatedAuditList && (
              <span className="block text-xs text-charcoal-400 mt-0.5">
                {t(copy.audit.truncatedNotice, {
                  loaded: ordersList.length,
                  total: metrics.totalOrdersCount,
                })}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 border-b border-warm-border/60 bg-cream-50/40 space-y-4">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : feedback.type === 'info'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : feedback.type === 'info' ? (
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-charcoal-400 hover:text-charcoal-700 p-1 text-base font-bold leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={copy.audit.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-warm-border bg-white text-charcoal-900 placeholder:text-charcoal-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900/10 focus:border-charcoal-400"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | 'ALL'
                      | 'APPROVED'
                      | 'PENDING'
                      | 'REJECTED'
                      | 'REFUNDED'
                      | 'CHARGED_BACK'
                  )
                }
                className="w-full px-3 py-2 rounded-xl border border-warm-border text-xs sm:text-sm bg-white text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-charcoal-900/10 focus:border-charcoal-400"
              >
                <option value="ALL">{copy.audit.statusOptions.ALL}</option>
                <option value="APPROVED">{copy.audit.statusOptions.APPROVED}</option>
                <option value="PENDING">{copy.audit.statusOptions.PENDING}</option>
                <option value="REJECTED">{copy.audit.statusOptions.REJECTED}</option>
                <option value="REFUNDED">{copy.audit.statusOptions.REFUNDED}</option>
                <option value="CHARGED_BACK">{copy.audit.statusOptions.CHARGED_BACK}</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={methodFilter}
                onChange={(e) =>
                  setMethodFilter(e.target.value as 'ALL' | 'PIX' | 'CREDIT_CARD')
                }
                className="w-full px-3 py-2 rounded-xl border border-warm-border text-xs sm:text-sm bg-white text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-charcoal-900/10 focus:border-charcoal-400"
              >
                <option value="ALL">{copy.audit.methodOptions.ALL}</option>
                <option value="PIX">{copy.audit.methodOptions.PIX}</option>
                <option value="CREDIT_CARD">{copy.audit.methodOptions.CREDIT_CARD}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead>
              <tr className="border-b border-warm-border/70 text-xs font-medium text-charcoal-500 bg-cream-50/50">
                <th className="py-3 px-3.5">{copy.audit.columns.date}</th>
                <th className="py-3 px-3.5">{copy.audit.columns.event}</th>
                <th className="py-3 px-3.5">{copy.audit.columns.payer}</th>
                <th className="py-3 px-3.5">{copy.audit.columns.method}</th>
                <th className="py-3 px-3.5">{copy.audit.columns.gross}</th>
                <th className="py-3 px-3.5">{copy.audit.columns.fee}</th>
                <th className="py-3 px-3.5">{copy.audit.columns.net}</th>
                <th className="py-3 px-3.5">{copy.audit.columns.status}</th>
                <th className="py-3 px-3.5 text-right">{copy.audit.columns.message}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border/60 text-charcoal-700">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-cream-50/60 transition-colors">
                  <td className="py-3.5 px-3.5 text-charcoal-500 tabular-nums whitespace-nowrap">
                    {formatDateTime(ord.createdAt)}
                  </td>
                  <td className="py-3.5 px-3.5">
                    <Link
                      href={`/${ord.eventSlug}`}
                      target="_blank"
                      className="font-medium text-charcoal-900 hover:text-terracotta inline-flex items-center gap-1 group"
                    >
                      <span className="truncate max-w-[130px]">
                        {ord.babyName || ord.parentsNames}
                      </span>
                      <ExternalLink className="w-3 h-3 text-charcoal-400 group-hover:text-terracotta" />
                    </Link>
                    <span className="text-[11px] text-charcoal-400 block">
                      /{ord.eventSlug}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="font-medium text-charcoal-900 block truncate max-w-[140px]">
                      {ord.payerName}
                    </span>
                    <span className="text-[11px] text-charcoal-400 block truncate max-w-[140px]">
                      {ord.payerEmail}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cream-100 text-charcoal-700">
                      {ord.paymentMethod === 'PIX'
                        ? copy.audit.methods.PIX
                        : copy.audit.methods.CREDIT_CARD}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 font-semibold text-charcoal-900 tabular-nums whitespace-nowrap">
                    {formatBRL(ord.amount)}
                  </td>
                  <td className="py-3.5 px-3.5 font-medium text-emerald-700 tabular-nums whitespace-nowrap">
                    {formatBRL(ord.platformFee)}
                  </td>
                  <td className="py-3.5 px-3.5 text-charcoal-600 tabular-nums whitespace-nowrap">
                    {formatBRL(ord.netAmount)}
                  </td>
                  <td className="py-3.5 px-3.5">
                    {ord.status === 'APPROVED' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {copy.audit.statuses.APPROVED}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(ord.id)}
                          disabled={verifyingId === ord.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white hover:bg-cream-100 text-charcoal-600 border border-warm-border transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title={copy.audit.actions.syncTitle}
                        >
                          <RefreshCw
                            className={`w-2.5 h-2.5 ${
                              verifyingId === ord.id ? 'animate-spin text-terracotta' : 'text-charcoal-400'
                            }`}
                          />
                          <span>
                            {verifyingId === ord.id
                              ? copy.audit.actions.verifying
                              : copy.audit.actions.sync}
                          </span>
                        </button>
                      </div>
                    ) : ord.status === 'PENDING' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {copy.audit.statuses.PENDING}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(ord.id)}
                          disabled={verifyingId === ord.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white hover:bg-cream-100 text-charcoal-800 border border-warm-border transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title={copy.audit.actions.verifyTitle}
                        >
                          <RefreshCw
                            className={`w-2.5 h-2.5 ${
                              verifyingId === ord.id ? 'animate-spin text-terracotta' : 'text-charcoal-500'
                            }`}
                          />
                          <span>
                            {verifyingId === ord.id
                              ? copy.audit.actions.verifying
                              : copy.audit.actions.verify}
                          </span>
                        </button>
                      </div>
                    ) : ord.status === 'REFUNDED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        <XCircle className="w-3 h-3 text-amber-600" />
                        {copy.audit.statuses.REFUNDED}
                      </span>
                    ) : ord.status === 'CHARGED_BACK' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-700" />
                        {copy.audit.statuses.CHARGED_BACK}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        {translateOrderStatus(ord.status)}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3.5 text-right">
                    {ord.payerMessage ? (
                      <span
                        title={ord.payerMessage}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cream-100 text-charcoal-600 hover:bg-cream-200 cursor-help"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-charcoal-300 text-center">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-sm text-charcoal-400">
                    {copy.audit.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
