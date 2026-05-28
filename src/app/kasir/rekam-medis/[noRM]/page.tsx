'use client';

import { PATIENTS } from '../../../../lib/mock-data';
import { notFound } from 'next/navigation';
import { use } from 'react';

export default function RekamMedisPrintPage({ params }: { params: Promise<{ noRM: string }> }) {
  const resolvedParams = use(params);
  const patient = PATIENTS.find(p => p.noRM === resolvedParams.noRM);
  
  if (!patient) {
    return notFound();
  }

  const handlePrint = () => {
    window.print();
  };

  // Ensure there are at least 8 rows for the form to look like a full page without spilling to page 2
  const minRows = 8;
  const historyCount = patient.medicalHistory.length;
  const blankRows = Math.max(0, minRows - historyCount);

  return (
    <div className="min-h-screen bg-white text-black print:bg-white print:m-0 print:p-0 font-sans" style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' } as React.CSSProperties}>
      
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

      {/* A4 Document Container */}
      <div className="max-w-[800px] mx-auto p-10 print:p-8 print:max-w-none print:w-full">
        
        {/* Header */}
        <div className="text-center font-bold pb-2 border-b-[2px] border-black mb-1 leading-tight">
          <h1 className="text-[20px] mb-1 text-black font-bold">Praktik Dokter dr. Popi Novia</h1>
          <p className="text-[14px] font-normal text-black">Jl. Sei Rumbai, Kota Lama, Kec. Kunto Darussalam,</p>
          <p className="text-[14px] font-normal text-black">Kab. Rokan Hulu. Telp/Hp. 082364381302</p>
        </div>
        <div className="border-b-[1px] border-black mb-4"></div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-[22px] font-black tracking-wider text-black">REKAM MEDIS</h2>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-6 text-[14px] font-medium text-black">
          <div className="grid grid-cols-[150px_auto]">
            <span>No. RM</span> <span>: {patient.noRM}</span>
            <span>Nama</span> <span>: {patient.name}</span>
            <span>NIK</span> <span>: {patient.nik || '-'}</span>
            <span>Tanggal Lahir / Umur</span> <span>: {patient.dob} / {patient.age} thn</span>
            <span>Jenis Kelamin</span> <span>: {patient.gender === 'Female' ? 'Perempuan' : 'Laki-laki'}</span>
          </div>
          <div className="grid grid-cols-[130px_auto]">
            <span>Pekerjaan</span> <span>: {patient.pekerjaan || '-'}</span>
            <span>Nama Wali</span> <span>: {patient.namaWali || '-'}</span>
            <span>Alamat</span> <span>: -</span>
            <span>No. HP</span> <span>: {patient.phone || '-'}</span>
            <span>Alergi Obat</span> <span>: {patient.allergies || '-'}</span>
          </div>
        </div>

        {/* Medical Table */}
        <table className="w-full border-collapse border border-black text-black">
          <thead>
            <tr>
              <th className="border border-black p-2 w-[12%] text-[15px]">Tanggal</th>
              <th className="border border-black p-2 w-[38%] text-[15px]">Anamnesis dan<br/>Pemeriksaan Fisik</th>
              <th className="border border-black p-2 w-[25%] text-[15px]">Diagnosa</th>
              <th className="border border-black p-2 w-[25%] text-[15px]">Terapi</th>
            </tr>
          </thead>
          <tbody>
            {patient.medicalHistory.map((record, i) => (
              <tr key={i}>
                <td className="border border-black p-2 align-top text-[13px]">{record.date}</td>
                <td className="border border-black p-2 align-top text-[13px]">
                  <span className="font-semibold">{record.doctor}</span><br/>
                  {record.notes}
                </td>
                <td className="border border-black p-2 align-top text-[13px]"></td>
                <td className="border border-black p-2 align-top text-[13px]">{record.treatment}</td>
              </tr>
            ))}
            {Array.from({ length: blankRows }).map((_, i) => (
              <tr key={`blank-${i}`}>
                <td className="border border-black p-2 h-14"></td>
                <td className="border border-black p-2 h-14"></td>
                <td className="border border-black p-2 h-14"></td>
                <td className="border border-black p-2 h-14"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
