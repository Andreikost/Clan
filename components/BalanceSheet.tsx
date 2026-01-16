
import React from 'react';
import { Asset, Liability, CurrencyCode, FamilyMember } from '../types';
import { TrendingUp, TrendingDown, Plus, Trash2, Globe, User } from 'lucide-react';

interface Props {
  assets: Asset[];
  liabilities: Liability[];
  baseCurrency: CurrencyCode;
  exchangeRates: Record<string, number>;
  isFamilyView: boolean; // New prop
  users: FamilyMember[]; // New prop to look up names
  onAddAsset: () => void;
  onAddLiability: () => void;
  onDeleteAsset: (id: string) => void;
  onDeleteLiability: (id: string) => void;
}

const BalanceSheet: React.FC<Props> = ({ 
  assets, 
  liabilities, 
  baseCurrency,
  exchangeRates,
  isFamilyView,
  users,
  onAddAsset, 
  onAddLiability,
  onDeleteAsset,
  onDeleteLiability
}) => {
  
  const formatMoney = (amount: number, currency: CurrencyCode) => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: currency,
        maximumFractionDigits: 0 
    }).format(amount);
  };

  const getValueInBase = (amount: number, currency: CurrencyCode) => {
     if (currency === baseCurrency) return amount;
     if (baseCurrency === 'COP' && currency === 'USD') return amount * (exchangeRates['USD'] || 1);
     if (baseCurrency === 'USD' && currency === 'COP') return amount / (exchangeRates['USD'] || 1);
     return amount;
  };

  const getOwnerName = (id?: string) => {
      if (!id) return '';
      return users.find(u => u.id === id)?.name || '';
  };

  const totalAssets = assets.reduce((sum, a) => sum + getValueInBase(a.value, a.currency), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + getValueInBase(l.totalOwed, l.currency), 0);
  const passiveIncome = assets.reduce((sum, a) => sum + getValueInBase(a.monthlyCashflow, a.currency), 0);
  const debtPayment = liabilities.reduce((sum, l) => sum + getValueInBase(l.monthlyPayment, l.currency), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Assets Column */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Activos {isFamilyView && '(Total)'}</h2>
              <p className="text-xs text-emerald-400">Ponen dinero en tu bolsillo</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-sm text-slate-400">Total Valor ({baseCurrency})</p>
             <p className="text-xl font-mono text-white font-bold">{formatMoney(totalAssets, baseCurrency)}</p>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {assets.length === 0 && <p className="text-slate-500 italic text-sm">Aún no tienes activos. ¡Empieza a invertir!</p>}
          {assets.map((asset) => (
            <div key={asset.id} className="group flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-all">
              <div>
                <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-200">{asset.name}</p>
                    {!isFamilyView && (
                        <button 
                            onClick={() => onDeleteAsset(asset.id)}
                            className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity"
                            title="Eliminar Activo"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="flex gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-900/50">{asset.type}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {asset.currency}
                    </span>
                    {isFamilyView && asset.ownerId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/30 text-indigo-300 flex items-center gap-1 border border-indigo-500/30">
                            <User className="w-3 h-3" /> {getOwnerName(asset.ownerId)}
                        </span>
                    )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-300 font-mono">{formatMoney(asset.value, asset.currency)}</p>
                <p className="text-xs text-emerald-400 flex items-center justify-end">
                  +{formatMoney(asset.monthlyCashflow, asset.currency)}/mes
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {!isFamilyView && (
            <div className="mt-4 pt-2 flex justify-center">
                <button 
                    onClick={onAddAsset}
                    className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                >
                    <Plus className="w-4 h-4" /> Agregar Activo
                </button>
            </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
            <span className="text-slate-400 text-sm">Ingreso Pasivo Total ({baseCurrency}):</span>
            <span className="text-emerald-400 font-bold text-lg">+{formatMoney(passiveIncome, baseCurrency)}/mes</span>
        </div>
      </div>

      {/* Liabilities Column */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Pasivos {isFamilyView && '(Total)'}</h2>
              <p className="text-xs text-rose-400">Sacan dinero de tu bolsillo</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-sm text-slate-400">Deuda Total ({baseCurrency})</p>
             <p className="text-xl font-mono text-white font-bold">{formatMoney(totalLiabilities, baseCurrency)}</p>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {liabilities.length === 0 && <p className="text-slate-500 italic text-sm">¡Excelente! No tienes pasivos.</p>}
          {liabilities.map((liab) => (
            <div key={liab.id} className="group flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-rose-500/30 transition-all">
              <div>
                <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-200">{liab.name}</p>
                    {!isFamilyView && (
                        <button 
                            onClick={() => onDeleteLiability(liab.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity"
                            title="Eliminar Pasivo"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="flex gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-900/30 text-rose-400 border border-rose-900/50">{liab.type}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{liab.interestRate}% Int.</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {liab.currency}
                    </span>
                    {isFamilyView && liab.ownerId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/30 text-indigo-300 flex items-center gap-1 border border-indigo-500/30">
                            <User className="w-3 h-3" /> {getOwnerName(liab.ownerId)}
                        </span>
                    )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-300 font-mono">{formatMoney(liab.totalOwed, liab.currency)}</p>
                <p className="text-xs text-rose-400 flex items-center justify-end">
                  -{formatMoney(liab.monthlyPayment, liab.currency)}/mes
                </p>
              </div>
            </div>
          ))}
        </div>

        {!isFamilyView && (
            <div className="mt-4 pt-2 flex justify-center">
                <button 
                    onClick={onAddLiability}
                    className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                >
                    <Plus className="w-4 h-4" /> Agregar Pasivo
                </button>
            </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
            <span className="text-slate-400 text-sm">Pago Deuda Mensual ({baseCurrency}):</span>
            <span className="text-rose-400 font-bold text-lg">-{formatMoney(debtPayment, baseCurrency)}/mes</span>
        </div>
      </div>
      
      {/* Net Worth Summary */}
      <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 flex justify-between items-center shadow-xl border border-blue-700/50">
        <div>
            <h3 className="text-blue-200 font-medium mb-1">Patrimonio Neto {isFamilyView && 'Familiar'} ({baseCurrency})</h3>
            <p className="text-3xl font-bold text-white">{formatMoney(netWorth, baseCurrency)}</p>
        </div>
        <div className="text-right hidden sm:block">
            <p className="text-blue-200 text-sm italic">"Los ricos se centran en su patrimonio neto.<br/> Los pobres en sus ingresos laborales."</p>
            <p className="text-blue-300 text-xs mt-1">- T. Harv Eker</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
