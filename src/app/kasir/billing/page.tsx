'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { TRANSACTIONS, type Transaction, formatCurrency } from '../../../../lib/mock-data';

export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'all'>('today');
  const [search, setSearch] = useState('');

  const filtered = transactions
    .filter(t => dateFilter === 'all' || t.date === dateFilter)
    .filter(t =>
      t.patientName.toLowerCase().includes(search.toLowerCase()) ||
      t.invoiceId.toLowerCase().includes(search.toLowerCase())
    );

  const todayTx = transactions.filter(t => t.date === 'today');
  const totalRevenue = todayTx.filter(t => t.status === 'Paid').reduce((s, t) => s + t.amount, 0);
  const totalTransactions = todayTx.length;
  const pendingCount = todayTx.filter(t => t.status === 'Pending').length;

  const handleProcess = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'Paid' as const, method: 'Cash' as const, methodIcon: 'payments' } : t));
    toast.success('Payment processed successfully!');
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">receipt_long</span>
            Transaction History
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">View and track all daily billing and payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden">
            {(['today', 'yesterday', 'all'] as const).map(f => (
              <button key={f} className={`px-4 py-2 font-label-md text-label-md transition-colors ${dateFilter === f ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`} onClick={() => setDateFilter(f)}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="bg-white border border-outline-variant px-4 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container-high transition-colors shadow-sm" onClick={() => toast.success('Report exported!')}>
            <span className="material-symbols-outlined text-[18px]">download</span> Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="glass-card ambient-shadow p-6 rounded-2xl border-l-4 border-primary">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Total Revenue (Today)</p>
          <h3 className="font-headline-lg text-[32px] font-bold text-primary">{formatCurrency(totalRevenue)}</h3>
          <p className="font-body-sm text-[12px] text-secondary mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>+15% from yesterday
          </p>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl border-l-4 border-secondary">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Transactions</p>
          <h3 className="font-headline-lg text-[32px] font-bold text-on-surface">{totalTransactions}</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>{pendingCount === 0 ? 'All payments cleared' : `${pendingCount} pending`}
          </p>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl border-l-4 border-outline-variant">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Pending Invoices</p>
          <h3 className="font-headline-lg text-[32px] font-bold text-on-surface">{pendingCount}</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>Awaiting patient checkout
          </p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-card ambient-shadow rounded-xl overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input type="text" placeholder="Search Invoice ID or Patient..." className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-sm w-72 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-primary-container/10 border-b border-outline-variant/30">
            <tr>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Patient Name</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Payment Method</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filtered.map(t => (
              <tr key={t.id} className={`hover:bg-primary-container/5 transition-colors ${t.status === 'Pending' ? 'bg-surface-container-highest/20' : ''}`}>
                <td className="px-6 py-4 font-body-sm text-on-surface-variant">{t.time}</td>
                <td className="px-6 py-4 font-body-md font-bold text-primary">{t.invoiceId}</td>
                <td className="px-6 py-4 font-body-sm font-semibold text-on-surface">{t.patientName}</td>
                <td className="px-6 py-4">
                  {t.method ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{t.methodIcon}</span>
                      <span className="font-body-sm text-on-surface-variant">{t.method}</span>
                    </div>
                  ) : <span className="font-body-sm text-on-surface-variant">-</span>}
                </td>
                <td className="px-6 py-4 font-body-md font-bold text-on-surface">{formatCurrency(t.amount)}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${t.status === 'Paid' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>{t.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {t.status === 'Paid' ? (
                    <button className="p-2 hover:bg-primary-container/30 rounded-lg text-primary transition-all" title="Print Receipt" onClick={() => toast.success('Receipt printed!')}>
                      <span className="material-symbols-outlined text-[20px]">print</span>
                    </button>
                  ) : (
                    <button className="px-3 py-1.5 bg-primary text-white font-label-md rounded-lg hover:opacity-90 active:scale-95 transition-all" onClick={() => handleProcess(t.id)}>Process</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
