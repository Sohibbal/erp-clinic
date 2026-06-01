'use client';

import { notFound } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { getPatientByNoRM } from '@/actions/patient';
import { formatDate } from '@/lib/utils';

export default function RekamMedisPrintPage({ params }: { params: Promise<{ noRM: string }> }) {
  const resolvedParams = use(params);
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPatientByNoRM(resolvedParams.noRM);
        setPatient(data);
      } catch (error) {
        console.error('Gagal memuat rekam medis', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.noRM]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-black">Memuat data...</div>;
  }

  if (!patient) {
    return notFound();
  }

  const age = patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 0;
  const historyCount = patient.medicalRecords?.length || 0;

  const handlePrint = () => {
    window.print();
  };

  const chunkSize = 4;
  const records = patient.medicalRecords || [];
  const pages = [];
  if (records.length === 0) {
    pages.push([]);
  } else {
    for (let i = 0; i < records.length; i += chunkSize) {
      pages.push(records.slice(i, i + chunkSize));
    }
  }

  return (
    <div className="min-h-screen print:min-h-0 bg-white text-black print:bg-white print:m-0 print:p-0 font-sans" style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' } as React.CSSProperties}>
      
      {/* Print Button (Hidden on Print) */}
      <div className="fixed bottom-10 right-10 z-50 print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-black text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          title="Cetak Rekam Medis"
        >
          <span className="material-symbols-outlined text-[28px]">print</span>
        </button>
      </div>

      {pages.map((pageRecords, pageIndex) => {
        const blankRows = Math.max(0, chunkSize - pageRecords.length);

        return (
          <div key={pageIndex} className={`max-w-[800px] mx-auto p-10 print:p-6 print:max-w-none print:w-full ${pageIndex < pages.length - 1 ? 'break-after-page' : ''}`}>
            
            {/* Header */}
            <div className="text-center font-bold pb-1 border-b-[2px] border-black mb-1 leading-tight">
              <h1 className="text-[20px] mb-1 text-black font-bold">Praktik Dokter dr. Popi Novia</h1>
              <p className="text-[13px] font-normal text-black">Jl. Sei Rumbai, Kota Lama, Kec. Kunto Darussalam,</p>
              <p className="text-[13px] font-normal text-black">Kab. Rokan Hulu. Telp/Hp. 082364381302</p>
            </div>
            <div className="border-b-[1px] border-black mb-2"></div>

            {/* Title */}
            <div className="text-center mb-2">
              <h2 className="text-[18px] font-black tracking-wider text-black">REKAM MEDIS</h2>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4 text-[13px] font-medium text-black">
              <div className="grid grid-cols-[140px_auto]">
                <span>No. RM</span> <span>: {patient.noRM}</span>
                <span>Nama</span> <span>: {patient.name}</span>
                <span>NIK</span> <span>: {patient.nik || '-'}</span>
                <span>Tanggal Lahir / Umur</span> <span>: {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '-'} / {age} thn</span>
                <span>Jenis Kelamin</span> <span>: {patient.gender === 'FEMALE' ? 'Perempuan' : 'Laki-laki'}</span>
              </div>
              <div className="grid grid-cols-[120px_auto]">
                <span>Pekerjaan</span> <span>: {patient.occupation || '-'}</span>
                <span>Nama Wali</span> <span>: {patient.guardianName || '-'}</span>
                <span>Alamat</span> <span>: {patient.address || '-'}</span>
                <span>No. HP</span> <span>: {patient.phone || '-'}</span>
                <span>Alergi Obat</span> <span>: {patient.allergies || '-'}</span>
              </div>
            </div>

            {/* Medical Table */}
            <table className="w-full border-collapse border border-black text-black">
              <thead>
                <tr>
                  <th className="border border-black p-2 w-[12%] text-[13px]">Tanggal</th>
                  <th className="border border-black p-2 w-[38%] text-[13px]">Anamnesis dan Pemeriksaan Fisik</th>
                  <th className="border border-black p-2 w-[15%] text-[13px]">Diagnosa</th>
                  <th className="border border-black p-2 w-[35%] text-[13px]">Terapi</th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((record: any, i: number) => {
                  const txTime = record.transaction ? new Date(record.transaction.createdAt).getTime() : new Date(record.visitDate).getTime();
                  const matchedQueue = patient.queues?.reduce((closest: any, q: any) => {
                    const qTime = new Date(q.createdAt).getTime();
                    if (!closest || Math.abs(qTime - txTime) < Math.abs(new Date(closest.createdAt).getTime() - txTime)) {
                      return q;
                    }
                    return closest;
                  }, null);

                  const doctorName = record.doctor?.name || matchedQueue?.doctor?.name;
                  const therapistName = matchedQueue?.therapist?.name;
                  
                  const handlers = [];
                  if (doctorName) handlers.push(doctorName);
                  if (therapistName) handlers.push(therapistName);
                  const handledBy = handlers.length > 0 ? handlers.join(' & ') : '-';

                  return (
                  <tr key={i}>
                    <td className="border border-black p-2 align-top text-[13px] h-[160px]">{formatDate(record.visitDate)}</td>
                    <td className="border border-black p-2 align-top text-[13px]">
                      <span className="font-semibold">{handledBy}</span><br/>
                      {record.anamnesis || '-'}
                    </td>
                    <td className="border border-black p-2 align-top text-[13px]">{record.diagnosis || '-'}</td>
                    <td className="border border-black p-2 align-top text-[13px]">{record.treatment || '-'}</td>
                  </tr>
                  );
                })}
                {Array.from({ length: blankRows }).map((_, i) => (
                  <tr key={`blank-${i}`}>
                    <td className="border border-black p-2 h-[160px]"></td>
                    <td className="border border-black p-2 h-[160px]"></td>
                    <td className="border border-black p-2 h-[160px]"></td>
                    <td className="border border-black p-2 h-[160px]"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
