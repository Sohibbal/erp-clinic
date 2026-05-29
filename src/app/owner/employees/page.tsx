'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getEmployees, createEmployee, updateEmployee, toggleEmployeeStatus, deleteEmployee } from '@/actions/employee';
import type { EmployeeRole, EmployeeStatus } from '@/generated/prisma/client';

type FilterRole = 'All' | EmployeeRole;

export default function OwnerEmployeesPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<FilterRole>('All');
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', role: 'DOCTOR' as EmployeeRole, specialty: '', joinDate: '', imageUrl: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const data = await getEmployees();
      setStaff(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (error) {
      toast.error('Gagal memuat data karyawan');
    } finally {
      setIsLoading(false);
    }
  }

  const selected = staff.find(s => s.id === selectedId);
  const filtered = staff.filter(s => roleFilter === 'All' || s.role === roleFilter);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl: url });
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await toggleEmployeeStatus(id);
      const emp = staff.find(s => s.id === id);
      const newStatus = emp.status === 'ACTIVE' ? 'ON_LEAVE' : 'ACTIVE';
      toast.success(`Status ${emp.name} diperbarui menjadi ${newStatus === 'ACTIVE' ? 'Aktif' : 'Cuti'}.`);
      await loadData();
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.specialty || !formData.joinDate) {
      toast.error('Mohon lengkapi semua data karyawan.');
      return;
    }
    try {
      if (editingId) {
        await updateEmployee(editingId, formData);
        toast.success('Profil karyawan berhasil diperbarui!');
      } else {
        await createEmployee(formData);
        toast.success('Karyawan baru berhasil ditambahkan!');
      }
      setShowModal(false);
      setFormData({ name: '', role: 'DOCTOR', specialty: '', joinDate: '', imageUrl: '' });
      setEditingId(null);
      await loadData();
    } catch (error) {
      toast.error('Gagal menyimpan data karyawan');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus karyawan ini?')) {
      try {
        await deleteEmployee(id);
        if (selectedId === id) setSelectedId(null);
        toast.success('Karyawan berhasil dihapus.');
        await loadData();
      } catch (error) {
        toast.error('Gagal menghapus karyawan');
      }
    }
  };

  const getRoleColor = (role: EmployeeRole) => {
    switch(role) {
      case 'DOCTOR': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PHARMACIST': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'RECEPTIONIST': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'THERAPIST': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatRole = (role: EmployeeRole) => {
    switch(role) {
      case 'DOCTOR': return 'Dokter';
      case 'PHARMACIST': return 'Apoteker';
      case 'RECEPTIONIST': return 'Staf';
      case 'THERAPIST': return 'Terapis';
      default: return role;
    }
  }

  const getInitials = (name: string) => (name || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat karyawan...</div>;
  }

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">groups</span>
            Manajemen Karyawan
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Direktori staf, metrik performa, dan manajemen peran.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
            {(['All', 'DOCTOR', 'PHARMACIST', 'RECEPTIONIST', 'THERAPIST'] as const).map(r => (
              <button
                key={r}
                className={`px-3 py-1.5 rounded-lg font-label-md text-[12px] transition-colors ${roleFilter === r ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
                onClick={() => setRoleFilter(r as FilterRole)}
              >{r === 'All' ? 'Semua' : formatRole(r as EmployeeRole)}</button>
            ))}
          </div>
          <button 
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-label-md flex items-center gap-2 hover:bg-primary/90 shadow-md active:scale-95 transition-all"
            onClick={() => { setEditingId(null); setFormData({ name: '', role: 'DOCTOR', specialty: '', joinDate: new Date().toISOString().split('T')[0], imageUrl: '' }); setShowModal(true); }}
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Tambah Karyawan
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">stethoscope</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'DOCTOR').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Dokter</p>
          </div>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-purple-600">medication</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'PHARMACIST').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Apoteker</p>
          </div>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600">support_agent</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'RECEPTIONIST').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Staf (Resepsionis)</p>
          </div>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-600">spa</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'THERAPIST').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Terapis</p>
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
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getRoleColor(s.role)}`}>{formatRole(s.role)}</span>
                <span className={`w-2 h-2 rounded-full ${s.status === 'ACTIVE' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant bg-white rounded-2xl border border-outline-variant/20">
              Tidak ada karyawan ditemukan.
            </div>
          )}
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
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(selected.role)}`}>{formatRole(selected.role)}</span>
                    <span className={`flex items-center gap-1 text-[11px] font-bold ${selected.status === 'ACTIVE' ? 'text-green-600' : 'text-orange-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${selected.status === 'ACTIVE' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                      {selected.status === 'ACTIVE' ? 'Aktif' : 'Cuti / Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-col justify-center">
                    <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Bergabung Sejak</p>
                    <p className="font-headline-sm text-on-surface mt-1">{new Date(selected.joinDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-col justify-center">
                    <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Pasien Ditangani</p>
                    <p className="font-headline-sm text-on-surface mt-1">{selected.medicalRecords?.length || 0}</p>
                  </div>
                </div>

                <div className="border-t border-outline-variant/30 pt-6 flex flex-wrap gap-3">
                  <button 
                    className="flex-1 py-2.5 bg-primary-container text-on-primary-container rounded-xl font-label-md hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      setEditingId(selected.id);
                      setFormData({ 
                        name: selected.name, 
                        role: selected.role, 
                        specialty: selected.specialty, 
                        joinDate: new Date(selected.joinDate).toISOString().split('T')[0], 
                        imageUrl: selected.imageUrl || '' 
                      });
                      setShowModal(true);
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Profil
                  </button>
                  <button 
                    className={`flex-1 py-2.5 rounded-xl font-label-md transition-colors flex items-center justify-center gap-2 ${selected.status === 'ACTIVE' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    onClick={() => toggleStatus(selected.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">{selected.status === 'ACTIVE' ? 'event_busy' : 'event_available'}</span>
                    {selected.status === 'ACTIVE' ? 'Set Cuti' : 'Set Aktif'}
                  </button>
                  <button 
                    className="w-12 h-10 flex items-center justify-center rounded-xl bg-error-container text-error hover:bg-error/20 transition-colors"
                    onClick={() => handleDelete(selected.id)}
                    title="Hapus Karyawan"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card ambient-shadow rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[64px] mb-4 text-outline-variant">person_search</span>
              <p className="font-body-lg">Pilih karyawan untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-sm text-on-surface">{editingId ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-outline-variant/20 text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-4 mb-2">
                {formData.imageUrl ? (
                  <img alt="Preview" className="w-16 h-16 rounded-full object-cover shadow-sm" src={formData.imageUrl} />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                  </div>
                )}
                <div>
                  <label className="text-primary font-label-md cursor-pointer hover:underline">
                    Unggah Foto Profil
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <p className="text-[11px] text-on-surface-variant mt-1">Opsional. Format JPG, PNG.</p>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Contoh: Dr. Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Peran</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as EmployeeRole})}
                  >
                    <option value="DOCTOR">Dokter</option>
                    <option value="PHARMACIST">Apoteker</option>
                    <option value="RECEPTIONIST">Resepsionis / Staf</option>
                    <option value="THERAPIST">Terapis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Tanggal Bergabung</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Spesialisasi / Deskripsi Peran</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Contoh: Dokter Umum"
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                />
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-low flex justify-end gap-3">
              <button 
                className="px-5 py-2 rounded-xl font-label-md text-on-surface-variant hover:bg-outline-variant/20 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button 
                className="px-5 py-2 rounded-xl font-label-md bg-primary text-white shadow-md hover:bg-primary/90 transition-all active:scale-95"
                onClick={handleSave}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
