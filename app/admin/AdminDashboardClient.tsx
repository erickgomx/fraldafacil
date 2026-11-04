'use client';

import React, { useState, useMemo } from 'react';
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
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Baby,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'PIX' | 'CREDIT_CARD'>('ALL');
  const [timePeriod, setTimePeriod] = useState<'ALL' | 'MONTH' | 'WEEK' | 'TODAY'>('ALL');

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
    if (orders.length === 0) {
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

    const rows = orders.map((o) => [
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
    return orders.filter((order) => {
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
  }, [orders, statusFilter, methodFilter, searchTerm]);

  // Valores calculados de acordo com o seletor de período rápido
  const currentPeriodData = useMemo(() => {
    switch (timePeriod) {
      case 'TODAY':
        return {
          gross: metrics.grossToday,
          earnings: metrics.earningsToday,
          label: 'Hoje',
        };
      case 'WEEK':
        return {
          gross: metrics.grossWeek,
          earnings: metrics.earningsWeek,
          label: 'Últimos 7 dias',
        };
      case 'MONTH':
        return {
          gross: metrics.grossMonth,
          earnings: metrics.earningsMonth,
          label: 'Últimos 30 dias',
        };
      default:
        return {
          gross: metrics.totalGross,
          earnings: metrics.totalPlatformFee,
          label: 'Todo o Histórico',
        };
    }
  }, [timePeriod, metrics]);

  // Cálculo de altura máxima do gráfico
  const maxChartValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.gross), 100);
    return max;
  }, [chartData]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header com Boas-vindas e Controles */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-0.5" />
                Live Hub Operacional
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-mono">
                Logado como: <strong className="text-slate-800">{admin.name}</strong> ({admin.email})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Relatórios Gerais do Site
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Consolidação financeira global, divisão de lucros da plataforma (split 4,99%), conversão de pagamentos e auditoria de chás.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Planilha CSV</span>
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

      {/* Grid de Cards Financeiros de Alto Impacto */}
      <div id="relatorios-financeiros" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Arrecadado Bruto */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Arrecadado ({currentPeriodData.label})
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
            {formatBRL(currentPeriodData.gross)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Ticket Médio Geral:</span>
            <strong className="text-slate-800 font-mono">{formatBRL(metrics.averageTicket)}</strong>
          </div>
        </div>

        {/* Card 2: Lucro / Ganhos da Plataforma */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Ganhos da Plataforma
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                4,99%
              </span>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            {formatBRL(currentPeriodData.earnings)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-emerald-200/80 pt-3 border-t border-emerald-800/60">
            <span>Lucro Líquido Retido</span>
            <span className="text-emerald-300 font-semibold">100% Automático</span>
          </div>
        </div>

        {/* Card 3: Repassado aos Pais */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Repassado aos Pais
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
            {formatBRL(metrics.totalParentsNet)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Destinado aos Organizadores</span>
            <strong className="text-indigo-700 font-semibold font-mono">~95,01%</strong>
          </div>
        </div>

        {/* Card 4: Taxas Gateway (Mercado Pago) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-600" />
            Comunidade &amp; Engajamento
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-0.5">Usuários Cadastrados</span>
              <strong className="text-xl font-bold font-serif text-slate-900 block font-mono">
                {metrics.totalUsers}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-0.5">Total de Chás Criados</span>
              <strong className="text-xl font-bold font-serif text-slate-900 block font-mono">
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

      {/* Gráfico de Evolução Financeira Diária (Últimos 30 dias) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Curva de Arrecadação e Lucro (Últimos 30 Dias)
            </h3>
            <p className="text-xs text-slate-500">
              Volume arrecadado por dia e receita líquida gerada para a plataforma.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-md bg-amber-500" />
              Arrecadação Bruta (R$)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-md bg-emerald-600" />
              Lucro do Site (4,99%)
            </span>
          </div>
        </div>

        {/* Gráfico SVG / Barras Dinâmicas */}
        <div className="relative pt-4">
          <div className="h-64 flex items-end gap-1.5 sm:gap-2.5 overflow-x-auto pb-6 border-b border-slate-100">
            {chartData.map((pt, idx) => {
              const grossHeight = Math.max(
                4,
                Math.round((pt.gross / maxChartValue) * 180)
              );
              const earningsHeight = Math.max(
                2,
                Math.round((pt.earnings / maxChartValue) * 180)
              );

              return (
                <div
                  key={idx}
                  className="flex-1 min-w-[20px] flex flex-col items-center justify-end group relative h-full"
                >
                  {/* Tooltip Hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none whitespace-nowrap">
                    <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-xl text-[11px] space-y-1">
                      <p className="font-semibold border-b border-slate-700 pb-1">{pt.label}</p>
                      <p className="text-amber-300">Bruto: {formatBRL(pt.gross)}</p>
                      <p className="text-emerald-400">Lucro Site: {formatBRL(pt.earnings)}</p>
                      <p className="text-slate-300">{pt.orders} presente(s)</p>
                    </div>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                  </div>

                  {/* Barras Empilhadas ou Duplas */}
                  <div className="w-full flex items-end justify-center gap-0.5">
                    <div
                      style={{ height: `${grossHeight}px` }}
                      className="w-full max-w-[12px] bg-amber-400 hover:bg-amber-500 rounded-t-sm transition-all"
                    />
                    <div
                      style={{ height: `${earningsHeight}px` }}
                      className="w-full max-w-[8px] bg-emerald-600 hover:bg-emerald-500 rounded-t-sm transition-all"
                    />
                  </div>

                  {/* Label inferior a cada intervalo */}
                  {idx % 4 === 0 && (
                    <span className="text-[10px] font-mono text-slate-400 mt-2 block whitespace-nowrap">
                      {pt.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela de Top Eventos / Chás com Maior Arrecadação */}
      <div id="top-eventos" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
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
      <div id="transacoes-gerais" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
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

          <div className="text-xs text-slate-500 font-mono">
            Exibindo <strong>{filteredOrders.length}</strong> de {orders.length} pedidos
          </div>
        </div>

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
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="ALL">Status: Todos</option>
              <option value="APPROVED">Apenas Aprovados</option>
              <option value="PENDING">Apenas Pendentes</option>
              <option value="REJECTED">Apenas Rejeitados / Cancelados</option>
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Aprovado
                      </span>
                    ) : ord.status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        {ord.status}
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
