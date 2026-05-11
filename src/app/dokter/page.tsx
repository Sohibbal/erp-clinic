'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PATIENTS, SERVICES, formatCurrency, type QueueStatus } from '../../lib/mock-data';

interface DokterQueueItem {
  patientId: string;
  patientName: string;
  age: number;
  service: string;
  serviceId: string;
  status: QueueStatus;
  lastVisit: string;
  allergies: string;
}

const DOKTER_QUEUE: DokterQueueItem[] = [
  { patientId: 'PT-8829', patientName: 'Sophia Montgomery', age: 24, service: 'Facial Acne', serviceId: 'S001', status: 'in-room', lastVisit: '12 Oct', allergies: 'Salicylic Acid' },
  { patientId: 'PT-6623', patientName: 'Julian Rivers', age: 31, service: 'Chemical Peel', serviceId: 'S002', status: 'waiting', lastVisit: '28 Sep', allergies: 'Lidocaine' },
  { patientId: 'PT-7741', patientName: 'Aria Sterling', age: 29, service: 'Botox Consultation', serviceId: 'S003', status: 'done', lastVisit: '10 Oct', allergies: 'None' },
];

export default function DoctorWorkspace() {
  const [queue, setQueue] = useState(DOKTER_QUEUE);
  const [selectedId, setSelectedId] = useState('PT-8829');
  const [examNotes, setExamNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const selected = queue.find(q => q.patientId === selectedId);
  const selectedService = SERVICES.find(s => s.id === selected?.serviceId);

  // Product state per patient
  type ProductState = { checked: boolean; qty: number };
  const [productStates, setProductStates] = useState<Record<string, ProductState[]>>(() => {
    const init: Record<string, ProductState[]> = {};
    DOKTER_QUEUE.forEach(q => {
      const svc = SERVICES.find(s => s.id === q.serviceId);
      if (svc) {
        init[q.patientId] = svc.linkedProducts.map(p => ({ checked: p.checked, qty: p.defaultQty }));
      }
    });
    return init;
  });

  const currentProducts = selectedService?.linkedProducts || [];
  const currentStates = productStates[selectedId] || [];

  const pharmacyTotal = currentProducts.reduce((sum, p, i) => {
    const state = currentStates[i];
    if (state?.checked) {
      const product = [...SERVICES.flatMap(s => s.linkedProducts)].find(lp => lp.name === p.name);
      const price = product ? 150000 : 150000; // Mock price
      return sum + (price * state.qty);
    }
    return sum;
  }, 0);

  const toggleProduct = (index: number) => {
    setProductStates(prev => ({
      ...prev,
      [selectedId]: prev[selectedId].map((s, i) => i === index ? { ...s, checked: !s.checked } : s),
    }));
  };

  const changeQty = (index: number, delta: number) => {
    setProductStates(prev => ({
      ...prev,
      [selectedId]: prev[selectedId].map((s, i) => i === index ? { ...s, qty: Math.max(1, s.qty + delta) } : s),
    }));
  };

  const handleComplete = () => {
    if (!selected) return;
    setQueue(prev => prev.map(q => q.patientId === selectedId ? { ...q, status: 'done' as const } : q));
    toast.success(`Treatment for ${selected.patientName} completed! Sent to Pharmacy.`);
    setExamNotes('');
    setDiagnosis('');
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved successfully!');
  };

  const statusLabel: Record<QueueStatus, { label: string; bg: string; text: string }> = {
    'in-room': { label: 'Current', bg: 'bg-secondary-container', text: 'text-on-secondary-fixed-variant' },
    waiting: { label: 'Waiting', bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' },
    done: { label: 'Done', bg: 'bg-tertiary-container', text: 'text-on-tertiary-fixed-variant' },
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      {/* TopNavBar */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-outline-variant/30 fixed top-0 z-50 w-full shadow-[0_10px_30px_-15px_rgba(183,110,121,0.08)]">
        <div className="flex justify-between items-center w-full px-margin h-16 max-w-container-max mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Aura Beauty</span>
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-primary font-semibold border-b-2 border-primary py-5 cursor-pointer">Dashboard</span>
              <span className="text-on-surface-variant hover:text-primary transition-colors py-5 cursor-pointer">Patients</span>
              <span className="text-on-surface-variant hover:text-primary transition-colors py-5 cursor-pointer">Treatments</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-primary-container/40 rounded-lg transition-all">
              <span className="material-symbols-outlined text-primary">settings</span>
            </button>
            <button className="p-2 hover:bg-primary-container/40 rounded-lg transition-all relative">
              <span className="material-symbols-outlined text-primary">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
              <div className="text-right">
                <p className="font-label-md text-label-md text-on-surface font-bold">Dr. Elena Vance</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Lead Clinician</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">EV</div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16 min-h-screen flex max-w-container-max mx-auto">
        {/* Left Panel: Queue */}
        <aside className="w-1/3 border-r border-outline-variant/30 bg-surface-container-low/50 overflow-y-auto h-[calc(100vh-64px)] p-margin">
          <div className="mb-stack-lg">
            <div className="flex items-center justify-between mb-stack-md">
              <h2 className="font-headline-sm text-headline-sm text-primary">Today&apos;s Queue</h2>
              <span className="px-3 py-1 bg-primary-container/50 text-on-primary-container rounded-full font-label-md text-label-md">{queue.length} Patients</span>
            </div>
            <div className="space-y-4">
              {queue.map((item) => {
                const isSelected = item.patientId === selectedId;
                const s = statusLabel[item.status];
                const patient = PATIENTS.find(p => p.id === item.patientId);
                return (
                  <div
                    key={item.patientId}
                    className={`p-4 rounded-xl transition-all cursor-pointer ${isSelected ? 'glass-card ambient-shadow border-l-4 border-primary' : item.status === 'done' ? 'bg-white/40 border border-outline-variant/20 opacity-60' : 'bg-white/40 border border-outline-variant/20 hover:bg-white/80'}`}
                    onClick={() => { setSelectedId(item.patientId); setExamNotes(''); setDiagnosis(''); }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className={`font-headline-sm text-[16px] text-on-surface ${isSelected ? 'font-bold' : 'font-medium'}`}>{item.patientName}</h3>
                        <p className="text-label-md text-on-surface-variant">{item.age} y.o • Patient ID: #{item.patientId}</p>
                      </div>
                      <span className={`px-2 py-1 ${s.bg} ${s.text} rounded-md font-label-md text-[10px] uppercase tracking-wider`}>{s.label}</span>
                    </div>
                    {isSelected && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-body-sm mb-4">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            <span>Last: {item.lastVisit}</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">medical_services</span>
                            <span>{item.service}</span>
                          </div>
                        </div>
                        <button className="w-full py-2 border border-primary text-primary hover:bg-primary-container/20 rounded-lg font-label-md transition-all flex items-center justify-center gap-2" onClick={() => toast.info(`Medical Record for ${item.patientName}: ${patient?.medicalHistory.length || 0} entries.`)}>
                          <span className="material-symbols-outlined text-[18px]">history</span>
                          View Medical Record
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Clinic Analytics */}
          <div className="mt-stack-lg border-t border-outline-variant/30 pt-stack-lg">
            <h4 className="font-label-md text-label-md uppercase text-outline mb-stack-md">Clinic Analytics</h4>
            <div className="bg-primary/5 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary">trending_up</span>
                </div>
                <div>
                  <p className="font-body-sm text-on-surface-variant">Product Conversion</p>
                  <p className="font-headline-sm text-primary font-bold">84%</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel: Active Treatment */}
        <section className="flex-1 bg-white overflow-y-auto h-[calc(100vh-64px)] p-margin">
          {selected ? (
            <>
              <div className="flex items-end justify-between mb-stack-lg pb-stack-md border-b border-outline-variant/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${selected.status === 'done' ? 'bg-tertiary' : 'bg-secondary animate-pulse'}`}></span>
                    <span className="font-label-md text-label-md text-secondary uppercase font-bold tracking-widest">
                      {selected.status === 'done' ? 'Completed' : 'Active Session'}
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">
                    Current Treatment: {selected.service}
                  </h1>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-full font-label-md hover:bg-surface-container transition-all" onClick={handleSaveDraft}>Save Draft</button>
                  <button className="px-4 py-2 bg-primary text-white rounded-full font-label-md hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md" onClick={() => toast.success('Print summary generated!')}>
                    <span className="material-symbols-outlined text-[18px]">print</span>Print Summary
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-gutter">
                {/* Consultation Form */}
                <div className="col-span-7 space-y-stack-lg">
                  <div className="space-y-stack-md">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase">Examination Notes</label>
                    <textarea className="w-full min-h-[160px] bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner" placeholder="Enter clinical observations, skin condition details..." value={examNotes} onChange={(e) => setExamNotes(e.target.value)}></textarea>
                  </div>
                  <div className="space-y-stack-md">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase">Diagnosis</label>
                    <textarea className="w-full min-h-[80px] bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner" placeholder="Enter medical diagnosis..." value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}></textarea>
                  </div>
                  <div className="p-6 bg-primary-container/10 border border-primary-container/40 rounded-2xl">
                    <h4 className="font-headline-sm text-[18px] text-primary mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined">add_circle</span>Additional Services
                    </h4>
                    <p className="text-body-sm text-on-surface-variant mb-6">Suggest additional treatments or procedures based on current diagnosis.</p>
                    <button className="px-6 py-3 border-2 border-dashed border-primary/40 text-primary font-label-md rounded-xl w-full hover:bg-primary-container/20 transition-all flex items-center justify-center gap-2" onClick={() => toast.info('Additional services — coming soon.')}>Add More Services</button>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="col-span-5">
                  <div className="glass-card ambient-shadow rounded-2xl overflow-hidden border border-outline-variant/40">
                    <div className="bg-primary/5 p-4 border-b border-outline-variant/30 flex justify-between items-center">
                      <h3 className="font-headline-sm text-[18px] text-primary font-bold">Layanan: {selected.service}</h3>
                      <span className="material-symbols-outlined text-primary">spa</span>
                    </div>
                    <div className="p-4 space-y-4">
                      {currentProducts.map((product, idx) => {
                        const state = currentStates[idx];
                        if (!state) return null;
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-transparent hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                              <input checked={state.checked} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" onChange={() => toggleProduct(idx)} />
                              <div>
                                <p className="font-body-md font-semibold text-on-surface">{product.name}</p>
                                <p className="text-label-md text-on-surface-variant">{product.description}</p>
                              </div>
                            </div>
                            <div className={`flex items-center gap-2 bg-surface-container-low rounded-lg p-1 border border-outline-variant/20 ${!state.checked ? 'opacity-40' : ''}`}>
                              <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md text-on-surface-variant transition-all" disabled={!state.checked} onClick={() => changeQty(idx, -1)}>-</button>
                              <span className="w-8 text-center font-bold text-on-surface">{state.qty}</span>
                              <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md text-on-surface-variant transition-all" disabled={!state.checked} onClick={() => changeQty(idx, 1)}>+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-6 mt-2 border-t border-outline-variant/30 bg-surface-container-low">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-body-sm text-on-surface-variant">Pharmacy Total</span>
                        <span className="font-headline-sm text-primary font-bold">{formatCurrency(pharmacyTotal)}</span>
                      </div>
                      <button className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3.5 px-4 rounded-xl font-headline-sm text-[15px] hover:shadow-[0_8px_20px_-6px_rgba(123,84,85,0.4)] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group" onClick={handleComplete} disabled={selected.status === 'done'}>
                        <span>{selected.status === 'done' ? 'Already Completed' : 'Complete & Send to Pharmacy'}</span>
                        {selected.status !== 'done' && (
                          <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Side Note */}
                  {selected.allergies !== 'None' && (
                    <div className="mt-stack-lg p-4 bg-secondary-container/20 rounded-xl border border-secondary-container/30 flex gap-4">
                      <span className="material-symbols-outlined text-secondary">info</span>
                      <p className="text-body-sm text-on-secondary-container">
                        Client has a history of sensitivity to {selected.allergies}. Please monitor reactions during session.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <span className="material-symbols-outlined text-[64px] text-outline-variant/40">medical_services</span>
                <p className="font-body-md text-on-surface-variant mt-2">Select a patient from the queue.</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95" onClick={() => toast.info('Quick Notes — coming soon.')}>
        <span className="material-symbols-outlined text-[28px]">edit_note</span>
      </button>
    </div>
  );
}
