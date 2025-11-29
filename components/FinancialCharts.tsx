import React from 'react';
import { Jar, JarType, MonthlyStats } from '../types';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  jars: Record<JarType, Jar>;
  stats: MonthlyStats[];
  expensesByJar: Record<JarType, number>;
  incomeByJar: Record<JarType, number>;
}

const FinancialCharts: React.FC<Props> = ({ jars, stats, expensesByJar, incomeByJar }) => {
  const jarList: Jar[] = Object.values(jars);
  const maxJarValue = Math.max(
    ...jarList.map(j => Math.max(incomeByJar[j.id] || 0, expensesByJar[j.id] || 0)),
    100 // Minimum scale
  );

  // Helper for Net Worth Trend (Line Chart)
  const getPoints = () => {
    if (stats.length < 2) return "";
    const maxVal = Math.max(...stats.map(s => s.netWorth));
    const minVal = Math.min(...stats.map(s => s.netWorth));
    const range = maxVal - minVal || 1;
    const width = 100; // percent
    
    return stats.map((s, i) => {
        const x = (i / (stats.length - 1)) * 100;
        const y = 100 - ((s.netWorth - minVal) / range) * 100;
        return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 1. Analysis: Allocation vs Expenses (Bar Chart) */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-white font-bold text-lg">Flujo por Jarrón (Mes Actual)</h3>
                <p className="text-xs text-slate-400">Ingreso Asignado vs. Gastado</p>
            </div>
            <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-600"></div> Asignado</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Gastado</div>
            </div>
        </div>

        <div className="space-y-4">
            {jarList.map(jar => {
                const income = incomeByJar[jar.id] || 0;
                const expense = expensesByJar[jar.id] || 0;
                const incomePct = (income / maxJarValue) * 100;
                const expensePct = (expense / maxJarValue) * 100;

                return (
                    <div key={jar.id} className="relative">
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>{jar.name}</span>
                            <span className="font-mono">
                                <span className="text-emerald-400">+${income.toLocaleString()}</span> / 
                                <span className="text-rose-400"> -${expense.toLocaleString()}</span>
                            </span>
                        </div>
                        <div className="h-3 w-full bg-slate-900 rounded-full relative overflow-hidden">
                            {/* Income Bar (Background/Target) */}
                            <div 
                                style={{ width: `${incomePct}%` }} 
                                className="absolute top-0 left-0 h-full bg-slate-700/50 rounded-full"
                            ></div>
                            {/* Expense Bar (Foreground) */}
                            <div 
                                style={{ width: `${expensePct}%` }} 
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${expense > income ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            ></div>
                        </div>
                        {expense > income && (
                            <div className="text-[10px] text-rose-500 text-right mt-0.5 font-bold">¡Presupuesto Excedido!</div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* 2. Analysis: Net Worth Trend (Area/Line Chart) */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-white font-bold text-lg">Tendencia de Riqueza</h3>
                    <p className="text-xs text-slate-400">Crecimiento del Patrimonio Neto</p>
                </div>
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                </div>
            </div>
            {stats.length > 1 && (
                <div className="mb-6">
                    <p className="text-3xl font-bold text-white">${stats[stats.length-1].netWorth.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-sm mt-1">
                        {stats[stats.length-1].netWorth >= stats[0].netWorth ? (
                            <span className="text-emerald-400 flex items-center"><ArrowUpRight className="w-4 h-4" /> Crecimiento</span>
                        ) : (
                            <span className="text-rose-400 flex items-center"><ArrowDownRight className="w-4 h-4" /> Decremento</span>
                        )}
                        <span className="text-slate-500">vs inicio</span>
                    </div>
                </div>
            )}
        </div>

        {/* CSS/SVG Chart */}
        <div className="h-48 w-full relative border-l border-b border-slate-700">
            {stats.length < 2 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm italic">
                    Necesitas más datos para ver tendencias.
                </div>
            ) : (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <polyline
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="2"
                        points={getPoints()}
                        vectorEffect="non-scaling-stroke"
                    />
                    <polygon
                        fill="url(#gradient)"
                        points={`0,100 ${getPoints()} 100,100`}
                    />
                     {/* Data points */}
                     {stats.map((s, i) => {
                        const maxVal = Math.max(...stats.map(st => st.netWorth));
                        const minVal = Math.min(...stats.map(st => st.netWorth));
                        const range = maxVal - minVal || 1;
                        const x = (i / (stats.length - 1)) * 100;
                        const y = 100 - ((s.netWorth - minVal) / range) * 100;
                        return (
                            <circle key={i} cx={x} cy={y} r="3" className="fill-indigo-400 hover:fill-white cursor-pointer transition-colors" />
                        )
                     })}
                </svg>
            )}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
            {stats.map((s, i) => (
                <span key={i}>{s.month.substring(0, 3)}</span>
            ))}
        </div>
      </div>

    </div>
  );
};

export default FinancialCharts;