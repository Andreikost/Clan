import React from 'react';
import { Jar, JarType } from '../types';
import { TrendingUp, School, Heart, Shield, Gamepad2, Home, Settings2, MousePointerClick } from 'lucide-react';

interface Props {
  jars: Record<JarType, Jar>;
  onConfig: () => void;
  onJarClick: (jar: Jar) => void;
}

const getIcon = (id: JarType) => {
  switch (id) {
    case JarType.NEC: return <Home className="w-5 h-5" />;
    case JarType.LIB: return <TrendingUp className="w-5 h-5" />;
    case JarType.EDU: return <School className="w-5 h-5" />;
    case JarType.ALP: return <Shield className="w-5 h-5" />;
    case JarType.JUE: return <Gamepad2 className="w-5 h-5" />;
    case JarType.DAR: return <Heart className="w-5 h-5" />;
    default: return <Home className="w-5 h-5" />;
  }
};

const JarsDisplay: React.FC<Props> = ({ jars, onConfig, onJarClick }) => {
  const jarList: Jar[] = Object.values(jars);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4 mt-8">
        <div>
           <h2 className="text-xl font-bold text-white">Sistema de Jarrones (Jars)</h2>
           <div className="flex items-center gap-2 mt-1">
             <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Hábito de Millonario</span>
           </div>
        </div>
        <button 
          onClick={onConfig}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-sm"
        >
          <Settings2 className="w-4 h-4" /> <span className="hidden sm:inline">Configurar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {jarList.map((jar) => (
          <div 
            key={jar.id} 
            onClick={() => onJarClick(jar)}
            className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg relative overflow-hidden group cursor-pointer"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${jar.color}`}></div>
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg bg-slate-700/50 text-slate-200 group-hover:text-emerald-400 transition-colors`}>
                {getIcon(jar.id)}
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900/50 px-2 py-1 rounded-full group-hover:bg-emerald-900/30 group-hover:text-emerald-400 transition-colors">
                {jar.percentage}% Meta
              </span>
            </div>
            <h3 className="text-slate-100 font-semibold text-lg">{jar.name}</h3>
            <p className="text-slate-400 text-xs mb-4 h-8 overflow-hidden">{jar.description}</p>
            
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold text-emerald-400">${jar.balance.toLocaleString()}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 right-4 bg-slate-900 p-1.5 rounded-lg border border-slate-700 text-slate-400">
                  <MousePointerClick className="w-4 h-4" />
              </div>
            </div>
            
            {jar.id === JarType.LIB && (
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JarsDisplay;