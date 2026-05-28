'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DOCTORS } from '../../../lib/mock-data';

type StaffRole = 'Doctor' | 'Pharmacist' | 'Receptionist' | 'Therapist';
type StaffStatus = 'Active' | 'On Leave';

interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  specialty: string;
  status: StaffStatus;
  joinDate: string;
  patientsSeen: number;
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
    imageUrl: d.imageUrl,
  })),
  {
    id: 'S001', name: 'Anna Kusuma', role: 'Pharmacist', specialty: 'Clinical Pharmacy',
    status: 'Active', joinDate: 'Mar 2022', patientsSeen: 0,
    imageUrl: '',
  },
  {
    id: 'S002', name: 'Rizky Pratama', role: 'Receptionist', specialty: 'Front Desk',
    status: 'Active', joinDate: 'Jun 2023', patientsSeen: 0,
    imageUrl: '',
  },
  {
    id: 'S003', name: 'Dewi Sartika', role: 'Pharmacist', specialty: 'Compounding',
    status: 'On Leave', joinDate: 'Aug 2022', patientsSeen: 0,
    imageUrl: '',
  },
];

export default function OwnerEmployeesPage() {
  const [staff, setStaff] = useState(STAFF_LIST);
  const [selectedId, setSelectedId] = useState<string | null>('D001');
  const [roleFilter, setRoleFilter] = useState<'All' | StaffRole>('All');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', role: 'Doctor' as StaffRole, specialty: '', joinDate: '', imageUrl: '' });

  const selected = staff.find(s => s.id === selectedId);
  const filtered = staff.filter(s => roleFilter === 'All' || s.role === roleFilter);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl: url });
    }
  };

  const toggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id !== id) return s;
      const newStatus: StaffStatus = s.status === 'Active' ? 'On Leave' : 'Active';
      toast.success(`Status ${s.name} diperbarui menjadi ${newStatus === 'Active' ? 'Aktif' : 'Cuti'}.`);
      return { ...s, status: newStatus };
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.specialty || !formData.joinDate) {
      toast.error('Mohon lengkapi semua data karyawan.');
      return;
    }
    if (editingId) {
      setStaff(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } : s));
      toast.success('Profil karyawan berhasil diperbarui!');
    } else {
      const newId = `S${String(staff.length + 1).padStart(3, '0')}`;
      const newStaff: StaffMember = {
        id: newId,
        ...formData,
        status: 'Active',
        patientsSeen: 0,
      };
      setStaff(prev => [...prev, newStaff]);
      setSelectedId(newId);
      toast.success('Karyawan baru berhasil ditambahkan!');
    }
    setShowModal(false);
    setFormData({ name: '', role: 'Doctor', specialty: '', joinDate: '', imageUrl: '' });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus karyawan ini?')) {
      setStaff(prev => prev.filter(s => s.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast.success('Karyawan berhasil dihapus.');
    }
  };

  const getRoleColor = (role: StaffRole) => {
    switch(role) {
      case 'Doctor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pharmacist': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Receptionist': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Therapist': return 'bg-teal-100 text-teal-700 border-teal-200';
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

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
            {(['All', 'Doctor', 'Pharmacist', 'Receptionist', 'Therapist'] as const).map(r => (
              <button
                key={r}
                className={`px-3 py-1.5 rounded-lg font-label-md text-[12px] transition-colors ${roleFilter === r ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
                onClick={() => setRoleFilter(r)}
              >{r === 'All' ? 'Semua' : r === 'Doctor' ? 'Dokter' : r === 'Pharmacist' ? 'Apoteker' : r === 'Receptionist' ? 'Resepsionis' : 'Terapis'}</button>
            ))}
          </div>
          <button 
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-label-md flex items-center gap-2 hover:bg-primary/90 shadow-md active:scale-95 transition-all"
            onClick={() => { setEditingId(null); setFormData({ name: '', role: 'Doctor', specialty: '', joinDate: '', imageUrl: '' }); setShowModal(true); }}
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
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'Doctor').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Dokter</p>
          </div>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-purple-600">medication</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'Pharmacist').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Apoteker</p>
          </div>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600">support_agent</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'Receptionist').length}</p>
            <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Resepsionis</p>
          </div>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-600">spa</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-on-surface leading-none">{staff.filter(s => s.role === 'Therapist').length}</p>
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
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getRoleColor(s.role)}`}>{s.role === 'Doctor' ? 'Dokter' : s.role === 'Pharmacist' ? 'Apoteker' : s.role === 'Receptionist' ? 'Resepsionis' : 'Terapis'}</span>
                <span className={`w-2 h-2 rounded-full ${s.status === 'Active' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
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
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(selected.role)}`}>{selected.role === 'Doctor' ? 'Dokter' : selected.role === 'Pharmacist' ? 'Apoteker' : selected.role === 'Receptionist' ? 'Resepsionis' : 'Terapis'}</span>
                    <span className={`flex items-center gap-1 text-[11px] font-bold ${selected.status === 'Active' ? 'text-green-600' : 'text-orange-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${selected.status === 'Active' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                      {selected.status === 'Active' ? 'Aktif' : 'Cuti'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 text-center">
                    <p className="text-[24px] font-bold text-on-surface leading-none">{selected.patientsSeen || '—'}</p>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Pasien Ditangani</p>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 text-center">
                    <p className="text-[24px] font-bold text-on-surface leading-none">{selected.joinDate.split(' ').pop()}</p>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Tahun Bergabung</p>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20">
                  <h4 className="font-label-md text-label-md uppercase text-outline flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    Detail Kepegawaian
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 text-body-sm">
                    <span className="text-on-surface-variant">ID Karyawan</span>
                    <span className="text-on-surface font-bold font-mono">{selected.id}</span>
                    <span className="text-on-surface-variant">Departemen</span>
                    <span className="text-on-surface font-bold">{selected.role === 'Doctor' ? 'Medis' : selected.role === 'Pharmacist' ? 'Farmasi' : selected.role === 'Receptionist' ? 'Administrasi' : 'Klinis & Perawatan'}</span>
                    <span className="text-on-surface-variant">Tanggal Bergabung</span>
                    <span className="text-on-surface font-bold">{selected.joinDate}</span>
                    <span className="text-on-surface-variant">Status</span>
                    <span className={`font-bold ${selected.status === 'Active' ? 'text-green-600' : 'text-orange-500'}`}>{selected.status === 'Active' ? 'Aktif' : 'Cuti'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    className={`flex-1 py-3 rounded-xl font-label-md flex items-center justify-center gap-2 transition-all shadow-sm ${selected.status === 'Active' ? 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200' : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'}`}
                    onClick={() => toggleStatus(selected.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">{selected.status === 'Active' ? 'pause_circle' : 'play_circle'}</span>
                    {selected.status === 'Active' ? 'Atur Cuti' : 'Atur Aktif'}
                  </button>
                  <button
                    className="flex-1 py-3 bg-primary-container text-primary rounded-xl font-label-md flex items-center justify-center gap-2 hover:bg-primary/20 transition-all shadow-sm"
                    onClick={() => { setEditingId(selected.id); setFormData({ name: selected.name, role: selected.role, specialty: selected.specialty, joinDate: selected.joinDate, imageUrl: selected.imageUrl || '' }); setShowModal(true); }}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit
                  </button>
                  <button
                    className="flex-1 py-3 bg-error-container text-error rounded-xl font-label-md flex items-center justify-center gap-2 hover:bg-error/20 transition-all shadow-sm"
                    onClick={() => handleDelete(selected.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card ambient-shadow rounded-2xl p-12 text-center sticky top-24">
              <span className="material-symbols-outlined text-[64px] text-outline-variant/40">person_search</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-4 mb-2">Belum Ada Karyawan Dipilih</p>
              <p className="font-body-md text-on-surface-variant">Pilih anggota staf dari direktori untuk melihat profil dan metrik mereka.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal CRUD Karyawan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">{editingId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</h3>
              <button className="text-on-surface-variant hover:text-error transition-colors" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-dashed border-outline-variant/60 flex items-center justify-center overflow-hidden hover:border-primary transition-all">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[32px] text-outline-variant group-hover:text-primary transition-colors">add_a_photo</span>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <p className="text-[11px] text-on-surface-variant mt-2">Unggah Foto Profil</p>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Nama Lengkap</label>
                <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Masukkan nama karyawan" />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Peran</label>
                <select className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as StaffRole })}>
                  <option value="Doctor">Dokter</option>
                  <option value="Pharmacist">Apoteker</option>
                  <option value="Receptionist">Resepsionis</option>
                  <option value="Therapist">Terapis</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Spesialisasi / Departemen</label>
                <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} placeholder="Contoh: Dermatologist" />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Bulan/Tahun Bergabung</label>
                <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Contoh: Jan 2024" value={formData.joinDate} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} />
              </div>
            </div>
            <button className="w-full bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-4" onClick={handleSave}>
              <span className="material-symbols-outlined text-[20px]">{editingId ? 'save' : 'person_add'}</span>
              {editingId ? 'Simpan Perubahan' : 'Tambah Karyawan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
