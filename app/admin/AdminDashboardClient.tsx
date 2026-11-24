/**
 * ============================================================================
 * CLIENTE DO DASHBOARD ADMINISTRATIVO (AdminDashboardClient)
 * ============================================================================
 * Interface visual rica para supervisão de faturamento, transações e auditoria:
 * - Cards de resumo financeiro (Faturamento Bruto, Lucro da Plataforma, Repasse aos Pais).
 * - Gráfico interativo com barras dos últimos 30 dias de movimentação.
 * - Tabela completa de auditoria com busca em tempo real por nome, e-mail, CPF ou evento.
 * - Exportação de relatórios para CSV em um clique.
 * - Lista ranqueada dos Chás de Bebê com maior arrecadação.
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  CreditCard,
  QrCode,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Download,
  FileText,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Baby,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'REFUNDED' | 'CHARGED_BACK'>('ALL');
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
          message: data.message || data.error || 'Erro ao verificar status do pagamento.',
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
          message: data.message || 'Pagamento ainda está pendente no Mercado Pago.',
        });
      }
    } catch (err: unknown) {
      console.error('Erro na verificação de pagamento:', err);
      setFeedback({
        type: 'error',
        message: 'Falha de comunicação ao verificar o pagamento. Tente novamente.',
      });
    } finally {
      setVerifyingId(null);
    }
  };

  // Formatação de Moeda Brasileira
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  // Formatação de Data Brasileira
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Exportar Relatório em CSV
  const handleExportCSV = () => {
    if (ordersList.length === 0) {
      alert('Nenhuma transação disponível para exportação.');
      return;
    }

    const headers = [
      'ID Pedido',
      'Data e Hora',
      'Chá / Evento (Slug)',
      'Nome do Bebê',
      'Organizadores',
      'Pagador',
      'E-mail Pagador',
      'Telefone Pagador',
      'CPF Pagador',
      'Método de Pagamento',
      'Valor Bruto (R$)',
      'Lucro Plataforma (R$)',
      'Líquido Pais (R$)',
      'Taxa Gateway (R$)',
      'Quem Pagou Taxa',
      'Status',
      'Palpite Bolão',
      'Mensagem Convidado',
    ];

    const rows = ordersList.map((o) => [
      `"${o.id}"`,
      `"${formatDate(o.createdAt)}"`,
      `"${o.eventSlug}"`,
      `"${o.babyName || ''}"`,
      `"${o.parentsNames}"`,
      `"${o.payerName.replace(/"/g, '""')}"`,
      `"${o.payerEmail}"`,
      `"${o.payerPhone || ''}"`,
      `"${o.payerCpf || ''}"`,
      `"${o.paymentMethod}"`,
      o.amount.toFixed(2),
      o.platformFee.toFixed(2),
      o.netAmount.toFixed(2),
      o.gatewayFee.toFixed(2),
      `"${o.feePayer}"`,
      `"${o.status}"`,
      `"${o.pollGuess || ''}"`,
      `"${(o.payerMessage || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_geral_fralda_facil_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtragem dinâmica de pedidos
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      // Filtro de Status
      if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;

      // Filtro de Método
      if (methodFilter === 'PIX' && order.paymentMethod !== 'PIX') return false;
      if (methodFilter === 'CREDIT_CARD' && order.paymentMethod === 'PIX') return false;

      // Filtro de Busca por Texto
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = order.payerName.toLowerCase().includes(query);
        const matchesEmail = order.payerEmail.toLowerCase().includes(query);
        const matchesSlug = order.eventSlug.toLowerCase().includes(query);
        const matchesBaby = (order.babyName || '').toLowerCase().includes(query);
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesCpf = (order.payerCpf || '').includes(query);

        if (!matchesName && !matchesEmail && !matchesSlug && !matchesBaby && !matchesId && !matchesCpf) {
          return false;
        }
      }

      return true;
    });
  }, [ordersList, statusFilter, methodFilter, searchTerm]);

  // Referências temporais para cálculos reativos em tempo real
  const now = useMemo(() => new Date(), []);
  const startOfToday = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [now]);
  const sevenDaysAgo = useMemo(() => new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), [now]);
  const thirtyDaysAgo = useMemo(() => new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), [now]);
  const hasTruncatedAuditList = metrics.totalOrdersCount > ordersList.length;

  // Pedidos aprovados no período selecionado
  const approvedInPeriod = useMemo(() => {
    return ordersList.filter((o) => {
      if (o.status !== 'APPROVED') return false;
      const orderDate = new Date(o.createdAt);
      if (timePeriod === 'TODAY') return orderDate >= startOfToday;
      if (timePeriod === 'WEEK') return orderDate >= sevenDaysAgo;
      if (timePeriod === 'MONTH') return orderDate >= thirtyDaysAgo;
      return true; // ALL
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
    return approvedInPeriod.reduce((sum, o) => sum + (o.platformFee ?? o.amount * 0.0499), 0);
  }, [approvedInPeriod, hasTruncatedAuditList, timePeriod, metrics]);

  // Valores calculados de acordo com o seletor de período rápido
  const currentPeriodData = useMemo(() => {
    const labels = {
      TODAY: 'Hoje',
      WEEK: 'Últimos 7 dias',
      MONTH: 'Últimos 30 dias',
      ALL: 'Todo o Histórico',
    };
    return {
      gross: periodGross,
      earnings: periodEarnings,
      label: labels[timePeriod],
    };
  }, [timePeriod, periodGross, periodEarnings]);

  // Geração dinâmica dos pontos do gráfico sincronizados com a lista de pedidos e o período selecionado
  const computedChartData = useMemo(() => {
    if (hasTruncatedAuditList && (timePeriod === 'ALL' || timePeriod === 'MONTH') && chartData.length > 0) {
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
      const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
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
      alert('Nenhuma transação disponível para exportação.');
      return;
    }

    try {
      setIsExportingPDF(true);

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
      const secondaryColor: [number, number, number] = [71, 85, 105]; // slate-600
      const borderColor: [number, number, number] = [226, 232, 240]; // slate-200

      // Header do Relatório
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(...primaryColor);
      doc.text('FRALDA FACIL', 14, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.text('Relatorio Administrativo & Auditoria Financeira', 14, 21);

      // Metadados à direita
      doc.setFontSize(8);
      const generatedAt = new Date().toLocaleString('pt-BR');
      doc.text(`Gerado em: ${generatedAt}`, 283, 13, { align: 'right' });
      doc.text(`Responsavel: ${admin.name} (${admin.email})`, 283, 18, { align: 'right' });
      doc.text(`Filtro de Periodo: ${currentPeriodData.label}`, 283, 23, { align: 'right' });

      // Linha horizontal elegante
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.4);
      doc.line(14, 26, 283, 26);

      let currentY = 32;

      // Seção 1: Resumo Financeiro & KPIs
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('1. RESUMO FINANCEIRO & PERFORMANCE', 14, currentY);

      currentY += 4;

      const summaryHead = [
        [
          'Total Bruto',
          'Lucro Plataforma (4,99%)',
          'Repasse Pais (~95,01%)',
          'Taxa Gateway MP',
          'Ticket Medio',
          'Conversao',
          'Pedidos Aprov.',
          'Total Pedidos',
          'Total Chas',
        ],
      ];

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

      currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

      // Seção 2: Métodos de Pagamento e Taxas
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('2. METODOS DE PAGAMENTO & REPASSE', 14, currentY);

      currentY += 4;

      const paymentHead = [
        [
          'PIX (Qtd)',
          'PIX (Volume R$)',
          'Cartao (Qtd)',
          'Cartao (Volume R$)',
          'Taxa Paga por Convidado',
          'Taxa Paga pelos Pais',
          'Chas com MP Conectado',
          'Chas MP Pendente',
        ],
      ];

      const paymentBody = [
        [
          String(metrics.pixOrdersCount),
          formatBRL(metrics.pixGrossAmount),
          String(metrics.cardOrdersCount),
          formatBRL(metrics.cardGrossAmount),
          `${metrics.guestFeeCount} pedidos`,
          `${metrics.parentsFeeCount} pedidos`,
          `${metrics.mpConnectedCount} eventos`,
          `${metrics.mpPendingCount} eventos`,
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

      currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

      // Seção 3: Ranking de Chás / Top Eventos
      if (topEvents && topEvents.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text('3. TOP CHAS DE BEBE (MAIOR ARRECADACAO)', 14, currentY);

        currentY += 4;

        const eventsHead = [
          ['#', 'Bebe / Slug', 'Organizadores', 'Email Responsavel', 'Tipo', 'MP', 'Pedidos', 'Total Arrecadado', 'Lucro Plataforma'],
        ];

        const eventsBody = topEvents.slice(0, 10).map((e, idx) => [
          String(idx + 1),
          `${e.babyName ? e.babyName + ' ' : ''}(${e.slug})`,
          e.parentsNames,
          e.ownerEmail,
          e.eventType === 'REVELACAO' ? 'Revelacao' : e.eventType === 'FRALDA' ? 'Cha de Fralda' : 'Ambos',
          e.mpConnected ? 'Conectado' : 'Pendente',
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

        currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
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
        `4. EXTRATO DE PEDIDOS & AUDITORIA (${ordersToExport.length} registro${ordersToExport.length === 1 ? '' : 's'})`,
        14,
        currentY
      );

      currentY += 4;

      const ordersHead = [
        ['ID Pedido', 'Data', 'Evento / Slug', 'Pagador', 'CPF', 'Metodo', 'Bruto (R$)', 'Lucro (R$)', 'Liq. Pais (R$)', 'Status'],
      ];

      const ordersBody = ordersToExport.map((o) => [
        o.id.slice(-8),
        formatDate(o.createdAt),
        o.babyName ? `${o.babyName} (${o.eventSlug})` : o.eventSlug,
        o.payerName,
        o.payerCpf || '-',
        o.paymentMethod === 'PIX' ? 'PIX' : 'Cartao',
        formatBRL(o.amount),
        formatBRL(o.platformFee),
        formatBRL(o.netAmount),
        o.status === 'APPROVED' ? 'Aprovado' : o.status === 'PENDING' ? 'Pendente' : 'Rejeitado',
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
            const val = String(data.cell.raw);
            if (val === 'Aprovado') {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = 'bold';
            } else if (val === 'Pendente') {
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
        doc.setTextColor(148, 163, 184); // slate-400
        doc.line(14, 198, 283, 198);
        doc.text('Fralda Facil • Documento confidencial para uso administrativo exclusivo', 14, 203);
        doc.text(`Pagina ${i} de ${totalPages}`, 283, 203, { align: 'right' });
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`relatorio_admin_fralda_online_${dateStr}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar relatorio em PDF:', err);
      alert('Ocorreu um erro ao gerar o relatorio em PDF. Tente novamente.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Minimalista e Controles */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                admin
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                {admin.name} <span className="text-slate-400">({admin.email})</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-slate-900 tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
              Métricas financeiras, comissões da plataforma (4,99%), conversão e auditoria de pedidos.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition"
              title="Exportar dados em formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition disabled:opacity-50"
              title="Exportar relatório completo em PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPDF ? 'Gerando PDF...' : 'Exportar PDF'}</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtro de Período Rápido */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Recorte de Faturamento:
          </span>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setTimePeriod('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timePeriod === 'ALL'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todo o Histórico
            </button>
            <button
              onClick={() => setTimePeriod('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timePeriod === 'MONTH'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 30 Dias
            </button>
            <button
              onClick={() => setTimePeriod('WEEK')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timePeriod === 'WEEK'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 7 Dias
            </button>
            <button
              onClick={() => setTimePeriod('TODAY')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timePeriod === 'TODAY'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoje
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Cards Financeiros */}
      <div id="relatorios-financeiros" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Arrecadado Bruto */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Arrecadado ({currentPeriodData.label})
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            {formatBRL(currentPeriodData.gross)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Ticket Médio:</span>
            <strong className="text-slate-700 font-mono">{formatBRL(metrics.averageTicket)}</strong>
          </div>
        </div>

        {/* Card 2: Lucro / Ganhos da Plataforma */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Ganhos da Plataforma
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                4,99%
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            {formatBRL(currentPeriodData.earnings)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Lucro Líquido:</span>
            <span className="text-emerald-600 font-medium font-mono">Split Automático</span>
          </div>
        </div>

        {/* Card 3: Repassado aos Pais */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Repassado aos Pais
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            {formatBRL(metrics.totalParentsNet)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Repasse Líquido:</span>
            <strong className="text-indigo-700 font-medium font-mono">~95,01%</strong>
          </div>
        </div>

        {/* Card 4: Taxas Gateway (Mercado Pago) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxas Gateway (MP)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
            {formatBRL(metrics.totalGatewayFee)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Pix 0,99% | Cartão 3,99%</span>
            <span className="text-slate-600 font-mono text-[11px]">Processamento</span>
          </div>
        </div>
      </div>

      {/* Grid de Indicadores de Conversão e Plataforma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Painel 1: Conversão de Pedidos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Funil de Pedidos
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {metrics.conversionRate.toFixed(1)}% aprovados
            </span>
          </div>

          <div className="space-y-3">
            {/* Barra de Progresso Tridimensional */}
            <div className="h-3.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
              <div
                style={{
                  width: `${
                    metrics.totalOrdersCount > 0
                      ? (metrics.approvedOrdersCount / metrics.totalOrdersCount) * 100
                      : 0
                  }%`,
                }}
                className="bg-emerald-500 h-full transition-all"
                title={`Aprovados: ${metrics.approvedOrdersCount}`}
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
                title={`Pendentes: ${metrics.pendingOrdersCount}`}
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
                title={`Rejeitados/Expirados: ${metrics.rejectedOrdersCount}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-emerald-700 font-semibold block text-base font-mono">
                  {metrics.approvedOrdersCount}
                </span>
                <span className="text-[11px] text-emerald-800">Aprovados</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-amber-700 font-semibold block text-base font-mono">
                  {metrics.pendingOrdersCount}
                </span>
                <span className="text-[11px] text-amber-800">Pendentes</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="text-rose-700 font-semibold block text-base font-mono">
                  {metrics.rejectedOrdersCount}
                </span>
                <span className="text-[11px] text-rose-800">Cancelados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel 2: Métodos de Pagamento e Split */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-indigo-600" />
            Métodos &amp; Pagador da Taxa
          </h3>

          <div className="space-y-4 text-xs">
            {/* Pix vs Cartão */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <QrCode className="w-3.5 h-3.5 text-teal-600" />
                  Pix ({metrics.pixOrdersCount} pedidos)
                </span>
                <strong className="font-mono text-slate-900">{formatBRL(metrics.pixGrossAmount)}</strong>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Cartão ({metrics.cardOrdersCount} pedidos)
                </span>
                <strong className="font-mono text-slate-900">{formatBRL(metrics.cardGrossAmount)}</strong>
              </div>
            </div>

            {/* Split: Convidado vs Pais */}
            <div className="flex items-center justify-between pt-1 text-slate-600">
              <span>Taxa paga pelo convidado:</span>
              <strong className="text-slate-900 font-mono">{metrics.guestFeeCount} pedidos</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Taxa assumida pelos pais:</span>
              <strong className="text-slate-900 font-mono">{metrics.parentsFeeCount} pedidos</strong>
            </div>
          </div>
        </div>

        {/* Painel 3: Base e Comunidade */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-600" />
            Comunidade &amp; Engajamento
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-0.5">Usuários Cadastrados</span>
              <strong className="text-xl font-semibold font-serif text-slate-900 block tabular-nums">
                {metrics.totalUsers}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-0.5">Total de Chás Criados</span>
              <strong className="text-xl font-semibold font-serif text-slate-900 block tabular-nums">
                {metrics.totalEvents}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-emerald-700 block mb-0.5">MP Conectados</span>
              <strong className="text-base font-bold text-emerald-900 block font-mono">
                {metrics.mpConnectedCount}
                <span className="text-[10px] font-normal text-emerald-600 ml-1">
                  ({metrics.totalEvents > 0 ? Math.round((metrics.mpConnectedCount / metrics.totalEvents) * 100) : 0}%)
                </span>
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-0.5">Recados &amp; Bolões</span>
              <strong className="text-base font-bold text-slate-900 block font-mono">
                {metrics.totalGuestMessages} / {metrics.totalPollVotes}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução Financeira Diária */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Curva de Arrecadação e Lucro ({currentPeriodData.label})
            </h3>
            <p className="text-xs text-slate-500">
              Volume arrecadado por período e receita gerada para a plataforma.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-md bg-amber-500" />
              Arrecadação Bruta ({formatBRL(currentPeriodData.gross)})
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-md bg-emerald-600" />
              Lucro do Site ({formatBRL(currentPeriodData.earnings)})
            </span>
          </div>
        </div>

        {/* Gráfico de Barras com Linhas Guia e Eixo X Separado */}
        <div className="relative pt-2">
          {/* Linhas de grade de fundo (Rótulos de valor de referência no eixo Y) */}
          <div className="absolute inset-x-0 top-6 h-48 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-dashed border-slate-200 w-full flex justify-end">
              <span className="text-[10px] font-mono text-slate-400 -mt-2.5 bg-white px-1">
                {formatBRL(maxChartValue)}
              </span>
            </div>
            <div className="border-b border-dashed border-slate-200 w-full flex justify-end">
              <span className="text-[10px] font-mono text-slate-400 -mt-2.5 bg-white px-1">
                {formatBRL(maxChartValue / 2)}
              </span>
            </div>
            <div className="border-b border-dashed border-slate-200 w-full flex justify-end">
              <span className="text-[10px] font-mono text-slate-400 -mt-2.5 bg-white px-1">
                R$ 0,00
              </span>
            </div>
          </div>

          {/* Área das Barras (Plot Area) */}
          <div className="relative h-48 flex items-end gap-1.5 sm:gap-2.5 overflow-x-auto pt-6 pb-0 border-b border-slate-200">
            {computedChartData.map((pt, idx) => {
              const maxBarHeight = 150;
              const grossHeight = pt.gross > 0
                ? Math.max(8, Math.round((pt.gross / maxChartValue) * maxBarHeight))
                : 4;
              const earningsHeight = pt.earnings > 0
                ? Math.max(4, Math.round((pt.earnings / maxChartValue) * maxBarHeight))
                : 2;

              return (
                <div
                  key={idx}
                  className="flex-1 min-w-[20px] h-full flex items-end justify-center group relative z-10"
                >
                  {/* Tooltip Hover */}
                  <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                    <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-xl text-[11px] space-y-1">
                      <p className="font-semibold border-b border-slate-700 pb-1">{pt.label}</p>
                      <p className="text-amber-300 font-mono">Bruto: {formatBRL(pt.gross)}</p>
                      <p className="text-emerald-400 font-mono">Lucro Site: {formatBRL(pt.earnings)}</p>
                      <p className="text-slate-300">{pt.orders} presente(s) aprovado(s)</p>
                    </div>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                  </div>

                  {/* Barras Lado a Lado apoiadas na mesma linha horizontal */}
                  <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1">
                    <div
                      style={{ height: `${grossHeight}px` }}
                      className={`w-full max-w-[10px] sm:max-w-[14px] rounded-t-sm transition-all duration-200 ${
                        pt.gross > 0
                          ? 'bg-amber-400 group-hover:bg-amber-500 shadow-xs'
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}
                    />
                    <div
                      style={{ height: `${earningsHeight}px` }}
                      className={`w-full max-w-[6px] sm:max-w-[10px] rounded-t-sm transition-all duration-200 ${
                        pt.earnings > 0
                          ? 'bg-emerald-600 group-hover:bg-emerald-500 shadow-xs'
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rótulos do Eixo X em linha dedicada */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 pt-2">
            {computedChartData.map((pt, idx) => (
              <div key={idx} className="flex-1 min-w-[20px] text-center">
                {idx % labelInterval === 0 ? (
                  <span className="text-[10px] font-mono text-slate-400 block truncate">
                    {pt.label}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono block opacity-0 select-none">
                    --
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Feedback se não houver faturamento aprovado no período */}
          {currentPeriodData.gross === 0 && (
            <div className="text-center py-4 text-xs text-slate-400 mt-2 bg-slate-50/50 rounded-xl border border-slate-100">
              Nenhuma transação aprovada registrada em <strong>{currentPeriodData.label.toLowerCase()}</strong>.
              {ordersList.some((o) => o.status === 'PENDING') && (
                <span className="ml-1 text-amber-600 font-medium">
                  (Há {ordersList.filter((o) => o.status === 'PENDING').length} pagamento(s) pendente(s) na tabela abaixo aguardando verificação)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Top Eventos / Chás com Maior Arrecadação */}
      <div id="top-eventos" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
              <Baby className="w-5 h-5 text-indigo-600" />
              Ranking dos Chás Mais Arrecadadores
            </h3>
            <p className="text-xs text-slate-500">
              Eventos com maior volume financeiro transacionado na história da plataforma.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {topEvents.length} eventos monitorados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-4">Chá / Família</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Mercado Pago</th>
                <th className="py-3 px-4">Presentes</th>
                <th className="py-3 px-4">Total Arrecadado</th>
                <th className="py-3 px-4 text-right">Lucro Plataforma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topEvents.slice(0, 10).map((ev, index) => (
                <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-400">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{ev.babyName ? `Chá de ${ev.babyName}` : ev.parentsNames}</span>
                      <Link
                        href={`/${ev.slug}`}
                        target="_blank"
                        title="Ver página pública do evento"
                        className="text-slate-400 hover:text-slate-700 inline-flex items-center"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      /{ev.slug} • {ev.ownerEmail}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                      {ev.eventType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {ev.mpConnected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Conectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{ev.ordersCount} pedidos</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                    {formatBRL(ev.grossRaised)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 font-mono">
                    {formatBRL(ev.platformEarnings)}
                  </td>
                </tr>
              ))}

              {topEvents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Nenhum evento registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auditoria Geral de Pedidos / Transações do Site */}
      <div id="transacoes-gerais" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              Auditoria de Todas as Transações do Site
            </h3>
            <p className="text-xs text-slate-500">
              Histórico completo de pagamentos recebidos, comissões retidas e dados dos pagadores.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono text-right">
            <span>
              Exibindo <strong>{filteredOrders.length}</strong> de {ordersList.length} pedidos
            </span>
            {hasTruncatedAuditList && (
              <span className="block text-[11px] text-slate-400 font-sans mt-0.5">
                Exibindo os {ordersList.length} pedidos mais recentes de {metrics.totalOrdersCount} no total (KPIs acima refletem 100% do histórico).
              </span>
            )}
          </div>
        </div>

        {/* Banner de Feedback de Verificação */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
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
              className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Barra de Filtros e Busca em Tempo Real */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Campo de Busca */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por pagador, e-mail, CPF, slug do chá ou ID do pedido..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Filtro de Status */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'REFUNDED' | 'CHARGED_BACK'
                )
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="ALL">Status: Todos</option>
              <option value="APPROVED">Apenas Aprovados</option>
              <option value="PENDING">Apenas Pendentes</option>
              <option value="REJECTED">Apenas Rejeitados / Cancelados</option>
              <option value="REFUNDED">Apenas Estornados</option>
              <option value="CHARGED_BACK">Apenas Contestados (Chargeback)</option>
            </select>
          </div>

          {/* Filtro de Método */}
          <div className="sm:col-span-3">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as 'ALL' | 'PIX' | 'CREDIT_CARD')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="ALL">Método: Todos</option>
              <option value="PIX">Apenas Pix</option>
              <option value="CREDIT_CARD">Apenas Cartão de Crédito</option>
            </select>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Data/Hora</th>
                <th className="py-3 px-3">Chá / Evento</th>
                <th className="py-3 px-3">Pagador</th>
                <th className="py-3 px-3">Método</th>
                <th className="py-3 px-3">Valor Bruto</th>
                <th className="py-3 px-3">Ganho Site</th>
                <th className="py-3 px-3">Líquido Pais</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Recado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(ord.createdAt)}
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      href={`/${ord.eventSlug}`}
                      target="_blank"
                      className="font-medium text-slate-900 hover:text-rose-600 inline-flex items-center gap-1 group"
                    >
                      <span className="truncate max-w-[120px]">
                        {ord.babyName || ord.parentsNames}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-rose-500" />
                    </Link>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      /{ord.eventSlug}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block truncate max-w-[140px]">
                      {ord.payerName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                      {ord.payerEmail}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {ord.paymentMethod === 'PIX' ? 'PIX' : 'Cartão'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {formatBRL(ord.amount)}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-emerald-600">
                    {formatBRL(ord.platformFee)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {formatBRL(ord.netAmount)}
                  </td>
                  <td className="py-3 px-3">
                    {ord.status === 'APPROVED' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Aprovado
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(ord.id)}
                          disabled={verifyingId === ord.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title="Sincronizar status atualizado no Mercado Pago (ex: estornos ou chargebacks)"
                        >
                          <RefreshCw
                            className={`w-2.5 h-2.5 ${verifyingId === ord.id ? 'animate-spin text-rose-500' : 'text-slate-400'}`}
                          />
                          <span>{verifyingId === ord.id ? 'Verificando...' : 'Sincronizar'}</span>
                        </button>
                      </div>
                    ) : ord.status === 'PENDING' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pendente
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(ord.id)}
                          disabled={verifyingId === ord.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title="Consultar status deste pagamento em tempo real no Mercado Pago"
                        >
                          <RefreshCw
                            className={`w-2.5 h-2.5 ${verifyingId === ord.id ? 'animate-spin text-rose-500' : 'text-slate-500'}`}
                          />
                          <span>{verifyingId === ord.id ? 'Verificando...' : 'Verificar'}</span>
                        </button>
                      </div>
                    ) : ord.status === 'REFUNDED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <XCircle className="w-3 h-3 text-amber-600" />
                        Estornado
                      </span>
                    ) : ord.status === 'CHARGED_BACK' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-700" />
                        Contestado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        {ord.status === 'REJECTED' ? 'Recusado' : ord.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {ord.payerMessage ? (
                      <span
                        title={ord.payerMessage}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-help"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-slate-300 text-center">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Nenhuma transação encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
