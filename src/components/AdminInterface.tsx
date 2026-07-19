import React, { useState, useEffect } from 'react';
import { Appointment, BlockedSlot } from '../types';
import { Calendar } from './Calendar';
import { getAppointments, getBlockedSlots, saveBlockedSlot, removeBlockedSlot, TIME_SLOTS } from '../store';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { LogOut, Shield, CalendarDays, Users, Ban, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

function calculateAge(dobString: string): string {
  if (!dobString) return '';
  const parts = dobString.split('-');
  if (parts.length !== 3) return '';
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);
  
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const m = today.getMonth() - birthMonth;
  if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return `${age} años`;
}

export function AdminInterface({ onLogout }: { onLogout: () => void }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'appointments' | 'calendar'>('appointments');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const bookedDays = React.useMemo(() => {
    const dates = new Set<string>();
    appointments.forEach(a => dates.add(a.date));
    return Array.from(dates);
  }, [appointments]);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    // Sort appointments by date and time
    const fetchedApps = await getAppointments();
    const apps = [...fetchedApps].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
    setAppointments(apps);
    const fetchedSlots = await getBlockedSlots();
    setBlockedSlots(fetchedSlots);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    if (username === 'karol' && password === '1234') {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const toggleBlockTime = async (dateStr: string, time: string | 'ALL') => {
    const isBlocked = blockedSlots.some(s => s.date === dateStr && s.time === time);
    if (isBlocked) {
      await removeBlockedSlot(dateStr, time);
    } else {
      await saveBlockedSlot({ date: dateStr, time });
    }
    await loadData();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
          <div className="w-16 h-16 bg-stone-100 text-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-center text-stone-800 mb-2">Acceso Administrativo</h1>
          <p className="text-stone-500 text-center mb-8">Usa 'karol' / '1234' para entrar.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Usuario</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 transition-colors bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 transition-colors bg-stone-50"
              />
            </div>
            
            {loginError && (
              <p className="text-red-500 text-sm font-medium text-center">Credenciales incorrectas.</p>
            )}

            <button 
              type="submit"
              className="w-full py-3 px-4 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-xl transition-colors mt-4"
            >
              Iniciar Sesión
            </button>
          </form>
          <div className="mt-6 text-center">
             <button onClick={onLogout} className="text-sm text-stone-400 hover:text-stone-600">
               Volver al inicio
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 md:min-h-screen flex flex-col">
        <div className="p-6 pb-2 border-b border-stone-800">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="h-8 md:h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden px-1 md:px-2">
              <img src="/logo-sm.svg" alt="Logo" className="h-full w-auto object-contain md:hidden p-1" />
              <img src="/logo.svg" alt="Logo" className="h-full w-auto object-contain hidden md:block py-2" />
            </div>
            <span className="font-semibold text-lg">Admin Panel</span>
          </div>
          <p className="text-xs text-stone-500">Gestión de Consultorio</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === 'appointments' ? "bg-stone-800 text-white" : "hover:bg-stone-800 hover:text-white"
            )}
          >
            <Users size={18} />
            Citas Agendadas
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === 'calendar' ? "bg-stone-800 text-white" : "hover:bg-stone-800 hover:text-white"
            )}
          >
            <CalendarDays size={18} />
            Control de Agenda
          </button>
        </nav>
        
        <div className="p-4 border-t border-stone-800 hidden md:block">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-8 md:hidden">
           <h2 className="text-xl font-semibold text-stone-800">
             {activeTab === 'appointments' ? 'Citas Agendadas' : 'Control de Agenda'}
           </h2>
           <button 
            onClick={() => setIsLoggedIn(false)}
            className="text-stone-500"
          >
            <LogOut size={20} />
          </button>
        </header>

        {activeTab === 'appointments' && (
          <div className="max-w-5xl">
            <h2 className="text-2xl font-semibold text-stone-800 mb-6 hidden md:block">Próximas Citas</h2>
            
            <div className="md:hidden space-y-4">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-stone-400 bg-white rounded-2xl shadow-sm border border-stone-200">
                  No hay citas agendadas actualmente.
                </div>
              ) : (
                appointments.map(app => (
                  <div key={app.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-stone-800 text-lg">{app.patientName}</h3>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                        {app.time}
                      </span>
                    </div>
                    <div className="text-sm text-stone-500 mb-1">
                      <span className="font-medium text-stone-700">F. Nacimiento:</span> {app.patientDob} <span className="text-stone-400 font-normal">({calculateAge(app.patientDob)})</span>
                    </div>
                    <div className="text-sm text-stone-500 mb-1">
                      <span className="font-medium text-stone-700">Teléfono:</span> {app.patientPhone}
                    </div>
                    <div className="text-sm text-stone-700 capitalize flex gap-1">
                      <span className="font-medium text-stone-700 normal-case">Cita:</span> 
                      {format(parseISO(app.date), "EEE, d MMM yyyy", { locale: es })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-sm border-b border-stone-200">
                      <th className="p-4 font-medium whitespace-nowrap">Paciente</th>
                      <th className="p-4 font-medium whitespace-nowrap">Teléfono</th>
                      <th className="p-4 font-medium whitespace-nowrap">F. Nacimiento</th>
                      <th className="p-4 font-medium whitespace-nowrap">Fecha de Cita</th>
                      <th className="p-4 font-medium whitespace-nowrap">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-stone-400">
                          No hay citas agendadas actualmente.
                        </td>
                      </tr>
                    ) : (
                      appointments.map(app => (
                        <tr key={app.id} className="hover:bg-stone-50 transition-colors">
                          <td className="p-4 font-medium text-stone-800 whitespace-nowrap">{app.patientName}</td>
                          <td className="p-4 text-stone-600 text-sm whitespace-nowrap">{app.patientPhone}</td>
                          <td className="p-4 text-stone-500 text-sm whitespace-nowrap">
                            {app.patientDob} <span className="text-stone-400 font-normal">({calculateAge(app.patientDob)})</span>
                          </td>
                          <td className="p-4 text-stone-700 capitalize whitespace-nowrap">
                            {format(parseISO(app.date), "EEE, d MMM yyyy", { locale: es })}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                              {app.time}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="max-w-5xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-stone-800 hidden md:block">Control de Agenda</h2>
              <p className="text-stone-500 mt-1">Bloquea días enteros o franjas horarias para evitar que los pacientes agenden citas.</p>
            </div>
            
            <div className="grid lg:grid-cols-[350px_1fr] gap-8 items-start">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <Calendar 
                  selectedDate={selectedDate} 
                  onSelectDate={setSelectedDate}
                  blockedDays={blockedSlots.filter(s => s.time === 'ALL').map(s => s.date)}
                  bookedDays={bookedDays}
                />
              </div>

              {selectedDate ? (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b border-stone-100 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-800 capitalize">
                        {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                      </h3>
                      <p className="text-sm text-stone-500">Gestiona la disponibilidad para este día.</p>
                    </div>
                    
                    {/* Block Whole Day Button */}
                    <button
                      onClick={() => toggleBlockTime(format(selectedDate, 'yyyy-MM-dd'), 'ALL')}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                        blockedSlots.some(s => s.date === format(selectedDate, 'yyyy-MM-dd') && s.time === 'ALL')
                          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      )}
                    >
                      <Ban size={16} />
                      {blockedSlots.some(s => s.date === format(selectedDate, 'yyyy-MM-dd') && s.time === 'ALL')
                        ? "Desbloquear Día Completo"
                        : "Bloquear Día Completo"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-stone-700">Franjas Horarias</h4>
                    
                    {blockedSlots.some(s => s.date === format(selectedDate, 'yyyy-MM-dd') && s.time === 'ALL') ? (
                      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
                        <Ban className="mx-auto mb-2 opacity-50" size={32} />
                        Este día está completamente bloqueado.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {TIME_SLOTS.map(time => {
                          const dateStr = format(selectedDate, 'yyyy-MM-dd');
                          const bookedAppointment = appointments.find(a => a.date === dateStr && a.time === time);
                          const isBlocked = blockedSlots.some(s => s.date === dateStr && s.time === time);
                          
                          if (bookedAppointment) {
                            return (
                              <div key={time} className="py-2 px-2 rounded-xl text-sm font-medium border border-brand-200 bg-brand-50 text-brand-700 flex flex-col items-center justify-center relative opacity-80 cursor-not-allowed text-center">
                                {time}
                                <span className="text-[10px] mt-0.5 text-brand-600 truncate w-full px-1" title={bookedAppointment.patientName}>
                                  {bookedAppointment.patientName}
                                </span>
                              </div>
                            );
                          }
                          
                          return (
                            <button
                              key={time}
                              onClick={() => toggleBlockTime(dateStr, time)}
                              className={cn(
                                "py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 border flex flex-col items-center justify-center",
                                isBlocked 
                                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                                  : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                              )}
                            >
                              {time}
                              <span className="text-[10px] mt-0.5 font-normal opacity-70">
                                {isBlocked ? 'Bloqueado' : 'Disponible'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-stone-50 rounded-2xl border border-stone-200 p-12 text-center flex flex-col items-center justify-center text-stone-400">
                  <CalendarDays size={48} className="mb-4 opacity-20" />
                  <p>Selecciona un día en el calendario para gestionar su disponibilidad.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
