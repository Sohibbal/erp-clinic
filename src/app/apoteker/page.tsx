'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PRODUCT_REQUESTS, type ProductRequest } from '../../lib/mock-data';

export default function ApotekerDashboard() {
  const [requests, setRequests] = useState<ProductRequest[]>(PRODUCT_REQUESTS);
  const [editingQty, setEditingQty] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    const req = requests.find(r => r.id === id);
    setRequests(prev => prev.filter(r => r.id !== id));
    toast.success(`Request from ${req?.patientName} approved! Products dispatched.`);
  };

  const handleReject = (id: string) => {
    const req = requests.find(r => r.id === id);
    setRequests(prev => prev.filter(r => r.id !== id));
    toast.error(`Request from ${req?.patientName} rejected.`);
  };

  const handleEditQty = (reqId: string, itemIdx: number, newQty: number) => {
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const updatedItems = [...r.items];
        updatedItems[itemIdx] = { ...updatedItems[itemIdx], qty: Math.max(1, newQty) };
        return { ...r, items: updatedItems };
      }
      return r;
    }));
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-gutter">
      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Product Requests */}
        <section className="col-span-12 lg:col-span-8 space-y-stack-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">pending_actions</span>
              Real-time Product Requests
            </h3>
            <span className="bg-primary-container text-on-primary-container font-label-md text-label-md px-3 py-1 rounded-full">{requests.length} Active</span>
          </div>
          
          {requests.length === 0 ? (
            <div className="glass-card ambient-shadow p-12 rounded-xl text-center">
              <span className="material-symbols-outlined text-[48px] text-outline-variant/40 mb-2">check_circle</span>
              <h4 className="font-headline-sm text-on-surface mb-1">All Caught Up!</h4>
              <p className="text-body-sm text-on-surface-variant">No pending product requests at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              {requests.map((req) => (
                <div key={req.id} className="glass-card ambient-shadow p-stack-md rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-body-lg font-bold text-on-surface">{req.patientName}</h4>
                      <p className="font-label-md text-label-md text-on-surface-variant">{req.room} • {req.treatment}</p>
                    </div>
                    <span className={`font-label-md text-label-md px-2 py-1 rounded ${req.priority === 'Urgent' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>{req.priority}</span>
                  </div>
                  <div className="bg-surface-container-low/50 rounded-lg p-3 space-y-2">
                    {req.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-body-sm">
                        <span className="text-on-surface-variant">
                          {editingQty === `${req.id}-${idx}` ? (
                            <span className="flex items-center gap-2">
                              <button className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center hover:bg-primary-container transition-all" onClick={() => handleEditQty(req.id, idx, item.qty - 1)}>-</button>
                              <span className="font-bold text-primary w-6 text-center">{item.qty}</span>
                              <button className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center hover:bg-primary-container transition-all" onClick={() => handleEditQty(req.id, idx, item.qty + 1)}>+</button>
                              <span className="ml-1">x {item.name}</span>
                            </span>
                          ) : (
                            <span>{item.qty}x {item.name}</span>
                          )}
                        </span>
                        <span className="font-bold text-primary">{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 bg-primary text-white font-label-md text-label-md py-2 rounded-lg hover:opacity-90 transition-opacity active:scale-95" onClick={() => handleApprove(req.id)}>Approve</button>
                    <button
                      className={`flex-1 border font-label-md text-label-md py-2 rounded-lg transition-colors ${editingQty?.startsWith(req.id) ? 'border-primary bg-primary-container/20 text-primary' : 'border-primary text-primary hover:bg-primary/5'}`}
                      onClick={() => {
                        if (editingQty?.startsWith(req.id)) {
                          setEditingQty(null);
                          toast.success('Quantities updated!');
                        } else {
                          setEditingQty(`${req.id}-0`);
                          // Enable editing for all items in this request
                          req.items.forEach((_, idx) => {
                            // This is a simplified approach - set all to editing
                          });
                          setEditingQty(req.id); // Use request id prefix
                        }
                      }}
                    >
                      {editingQty?.startsWith(req.id) ? 'Done Editing' : 'Edit Qty'}
                    </button>
                    <button className="w-10 h-10 border border-outline-variant text-error flex items-center justify-center rounded-lg hover:bg-error-container/20 active:scale-95 transition-all" onClick={() => handleReject(req.id)}>
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Inventory Overview */}
        <section className="col-span-12 lg:col-span-4 space-y-stack-md">
          <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">monitoring</span>
            Inventory Overview
          </h3>
          <div className="glass-card ambient-shadow p-stack-md rounded-xl space-y-6">
            <div className="flex items-center justify-around py-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-high" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className="text-primary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="62.8" strokeWidth="8"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-headline-sm">75%</div>
                </div>
                <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Stock Levels</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-high" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className="text-secondary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="220" strokeWidth="8"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-headline-sm">12%</div>
                </div>
                <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Expiring Soon</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-error-container/20 border border-error/10 rounded-lg">
                <span className="material-symbols-outlined text-error">warning</span>
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-error-container">Low Stock Alert</p>
                  <p className="font-body-sm text-body-sm text-on-error-container/80">Hyaluronic Fillers (S) - 2 units left</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary-container/20 border border-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary">event_note</span>
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-secondary-fixed-variant">Restock Scheduled</p>
                  <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant/80">Premium Collagen Serum arrives tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom: Stock Inventory Table */}
        <section className="col-span-12 space-y-stack-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-primary">Full Stock Inventory</h3>
            <div className="flex gap-2">
              <button className="bg-white border border-outline-variant px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
              </button>
              <button className="bg-primary text-white px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-opacity" onClick={() => toast.success('CSV exported successfully!')}>
                <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
              </button>
            </div>
          </div>
          <div className="glass-card ambient-shadow rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-primary-container/20 border-b border-outline-variant/30">
                <tr>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Stock On Hand</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Last Restock</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {[
                  { name: 'Hyaluronic Filler (Soft)', batch: 'HY-2024-001', cat: 'Injectables', stock: 2, status: 'Low Stock', statusColor: 'bg-error-container text-on-error-container', date: 'Oct 12, 2023', action: 'Order Now' },
                  { name: 'Purifying Facial Toner', batch: 'SK-2024-082', cat: 'Skincare', stock: 45, status: 'In Stock', statusColor: 'bg-primary-container text-on-primary-container', date: 'Nov 05, 2023', action: 'Details' },
                  { name: 'Salicylic Acid 2% Serum', batch: 'SK-2024-115', cat: 'Treatments', stock: 18, status: 'In Stock', statusColor: 'bg-primary-container text-on-primary-container', date: 'Oct 28, 2023', action: 'Details' },
                  { name: 'Botox Type A (50 Units)', batch: 'BX-2024-004', cat: 'Injectables', stock: 5, status: 'Expiring', statusColor: 'bg-secondary-container text-on-secondary-container', date: 'Nov 10, 2023', action: 'Replace' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-primary-container/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-body-md font-semibold text-on-surface">{row.name}</div>
                      <div className="font-body-sm text-on-surface-variant">Batch #{row.batch}</div>
                    </td>
                    <td className="px-6 py-4 font-body-sm text-on-surface-variant">{row.cat}</td>
                    <td className="px-6 py-4 font-body-sm font-bold text-on-surface">{row.stock} Units</td>
                    <td className="px-6 py-4"><span className={`${row.statusColor} text-[10px] font-bold px-2 py-1 rounded-full uppercase`}>{row.status}</span></td>
                    <td className="px-6 py-4 font-body-sm text-on-surface-variant">{row.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline font-label-md text-label-md" onClick={() => toast.info(`${row.action} for ${row.name} — coming soon.`)}>{row.action}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
