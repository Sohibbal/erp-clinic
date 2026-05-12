'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ClinicProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  license: string;
}

interface OperatingHours {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export default function OwnerSettingsPage() {
  const [profile, setProfile] = useState<ClinicProfile>({
    name: 'Aura Beauty Clinic',
    address: 'Jl. Sudirman No. 123, Jakarta Selatan, 12930',
    phone: '+62 21-5555-8899',
    email: 'info@aurabeauty.co.id',
    license: 'SIP-2023-JKT-00412',
  });

  const [hours, setHours] = useState<OperatingHours[]>([
    { day: 'Monday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Tuesday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Wednesday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Thursday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Friday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Saturday', open: '10:00', close: '15:00', isOpen: true },
    { day: 'Sunday', open: '00:00', close: '00:00', isOpen: false },
  ]);

  const [editingProfile, setEditingProfile] = useState(false);

  const handleSaveProfile = () => {
    setEditingProfile(false);
    toast.success('Clinic profile saved successfully.');
  };

  const toggleDay = (idx: number) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, isOpen: !h.isOpen } : h));
  };

  const updateHours = (idx: number, field: 'open' | 'close', value: string) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[32px]">settings</span>
          Clinic Settings
        </h2>
        <p className="font-body-md text-on-surface-variant mt-1">Manage clinic profile, operating hours, and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Clinic Profile */}
        <div className="glass-card ambient-shadow rounded-2xl overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-headline-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">store</span>
              Clinic Profile
            </h3>
            {!editingProfile ? (
              <button
                className="px-3 py-1.5 bg-white border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-[12px] hover:bg-surface-container transition-all flex items-center gap-1.5"
                onClick={() => setEditingProfile(true)}
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>Edit
              </button>
            ) : (
              <button
                className="px-3 py-1.5 bg-primary text-white rounded-xl font-label-md text-[12px] hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                onClick={handleSaveProfile}
              >
                <span className="material-symbols-outlined text-[14px]">check</span>Save
              </button>
            )}
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">Clinic Name</label>
              {editingProfile ? (
                <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={profile.name} onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))} />
              ) : (
                <p className="font-body-md text-on-surface font-bold">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">Address</label>
              {editingProfile ? (
                <textarea className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[60px]" value={profile.address} onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))} />
              ) : (
                <p className="font-body-md text-on-surface">{profile.address}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">Phone</label>
                {editingProfile ? (
                  <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={profile.phone} onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))} />
                ) : (
                  <p className="font-body-md text-on-surface">{profile.phone}</p>
                )}
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">Email</label>
                {editingProfile ? (
                  <input type="email" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={profile.email} onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))} />
                ) : (
                  <p className="font-body-md text-on-surface">{profile.email}</p>
                )}
              </div>
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">Medical License No.</label>
              <p className="font-body-md text-on-surface font-mono bg-surface-container px-3 py-1.5 rounded-lg w-fit">{profile.license}</p>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="glass-card ambient-shadow rounded-2xl overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-headline-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              Operating Hours
            </h3>
            <button
              className="px-3 py-1.5 bg-primary text-white rounded-xl font-label-md text-[12px] hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
              onClick={() => toast.success('Operating hours saved.')}
            >
              <span className="material-symbols-outlined text-[14px]">check</span>Save Hours
            </button>
          </div>
          <div className="p-6 space-y-3">
            {hours.map((h, idx) => (
              <div key={h.day} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${h.isOpen ? 'bg-white border-outline-variant/20' : 'bg-surface-container-low/50 border-outline-variant/10 opacity-60'}`}>
                <button
                  className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${h.isOpen ? 'bg-primary' : 'bg-outline-variant/40'}`}
                  onClick={() => toggleDay(idx)}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${h.isOpen ? 'left-[18px]' : 'left-0.5'}`}></span>
                </button>
                <span className="font-body-md text-on-surface font-bold w-24">{h.day}</span>
                {h.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 font-body-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={h.open}
                      onChange={(e) => updateHours(idx, 'open', e.target.value)}
                    />
                    <span className="text-on-surface-variant font-body-sm">to</span>
                    <input
                      type="time"
                      className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 font-body-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={h.close}
                      onChange={(e) => updateHours(idx, 'close', e.target.value)}
                    />
                  </div>
                ) : (
                  <span className="font-body-sm text-on-surface-variant italic">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Access */}
      <div className="glass-card ambient-shadow rounded-2xl overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-outline-variant/30">
          <h3 className="font-headline-sm font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            System Access Control
          </h3>
          <p className="font-body-sm text-on-surface-variant mt-1">Manage login credentials for each role in the system.</p>
        </div>
        <div className="p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {[
                { role: 'Owner', email: 'owner@aura.com', icon: 'shield_person' },
                { role: 'Kasir', email: 'kasir@aura.com', icon: 'point_of_sale' },
                { role: 'Dokter', email: 'dokter@aura.com', icon: 'stethoscope' },
                { role: 'Apoteker', email: 'apoteker@aura.com', icon: 'medication' },
              ].map(acc => (
                <tr key={acc.role} className="hover:bg-primary-container/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">{acc.icon}</span>
                      <span className="font-body-md font-bold text-on-surface">{acc.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-[12px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded w-fit">{acc.email}</td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1.5 text-green-600 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>Active
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg font-label-md text-[11px] hover:bg-surface-container-highest transition-colors"
                      onClick={() => toast.info(`Reset password for ${acc.email} — coming soon.`)}
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
