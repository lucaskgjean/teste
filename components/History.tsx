
import React, { useState, useMemo } from 'react';
import { DailyEntry, AppConfig } from '../types';
import { formatCurrency, getWeeklySummary, getDailyStats, getLocalDateStr } from '../utils/calculations';
import { motion, AnimatePresence } from 'motion/react';
import CustomDatePicker from './CustomDatePicker';
import CustomSelect from './CustomSelect';
import { 
  Search, 
  Filter, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Clock,
  CreditCard,
  Tag,
  Trash2,
  Edit3,
  Check,
  Info,
  ChevronRight,
  History as HistoryIcon,
  Layers,
  Banknote,
  Activity
} from 'lucide-react';
import QuickLaunch from './QuickLaunch';

interface HistoryProps {
  entries: DailyEntry[];
  config: AppConfig;
  onDelete: (id: string) => void;
  onEdit: (entry: DailyEntry) => void;
  onUpdate: (entry: DailyEntry) => void;
  filterStore: string;
  onFilterStoreChange: (val: string) => void;
}

const History: React.FC<HistoryProps> = ({ entries, config, onDelete, onEdit, onUpdate, filterStore, onFilterStoreChange }) => {
  const todayStr = getLocalDateStr();
  const [filterStartDate, setFilterStartDate] = useState<string>(todayStr);
  const [filterEndDate, setFilterEndDate] = useState<string>(todayStr);
  const [filterPayment, setFilterPayment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showPaymentSelect, setShowPaymentSelect] = useState(false);
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [showStoreSelect, setShowStoreSelect] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const uniqueStores = useMemo(() => {
    return Array.from(new Set(entries.filter(e => e.grossAmount > 0).map(e => e.storeName))).sort();
  }, [entries]);

  const todayEntries = entries.filter(e => e.date === todayStr);

  const filteredEntries = useMemo(() => {
    return entries.map((entry, index) => ({ entry, index })).filter(({ entry }) => {
      // Excluir gastos manuais (grossAmount === 0) e Fechamento de KM (que agora fica na Manutenção)
      if (entry.grossAmount === 0 || entry.storeName === 'Fechamento de KM') return false;

      const matchRange = (filterStartDate || filterEndDate) ? (
        (!filterStartDate || entry.date >= filterStartDate) &&
        (!filterEndDate || entry.date <= filterEndDate)
      ) : true;
      
      const matchPayment = filterPayment ? entry.paymentMethod === filterPayment : true;
      
      const matchStatus = filterStatus ? (
        filterStatus === 'paid' ? entry.isPaid === true : entry.isPaid === false
      ) : true;

      const matchStore = filterStore ? entry.storeName.toLowerCase().includes(filterStore.toLowerCase()) : true;
      
      return matchRange && matchPayment && matchStatus && matchStore;
    }).sort((a, b) => b.index - a.index)
      .map(item => item.entry);
  }, [entries, filterStartDate, filterEndDate, filterPayment, filterStatus, filterStore]);

  const stats = useMemo(() => getWeeklySummary(filteredEntries), [filteredEntries]);
  const dailyBreakdown = useMemo(() => getDailyStats(entries, config), [entries, config]);

  const clearFilters = () => {
    setFilterStartDate(todayStr);
    setFilterEndDate(todayStr);
    setFilterPayment('');
    setFilterStatus('');
    onFilterStoreChange('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-24"
    >
      {/* Filtros Inteligentes */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Filter size={16} />
          </div>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Filtros de Busca</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Início</label>
            <button 
              type="button"
              onClick={() => setShowStartDatePicker(true)}
              className="w-full flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:border-indigo-200 dark:hover:border-indigo-500/30"
            >
              <Calendar className="text-slate-300 dark:text-slate-600" size={16} />
              <span>{filterStartDate ? new Date(filterStartDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Início'}</span>
            </button>
          </div>
          <div className="space-y-2">
            <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Fim</label>
            <button 
              type="button"
              onClick={() => setShowEndDatePicker(true)}
              className="w-full flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:border-indigo-200 dark:hover:border-indigo-500/30"
            >
              <Calendar className="text-slate-300 dark:text-slate-600" size={16} />
              <span>{filterEndDate ? new Date(filterEndDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Fim'}</span>
            </button>
          </div>
          <div className="space-y-2">
            <CustomSelect
              label="Pagamento"
              value={filterPayment}
              options={[
                { id: '', label: 'Todos', icon: <Banknote size={14} /> },
                { id: 'pix', label: config.paymentMethodLabels?.pix || 'PIX', icon: <CreditCard size={14} className="text-indigo-500" /> },
                { id: 'money', label: config.paymentMethodLabels?.money || 'Dinheiro', icon: <Wallet size={14} className="text-emerald-500" /> },
                { id: 'caderno', label: config.paymentMethodLabels?.caderno || 'Caderno', icon: <Tag size={14} className="text-amber-500" /> }
              ]}
              onChange={setFilterPayment}
              isOpen={showPaymentSelect}
              onOpen={() => setShowPaymentSelect(true)}
              onClose={() => setShowPaymentSelect(false)}
            />
          </div>
          <div className="space-y-2">
            <CustomSelect
              label="Status"
              value={filterStatus}
              options={[
                { id: '', label: 'Todos', icon: <Activity size={14} /> },
                { id: 'paid', label: 'Pago', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
                { id: 'pending', label: 'Pendente', icon: <AlertCircle size={14} className="text-rose-500" /> }
              ]}
              onChange={setFilterStatus}
              isOpen={showStatusSelect}
              onOpen={() => setShowStatusSelect(true)}
              onClose={() => setShowStatusSelect(false)}
            />
          </div>
          <div className="space-y-2">
            <CustomSelect
              label="Filtrar por Loja"
              value={filterStore}
              options={[
                { id: '', label: 'Todas as Lojas', icon: <HistoryIcon size={14} /> },
                ...uniqueStores.map(store => ({
                  id: store,
                  label: store,
                  icon: <Tag size={14} />
                }))
              ]}
              onChange={onFilterStoreChange}
              isOpen={showStoreSelect}
              onOpen={() => setShowStoreSelect(true)}
              onClose={() => setShowStoreSelect(false)}
            />
          </div>
          <button 
            onClick={clearFilters}
            className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl transition flex items-center justify-center gap-2"
          >
            <X size={14} /> Limpar
          </button>
        </div>
      </motion.div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Bruto Total', value: formatCurrency(stats.totalGross), color: 'text-slate-800 dark:text-white', bg: 'bg-white dark:bg-slate-900' },
          { label: 'Líquido Total', value: formatCurrency(stats.totalNet), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-white dark:bg-slate-900' },
          { label: 'Recebido', value: formatCurrency(stats.totalPaid), color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900' },
          { label: 'Pendente', value: formatCurrency(stats.totalPending), color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className={`${stat.bg} p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm`}
          >
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1 tracking-widest">{stat.label}</span>
            <p className={`text-xl font-black font-mono-num ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Lista de Movimentações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
            Histórico Completo
          </h3>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest">
            {filteredEntries.length} Itens
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredEntries.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 dark:text-slate-700">
                  <Search size={32} />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Nenhum registro encontrado</p>
              </motion.div>
            ) : (
              (showFullHistory ? filteredEntries : filteredEntries.slice(0, 1)).map((entry) => (
                <motion.div 
                  layout
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border-2 transition-all group relative overflow-hidden ${
                    entry.paymentMethod === 'money' 
                      ? 'border-slate-100 dark:border-slate-800' 
                      : entry.isPaid 
                        ? 'border-emerald-500 dark:border-emerald-400' 
                        : 'border-rose-500 dark:border-rose-400'
                  } hover:shadow-md`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${entry.grossAmount > 0 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                        {entry.grossAmount > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 dark:text-white leading-tight text-lg">{entry.storeName.replace('[GASTO] ', '')}</h4>
                          {entry.paymentMethod !== 'money' && (
                            <span className={`text-[8px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-widest border ${entry.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900 dark:text-rose-400 dark:border-rose-500/20'}`}>
                              {entry.isPaid ? 'Pago' : 'Pendente'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tight flex items-center gap-1">
                            <Calendar size={10} /> {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tight flex items-center gap-1">
                            <Clock size={10} /> {entry.time}
                          </span>
                          {entry.paymentMethod && (
                            <span className="text-[10px] text-indigo-400 dark:text-indigo-500 font-semibold uppercase tracking-tight flex items-center gap-1">
                              <CreditCard size={10} /> {config.paymentMethodLabels?.[entry.paymentMethod as keyof typeof config.paymentMethodLabels] || entry.paymentMethod}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold font-mono-num ${entry.grossAmount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {entry.grossAmount > 0 ? `+${formatCurrency(entry.grossAmount).replace('R$', '')}` : `-${formatCurrency(entry.fuel + entry.food + entry.maintenance).replace('R$', '')}`}
                      </div>
                      <span className="text-[9px] font-semibold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                        {entry.grossAmount > 0 ? 'Lucro' : 'Gasto'}
                      </span>
                    </div>
                  </div>

                  {/* Removido a parte de projeção conforme solicitado */}
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onDelete(entry.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl transition-all active:scale-95"
                    >
                      <Trash2 size={14} />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">Excluir</span>
                    </button>
                    <button 
                      onClick={() => onEdit(entry)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl transition-all active:scale-95"
                    >
                      <Edit3 size={14} />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">Editar</span>
                    </button>
                    {entry.paymentMethod !== 'money' && (
                      <button 
                        onClick={() => onUpdate({ ...entry, isPaid: !entry.isPaid })}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all active:scale-95 border-2 ${
                          entry.isPaid 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-400/10 dark:border-emerald-400/40 dark:text-emerald-400' 
                            : 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-400/10 dark:border-rose-400/40 dark:text-rose-400'
                        }`}
                      >
                        {entry.isPaid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        <span className="text-[10px] font-semibold uppercase tracking-widest">
                          {entry.isPaid ? 'Pago' : 'Pendente'}
                        </span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {filteredEntries.length > 1 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="w-full mt-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
            >
              {showFullHistory ? (
                <>Ocultar Histórico <X size={14} /></>
              ) : (
                <>Ver Todos os Lançamentos ({filteredEntries.length}) <ChevronRight size={14} /></>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Calendário de Performance */}
      <PerformanceCalendar dailyStats={dailyBreakdown} />

      <AnimatePresence>
        {showStartDatePicker && (
          <CustomDatePicker 
            value={filterStartDate} 
            onChange={setFilterStartDate} 
            onClose={() => setShowStartDatePicker(false)} 
          />
        )}
        {showEndDatePicker && (
          <CustomDatePicker 
            value={filterEndDate} 
            onChange={setFilterEndDate} 
            onClose={() => setShowEndDatePicker(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PerformanceCalendar = ({ dailyStats }: { dailyStats: any[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate);
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Preencher dias vazios no início
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Preencher dias do mês
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const stats = dailyStats.find(s => s.date === dateStr);
    days.push({ day: d, stats });
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm mt-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
            <Calendar size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{capitalizedMonth}</h4>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{year}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
            <ChevronRight className="rotate-180" size={18} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(wd => (
          <div key={wd} className="text-center text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="aspect-square" />;
          
          const isToday = new Date().toDateString() === new Date(year, month, d.day).toDateString();
          const hasWorked = !!d.stats;
          const goalMet = d.stats?.goalMet;

          let bgColor = 'bg-slate-50 dark:bg-slate-800/50';
          let textColor = 'text-slate-400 dark:text-slate-600';
          let borderColor = 'border-transparent';

          if (hasWorked) {
            if (goalMet) {
              bgColor = 'bg-emerald-500/10';
              textColor = 'text-emerald-600 dark:text-emerald-400';
              borderColor = 'border-emerald-500/20';
            } else {
              bgColor = 'bg-indigo-500/10';
              textColor = 'text-indigo-600 dark:text-indigo-400';
              borderColor = 'border-indigo-500/20';
            }
          }

          if (isToday) {
            borderColor = 'border-indigo-500';
          }

          return (
            <div 
              key={d.day} 
              className={`aspect-square rounded-2xl border ${borderColor} ${bgColor} flex flex-col items-center justify-center relative group transition-all`}
            >
              <span className={`text-xs font-black font-mono-num ${textColor}`}>{d.day}</span>
              {hasWorked && (
                <div className={`w-1 h-1 rounded-full mt-1 ${goalMet ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
              )}
              
              {/* Tooltip simples no hover */}
              {hasWorked && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                  <div className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-lg whitespace-nowrap uppercase tracking-widest shadow-xl">
                    {formatCurrency(d.stats.gross)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Meta Batida</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trabalhado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Folga</span>
        </div>
      </div>
    </motion.div>
  );
};

export default History;
