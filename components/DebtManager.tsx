
import React, { useState } from 'react';
import { Liability, CurrencyCode, FamilyMember } from '../types';
import { ShieldAlert, TrendingDown, CheckCircle2, Percent, Edit2, Trash2, X, Save, Settings2, Globe, User } from 'lucide-react';

interface Props {
  liabilities: Liability[];
  users: FamilyMember[];
  isFamilyView: boolean;
  onUpdateLiability: (l: Liability) => void;
  onDeleteLiability: (id: string) => void;
}

const DebtManager: React.FC<Props> = ({ liabilities, users, isFamilyView, onUpdateLiability, onDeleteLiability }) => {
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('snowball');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
      name: '',
      totalOwed: '',
      monthlyPayment: '',
      interestRate: '',
      currency: 'COP' as CurrencyCode
  });

  // Sort Logic
  const sortedLiabilities = [...liabilities].sort((a, b) => {
      if (strategy === 'snowball') return a.totalOwed - b.totalOwed; 
      return b.interestRate - a.interestRate;
  });

  const getOwnerName = (id?: string) => {
    if (!id) return '';
    return users.find(u => u.id === id)?.name || '';
  };

  const handleEditClick = (l: Liability) => {
      setEditingId(l.id);
      setEditForm({
          name: l.name,
          totalOwed: l.totalOwed.toString(),
          monthlyPayment: l.monthlyPayment.toString(),
          interestRate: l.interestRate.toString(),
          currency: l.currency
      });
  };

  const handleSaveEdit = (original: Liability) => {
      const updated: Liability = {
          ...original,
          name: editForm.name,
          totalOwed: parseFloat(editForm.totalOwed) || 0,
          monthlyPayment: parseFloat(editForm.monthlyPayment) || 0,
          interestRate: parseFloat(editForm.interestRate) || 0,
          currency: editForm.currency
      };
      onUpdateLiability(updated);
      setEditingId(null);
  };
  
  const formatMoney = (amount: number, currency: CurrencyCode) => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: currency,
        maximumFractionDigits: 0 
    }).format(amount);
  };

  if (liabilities.length === 0) {
    return (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Libertad Financiera!</h2>
            <p className="text-slate-400">No tienes pasivos registrados. Estás en el camino correcto para construir riqueza masiva.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/20 rounded-lg">
                    <ShieldAlert className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Gestión de Deuda {isFamilyView && '(Vista Familiar)'}</h2>
                    <p className="text-xs text-slate-400">Configura y elimina tus pasivos</p>
                </div>
            </div>
            
            {/* Strategy Toggle */}
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button 
                    onClick={() => setStrategy('snowball')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${strategy === 'snowball' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Bola de Nieve
                </button>
                <button 
                    onClick={() => setStrategy('avalanche')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${strategy === 'avalanche' ? 'bg-rose-900/40 text-rose-200 shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Avalancha
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs uppercase tracking-wider">Deudas Activas</p>
                <p className="text-2xl font-bold text-slate-200">{liabilities.length}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-center gap-2">
                 <ShieldAlert className="w-8 h-8 text-rose-500/50" />
                 <p className="text-xs text-slate-400">El cálculo total requiere conversión de divisas. Revisa cada deuda individualmente.</p>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Settings2 className="w-4 h-4" /> 
                    Plan de Ataque: {strategy === 'snowball' ? 'Menor Saldo Primero' : 'Mayor Interés Primero'}
                 </h3>
            </div>

            {sortedLiabilities.map((debt, index) => {
                const isPriority = index === 0;
                const priorityClass = isPriority ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-slate-800" : "border-slate-700 bg-slate-900/30 opacity-90";
                
                if (editingId === debt.id) {
                    // EDIT MODE CARD
                    return (
                        <div key={debt.id} className="p-4 rounded-xl border border-indigo-500 bg-slate-800 shadow-xl relative animate-in fade-in zoom-in-95">
                            <div className="absolute -top-3 left-4 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                Editando
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Nombre</label>
                                    <input 
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Moneda</label>
                                    <select 
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
                                        value={editForm.currency}
                                        onChange={(e) => setEditForm({...editForm, currency: e.target.value as CurrencyCode})}
                                    >
                                        <option value="COP">COP</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Tasa Interés (%)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
                                        value={editForm.interestRate}
                                        onChange={(e) => setEditForm({...editForm, interestRate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Total Deuda</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
                                        value={editForm.totalOwed}
                                        onChange={(e) => setEditForm({...editForm, totalOwed: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Pago Mensual</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
                                        value={editForm.monthlyPayment}
                                        onChange={(e) => setEditForm({...editForm, monthlyPayment: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-white bg-slate-700 rounded-lg"><X className="w-4 h-4" /></button>
                                <button onClick={() => handleSaveEdit(debt)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm transition-colors"><Save className="w-4 h-4" /> Guardar</button>
                            </div>
                        </div>
                    );
                }

                // VIEW MODE CARD
                return (
                    <div key={debt.id} className={`p-4 rounded-xl border ${priorityClass} relative group transition-all`}>
                        {isPriority && (
                            <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase z-10">
                                Prioridad #1
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-200 text-lg">{debt.name}</h4>
                                    {!isFamilyView && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEditClick(debt)}
                                                className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors" title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => onDeleteLiability(debt.id)}
                                                className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 mt-1 items-center">
                                    <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">{debt.type}</span>
                                    <span className="text-xs text-rose-400 flex items-center gap-1 font-mono"><Percent className="w-3 h-3" /> {debt.interestRate}% Anual</span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-800 px-2 rounded"><Globe className="w-3 h-3"/> {debt.currency}</span>
                                    {isFamilyView && debt.ownerId && (
                                        <span className="text-xs text-indigo-300 flex items-center gap-1 bg-indigo-900/20 px-2 rounded border border-indigo-500/30"><User className="w-3 h-3"/> {getOwnerName(debt.ownerId)}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 bg-slate-950/30 p-3 rounded-lg border border-slate-800">
                                <div className="flex-1 md:flex-none">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Restante</span>
                                    </div>
                                    <p className="text-slate-200 font-mono font-bold">{formatMoney(debt.totalOwed, debt.currency)}</p>
                                </div>
                                <div className="h-8 w-px bg-slate-700"></div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">Cuota</p>
                                    <p className="font-mono text-rose-400 font-bold">-{formatMoney(debt.monthlyPayment, debt.currency)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default DebtManager;
