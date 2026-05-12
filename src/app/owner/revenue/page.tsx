'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { TRANSACTIONS, formatCurrency } from '../../../lib/mock-data';

type FilterMethod = 'All' | 'QRIS' | 'Credit Card' | 'Transfer' | 'Cash';
type FilterStatus = 'All' | 'Paid' | 'Pending';

export default function OwnerRevenuePage() {
  const [methodFilter, setMethodFilter] = useState<FilterMethod>('All');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const [search, setSearch] = useState('');

  const filtered = TRANSACTIONS.filter(tx => {
    if (methodFilter !== 'All' && tx.method !== methodFilter) return false;
    if (statusFilter !== 'All' && tx.status !== statusFilter) return false;
    if (search && !tx.patientName.toLowerCase().includes(search.toLowerCase()) && !tx.invoiceId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRevenue = filtered.reduce((sum, tx) => tx.status === 'Paid' ? sum + tx.amount : sum, 0);
  const totalPending = filtered.reduce((sum, tx) => tx.status === 'Pending' ? sum + tx.amount : sum, 0);
  const paidCount = filtered.filter(tx => tx.status === 'Paid').length;
  const pendingCount = filtered.filter(tx => tx.status === 'Pending').length;

  const methodIcons: Record<string, string> = {
    'QRIS': 'qr_code_2',
    'Credit Card': 'credit_card',
    'Transfer': 'account_balance',
    'Cash': 'payments',
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">account_balance_wallet</span>
            Revenue & Financial Ledger
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Detailed transaction records, cash flow analysis, and payment tracking.</p>
        </div>
        <button
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-label-md flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
          onClick={() => toast.success('Financial report exported as PDF.')}
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-100/30 rounded-bl-full -mr-6 -mt-6"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Collected</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(totalRevenue)}</h3>
          <p className="text-[11px] text-green-600 font-bold mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            {paidCount} transactions
          </p>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100/30 rounded-bl-full -mr-6 -mt-6"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Pending</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(totalPending)}</h3>
          <p className="text-[11px] text-orange-600 font-bold mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {pendingCount} awaiting payment
          </p>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl">
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Avg Transaction</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {formatCurrency(paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0)}
          </h3>
          <p className="text-[11px] text-on-surface-variant font-bold mt-1">Per paid invoice</p>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl">
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Top Method</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-primary text-[28px]">qr_code_2</span>
            <div>
              <h3 className="font-headline-sm text-on-surface">QRIS</h3>
              <p className="text-[11px] text-on-surface-variant font-bold">Most used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search by patient name or invoice..."
            className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant/60 rounded-xl text-body-sm w-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
          {(['All', 'QRIS', 'Credit Card', 'Transfer', 'Cash'] as FilterMethod[]).map(m => (
            <button
              key={m}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[12px] transition-colors ${methodFilter === m ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
              onClick={() => setMethodFilter(m)}
            >{m}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
          {(['All', 'Paid', 'Pending'] as FilterStatus[]).map(s => (
            <button
              key={s}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[12px] transition-colors ${statusFilter === s ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
              onClick={() => setStatusFilter(s)}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card ambient-shadow rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-primary-container/10 border-b border-outline-variant/30">
            <tr>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Patient</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Service</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Method</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filtered.map(tx => (
              <tr key={tx.id} className="hover:bg-primary-container/5 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-[12px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">{tx.invoiceId}</span>
                </td>
                <td className="px-6 py-4 font-body-md font-bold text-on-surface">{tx.patientName}</td>
                <td className="px-6 py-4 font-body-sm text-on-surface-variant">{tx.service}</td>
                <td className="px-6 py-4">
                  {tx.method ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{methodIcons[tx.method] || 'help'}</span>
                      <span className="font-body-sm text-on-surface">{tx.method}</span>
                    </div>
                  ) : (
                    <span className="text-on-surface-variant text-body-sm italic">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right font-headline-sm text-primary font-bold">{formatCurrency(tx.amount)}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tx.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">No transactions match the current filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
