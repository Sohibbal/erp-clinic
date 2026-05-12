'use client';

import { useState } from 'react';
import { SERVICES, type Service } from '../../../lib/mock-data';

export default function DokterTreatmentsPage() {
  const [services] = useState<Service[]>(SERVICES);
  const [selectedId, setSelectedId] = useState<string>('S001');
  const [search, setSearch] = useState('');

  const selected = services.find(s => s.id === selectedId);
  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTreatment = (id: string) => {
    setSelectedId(id);
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4 mt-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">medical_information</span>
            Clinical Reference Hub
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Master directory for clinical guidelines, SOPs, and treatment protocols.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search guidelines..."
              className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant/60 rounded-xl text-body-sm w-72 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Treatment List */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="glass-card ambient-shadow rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-primary-container/20 border-b border-outline-variant/30">
                <tr>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Clinical Service</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Items Mapped</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map(s => (
                  <tr
                    key={s.id}
                    className={`transition-colors cursor-pointer ${selectedId === s.id ? 'bg-primary-container/10 border-l-4 border-l-primary' : 'hover:bg-primary-container/5'}`}
                    onClick={() => handleSelectTreatment(s.id)}
                  >
                    <td className="px-6 py-5">
                      <div className="font-body-md font-bold text-on-surface mb-1">{s.name}</div>
                      <div className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded w-fit">{s.id}</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[12px]">
                        {s.linkedProducts.length}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={2} className="px-6 py-8 text-center text-on-surface-variant">No guidelines found matching &quot;{search}&quot;</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Detailed Reference */}
        <div className="col-span-12 lg:col-span-7">
          {selected ? (
            <div className="glass-card ambient-shadow rounded-2xl overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
              {/* Header */}
              <div className="bg-primary/5 p-6 border-b border-outline-variant/30 flex items-center justify-between">
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold text-primary mb-2">{selected.name}</h3>
                  <p className="font-body-sm text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    Standard Operating Procedure (Read-Only)
                  </p>
                </div>
                <div className="px-3 py-1 bg-surface-container-high rounded text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Reference V.1.0
                </div>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                
                {/* SOP Details */}
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm">
                   <h4 className="font-label-md text-label-md uppercase text-outline flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      Clinical Guidelines & Procedures
                    </h4>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">
                      1. Verify patient identity and allergies before applying any topical solutions.<br/>
                      2. Cleanse the target area thoroughly using provided antiseptic.<br/>
                      3. Apply the primary treatment compound evenly.<br/>
                      4. Monitor patient response for at least 15 minutes post-application.<br/>
                      5. Ensure all post-treatment care instructions are delivered clearly.
                    </p>
                </div>

                {/* Reference Products */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-label-md text-label-md uppercase text-outline flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">inventory</span>
                      Inventory Mapping Reference
                    </h4>
                  </div>

                  {selected.linkedProducts.length === 0 ? (
                    <div className="p-6 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/20 border-dashed">
                      <p className="text-body-sm text-on-surface-variant italic">No specific supplies mapped for this treatment.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selected.linkedProducts.map((prod, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-outline-variant/20 bg-white">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px] text-outline-variant">
                              inventory_2
                            </span>
                            <div>
                              <p className="font-body-md font-bold text-on-surface leading-tight">{prod.name}</p>
                              <p className="text-[11px] text-on-surface-variant">{prod.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase text-outline-variant tracking-wider block mb-1">Standard Qty</span>
                            <span className="font-bold text-on-surface bg-surface-container-high px-2 py-1 rounded">x{prod.defaultQty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card ambient-shadow rounded-2xl p-12 text-center sticky top-24">
              <span className="material-symbols-outlined text-[64px] text-outline-variant/40">library_books</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-4 mb-2">No Guideline Selected</p>
              <p className="font-body-md text-on-surface-variant">Select a service from the directory to read its standard operating procedure.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
