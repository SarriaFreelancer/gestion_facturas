import React from 'react';
import { 
  FileText, 
  FileCheck, 
  Receipt, 
  PenTool, 
  Inbox, 
  Sliders, 
  AlertTriangle, 
  Package 
} from 'lucide-react';

interface StatsProps {
  stats: {
    totalMonth: number;
    totalQuotations: number;
    totalInvoices: number;
    pendingSignatures: number;
    pendingFacture: number;
    pendingManagement: number;
    delayedInvoices: number;
    pendingDelivery: number;
  };
}

export const DashboardCards: React.FC<StatsProps> = ({ stats }) => {
  const cards = [
    {
      title: '📄 Total documentos',
      value: stats.totalMonth,
      subtitle: 'Cantidad total del mes',
      icon: FileText,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      title: '📝 Cotizaciones',
      value: stats.totalQuotations,
      subtitle: 'Cotizaciones registradas',
      icon: FileCheck,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    },
    {
      title: '🧾 Facturas',
      value: stats.totalInvoices,
      subtitle: 'Facturas registradas',
      icon: Receipt,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    },
    {
      title: '✍️ Pendientes de firma',
      value: stats.pendingSignatures,
      subtitle: 'Pendientes de firma',
      icon: PenTool,
      color: 'bg-amber-50 border-amber-200 text-amber-700'
    },
    {
      title: '📥 Pendientes de Facture',
      value: stats.pendingFacture,
      subtitle: 'LLEGÓ EN FACTURE = AÚN NO',
      icon: Inbox,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    },
    {
      title: '⚠️ Pendientes de gestión',
      value: stats.pendingManagement,
      subtitle: 'GESTIÓN = NO',
      icon: Sliders,
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    {
      title: '🚨 Facturas atrasadas',
      value: stats.delayedInvoices,
      subtitle: '2 o 3+ días sin gestión',
      icon: AlertTriangle,
      color: 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
    },
    {
      title: '📦 Pendientes de entrega',
      value: stats.pendingDelivery,
      subtitle: 'ENTREGADA = NO',
      icon: Package,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className={`p-4 rounded-xl border ${card.color} shadow-sm transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{card.title}</span>
              <Icon className="w-5 h-5 opacity-80" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-bold">{card.value}</span>
            </div>
            <p className="mt-1 text-xs opacity-75">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
