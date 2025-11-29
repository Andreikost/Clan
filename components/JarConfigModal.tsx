import React, { useState, useEffect } from 'react';
import { Jar, JarType } from '../types';
import { X, Save, AlertTriangle, Check } from 'lucide-react';

interface Props {
  jars: Record<JarType, Jar>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedJars: Record<JarType, Jar>) => void;
}

const COLORS = [
  { label: 'Blue', value: 'bg-blue-600' },
  { label: 'Emerald', value: 'bg-emerald-500' },
  { label: 'Cyan', value: 'bg-cyan-600' },
  { label: 'Violet', value: 'bg-violet-600' },
  { label: 'Pink', value: 'bg-pink-500' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Rose', value: 'bg-rose-500' },
  { label: 'Indigo', value: 'bg-indigo-600' },
  { label: 'Slate', value: 'bg-slate-600' },
];

const JarConfigModal: React.FC<Props> = ({ jars, isOpen, onClose, onSave }) => {
  const [localJars, setLocalJars] = useState<Record<JarType, Jar>>(jars);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalJars(JSON.parse(JSON.stringify(jars)));
    }
  }, [isOpen, jars]);

  if (!isOpen) return null;

  const jarList = Object.values(localJars) as Jar[];
  const totalPercentage = jarList.reduce((sum, jar) => sum + (jar.percentage || 0), 0);
  const isValid = totalPercentage === 100;

  const handleChange = (id: JarType, field: keyof Jar, value: any) => {
    setLocalJars(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSave = () => {
    if (!isValid) {
      if (!window.confirm(`El total es ${totalPercentage}%. Se recomienda que sea 100%. ¿Guardar de todos modos?`)) {
        return;
      }
    }
    onSave(localJars);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white">Configuración del Sistema</h2>
            <p className="text-sm text-slate-400">Edita los porcentajes y nombres de tus jarrones.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
             <div className="col-span-1">Color</div>
             <div className="col-span-3">Nombre</div>
             <div className="col-span-2 text-center">% Meta</div>
             <div className="col-span-6">Descripción</div>
          </div>

          {jarList.map((jar) => (
            <div key={jar.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-colors items-start">
              
              {/* Color Picker */}
              <div className="col-span-1 flex justify-center md:pt-2">
                 <div className="group relative">
                    <div className={`w-8 h-8 rounded-full cursor-pointer shadow-lg border-2 border-slate-600 ${jar.color}`}></div>
                    <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 p-2 rounded-lg grid grid-cols-3 gap-1 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-32">
                        {COLORS.map(c => (
                            <div 
                                key={c.value} 
                                onClick={() => handleChange(jar.id, 'color', c.value)}
                                className={`w-6 h-6 rounded-full cursor-pointer ${c.value} ${jar.color === c.value ? 'ring-2 ring-white' : ''}`}
                                title={c.label}
                            />
                        ))}
                    </div>
                 </div>
              </div>

              {/* Name */}
              <div className="col-span-3">
                 <input 
                    type="text" 
                    value={jar.name} 
                    onChange={(e) => handleChange(jar.id, 'name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm font-bold"
                 />
              </div>

              {/* Percentage */}
              <div className="col-span-2 relative">
                 <input 
                    type="number" 
                    value={jar.percentage} 
                    onChange={(e) => handleChange(jar.id, 'percentage', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm text-center"
                 />
                 <span className="absolute right-3 top-2 text-slate-500 text-xs">%</span>
              </div>

              {/* Description */}
              <div className="col-span-6">
                 <textarea 
                    rows={2}
                    value={jar.description} 
                    onChange={(e) => handleChange(jar.id, 'description', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:border-indigo-500 outline-none text-xs resize-none"
                 />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex flex-col md:flex-row justify-between items-center gap-4">
           <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${isValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {isValid ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                <span className="font-mono font-bold">Total: {totalPercentage}%</span>
                {!isValid && <span className="text-xs ml-2 opacity-80">(Debe sumar 100%)</span>}
           </div>

           <div className="flex gap-3 w-full md:w-auto">
               <button onClick={onClose} className="flex-1 md:flex-none px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-medium transition-colors">
                   Cancelar
               </button>
               <button onClick={handleSave} className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-colors">
                   <Save className="w-4 h-4" /> Guardar Cambios
               </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default JarConfigModal;