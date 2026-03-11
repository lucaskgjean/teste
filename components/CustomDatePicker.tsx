
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  onClose: () => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, onClose }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = value ? new Date(value + 'T12:00:00') : new Date();
    return d;
  });

  const selectedDate = value ? new Date(value + 'T12:00:00') : null;

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    onClose();
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="p-6 bg-rose-500 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Selecionar Data</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <div className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">
                {monthNames[month]}
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {year}
              </div>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              
              const isSelected = selectedDate && 
                                selectedDate.getDate() === day && 
                                selectedDate.getMonth() === month && 
                                selectedDate.getFullYear() === year;
              
              const isToday = new Date().getDate() === day && 
                              new Date().getMonth() === month && 
                              new Date().getFullYear() === year;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all
                    ${isSelected 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none scale-110 z-10' 
                      : isToday
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-2">
            <button 
              onClick={() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                onChange(`${year}-${month}-${day}`);
                onClose();
              }}
              className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              Hoje
            </button>
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomDatePicker;
