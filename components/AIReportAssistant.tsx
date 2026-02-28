
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface AIReportAssistantProps {
  reportData: any;
}

const AIReportAssistant: React.FC<AIReportAssistantProps> = ({ reportData }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      // Tenta buscar a chave de diferentes formas para garantir compatibilidade com Vercel/Vite
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('API_KEY_MISSING');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const context = `
        Você é o assistente de inteligência artificial do aplicativo RotaFinanceira.
        Seu objetivo é analisar os dados financeiros do usuário e fornecer insights úteis.
        
        DADOS DO RELATÓRIO ATUAL:
        - Período Analisado: ${reportData.startDate} até ${reportData.endDate}
        - Faturamento Bruto Total: ${formatCurrency(reportData.summary.totalGross)}
        - Lucro Líquido Real: ${formatCurrency(reportData.summary.totalNet)}
        - Total de Despesas: ${formatCurrency(reportData.totalExpenses)}
        - Quantidade de Entregas: ${reportData.quickLaunchesCount}
        - KM Total Rodado: ${reportData.totalKm.toFixed(1)} km
        - Tempo Total de Trabalho: ${Math.floor(reportData.totalHours / 60)}h ${reportData.totalHours % 60}min
        - Ticket Médio por Entrega: ${formatCurrency(reportData.avgValuePerLaunch)}
        - Faturamento por Hora: ${formatCurrency(reportData.avgGrossPerHour)}
        
        DESPESAS DETALHADAS:
        - Combustível: ${formatCurrency(reportData.totalFuelSpent)}
        - Alimentação: ${formatCurrency(reportData.totalFoodSpent)}
        - Manutenção: ${formatCurrency(reportData.totalMaintenanceSpent)}
        
        FATURAMENTO POR MÉTODO:
        - PIX: ${formatCurrency(reportData.totalsByPayment.pix || 0)}
        - Dinheiro: ${formatCurrency(reportData.totalsByPayment.money || 0)}
        - Caderno: ${formatCurrency(reportData.totalsByPayment.caderno || 0)}

        GASTOS POR MÉTODO:
        - PIX: ${formatCurrency(reportData.expenseTotalsByMethod.pix || 0)}
        - Dinheiro: ${formatCurrency(reportData.expenseTotalsByMethod.money || 0)}
        - Caderno: ${formatCurrency(reportData.expenseTotalsByMethod.caderno || 0)}

        Responda de forma concisa, profissional e amigável em português do Brasil. 
        Se o usuário perguntar algo que não está nos dados, informe que você só tem acesso aos dados do período selecionado.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: context + "\n\nPergunta do usuário: " + userMessage }] }
        ],
      });

      const modelText = response.text || "Desculpe, não consegui processar sua solicitação.";
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (err: any) {
      console.error("Erro na IA:", err);
      if (err.message === 'API_KEY_MISSING') {
        setError("Chave da API não encontrada. Se você estiver no Vercel, adicione a variável de ambiente GEMINI_API_KEY nas configurações do projeto.");
      } else {
        setError("Ocorreu um erro ao consultar a inteligência artificial. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[500px]"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-indigo-600 dark:bg-indigo-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">IA Analista Financeira</h3>
            <p className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Análise inteligente de dados</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-slate-50/50 dark:bg-slate-950/20"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot size={48} className="text-indigo-500" />
            <div className="max-w-xs">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Olá! Eu sou sua IA Analista.</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Pergunte-me sobre seu lucro, médias ou como melhorar seu desempenho neste período.</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                {msg.text}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 shadow-sm flex items-center justify-center">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-rose-100 dark:border-rose-500/20">
              <AlertCircle size={14} /> {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo sobre o relatório..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIReportAssistant;
