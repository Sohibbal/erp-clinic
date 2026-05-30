'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getPatientsWithMedicalRecords, getMedicalRecordsByPatient, saveMedicalRecord } from '@/actions/medical-record';
import { formatDate } from '@/lib/utils';

export default function InputRekamMedisPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    anamnesis: '',
    diagnosis: '',
    treatment: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await getPatientsWithMedicalRecords();
        setPatients(data);
      } catch (error) {
        toast.error('Gagal memuat daftar pasien');
      } finally {
        setIsLoading(false);
      }
    }
    loadPatients();
  }, []);

  useEffect(() => {
    async function loadRecords() {
      if (!selectedPatientId) {
        setRecords([]);
        setSelectedRecordId('');
        return;
      }
      try {
        const data = await getMedicalRecordsByPatient(selectedPatientId);
        setRecords(data);
        if (data.length > 0) {
          setSelectedRecordId(data[0].id);
        } else {
          setSelectedRecordId('');
        }
      } catch (error) {
        toast.error('Gagal memuat rekam medis pasien');
      }
    }
    loadRecords();
  }, [selectedPatientId]);

  useEffect(() => {
    const record = records.find(r => r.id === selectedRecordId);
    if (record) {
      setFormData({
        anamnesis: record.anamnesis || '',
        diagnosis: record.diagnosis || '',
        treatment: record.treatment || ''
      });
    } else {
      setFormData({ anamnesis: '', diagnosis: '', treatment: '' });
    }
  }, [selectedRecordId, records]);

  const handleSave = async () => {
    if (!selectedRecordId || !selectedPatientId) return;
    setIsSaving(true);
    try {
      await saveMedicalRecord({
        transactionId: selectedRecordId,
        patientId: selectedPatientId,
        ...formData
      });
      toast.success('Rekam medis berhasil disimpan');
      // Update local state so it doesn't revert if re-rendered
      setRecords(prev => prev.map(r => r.id === selectedRecordId ? { ...r, ...formData, hasRecord: true } : r));
    } catch (error) {
      toast.error('Gagal menyimpan rekam medis');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedRecord = records.find(r => r.id === selectedRecordId);

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">medical_information</span>
            Input Rekam Medis
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Lengkapi data rekam medis pasien berdasarkan kunjungan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Selection */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-card ambient-shadow rounded-2xl p-6 space-y-4">
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Pilih Pasien</label>
              {isLoading ? (
                <div className="animate-pulse h-12 bg-surface-container-high rounded-xl"></div>
              ) : (
                <select 
                  className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md"
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                >
                  <option value="">-- Cari atau Pilih Pasien --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.noRM})</option>
                  ))}
                </select>
              )}
            </div>

            {selectedPatientId && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Kunjungan / Transaksi</label>
                <select 
                  className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md"
                  value={selectedRecordId}
                  onChange={e => setSelectedRecordId(e.target.value)}
                >
                  <option value="">-- Pilih Kunjungan --</option>
                  {records.map(r => (
                    <option key={r.id} value={r.id}>
                      {formatDate(r.visitDate)} - {r.transactionDesc}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Input Form */}
        <div className="md:col-span-8">
          <div className="glass-card ambient-shadow rounded-2xl p-6">
            {!selectedPatientId ? (
              <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-[64px] mb-4">person_search</span>
                <p className="font-body-lg">Pilih pasien terlebih dahulu</p>
              </div>
            ) : !selectedRecordId ? (
              <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-[64px] mb-4">event_note</span>
                <p className="font-body-lg">Pilih kunjungan / transaksi pasien</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                
                {/* Info Bar */}
                <div className="flex gap-4 p-4 rounded-xl bg-primary-container/20 border border-primary/20">
                  <div className="flex-1">
                    <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Tanggal Kunjungan</p>
                    <p className="font-body-md font-semibold text-primary">
                      {selectedRecord ? new Date(selectedRecord.visitDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                  {selectedRecord?.handledBy && (
                    <div className="flex-1">
                      <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Ditangani Oleh</p>
                      <p className="font-body-md font-semibold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                        {selectedRecord.handledBy}
                      </p>
                    </div>
                  )}
                </div>

                {/* Forms */}
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Anamnesis dan Pemeriksaan Fisik</label>
                  <textarea 
                    className="w-full p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-body-md min-h-[120px]"
                    placeholder="Masukkan hasil anamnesis dan pemeriksaan fisik..."
                    value={formData.anamnesis}
                    onChange={e => setFormData({ ...formData, anamnesis: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Diagnosa</label>
                  <textarea 
                    className="w-full p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-body-md min-h-[100px]"
                    placeholder="Masukkan diagnosa..."
                    value={formData.diagnosis}
                    onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Terapi</label>
                  <textarea 
                    className="w-full p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-body-md min-h-[100px]"
                    placeholder="Masukkan rincian terapi..."
                    value={formData.treatment}
                    onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-label-lg flex items-center gap-2 hover:bg-primary/90 hover:shadow-lg transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isSaving ? (
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                    ) : (
                      <span className="material-symbols-outlined">save</span>
                    )}
                    {isSaving ? 'Menyimpan...' : 'Simpan Rekam Medis'}
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
