'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { INITIAL_QUEUE, CHECKOUT_ITEMS, type QueueItem, type CheckoutItem, formatCurrency } from '../../../lib/mock-data';

export default function KasirDashboard() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('PT-8829');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer' | 'cash'>('qris');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(true);

  const selectedQueue = queue.find(q => q.patientId === selectedPatientId);
  const checkoutItems: CheckoutItem[] = selectedPatientId ? (CHECKOUT_ITEMS[selectedPatientId] || []) : [];
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const grandTotal = subtotal - (subtotal * appliedDiscount);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'AURA10') {
      setAppliedDiscount(0.1);
      toast.success('Promo code AURA10 applied! 10% discount.');
    } else if (promoCode.toUpperCase() === 'AURA20') {
      setAppliedDiscount(0.2);
      toast.success('Promo code AURA20 applied! 20% discount.');
    } else if (promoCode) {
      toast.error('Invalid promo code.');
      setAppliedDiscount(0);
    }
  };

  const handleProcessBilling = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowCheckout(true);
    setPromoCode('');
    setAppliedDiscount(0);
  };

  const handleGenerateInvoice = () => {
    if (!selectedQueue) return;
    toast.success(`Invoice generated for ${selectedQueue.patientName}!`);
    setQueue(prev => prev.filter(q => q.patientId !== selectedPatientId));
    setShowCheckout(false);
    setSelectedPatientId(null);
  };

  const handleSendWhatsApp = () => {
    toast.success('Receipt sent via WhatsApp!');
  };

  const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    done: { bg: 'bg-green-100', text: 'text-green-700', label: 'Done' },
    'in-room': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Room' },
    waiting: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Waiting' },
  };

  const paymentMethods = [
    { id: 'qris' as const, icon: 'qr_code_2', label: 'QRIS' },
    { id: 'transfer' as const, icon: 'account_balance', label: 'Transfer' },
    { id: 'cash' as const, icon: 'payments', label: 'Cash' },
  ];

  return (
    <>
      <div className="p-margin max-w-container-max mx-auto w-full space-y-gutter">
        {/* Top Action Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <div
            className="glass-card p-stack-md rounded-xl flex items-center gap-4 hover:border-primary/30 cursor-pointer transition-all active:scale-95"
            onClick={() => router.push('/kasir/patients')}
          >
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase">New Patient</h3>
              <p className="font-headline-sm text-headline-sm text-primary">Add Record</p>
            </div>
          </div>
          <div className="glass-card p-stack-md rounded-xl flex items-center gap-4 hover:border-primary/30 cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase">Check Queue</h3>
              <p className="font-headline-sm text-headline-sm text-secondary">{queue.length} Waiting</p>
            </div>
          </div>
          <div
            className="glass-card p-stack-md rounded-xl flex items-center gap-4 hover:border-primary/30 cursor-pointer transition-all active:scale-95"
            onClick={() => router.push('/kasir/billing')}
          >
            <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase">Today&apos;s Billing</h3>
              <p className="font-headline-sm text-headline-sm text-tertiary">24 Invoices</p>
            </div>
          </div>
          <div className="glass-card p-stack-md rounded-xl flex items-center gap-4 hover:border-primary/30 cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase">Sales Report</h3>
              <p className="font-headline-sm text-headline-sm text-primary">View Trends</p>
            </div>
          </div>
        </section>

        {/* Main Body Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left: Queue Management */}
          <section className="lg:col-span-5 space-y-stack-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Active Queue</h3>
              <span className="font-label-md text-label-md bg-surface-container-high px-3 py-1 rounded-full">April 12, 2024</span>
            </div>
            <div className="space-y-3">
              {queue.length === 0 && (
                <div className="glass-card p-8 rounded-xl text-center">
                  <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">check_circle</span>
                  <p className="font-body-md text-on-surface-variant">All patients have been processed!</p>
                </div>
              )}
              {queue.map((item) => {
                const style = statusStyles[item.status];
                const isSelected = item.patientId === selectedPatientId && showCheckout;
                return (
                  <div
                    key={item.patientId}
                    className={`glass-card p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-l-4 border-l-primary/40 bg-white ring-2 ring-primary/20' : 'bg-white/50 hover:bg-white/80'}`}
                    onClick={() => { setSelectedPatientId(item.patientId); setShowCheckout(true); setPromoCode(''); setAppliedDiscount(0); }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSelected ? 'bg-primary-container text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        {item.initials}
                      </div>
                      <div>
                        <h4 className="font-body-md font-semibold text-on-surface">{item.patientName}</h4>
                        <p className="text-body-sm text-on-surface-variant">{item.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`block px-2 py-1 ${style.bg} ${style.text} text-[10px] font-bold rounded uppercase mb-2 text-center`}>{style.label}</span>
                      {item.status === 'done' ? (
                        <button
                          className="text-primary font-label-md border border-primary/20 px-3 py-1 rounded-lg hover:bg-primary-container/20 transition-all"
                          onClick={(e) => { e.stopPropagation(); handleProcessBilling(item.patientId); }}
                        >
                          Process Billing
                        </button>
                      ) : (
                        <p className="text-[10px] mt-2 text-on-surface-variant">{item.estimatedTime}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right: Checkout Workspace */}
          <section className="lg:col-span-7">
            {showCheckout && selectedQueue ? (
              <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full bg-white">
                {/* Header */}
                <div className="p-stack-md bg-primary-container/20 border-b border-outline-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">shopping_cart_checkout</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Checkout: {selectedQueue.patientName}</h3>
                  </div>
                  <button
                    className="text-on-surface-variant hover:text-error transition-colors"
                    onClick={() => setShowCheckout(false)}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Itemized Table */}
                <div className="p-stack-md overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low">
                        <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Item/Service</th>
                        <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Qty</th>
                        <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Price</th>
                        <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {checkoutItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-primary-container/10 transition-colors">
                          <td className="p-3">
                            <p className="font-body-md font-medium text-on-surface">{item.name}</p>
                            <span className="text-[12px] text-on-surface-variant">{item.type}</span>
                          </td>
                          <td className="p-3 text-center text-body-sm">{item.qty}</td>
                          <td className="p-3 text-right text-body-sm">{formatCurrency(item.price, 'USD')}</td>
                          <td className="p-3 text-right font-semibold">{formatCurrency(item.qty * item.price, 'USD')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary & Payment */}
                <div className="p-stack-md bg-surface-container-low/50 grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                  {/* Payment Section */}
                  <div className="space-y-4">
                    <h4 className="font-label-md text-label-md text-on-surface-variant uppercase">Payment Method</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((pm) => (
                        <button
                          key={pm.id}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === pm.id ? 'border-primary bg-white text-primary' : 'border-outline-variant bg-white text-on-surface-variant hover:border-primary/50'}`}
                          onClick={() => setPaymentMethod(pm.id)}
                        >
                          <span className="material-symbols-outlined">{pm.icon}</span>
                          <span className="text-[10px] font-bold mt-1">{pm.label}</span>
                        </button>
                      ))}
                    </div>
                    {paymentMethod === 'qris' && (
                      <div className="mt-4 p-4 bg-white border border-outline-variant/30 rounded-xl flex flex-col items-center justify-center">
                        <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-lg mb-2 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-rose-gold)]/20 to-primary/10"></div>
                          <span className="material-symbols-outlined text-[64px] text-primary/40">qr_code_2</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant italic">Scan to complete payment via QRIS</p>
                      </div>
                    )}
                  </div>

                  {/* Totals Section */}
                  <div className="flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-body-sm text-on-surface-variant">Subtotal</span>
                        <span className="text-body-sm font-medium">{formatCurrency(subtotal, 'USD')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-body-sm text-on-surface-variant">Discount / Promo</span>
                        <div className="flex items-center gap-2">
                          {appliedDiscount > 0 && <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded">-{appliedDiscount * 100}%</span>}
                          <input
                            className="w-24 text-right bg-transparent border-b border-outline-variant text-[12px] py-0 px-1 focus:ring-0 focus:border-primary"
                            placeholder="Enter code"
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            onBlur={handleApplyPromo}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                          />
                        </div>
                      </div>
                      <div className="pt-4 mt-2 border-t border-outline-variant/30 flex justify-between items-end">
                        <div>
                          <span className="text-label-md text-on-surface-variant uppercase block">Grand Total</span>
                          <h2 className="font-headline-lg text-headline-lg text-primary">{formatCurrency(grandTotal, 'USD')}</h2>
                        </div>
                        <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded">Tax Included</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button
                        className="w-full py-4 bg-[var(--color-rose-gold)] text-white rounded-xl font-headline-sm text-headline-sm shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-3 active:scale-95 duration-150 ease-in-out"
                        onClick={handleGenerateInvoice}
                      >
                        <span className="material-symbols-outlined">receipt</span>
                        Generate Invoice
                      </button>
                      <button
                        className="w-full py-3 bg-white border border-[var(--color-rose-gold)] text-[var(--color-rose-gold)] rounded-xl font-label-md text-label-md hover:bg-[var(--color-rose-gold)]/5 transition-all flex items-center justify-center gap-2"
                        onClick={handleSendWhatsApp}
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        Send WhatsApp Receipt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center bg-white/50">
                <span className="material-symbols-outlined text-[64px] text-outline-variant/40 mb-4">point_of_sale</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface-variant mb-2">No Patient Selected</h3>
                <p className="font-body-sm text-on-surface-variant">Click a patient from the queue to start checkout.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Contextual FAB */}
      <button
        className="fixed bottom-margin right-margin w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50"
        onClick={() => router.push('/kasir/patients')}
      >
        <span className="material-symbols-outlined text-[28px]">calendar_add_on</span>
      </button>
    </>
  );
}
