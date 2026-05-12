'use client';

import { useState } from 'react';
import { toast } from 'sonner';

// Mock data for appointments locally since it's not in mock-data.ts yet
type AppointmentStatus = 'Confirmed' | 'Completed' | 'Rescheduled' | 'No Show';

interface Appointment {
  id: string;
  time: string;
  patientName: string;
  patientId: string;
  service: string;
  status: AppointmentStatus;
  duration: number; // in minutes
  type: 'Consultation' | 'Treatment' | 'Follow-up';
}

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'A001', time: '09:00 AM', patientName: 'Julian Rivers', patientId: 'PT-6623', service: 'Laser Hair Removal', status: 'Completed', duration: 45, type: 'Treatment' },
  { id: 'A002', time: '10:00 AM', patientName: 'Aria Sterling', patientId: 'PT-7741', service: 'Botox Consultation', status: 'Completed', duration: 30, type: 'Consultation' },
  { id: 'A003', time: '11:30 AM', patientName: 'Robert Jenkins', patientId: 'PT-9012', service: 'Chemical Peel', status: 'Confirmed', duration: 60, type: 'Treatment' },
  { id: 'A004', time: '01:00 PM', patientName: 'Sophia Montgomery', patientId: 'PT-8829', service: 'Facial Acne Treatment', status: 'Confirmed', duration: 45, type: 'Treatment' },
  { id: 'A005', time: '02:30 PM', patientName: 'Elena Lockwood', patientId: 'PT-9941', service: 'Initial Assessment', status: 'Confirmed', duration: 30, type: 'Consultation' },
  { id: 'A006', time: '04:00 PM', patientName: 'Marcus Hale', patientId: 'PT-1122', service: 'Post-Op Review', status: 'Rescheduled', duration: 15, type: 'Follow-up' },
];

