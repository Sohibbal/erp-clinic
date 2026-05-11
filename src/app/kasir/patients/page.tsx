'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PATIENTS, type Patient } from '../../../../lib/mock-data';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(PATIENTS);
  const [selectedId, setSelectedId] = useState<string>('PT-8829');
  const [search, setSearch] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', dob: '', gender: 'Female' as 'Male' | 'Female', allergies: '' });

  const selected = patients.find(p => p.id === selectedId);
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const handleRegister = () => {
    if (!newPatient.name || !newPatient.phone) {
      toast.error('Name and Phone are required.');
      return;
    }
    const id = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    const initials = newPatient.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const created: Patient = {
      id, name: newPatient.name, initials, age: 0, gender: newPatient.gender,
      phone: newPatient.phone, dob: newPatient.dob || '-', allergies: newPatient.allergies || 'None',
      registeredDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'New Patient', lastVisitDate: 'New', lastVisitTreatment: '-', medicalHistory: [],
    };
    setPatients(prev => [created, ...prev]);
    setSelectedId(id);
    setShowRegisterModal(false);
    setNewPatient({ name: '', phone: '', dob: '', gender: 'Female', allergies: '' });
    toast.success(`Patient ${created.name} registered successfully!`);
  };

  const handleAddToQueue = () => {
    if (!selected) return;
    toast.success(`${selected.name} added to today's queue!`);
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">group</span>
            Patient Directory
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage patient registrations and view medical records.</p>
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
          <button
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
            onClick={() => setShowRegisterModal(true)}
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span> Register New Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Patient List */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="glass-card ambient-shadow rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-primary-container/20 border-b border-outline-variant/30">
                <tr>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Patient Details</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Status</th>
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
                      <div className="font-body-sm text-on-surface-variant">ID: #{p.id} • {p.gender}, {p.age} y.o</div>
                    </td>
                    <td className="px-6 py-4"><div className="font-body-sm text-on-surface">{p.phone}</div></td>
                    <td className="px-6 py-4">
                      <div className="font-body-sm font-bold text-on-surface">{p.lastVisitDate}</div>
                      <div className="font-body-sm text-on-surface-variant">{p.lastVisitTreatment}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${p.status === 'New Patient' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">No patients found matching &quot;{search}&quot;</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Patient Medical Record */}
        <div className="col-span-12 lg:col-span-5">
          {selected ? (
            <div className="glass-card ambient-shadow rounded-2xl overflow-hidden sticky top-24">
              <div className="bg-primary-container/30 p-6 border-b border-primary-container flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-headline-md text-headline-md font-bold shadow-md">{selected.initials}</div>
                <div>
                  <h3 className="font-headline-sm text-[22px] font-bold text-primary">{selected.name}</h3>
                  <p className="font-body-sm text-on-surface-variant">ID: #{selected.id} • Registered: {selected.registeredDate}</p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="font-body-sm font-semibold text-on-surface">{selected.dob} ({selected.age} y.o)</p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Allergies</p>
                    <p className={`font-body-sm font-semibold ${selected.allergies !== 'None' ? 'text-error' : 'text-on-surface'}`}>{selected.allergies}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md uppercase text-outline mb-3">Recent Medical History</h4>
                  {selected.medicalHistory.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant italic">No medical history yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {selected.medicalHistory.map((record, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border shadow-sm ${idx === 0 ? 'bg-surface-container-lowest border-primary/20' : 'bg-surface-container-lowest border-outline-variant/20 opacity-70'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-label-md ${idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{record.date}</span>
                            <span className="text-[10px] text-on-surface-variant">{record.doctor}</span>
                          </div>
                          <p className="font-body-sm font-bold text-on-surface">{record.treatment}</p>
                          <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1">{record.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-surface-container-low p-6 border-t border-outline-variant/30">
                <button
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:shadow-[0_8px_20px_-6px_rgba(123,84,85,0.4)] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  onClick={handleAddToQueue}
                >
                  <span className="material-symbols-outlined text-[20px]">queue</span>
                  Add to Today&apos;s Queue
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card ambient-shadow rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline-variant/40">person_search</span>
              <p className="font-body-md text-on-surface-variant mt-2">Select a patient to view their record.</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowRegisterModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">Register New Patient</h3>
              <button className="text-on-surface-variant hover:text-error" onClick={() => setShowRegisterModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Full Name *</label>
                <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Enter full name" value={newPatient.name} onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Phone *</label>
                  <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="+62 8xx-xxxx-xxxx" value={newPatient.phone} onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Date of Birth</label>
                  <input type="date" className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" value={newPatient.dob} onChange={(e) => setNewPatient(prev => ({ ...prev, dob: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Gender</label>
                  <select className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" value={newPatient.gender} onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' }))}>
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Allergies</label>
                  <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="None" value={newPatient.allergies} onChange={(e) => setNewPatient(prev => ({ ...prev, allergies: e.target.value }))} />
                </div>
              </div>
            </div>
            <button className="w-full bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2" onClick={handleRegister}>
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Register Patient
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
