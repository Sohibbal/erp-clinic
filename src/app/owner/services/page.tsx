'use client';

import { useState } from 'react';
import { SERVICES, PRODUCTS, type Service } from '../../../lib/mock-data';

export default function OwnerServicesPage() {
  const [selectedId, setSelectedId] = useState<string>('S001');
  const [search, setSearch] = useState('');

  const selected = SERVICES.find(s => s.id === selectedId);

  const filtered = SERVICES.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  // Resolve product stock info from the master PRODUCTS list
  const getProductStock = (productName: string) => {
    const prod = PRODUCTS.find(p => p.name === productName);
    return prod ? { stock: prod.stock, status: prod.status } : { stock: -1, status: 'Unknown' };
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">account_tree</span>
            Service–Product Mapping
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Define which inventory items are consumed when a clinical service is performed.</p>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search services..."
            className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant/60 rounded-xl text-body-sm w-72 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-5 flex items-start gap-4">
        <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">lightbulb</span>
        <div>
          <p className="font-body-md font-bold text-on-surface mb-1">How Service–Product Mapping Works</p>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            Each clinical service is linked to specific products from the inventory. When a doctor completes a treatment and sends it to the pharmacy,
            the system automatically deducts the mapped products from stock. This page lets you review and understand these relationships.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left: Service List */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          {filtered.map(s => {
            const isSelected = selectedId === s.id;
            return (
              <div
                key={s.id}
                className={`p-5 rounded-2xl cursor-pointer transition-all ${isSelected ? 'glass-card ambient-shadow border-l-4 border-primary' : 'bg-white border border-outline-variant/20 hover:shadow-md'}`}
                onClick={() => setSelectedId(s.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-body-md font-bold text-on-surface">{s.name}</h4>
                    <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">{s.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">link</span>
                    <span className="text-[12px] font-bold text-primary bg-primary-container/30 px-2 py-0.5 rounded-full">{s.linkedProducts.length} items</span>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/20">
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      Click to view the full product mapping on the right panel.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant bg-white rounded-2xl border border-outline-variant/20">
              No services match &quot;{search}&quot;
            </div>
          )}
        </div>

        {/* Right: Mapping Diagram */}
        <div className="col-span-12 lg:col-span-7">
          {selected ? (
            <div className="glass-card ambient-shadow rounded-2xl overflow-hidden sticky top-24">
              <div className="bg-primary/5 p-6 border-b border-outline-variant/30">
                <h3 className="font-headline-md text-headline-md font-bold text-primary mb-1">{selected.name}</h3>
                <p className="font-body-sm text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  Inventory Dependency Map
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Visual Flow */}
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">spa</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-body-md font-bold text-on-surface">{selected.name}</p>
                      <p className="text-[11px] text-on-surface-variant">Service performed → Products consumed</p>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant text-[28px]">arrow_downward</span>
                  </div>

                  <div className="border-t border-dashed border-outline-variant/30 pt-4 space-y-3">
                    {selected.linkedProducts.map((prod, idx) => {
                      const stockInfo = getProductStock(prod.name);
                      const stockColor = stockInfo.status === 'In Stock' ? 'text-green-600 bg-green-100' :
                                         stockInfo.status === 'Low Stock' ? 'text-orange-600 bg-orange-100' :
                                         stockInfo.status === 'Out of Stock' ? 'text-red-600 bg-red-100' :
                                         'text-on-surface-variant bg-surface-container';
                      return (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-outline-variant/20 shadow-sm">
                          <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-body-md font-bold text-on-surface">{prod.name}</p>
                            <p className="text-[11px] text-on-surface-variant">{prod.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <span className="text-[10px] uppercase text-outline-variant tracking-wider block">Qty/Use</span>
                              <span className="font-bold text-on-surface text-[16px]">x{prod.defaultQty}</span>
                            </div>
                            {stockInfo.stock >= 0 && (
                              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${stockColor}`}>
                                {stockInfo.stock} left
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Impact Summary */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20">
                  <h4 className="font-label-md text-label-md uppercase text-outline flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[18px]">calculate</span>
                    Impact Per Session
                  </h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    Every time <strong>{selected.name}</strong> is performed, the system will automatically deduct{' '}
                    <strong>{selected.linkedProducts.reduce((sum, p) => sum + p.defaultQty, 0)} item(s)</strong> from inventory
                    across <strong>{selected.linkedProducts.length} product type(s)</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card ambient-shadow rounded-2xl p-12 text-center sticky top-24">
              <span className="material-symbols-outlined text-[64px] text-outline-variant/40">device_hub</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-4 mb-2">No Service Selected</p>
              <p className="font-body-md text-on-surface-variant">Select a service from the list to see its product dependency map.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