export default function DokterSchedulePage() {
  const [selectedDate, setSelectedDate] = useState<number>(12); // Mock current date: 12th
  const [selectedAppt, setSelectedAppt] = useState<string | null>(null);

  const handleDateSelect = (day: number) => {
    setSelectedDate(day);
    if (day !== 12) {
      toast.info(`Showing schedule for April ${day}, 2024.`);
    }
  };

  const handleStartSession = (appt: Appointment) => {
    toast.success(`Session started for ${appt.patientName}.`);
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch(status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rescheduled': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'No Show': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Consultation': return 'forum';
      case 'Treatment': return 'healing';
      case 'Follow-up': return 'update';
      default: return 'event';
    }
  };

  // Mock calendar grid generation (April 2024)
  const daysInMonth = 30;
  const startingDayOfWeek = 1; // 0=Sun, 1=Mon (April 1st 2024 is Monday)
  const weeks = [];
  let currentWeek = [];
  
  // Empty slots for beginning of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Filter appointments for visual effect (only show full list on day 12)
  const displayAppts = selectedDate === 12 ? MOCK_APPOINTMENTS : (selectedDate % 2 === 0 ? [MOCK_APPOINTMENTS[0], MOCK_APPOINTMENTS[3]] : []);

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4 mt-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">calendar_month</span>
            My Schedule
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage clinical appointments and daily agenda.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
          <button className="px-4 py-2 bg-white rounded-lg shadow-sm font-label-md text-primary">Day</button>
          <button className="px-4 py-2 text-on-surface-variant font-label-md hover:bg-white/50 rounded-lg transition-colors">Week</button>
          <button className="px-4 py-2 text-on-surface-variant font-label-md hover:bg-white/50 rounded-lg transition-colors">Month</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter items-start">
        {/* Left Column: Calendar & Summary */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Calendar Widget */}
          <div className="glass-card ambient-shadow rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm font-bold text-on-surface">April 2024</h3>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider py-1">{day}</div>
              ))}
            </div>
            
            <div className="space-y-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-cols-7 gap-1">
                  {week.map((day, dIdx) => {
                    if (!day) return <div key={dIdx} className="h-10"></div>;
                    
                    const isToday = day === 12;
                    const isSelected = day === selectedDate;
                    const hasAppts = day % 2 === 0 || day === 12; // Mock dots
                    
                    return (
                      <button 
                        key={dIdx}
                        onClick={() => handleDateSelect(day)}
                        className={`h-10 rounded-full flex flex-col items-center justify-center relative transition-all font-body-sm font-medium ${isSelected ? 'bg-primary text-white shadow-md scale-105' : isToday ? 'text-primary bg-primary-container/30 border border-primary/20' : 'text-on-surface hover:bg-surface-container-high'}`}
                      >
                        {day}
                        {hasAppts && !isSelected && (
                          <div className="w-1 h-1 rounded-full bg-secondary absolute bottom-1.5"></div>
                        )}
                        {hasAppts && isSelected && (
                          <div className="w-1 h-1 rounded-full bg-white absolute bottom-1.5 opacity-80"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Summary */}
          <div className="glass-card ambient-shadow rounded-2xl p-6 bg-primary/5 border-primary/10">
            <h4 className="font-label-md uppercase text-primary tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">insights</span>
              Daily Summary
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20">
                <p className="text-[28px] font-bold text-on-surface leading-none">{displayAppts.length}</p>
                <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Appointments</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20">
                <p className="text-[28px] font-bold text-secondary leading-none">{displayAppts.filter(a => a.status === 'Completed').length}</p>
                <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Completed</p>
              </div>
            </div>
            
            <button 
              className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-label-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
              onClick={() => toast.success('Time slot blocked successfully.')}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Block Time Slot
            </button>
          </div>
        </div>

        {/* Right Column: Daily Agenda Timeline */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card ambient-shadow rounded-2xl overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  {selectedDate === 12 ? 'Today, April 12' : `April ${selectedDate}, 2024`}
                </h3>
                <p className="font-body-sm text-on-surface-variant">{displayAppts.length} sessions scheduled</p>
              </div>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/10 rounded-full">
                <span className="material-symbols-outlined">print</span>
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-surface-container-lowest relative">
              {/* Timeline Track */}
              <div className="absolute left-[112px] top-6 bottom-6 w-px bg-outline-variant/30"></div>

              {displayAppts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <span className="material-symbols-outlined text-[64px] text-outline-variant/40 mb-4">event_available</span>
                  <p className="font-headline-sm text-on-surface">No Appointments</p>
                  <p className="font-body-sm text-on-surface-variant mt-1">Your schedule is clear for this day.</p>
                </div>
              ) : (
                <div className="space-y-6 relative">
                  {displayAppts.map((appt, idx) => (
                    <div 
                      key={appt.id} 
                      className="flex gap-4 relative group cursor-pointer"
                      onClick={() => setSelectedAppt(selectedAppt === appt.id ? null : appt.id)}
                    >
                      {/* Timeline Node */}
                      <div className="w-[80px] flex-shrink-0 text-right pt-4 pr-2">
                        <span className="font-label-md text-on-surface font-bold block leading-tight">{appt.time.split(' ')[0]}</span>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase">{appt.time.split(' ')[1]}</span>
                      </div>
                      
                      {/* Node Circle */}
                      <div className="absolute left-[82px] top-5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10" style={{ backgroundColor: appt.status === 'Completed' ? 'var(--color-green-500)' : 'var(--color-primary)' }}></div>

                      {/* Appointment Card */}
                      <div className={`flex-1 p-4 rounded-2xl border transition-all duration-300 ${selectedAppt === appt.id ? 'bg-white shadow-lg border-primary/30 ring-1 ring-primary/20 scale-[1.01]' : 'bg-white border-outline-variant/20 shadow-sm hover:border-primary/30 hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{getTypeIcon(appt.type)}</span>
                            <span className="font-label-md text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{appt.type}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase ${getStatusColor(appt.status)}`}>{appt.status}</span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="font-headline-sm text-[18px] font-bold text-primary mb-0.5">{appt.patientName}</h4>
                            <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5">
                              <span className="font-mono text-[11px] bg-surface-container px-1.5 py-0.5 rounded">{appt.patientId}</span>
                              • {appt.service}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="flex items-center gap-1 text-[11px] text-on-surface-variant font-bold uppercase">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {appt.duration} min
                            </span>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {selectedAppt === appt.id && (
                          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center gap-3 animate-fade-in">
                            <button 
                              className="px-4 py-2 bg-surface-container-high text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container-highest transition-colors flex items-center gap-2 text-[13px]"
                              onClick={(e) => { e.stopPropagation(); toast.info(`Viewing records for ${appt.patientName}`); }}
                            >
                              <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                              View Records
                            </button>
                            {appt.status !== 'Completed' && (
                              <button 
                                className="px-4 py-2 bg-primary text-white font-label-md rounded-xl hover:opacity-90 shadow-sm transition-all active:scale-95 flex items-center gap-2 text-[13px]"
                                onClick={(e) => { e.stopPropagation(); handleStartSession(appt); }}
                              >
                                <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                                Start Session
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
