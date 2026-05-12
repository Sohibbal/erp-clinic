'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DOCTORS } from '../../../lib/mock-data';

type StaffRole = 'Doctor' | 'Pharmacist' | 'Receptionist';
type StaffStatus = 'Active' | 'On Leave';

interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  specialty: string;
  status: StaffStatus;
  joinDate: string;
  patientsSeen: number;
  rating: number;
  imageUrl: string;
}

const STAFF_LIST: StaffMember[] = [
  ...DOCTORS.map(d => ({
    id: d.id,
    name: d.name,
    role: 'Doctor' as StaffRole,
    specialty: d.specialty,
    status: 'Active' as StaffStatus,
    joinDate: 'Jan 2022',
    patientsSeen: d.patientsSeen,
    rating: d.rating,
    imageUrl: d.imageUrl,
  })),
  {
    id: 'S001', name: 'Anna Kusuma', role: 'Pharmacist', specialty: 'Clinical Pharmacy',
    status: 'Active', joinDate: 'Mar 2022', patientsSeen: 0, rating: 4.7,
    imageUrl: '',
  },
  {
    id: 'S002', name: 'Rizky Pratama', role: 'Receptionist', specialty: 'Front Desk',
    status: 'Active', joinDate: 'Jun 2023', patientsSeen: 0, rating: 4.5,
    imageUrl: '',
  },
  {
    id: 'S003', name: 'Dewi Sartika', role: 'Pharmacist', specialty: 'Compounding',
    status: 'On Leave', joinDate: 'Aug 2022', patientsSeen: 0, rating: 4.6,
    imageUrl: '',
  },
];

export default function OwnerEmployeesPage() {
  const [staff, setStaff] = useState(STAFF_LIST);
  const [selectedId, setSelectedId] = useState<string | null>('D001');
  const [roleFilter, setRoleFilter] = useState<'All' | StaffRole>('All');

  const selected = staff.find(s => s.id === selectedId);

  const filtered = staff.filter(s => roleFilter === 'All' || s.role === roleFilter);

  const toggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id !== id) return s;
      const newStatus: StaffStatus = s.status === 'Active' ? 'On Leave' : 'Active';
      toast.success(`${s.name} status updated to ${newStatus}.`);
      return { ...s, status: newStatus };
    }));
  };

  const getRoleColor = (role: StaffRole) => {
    switch(role) {
      case 'Doctor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pharmacist': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Receptionist': return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">groups</span>
            Employee Management
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Staff directory, performance metrics, and role management.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
          {(['All', 'Doctor', 'Pharmacist', 'Receptionist'] as const).map(r => (
            <button
              key={r}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[12px] transition-colors ${roleFilter === r ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
              onClick={() => setRoleFilter(r)}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">stethoscope</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'Doctor').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Doctors</p>
          </div>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-purple-600">medication</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'Pharmacist').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Pharmacists</p>
          </div>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600">support_agent</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'Receptionist').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Receptionists</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Staff List */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          {filtered.map(s => (
            <div
              key={s.id}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${selectedId === s.id ? 'glass-card ambient-shadow border-l-4 border-primary' : 'bg-white border border-outline-variant/20 hover:shadow-md'}`}
              onClick={() => setSelectedId(s.id)}
            >
              {s.imageUrl ? (
                <img alt={s.name} className="w-12 h-12 rounded-full object-cover" src={s.imageUrl} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">{getInitials(s.name)}</div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-body-md font-bold text-on-surface truncate">{s.name}</h4>
                <p className="text-[11px] text-on-surface-variant">{s.specialty}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getRoleColor(s.role)}`}>{s.role}</span>
                <span className={`w-2 h-2 rounded-full ${s.status === 'Active' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="col-span-12 lg:col-span-7">
          {selected ? (
            <div className="glass-card ambient-shadow rounded-2xl overflow-hidden sticky top-24">
              {/* Profile Header */}
              <div className="bg-primary/5 p-8 border-b border-outline-variant/30 flex items-center gap-6">
                {selected.imageUrl ? (
                  <img alt={selected.name} className="w-20 h-20 rounded-2xl object-cover shadow-md" src={selected.imageUrl} />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center text-primary font-bold text-[28px] shadow-md">{getInitials(selected.name)}</div>
                )}
                <div className="flex-1">
                  <h3 className="font-headline-md text-headline-md font-bold text-primary">{selected.name}</h3>
                  <p className="font-body-sm text-on-surface-variant">{selected.specialty}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(selected.role)}`}>{selected.role}</span>
                    <span className={`flex items-center gap-1 text-[11px] font-bold ${selected.status === 'Active' ? 'text-green-600' : 'text-orange-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${selected.status === 'Active' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 text-center">
                    <p className="text-[24px] font-bold text-on-surface leading-none">{selected.patientsSeen || '—'}</p>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Patients Seen</p>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 text-center">
                    <p className="text-[24px] font-bold text-on-surface leading-none flex items-center justify-center gap-1">
                      {selected.rating}
                      <span className="material-symbols-outlined text-amber-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </p>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Rating</p>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 text-center">
                    <p className="text-[24px] font-bold text-on-surface leading-none">{selected.joinDate.split(' ')[1]}</p>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Since {selected.joinDate.split(' ')[0]}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20">
                  <h4 className="font-label-md text-label-md uppercase text-outline flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    Employment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 text-body-sm">
                    <span className="text-on-surface-variant">Employee ID</span>
                    <span className="text-on-surface font-bold font-mono">{selected.id}</span>
                    <span className="text-on-surface-variant">Department</span>
                    <span className="text-on-surface font-bold">{selected.role === 'Doctor' ? 'Medical' : selected.role === 'Pharmacist' ? 'Pharmacy' : 'Administration'}</span>
                    <span className="text-on-surface-variant">Join Date</span>
                    <span className="text-on-surface font-bold">{selected.joinDate}</span>
                    <span className="text-on-surface-variant">Status</span>
                    <span className={`font-bold ${selected.status === 'Active' ? 'text-green-600' : 'text-orange-500'}`}>{selected.status}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    className={`flex-1 py-3 rounded-xl font-label-md flex items-center justify-center gap-2 transition-all shadow-sm ${selected.status === 'Active' ? 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200' : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'}`}
                    onClick={() => toggleStatus(selected.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">{selected.status === 'Active' ? 'pause_circle' : 'play_circle'}</span>
                    {selected.status === 'Active' ? 'Set On Leave' : 'Set Active'}
                  </button>
                  <button
                    className="px-5 py-3 bg-primary text-white rounded-xl font-label-md flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
                    onClick={() => toast.info(`Edit profile for ${selected.name} — coming soon.`)}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card ambient-shadow rounded-2xl p-12 text-center sticky top-24">
              <span className="material-symbols-outlined text-[64px] text-outline-variant/40">person_search</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-4 mb-2">No Employee Selected</p>
              <p className="font-body-md text-on-surface-variant">Select a staff member from the directory to view their profile and metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
