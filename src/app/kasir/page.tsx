'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getPatients, createPatient } from '@/actions/patient';
import { getDoctors, getTherapists } from '@/actions/employee';
import { addToQueue } from '@/actions/queue';
import { formatDate, getInitials } from '@/lib/utils';
import type { PatientStatus } from '@/generated/prisma/client';

// Define the mapped type for the UI
type MappedPatient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: string;
  phone: string;
  dob: string;
  allergies: string;
  registeredDate: string;
  status: string;
  lastVisitDate: string;
  lastVisitTreatment: string;
  lastVisitDoctor: string;
  medicalHistory: { date: string; doctor: string; diagnosis: string; notes: string }[];
  noRM: string;
  nik: string;
  namaWali?: string;
  pekerjaan?: string;
};

export default function KasirDashboard() {
  const [patients, setPatients] = useState<MappedPatient[]>([]);
  const [doctors, setDoctors] = useState<{ id: string, name: string }[]>([]);
  const [therapists, setTherapists] = useState<{ id: string, name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNoRM, setSelectedNoRM] = useState<string>('');
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueData, setQueueData] = useState({ doctorId: '', therapistId: '' });
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', dob: '', gender: 'FEMALE' as 'MALE' | 'FEMALE', allergies: '', address: '', nik: '', namaWali: '', pekerjaan: '' });
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [patientsData, doctorsData, therapistsData] = await Promise.all([
          getPatients(),
          getDoctors(),
          getTherapists()
        ]);

        const mappedPatients: MappedPatient[] = patientsData.map((p: any) => {
          const lastRecord = p.medicalRecords?.[0];
          const lastTx = p.transactions?.[0];

          let lastVisitDate = 'Belum ada';
          let lastVisitTreatment = '-';
          let lastVisitDoctor = '-';

          if (lastTx) {
            lastVisitDate = formatDate(lastTx.createdAt);
            const services = lastTx.items?.filter((i: any) => i.itemType === 'SERVICE') || [];
            lastVisitTreatment = services.length > 0 ? services.map((i: any) => i.service?.name || i.itemName).join(', ') : '-';

            const txTime = new Date(lastTx.createdAt).getTime();
            const matchedQueue = p.queues?.reduce((closest: any, q: any) => {
              const qTime = new Date(q.createdAt).getTime();
              if (!closest || Math.abs(qTime - txTime) < Math.abs(new Date(closest.createdAt).getTime() - txTime)) {
                return q;
              }
              return closest;
            }, null);

            const docName = lastRecord?.doctor?.name || matchedQueue?.doctor?.name;
            const therName = matchedQueue?.therapist?.name;
            const handlers = [];
            if (docName) handlers.push(`Dr. ${docName.replace('Dr. ', '')}`);
            if (therName) handlers.push(therName);
            lastVisitDoctor = handlers.length > 0 ? handlers.join(' & ') : '-';

          } else if (lastRecord) {
            lastVisitDate = formatDate(lastRecord.visitDate);
            lastVisitTreatment = lastRecord.treatment || '-';
            lastVisitDoctor = lastRecord.doctor?.name ? `Dr. ${lastRecord.doctor.name.replace('Dr. ', '')}` : '-';
          }

          const hasTransactions = p.transactions && p.transactions.length > 0;
          const statusStr = (hasTransactions || p.status !== 'NEW_PATIENT') ? 'Returning' : 'New Patient';

          const age = p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 0;
          return {
            id: p.id,
            name: p.name,
            initials: getInitials(p.name),
            age,
            gender: p.gender === 'FEMALE' ? 'Female' : 'Male',
            phone: p.phone || '',
            dob: formatDate(p.dateOfBirth),
            allergies: p.allergies || 'None',
            registeredDate: formatDate(p.registeredAt),
            status: statusStr,
            lastVisitDate,
            lastVisitTreatment,
            lastVisitDoctor,
            medicalHistory: (p.medicalRecords || []).map((r: any) => {
              // Try to find matching queue by visitDate
              const vTime = new Date(r.visitDate).getTime();
              const mQueue = p.queues?.reduce((closest: any, q: any) => {
                const qTime = new Date(q.createdAt).getTime();
                if (!closest || Math.abs(qTime - vTime) < Math.abs(new Date(closest.createdAt).getTime() - vTime)) {
                  return q;
                }
                return closest;
              }, null);
              const dName = r.doctor?.name || mQueue?.doctor?.name;
              const tName = mQueue?.therapist?.name;
              const hnd = [];
              if (dName) hnd.push(`Dr. ${dName.replace('Dr. ', '')}`);
              if (tName) hnd.push(tName);

              return {
                date: formatDate(r.visitDate),
                doctor: hnd.length > 0 ? hnd.join(' & ') : 'Unknown',
                diagnosis: r.diagnosis || '-',
                notes: r.notes || ''
              };
            }),
            noRM: p.noRM,
            nik: p.nik || '',
            namaWali: p.guardianName || undefined,
            pekerjaan: p.occupation || undefined,
          };
        });

        setPatients(mappedPatients);
        setDoctors(doctorsData);
        setTherapists(therapistsData);

        if (mappedPatients.length > 0 && !selectedNoRM) {
          setSelectedNoRM(mappedPatients[0].noRM);
        }
        if (doctorsData.length > 0) setQueueData(prev => ({ ...prev, doctorId: doctorsData[0].id }));
        if (therapistsData.length > 0) setQueueData(prev => ({ ...prev, therapistId: therapistsData[0].id }));
      } catch (error) {
        toast.error('Gagal memuat data pasien');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedNoRM]); // Initial load only, selectedNoRM handled safely inside

  const selected = patients.find(p => p.noRM === selectedNoRM);
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.noRM && p.noRM.toLowerCase().includes(search.toLowerCase())) ||
    (p.nik && p.nik.toLowerCase().includes(search.toLowerCase())) ||
    p.phone.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleRegister = async () => {
    if (!newPatient.name || !newPatient.nik || !newPatient.address || !newPatient.phone || !newPatient.dob || !newPatient.gender) {
      toast.error('Semua kolom yang memiliki tanda (*) wajib diisi.');
      return;
    }

    try {
      const created = await createPatient({
        nik: newPatient.nik,
        name: newPatient.name,
        gender: newPatient.gender,
        phone: newPatient.phone,
        dateOfBirth: newPatient.dob || undefined,
        allergies: newPatient.allergies,
        guardianName: newPatient.namaWali,
        occupation: newPatient.pekerjaan,
        address: newPatient.address || undefined
      });

      const mapped: MappedPatient = {
        id: created.id,
        name: created.name,
        initials: getInitials(created.name),
        age: created.dateOfBirth ? new Date().getFullYear() - created.dateOfBirth.getFullYear() : 0,
        gender: created.gender === 'FEMALE' ? 'Female' : 'Male',
        phone: created.phone || '',
        dob: formatDate(created.dateOfBirth),
        allergies: created.allergies || 'None',
        registeredDate: formatDate(created.registeredAt),
        status: 'New Patient',
        lastVisitDate: 'Belum ada',
        lastVisitTreatment: '-',
        lastVisitDoctor: '-',
        medicalHistory: [],
        noRM: created.noRM,
        nik: created.nik || '',
        namaWali: created.guardianName || undefined,
        pekerjaan: created.occupation || undefined
      };

      setPatients(prev => [mapped, ...prev]);
      setSelectedNoRM(mapped.noRM);
      setShowRegisterModal(false);
      setNewPatient({ name: '', phone: '', dob: '', gender: 'FEMALE', allergies: '', address: '', nik: '', namaWali: '', pekerjaan: '' });
      toast.success(`Pasien ${mapped.name} berhasil didaftarkan!`);
    } catch (error) {
      toast.error('Gagal mendaftar pasien. Mungkin No RM / NIK sudah ada.');
    }
  };

  const handleAddToQueue = async () => {
    if (!selected) return;

    if (!queueData.doctorId && !queueData.therapistId) {
      toast.error('Silakan pilih minimal Dokter atau Terapis');
      return;
    }

    try {
      await addToQueue({
        patientId: selected.id,
        doctorId: queueData.doctorId || undefined,
        therapistId: queueData.therapistId || undefined,
        serviceName: selected.lastVisitTreatment !== '-' ? selected.lastVisitTreatment : 'General Consultation'
      });

      toast.success(`${selected.name} berhasil ditambahkan ke antrean!`);
      setShowQueueModal(false);
      router.push('/kasir/billing');
    } catch (error) {
      toast.error('Gagal menambahkan ke antrean');
    }
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">dashboard</span>
            Dashboard & Rekam Medis
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Kelola pendaftaran pasien dan lihat rekam medis.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Cari nama, No. RM, NIK..."
              className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant/60 rounded-xl text-body-sm w-72 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
            onClick={() => setShowRegisterModal(true)}
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span> Daftar Pasien Baru
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
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Detail Pasien</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Kunjungan Terakhir</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginated.map(p => (
                  <tr
                    key={p.noRM}
                    className={`transition-colors cursor-pointer ${selectedNoRM === p.noRM ? 'bg-primary-container/10 border-l-4 border-l-primary' : 'hover:bg-primary-container/5'}`}
                    onClick={() => setSelectedNoRM(p.noRM)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-body-md font-semibold text-on-surface">{p.name}</div>
                      <div className="font-body-sm text-on-surface-variant">RM: {p.noRM}</div>
                    </td>
                    <td className="px-6 py-4"><div className="font-body-sm text-on-surface">{p.phone}</div></td>
                    <td className="px-6 py-4">
                      <div className="font-body-sm font-bold text-on-surface">{p.lastVisitDate}</div>
                      <div className="font-body-sm text-on-surface-variant line-clamp-1">{p.lastVisitTreatment}</div>
                      {p.lastVisitDoctor !== '-' && (
                        <div className="text-[11px] text-primary font-medium mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">stethoscope</span>
                          {p.lastVisitDoctor}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${p.status === 'New Patient' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>{p.status === 'New Patient' ? 'Pasien Baru' : 'Kunjungan Ulang'}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">Tidak ada pasien ditemukan untuk &quot;{search}&quot;</td></tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filtered.length > 0 && (
              <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between bg-white/50">
                <span className="text-body-sm text-on-surface-variant">
                  Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} dari {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30"
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
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
                  <p className="font-body-sm text-on-surface-variant">RM: {selected.noRM} • Terdaftar: {selected.registeredDate}</p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Tanggal Lahir</p>
                    <p className="font-body-sm font-semibold text-on-surface">{selected.dob} ({selected.age} thn)</p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Alergi</p>
                    <p className={`font-body-sm font-semibold ${selected.allergies !== 'None' ? 'text-error' : 'text-on-surface'}`}>{selected.allergies === 'None' ? 'Tidak ada' : selected.allergies}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md uppercase text-outline mb-3">Riwayat Medis Terakhir</h4>
                  {selected.medicalHistory.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant italic">Belum ada riwayat medis.</p>
                  ) : (
                    <div className="space-y-3">
                      {selected.medicalHistory.slice(0, 3).map((record, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border shadow-sm ${idx === 0 ? 'bg-surface-container-lowest border-primary/20' : 'bg-surface-container-lowest border-outline-variant/20 opacity-70'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-label-md ${idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{record.date}</span>
                            <span className="text-[10px] text-on-surface-variant">{record.doctor}</span>
                          </div>
                          <p className="font-body-sm font-bold text-on-surface">{record.diagnosis}</p>
                          <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1">{record.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-surface-container-low p-6 border-t border-outline-variant/30">
                <button
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:shadow-[0_8px_20px_-6px_rgba(194,160,88,0.4)] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  onClick={() => setShowQueueModal(true)}
                >
                  <span className="material-symbols-outlined text-[20px]">queue</span>
                  Tambah ke Antrean Hari Ini
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card ambient-shadow rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline-variant/40">person_search</span>
              <p className="font-body-md text-on-surface-variant mt-2">Pilih pasien untuk melihat rekam medisnya.</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowRegisterModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">Daftar Pasien Baru</h3>
              <button className="text-on-surface-variant hover:text-error" onClick={() => setShowRegisterModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Nama Lengkap *</label>
                  <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Masukkan nama lengkap" value={newPatient.name} onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">NIK *</label>
                  <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Masukkan NIK" value={newPatient.nik} onChange={(e) => setNewPatient(prev => ({ ...prev, nik: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Alamat Lengkap *</label>
                  <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Masukkan alamat pasien" value={newPatient.address} onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))} />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Nama Wali</label>
                  <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Nama wali pasien" value={newPatient.namaWali} onChange={(e) => setNewPatient(prev => ({ ...prev, namaWali: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Telepon *</label>
                  <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="+62 8xx-xxxx-xxxx" value={newPatient.phone} onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Tanggal Lahir *</label>
                  <input type="date" className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" value={newPatient.dob} onChange={(e) => setNewPatient(prev => ({ ...prev, dob: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Jenis Kelamin *</label>
                  <select className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" value={newPatient.gender} onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' }))}>
                    <option value="FEMALE">Perempuan</option>
                    <option value="MALE">Laki-laki</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Pekerjaan</label>
                  <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Pekerjaan" value={newPatient.pekerjaan} onChange={(e) => setNewPatient(prev => ({ ...prev, pekerjaan: e.target.value }))} />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Alergi</label>
                  <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Tidak ada" value={newPatient.allergies} onChange={(e) => setNewPatient(prev => ({ ...prev, allergies: e.target.value }))} />
                </div>
              </div>
            </div>
            <button className="w-full bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2" onClick={handleRegister}>
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Daftar Pasien
            </button>
          </div>
        </div>
      )}
      {/* Queue Modal */}
      {showQueueModal && selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowQueueModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">Tambahkan ke Antrean</h3>
              <button className="text-on-surface-variant hover:text-error transition-colors" onClick={() => setShowQueueModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 bg-primary-container/20 rounded-xl border border-primary-container/30">
              <p className="font-body-sm text-on-surface-variant mb-1">Pasien Terpilih</p>
              <p className="font-headline-sm font-bold text-primary">{selected.name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Pilih Dokter</label>
                <select className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={queueData.doctorId} onChange={e => setQueueData({ ...queueData, doctorId: e.target.value })}>
                  <option value="">Tanpa Dokter</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Pilih Terapis</label>
                <select className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={queueData.therapistId} onChange={e => setQueueData({ ...queueData, therapistId: e.target.value })}>
                  <option value="">Tanpa Terapis</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>{therapist.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="w-full bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-4" onClick={handleAddToQueue}>
              <span className="material-symbols-outlined text-[20px]">send</span>
              Konfirmasi Antrean & Transaksi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
