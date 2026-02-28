
import React, { useState, useMemo } from 'react';
import { TimeEntry } from '../types';
import { generateId, calculateDuration, formatDuration } from '../utils/calculations';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Square, 
  Coffee, 
  FileText, 
  Trash2, 
  Calendar, 
  ChevronRight,
  Timer
} from 'lucide-react';

interface TimeTrackingProps {
  timeEntries: TimeEntry[];
  onAdd: (entry: TimeEntry) => void;
  onUpdate: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}

const TimeTracking: React.FC<TimeTrackingProps> = ({ timeEntries, onAdd, onUpdate, onDelete }) => {
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const activeEntry = useMemo(() => 
    timeEntries.find(e => e.date === today && !e.endTime),
    [timeEntries, today]
  );

  const [breakInput, setBreakInput] = useState<string>('0');
  const [notesInput, setNotesInput] = useState<string>('');

  const handleClockIn = () => {
    const newEntry: TimeEntry = {
      id: generateId(),
      date: today,
      startTime: currentTime,
      notes: ''
    };
    onAdd(newEntry);
  };

  const handleClockOut = () => {
    if (!activeEntry) return;
    const updatedEntry: TimeEntry = {
      ...activeEntry,
      endTime: currentTime,
      breakDuration: parseInt(breakInput) || 0,
      notes: notesInput
    };
    onUpdate(updatedEntry);
    setBreakInput('0');
    setNotesInput('');
  };

  const dailyTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    timeEntries.forEach(e => {
      if (e.startTime && e.endTime) {
        const duration = calculateDuration(e.startTime, e.endTime, e.breakDuration || 0);
        totals[e.date] = (totals[e.date] || 0) + duration;
      }
    });
    return totals;
  }, [timeEntries]);

  const sortedDates = Object.keys(dailyTotals).sort((a, b) => b.localeCompare(a));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-24"
    >
      {/* Status de Ponto Atual */}
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-3">Controle de Ponto</h2>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className={`w-3 h-3 rounded-full ${activeEntry ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
              <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                {activeEntry ? `Trabalhando desde ${activeEntry.startTime}` : 'Fora de Serviço'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Hoje acumulado:</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono-num">{formatDuration(dailyTotals[today] || 0)}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {!activeEntry ? (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleClockIn}
                className="flex-1 md:flex-none bg-emerald-600 dark:bg-emerald-500 text-white font-black py-5 px-10 rounded-2xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
              >
                <Play size={18} fill="currentColor" /> Iniciar Turno
              </motion.button>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      <Coffee size={10} /> Pausa (min)
                    </label>
                    <input 
                      type="number" 
                      value={breakInput} 
                      onChange={(e) => setBreakInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white font-mono-num"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      <FileText size={10} /> Notas
                    </label>
                    <input 
                      type="text" 
                      value={notesInput} 
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Opcional..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                    />
                  </div>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClockOut}
                  className="bg-rose-600 dark:bg-rose-500 text-white font-black py-5 px-10 rounded-2xl hover:bg-rose-700 dark:hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 dark:shadow-none flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
                >
                  <Square size={18} fill="currentColor" /> Finalizar Turno
                </motion.button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
          <Timer size={200} />
        </div>
      </motion.div>

      {/* Relatório de Horas */}
      <motion.div variants={itemVariants} className="space-y-6 pt-4">
        <h3 className="text-sm font-black text-slate-800 dark:text-white px-2 flex items-center gap-3 uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
          Histórico de Ponto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedDates.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
               <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">Nenhum registro encontrado</p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-emerald-100 dark:hover:border-emerald-500 transition-colors">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Data</span>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200 capitalize">
                        {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-emerald-400 dark:text-emerald-500 uppercase tracking-widest block">Total</span>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono-num">{formatDuration(dailyTotals[date])}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {timeEntries
                    .filter(e => e.date === date)
                    .sort((a, b) => b.startTime.localeCompare(a.startTime))
                    .map(entry => (
                      <div key={entry.id} className="group/item flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shadow-sm text-slate-300 dark:text-slate-600">
                            <Clock size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 font-mono-num">
                              {entry.startTime} — {entry.endTime || 'Em aberto'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {entry.breakDuration ? (
                                <span className="text-[8px] text-rose-500 font-black uppercase bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md">Pausa: {entry.breakDuration}m</span>
                              ) : null}
                              {entry.notes && (
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 italic truncate max-w-[120px]">{entry.notes}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => onDelete(entry.id)}
                          className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover/item:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimeTracking;
