'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getClinicProfile, updateClinicProfile, updateOperatingHours } from '@/actions/clinic';
import { getSystemAccounts, resetPassword } from '@/actions/auth';
import type { UserRole } from '@/generated/prisma/client';

export default function OwnerSettingsPage() {
  const [profile, setProfile] = useState<any>({
    name: '',
    address: '',
    phone: '',
    email: '',
    licenseNumber: '',
  });

  const [hours, setHours] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingHours, setEditingHours] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const [clinicData, accData] = await Promise.all([
        getClinicProfile(),
        getSystemAccounts(),
      ]);

      setProfile(clinicData);
      setHours(clinicData.operatingHours || []);
      setAccounts(accData);
    } catch (error) {
      toast.error('Gagal memuat pengaturan sistem');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveProfile = async () => {
    try {
      await updateClinicProfile({
        name: profile.name,
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
      });
      toast.success('Profil klinik berhasil disimpan.');
      setEditingProfile(false);
    } catch (error) {
      toast.error('Gagal menyimpan profil klinik');
    }
  };

  const handleSaveHours = async () => {
    try {
      await updateOperatingHours(hours.map(h => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isOpen: h.isOpen
      })));
      toast.success('Jam operasional berhasil disimpan.');
      setEditingHours(false);
    } catch (error) {
      toast.error('Gagal menyimpan jam operasional');
    }
  };

  const toggleDay = (idx: number) => {
    if (!editingHours) return;
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, isOpen: !h.isOpen } : h));
  };

  const updateHoursState = (idx: number, field: 'openTime' | 'closeTime', value: string) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const handleResetPassword = async (userId: string, email: string) => {
    const newPass = prompt(`Masukkan kata sandi baru untuk ${email}:`);
    if (!newPass) return;
    
    if (newPass.length < 6) {
      toast.error('Kata sandi harus minimal 6 karakter.');
      return;
    }

    try {
      await resetPassword(userId, newPass);
      toast.success(`Kata sandi untuk ${email} berhasil direset.`);
    } catch (error) {
      toast.error('Gagal mereset kata sandi');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'OWNER': return 'shield_person';
      case 'KASIR': return 'point_of_sale';
      case 'APOTEKER': return 'medication';
      default: return 'person';
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat pengaturan...</div>;
  }

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[32px]">settings</span>
          Pengaturan Klinik
        </h2>
        <p className="font-body-md text-on-surface-variant mt-1">Kelola profil klinik, jam operasional, dan konfigurasi sistem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Clinic Profile */}
        <div className="glass-card ambient-shadow rounded-2xl overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-headline-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">store</span>
              Profil Klinik
            </h3>
            {!editingProfile ? (
              <button
                className="px-3 py-1.5 bg-white border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-[12px] hover:bg-surface-container transition-all flex items-center gap-1.5"
                onClick={() => setEditingProfile(true)}
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>Ubah
              </button>
            ) : (
              <button
                className="px-3 py-1.5 bg-primary text-white rounded-xl font-label-md text-[12px] hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                onClick={handleSaveProfile}
              >
                <span className="material-symbols-outlined text-[14px]">check</span>Simpan
              </button>
            )}
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">Nama Klinik</label>
              {editingProfile ? (
                <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={profile.name} onChange={(e) => setProfile((prev: any) => ({ ...prev, name: e.target.value }))} />
              ) : (
                <p className="font-body-md text-on-surface font-bold">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">Alamat</label>
              {editingProfile ? (
                <textarea className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[60px]" value={profile.address} onChange={(e) => setProfile((prev: any) => ({ ...prev, address: e.target.value }))} />
              ) : (
                <p className="font-body-md text-on-surface">{profile.address || '-'}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">Telepon</label>
                {editingProfile ? (
                  <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={profile.phone} onChange={(e) => setProfile((prev: any) => ({ ...prev, phone: e.target.value }))} />
                ) : (
                  <p className="font-body-md text-on-surface">{profile.phone || '-'}</p>
                )}
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">Email</label>
                {editingProfile ? (
                  <input type="email" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={profile.email} onChange={(e) => setProfile((prev: any) => ({ ...prev, email: e.target.value }))} />
                ) : (
                  <p className="font-body-md text-on-surface">{profile.email || '-'}</p>
                )}
              </div>
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1.5">No. Izin Medis</label>
              <p className="font-body-md text-on-surface font-mono bg-surface-container px-3 py-1.5 rounded-lg w-fit">{profile.licenseNumber || '-'}</p>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="glass-card ambient-shadow rounded-2xl overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-headline-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              Jam Operasional
            </h3>
            {!editingHours ? (
              <button
                className="px-3 py-1.5 bg-white border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-[12px] hover:bg-surface-container transition-all flex items-center gap-1.5"
                onClick={() => setEditingHours(true)}
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>Ubah
              </button>
            ) : (
              <button
                className="px-3 py-1.5 bg-primary text-white rounded-xl font-label-md text-[12px] hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                onClick={handleSaveHours}
              >
                <span className="material-symbols-outlined text-[14px]">check</span>Simpan Jam
              </button>
            )}
          </div>
          <div className="p-6 space-y-3">
            {hours.map((h, idx) => (
              <div key={h.dayOfWeek} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${h.isOpen ? 'bg-white border-outline-variant/20' : 'bg-surface-container-low/50 border-outline-variant/10 opacity-60'}`}>
                <button
                  className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${h.isOpen ? 'bg-primary' : 'bg-outline-variant/40'} ${!editingHours ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={() => toggleDay(idx)}
                  disabled={!editingHours}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${h.isOpen ? 'left-[18px]' : 'left-0.5'}`}></span>
                </button>
                <span className="font-body-md text-on-surface font-bold w-24">{h.dayOfWeek}</span>
                {h.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 font-body-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-80 disabled:bg-surface-container-low"
                      value={h.openTime}
                      onChange={(e) => updateHoursState(idx, 'openTime', e.target.value)}
                      disabled={!editingHours}
                    />
                    <span className="text-on-surface-variant font-body-sm">s/d</span>
                    <input
                      type="time"
                      className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 font-body-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-80 disabled:bg-surface-container-low"
                      value={h.closeTime}
                      onChange={(e) => updateHoursState(idx, 'closeTime', e.target.value)}
                      disabled={!editingHours}
                    />
                  </div>
                ) : (
                  <span className="font-body-sm text-on-surface-variant italic">Tutup</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Access */}
      <div className="glass-card ambient-shadow rounded-2xl overflow-hidden mt-6">
        <div className="bg-primary/5 p-6 border-b border-outline-variant/30">
          <h3 className="font-headline-sm font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            Kontrol Akses Sistem
          </h3>
          <p className="font-body-sm text-on-surface-variant mt-1">Kelola kredensial login untuk setiap peran di sistem.</p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Peran</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Nama Karyawan</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-primary-container/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">{getRoleIcon(acc.role)}</span>
                      <span className="font-body-md font-bold text-on-surface">{acc.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-on-surface">
                    {acc.employee?.name || '-'}
                  </td>
                  <td className="px-4 py-4 font-mono text-[12px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded w-fit">{acc.email}</td>
                  <td className="px-4 py-4">
                    <span className={`flex items-center gap-1.5 text-[11px] font-bold ${acc.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${acc.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {acc.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg font-label-md text-[11px] hover:bg-surface-container-highest transition-colors"
                      onClick={() => handleResetPassword(acc.id, acc.email)}
                    >
                      Reset Kata Sandi
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
