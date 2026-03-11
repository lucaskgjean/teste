
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, X, Check } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // HH:mm
  onChange: (time: string) => void;
  onClose: () => void;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange, onClose }) => {
  const [hour, setHour] = useState(() => value.split(':')[0] || '00');
  const [minute, setMinute] = useState(() => value.split(':')[1] || '00');

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const handleSave = () => {
    onChange(`${hour}:${minute}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Selecionar Hora</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            {/* Hours */}
            <div className="flex-1 space-y-3">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center block">Hora</label>
              <div className="h-48 overflow-y-auto pr-1 custom-scrollbar grid grid-cols-2 gap-1">
                {hours.map(h => (
                  <button
                    key={h}
                    onClick={() => setHour(h)}
                    className={`
                      py-2 rounded-xl text-xs font-bold transition-all
                      ${hour === h 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1 space-y-3">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center block">Minuto</label>
              <div className="h-48 overflow-y-auto pr-1 custom-scrollbar grid grid-cols-2 gap-1">
                {minutes.map(m => (
                  <button
                    key={m}
                    onClick={() => setMinute(m)}
                    className={`
                      py-2 rounded-xl text-xs font-bold transition-all
                      ${minute === m 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    {m}
                  </button>
                ))}
                {/* Manual minute input if needed, but let's keep it simple with 5min intervals for now or add a full list */}
                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
                  .filter(m => !minutes.includes(m))
                  .map(m => (
                    <button
                      key={m}
                      onClick={() => setMinute(m)}
                      className={`
                        py-2 rounded-xl text-xs font-bold transition-all
                        ${minute === m 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }
                      `}
                    >
                      {m}
                    </button>
                  ))
                  .sort((a, b) => parseInt(a.key as string) - parseInt(b.key as string))
                }
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                const now = new Date();
                setHour(String(now.getHours()).padStart(2, '0'));
                setMinute(String(now.getMinutes()).padStart(2, '0'));
              }}
              className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              Agora
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <Check size={14} /> Confirmar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomTimePicker;
