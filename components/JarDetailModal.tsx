
import React from 'react';
import { Jar, Transaction, JarType } from '../types';
import { X, TrendingDown, TrendingUp, ArrowDownRight, ArrowUpRight, Calendar, Globe } from 'lucide-react';

interface Props {
  jar: Jar | null;
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
}

const JarDetailModal: React.FC<Props> = ({ jar, transactions, isOpen, onClose }) => {
  if (!isOpen || !jar) return null;

  // 1. Filter Transactions relevant to this Jar
  // Expenses: Direct match on jarId
  const jarExpenses = transactions.filter(t => t.type === 'EXPENSE' && t.jarId === jar.id);
  
  // Income: We calculate the implied allocation based on the jar's CURRENT percentage.
  // (Note: In a real DB, we would store the specific allocation record, but this works for the model)
  const incomeTransactions = transactions.filter(t => t.type === 'INCOME');

  // 2. Calculate Totals (Simplified: assuming converted values for totals, or ignoring currency mix for chart)
  // For precise visualization, we should convert everything to base currency, but for now we assume values are passed normalized
  // or we accept the discrepancy in the bar chart. Ideally, App.tsx converts before adding to Jar balance.
  
  const totalExpenses = jarExpenses.reduce((sum, t) => sum + t.amount, 0); // Warning: Mixing currencies in raw sum if not normalized
  const totalAllocatedIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount * (jar.percentage / 100)), 0);
  const netFlow = totalAllocatedIncome - totalExpenses;

  // 3. Group Expenses by Description for the Chart
  const expensesByDesc = jarExpenses.reduce((acc, t) => {
    acc[t.description] = (acc[t.description] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort by value (highest expense first)
  const sortedExpenses = Object.entries(expensesByDesc)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([desc, amount]) => ({ desc, amount: amount as number }));

  const maxExpenseVal = sortedExpenses.length > 0 ? sortedExpenses[0].amount : 0;

  // Combined history for the list (Allocated Income + Direct Expenses)
  const historyList = [
    ...jarExpenses.map(t => ({ ...t, displayAmount: t.amount, isAllocation: false })),
    ...incomeTransactions.map(t => ({ 
        ...t, 
        displayAmount: t.amount * (jar.percentage / 100), 
        description: `Asignación: ${t.description}`,
        isAllocation: true,
        id: `alloc-${t.id}` // unique key
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative overflow-hidden p-6 rounded-t-2xl border-b border-slate-800">
           <div className={`absolute top-0 left-0 w-full h-1 ${jar.color}`}></div>
           <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl ${jar.color}`}></div>
           
           <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-white">{jar.name}</h2>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-800 border border-slate-600 text-slate-300">{jar.percentage}% del Ingreso</span>
                </div>
                <p className="text-slate-400 text-sm max-w-md">{jar.description}</p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Ingreso Asignado (Histórico)</p>
                  <p className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5" /> ${totalAllocatedIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Gastos Totales</p>
                  <p className="text-2xl font-bold text-rose-400 flex items-center gap-2">
                      <ArrowDownRight className="w-5 h-5" /> ${totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Saldo Actual</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                      ${jar.balance.toLocaleString()}
                  </p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart: Expenses by Description */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-rose-400" /> Desglose de Gastos
                </h3>
                
                {sortedExpenses.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-slate-500 text-sm italic">
                        No hay gastos registrados en este jarrón.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedExpenses.map((item, idx) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300 font-medium">{item.desc}</span>
                                    <span className="text-slate-400">${item.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-rose-500 rounded-full transition-all duration-500 group-hover:bg-rose-400"
                                            style={{ width: `${(item.amount / maxExpenseVal) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 w-8 text-right">
                                        {Math.round((item.amount / totalExpenses) * 100)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent History */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex flex-col">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" /> Movimientos Recientes
                </h3>
                
                <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3">
                    {historyList.length === 0 ? (
                         <div className="text-slate-500 text-sm italic text-center py-10">Sin movimientos.</div>
                    ) : (
                        historyList.map((t) => (
                            <div key={t.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                <div>
                                    <p className="text-sm font-medium text-slate-200">{t.description}</p>
                                    <div className="flex gap-2 text-[10px] text-slate-500">
                                        <span>{new Date(t.date).toLocaleDateString()}</span>
                                        {/* Show currency flag for transaction */}
                                        <span className="flex items-center gap-1 bg-slate-800 px-1 rounded text-slate-400"><Globe className="w-2 h-2" /> {t.currency}</span>
                                    </div>
                                </div>
                                <div className={`font-mono font-bold text-sm ${t.isAllocation ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.isAllocation ? '+' : '-'}${t.displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JarDetailModal;
