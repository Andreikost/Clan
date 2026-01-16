import React, { useState } from 'react';
import { FinancialState } from '../types';
import { getFinancialAdvice, FinancialContext } from '../services/geminiService';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  state: FinancialContext;
}

const AICoach: React.FC<Props> = ({ state }) => {
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAsk = async () => {
    if (!query.trim() && !advice) {
        // Initial generic advice
        setLoading(true);
        const response = await getFinancialAdvice(state);
        setAdvice(response);
        setLoading(false);
        return;
    }
    if (!query.trim()) return;

    setLoading(true);
    const response = await getFinancialAdvice(state, query);
    setAdvice(response);
    setQuery('');
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2 border border-white/20"
      >
        <Sparkles className="w-6 h-6 text-white" />
        <span className="text-white font-bold hidden md:inline">Coach IA</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[600px] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-500/20 p-2 rounded-lg">
                <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
                <h3 className="text-white font-bold text-sm">Coach Financiero</h3>
                <p className="text-xs text-slate-400">Impulsado por Gemini</p>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {!advice && (
            <div className="text-center text-slate-500 mt-10">
                <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Pregúntame cómo salir de la carrera de la rata o distribuir tus ingresos.</p>
                <button 
                    onClick={handleAsk}
                    className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-indigo-400 border border-indigo-900 transition-colors"
                >
                    Analizar mis finanzas ahora
                </button>
            </div>
        )}
        
        {advice && (
            <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700 text-sm text-slate-200">
                 <ReactMarkdown 
                    components={{
                        strong: ({node, ...props}) => <span className="text-indigo-300 font-bold" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-2 mt-2" {...props} />,
                        li: ({node, ...props}) => <li className="text-slate-300" {...props} />
                    }}
                 >
                    {advice}
                 </ReactMarkdown>
            </div>
        )}

        {loading && (
            <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="relative">
            <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Escribe tu consulta..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button 
                onClick={handleAsk}
                disabled={loading}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors disabled:opacity-50"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;