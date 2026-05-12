'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PATIENTS, type Patient } from '../../../lib/mock-data';
import { useRouter } from 'next/navigation';

export default function DokterPatientsPage() {
  const router = useRouter();
  const [patients] = useState<Patient[]>(PATIENTS);
  const [selectedId, setSelectedId] = useState<string>('PT-8829');
  const [search, setSearch] = useState('');

  const selected = patients.find(p => p.id === selectedId);
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const handleStartConsultation = () => {
    if (!selected) return;
    toast.success(`Starting consultation session for ${selected.name}...`);
    // Ideally this would redirect to the workspace and pre-select the patient
    setTimeout(() => {
      router.push('/dokter');
    }, 1000);
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4 mt-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">folder_shared</span>
            Clinical Patient Records
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Search and review patient medical history and clinical notes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant/60 rounded-xl text-body-sm w-72 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Patient List */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="glass-card ambient-shadow rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-primary-container/20 border-b border-outline-variant/30">
                <tr>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Patient Details</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Demographics</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    className={`transition-colors cursor-pointer ${selectedId === p.id ? 'bg-primary-container/10 border-l-4 border-l-primary' : 'hover:bg-primary-container/5'}`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-body-md font-semibold text-on-surface">{p.name}</div>
                      <div className="font-body-sm text-on-surface-variant">ID: #{p.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body-sm text-on-surface">{p.age} y.o</div>
                      <div className="font-body-sm text-on-surface-variant">{p.gender}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body-sm font-bold text-on-surface">{p.lastVisitDate}</div>
                      <div className="font-body-sm text-on-surface-variant truncate max-w-[120px]" title={p.lastVisitTreatment}>{p.lastVisitTreatment}</div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-on-surface-variant">No patients found matching &quot;{search}&quot;</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Detailed Clinical Record */}
        <div className="col-span-12 lg:col-span-6">
          {selected ? (
            <div className="glass-card ambient-shadow rounded-2xl overflow-hidden sticky top-24">
              <div className="bg-primary/5 p-6 border-b border-outline-variant/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-headline-md text-headline-md font-bold shadow-md">{selected.initials}</div>
                  <div>
                    <h3 className="font-headline-sm text-[22px] font-bold text-primary">{selected.name}</h3>
                    <p className="font-body-sm text-on-surface-variant">Patient ID: #{selected.id}</p>
                  </div>
                </div>
                {selected.allergies !== 'None' && (
                  <div className="px-3 py-1 bg-error/10 text-error rounded-md border border-error/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span className="font-bold text-[12px] uppercase tracking-wider">Allergies</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="font-body-md font-semibold text-on-surface">{selected.dob} ({selected.age} y.o)</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${selected.allergies !== 'None' ? 'bg-error/5 border-error/30' : 'bg-surface-container-low border-outline-variant/20'}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${selected.allergies !== 'None' ? 'text-error' : 'text-on-surface-variant'}`}>Known Allergies</p>
                    <p className={`font-body-md font-semibold ${selected.allergies !== 'None' ? 'text-error' : 'text-on-surface'}`}>{selected.allergies}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-label-md text-label-md uppercase text-outline flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">history</span>
                      Clinical History
                    </h4>
                    <button className="text-primary text-[12px] font-bold hover:underline">View All Records</button>
                  </div>

                  {selected.medicalHistory.length === 0 ? (
                    <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/20 border-dashed">
                      <span className="material-symbols-outlined text-outline-variant/40 text-[32px] mb-2">medical_information</span>
                      <p className="text-body-sm text-on-surface-variant italic">No clinical records found for this patient.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {selected.medicalHistory.map((record, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border shadow-sm ${idx === 0 ? 'bg-white border-primary/20 ring-1 ring-primary/10' : 'bg-surface-container-lowest border-outline-variant/20'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-label-md ${idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{record.date}</span>
                            <span className="text-[10px] font-bold px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">{record.doctor}</span>
                          </div>
                          <p className="font-body-md font-bold text-on-surface mb-1">{record.treatment}</p>
                          <p className="text-body-sm text-on-surface-variant bg-surface-container-low p-3 rounded-lg border border-outline-variant/10 leading-relaxed">
                            <span className="block text-[10px] uppercase text-primary font-bold mb-1">Clinical Notes</span>
                            {record.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-surface-container-low p-6 border-t border-outline-variant/30 flex gap-3">
                <button 
                  className="px-4 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-label-md hover:bg-surface-container transition-all flex items-center gap-2"
                  onClick={() => toast.info('Full report exported to PDF.')}
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export
                </button>
                <button
                  className="flex-1 bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:shadow-[0_8px_20px_-6px_rgba(123,84,85,0.4)] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  onClick={handleStartConsultation}
                >
                  <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                  Start Consultation
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card ambient-shadow rounded-2xl p-12 text-center sticky top-24">
              <span className="material-symbols-outlined text-[64px] text-outline-variant/40">person_search</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-4 mb-2">No Patient Selected</p>
              <p className="font-body-md text-on-surface-variant">Select a patient from the directory to view their complete clinical record.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
