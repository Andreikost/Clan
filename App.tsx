
import React, { useState, useEffect } from 'react';
import { JarType, FinancialState, FamilyMember, Transaction, MonthlyStats, Jar, Asset, Liability, CurrencyCode } from './types';
import JarsDisplay from './components/JarsDisplay';
import BalanceSheet from './components/BalanceSheet';
import FinancialCharts from './components/FinancialCharts';
import AICoach from './components/AICoach';
import DebtManager from './components/DebtManager';
import JarConfigModal from './components/JarConfigModal';
import JarDetailModal from './components/JarDetailModal';
import { PieChart, LayoutDashboard, PlusCircle, LogOut, Wallet, TrendingDown, TrendingUp, AlertCircle, ArrowRight, X, Save, Calculator, Globe, RefreshCcw, Check, Settings } from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_JARS = {
  [JarType.NEC]: { id: JarType.NEC, name: "Necesidades", description: "Gastos básicos de vida", percentage: 55, balance: 10000000, color: "bg-blue-600" },
  [JarType.LIB]: { id: JarType.LIB, name: "Libertad Financiera (FFA)", description: "La gallina de los huevos de oro. ¡Nunca gastar!", percentage: 10, balance: 48000000, color: "bg-emerald-500" },
  [JarType.ALP]: { id: JarType.ALP, name: "Ahorro Largo Plazo", description: "Gastos grandes futuros", percentage: 10, balance: 6000000, color: "bg-cyan-600" },
  [JarType.EDU]: { id: JarType.EDU, name: "Educación", description: "Crecimiento personal y cursos", percentage: 10, balance: 1600000, color: "bg-violet-600" },
  [JarType.JUE]: { id: JarType.JUE, name: "Juego", description: "Disfrutar sin culpa. Gastar todo a fin de mes.", percentage: 10, balance: 1200000, color: "bg-pink-500" },
  [JarType.DAR]: { id: JarType.DAR, name: "Dar", description: "Donaciones y caridad", percentage: 5, balance: 600000, color: "bg-amber-500" },
};

const INITIAL_USER: FamilyMember = {
  id: '1',
  name: 'Roberto',
  role: 'Admin',
  avatar: 'https://picsum.photos/200'
};

const INITIAL_STATS: MonthlyStats[] = [
    { month: 'Ene', income: 16000000, expenses: 14000000, netWorth: 112000000 },
    { month: 'Feb', income: 16800000, expenses: 14400000, netWorth: 114400000 },
    { month: 'Mar', income: 16000000, expenses: 13600000, netWorth: 116800000 },
    { month: 'Abr', income: 18000000, expenses: 15200000, netWorth: 119600000 },
    { month: 'May', income: 18400000, expenses: 15600000, netWorth: 122400000 },
];

const INITIAL_DESCRIPTIONS = [
    "Salario Mensual", "Renta de Propiedad", "Dividendos", "Comestibles", 
    "Restaurante", "Cine", "Gasolina", "Electricidad", "Internet", "Educación Online"
];

const INITIAL_STATE: FinancialState = {
  baseCurrency: 'COP',
  exchangeRates: {
      'USD': 4000,
      'EUR': 4300,
      'COP': 1
  },
  jars: INITIAL_JARS,
  assets: [
    { id: '1', name: 'Apartamento Renta', value: 600000000, currency: 'COP', monthlyCashflow: 3200000, type: 'RealEstate' },
    { id: '2', name: 'Portafolio Dividendos', value: 10000, currency: 'USD', monthlyCashflow: 40, type: 'Stock' }
  ],
  liabilities: [
    { id: '1', name: 'Hipoteca Casa', totalOwed: 480000000, currency: 'COP', monthlyPayment: 3600000, type: 'Mortgage', interestRate: 12.5 },
    { id: '2', name: 'Préstamo Auto', totalOwed: 6000, currency: 'USD', monthlyPayment: 150, type: 'Car', interestRate: 7.2 }
  ],
  transactions: [],
  currentUser: INITIAL_USER,
  monthlyStats: INITIAL_STATS,
  savedDescriptions: INITIAL_DESCRIPTIONS
};

const App: React.FC = () => {
  const [state, setState] = useState<FinancialState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'debt'>('dashboard');
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [isLogin, setIsLogin] = useState(true);

  // Form State
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('COP');
  const [transactionDesc, setTransactionDesc] = useState('');
  
  // Expense Specific
  const [selectedJar, setSelectedJar] = useState<JarType>(JarType.NEC);
  
  // Income Specific
  const [isManualDistribution, setIsManualDistribution] = useState(false);
  const [manualDist, setManualDist] = useState<Record<JarType, string>>({
      [JarType.NEC]: '', [JarType.LIB]: '', [JarType.ALP]: '',
      [JarType.EDU]: '', [JarType.JUE]: '', [JarType.DAR]: ''
  });

  // Modal State for Asset/Liability/Jars
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [showJarConfigModal, setShowJarConfigModal] = useState(false);
  
  // -- NEW STATE FOR JAR DETAILS --
  const [selectedJarDetail, setSelectedJarDetail] = useState<Jar | null>(null);
  
  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState(''); // Value or Total Owed
  const [newItemCashflow, setNewItemCashflow] = useState(''); // Cashflow or Payment
  const [newItemType, setNewItemType] = useState<string>('');
  const [newItemInterest, setNewItemInterest] = useState('');
  const [newItemCurrency, setNewItemCurrency] = useState<CurrencyCode>('COP');

  // Exchange Rate / Global Config UI State
  const [editingRates, setEditingRates] = useState(false);
  const [tempUSDRate, setTempUSDRate] = useState(state.exchangeRates['USD'].toString());
  const [tempEURRate, setTempEURRate] = useState(state.exchangeRates['EUR'].toString());
  const [tempBaseCurrency, setTempBaseCurrency] = useState<CurrencyCode>(state.baseCurrency);

  // --- HELPERS ---
  const convertToBase = (amt: number, fromCurrency: CurrencyCode): number => {
      if (fromCurrency === state.baseCurrency) return amt;
      
      // We assume exchangeRates are stored relative to COP (as anchor) or we handle logic here
      // For this app: exchangeRates = { USD: 4000, EUR: 4300, COP: 1 } (Meaning 1 Unit = X COP)
      
      // 1. Convert to Anchor (COP)
      let valInAnchor = amt;
      if (fromCurrency !== 'COP') {
          valInAnchor = amt * (state.exchangeRates[fromCurrency] || 1);
      }

      // 2. Convert Anchor to Target Base
      if (state.baseCurrency === 'COP') return valInAnchor;
      
      // If base is USD, we need (COP Value) / (USD Rate)
      return valInAnchor / (state.exchangeRates[state.baseCurrency] || 1);
  };

  // Derived Calculations for Charts
  const currentMonthTransactions = state.transactions.filter(t => true); // Mock filtering

  const incomeByJar = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
         // Convert transaction amount to base currency before aggregating
         const amtInBase = convertToBase(t.amount, t.currency);
         
         if(t.type === 'INCOME') {
             acc[JarType.NEC] = (acc[JarType.NEC] || 0) + amtInBase * 0.55;
             acc[JarType.LIB] = (acc[JarType.LIB] || 0) + amtInBase * 0.10;
             acc[JarType.ALP] = (acc[JarType.ALP] || 0) + amtInBase * 0.10;
             acc[JarType.EDU] = (acc[JarType.EDU] || 0) + amtInBase * 0.10;
             acc[JarType.JUE] = (acc[JarType.JUE] || 0) + amtInBase * 0.10;
             acc[JarType.DAR] = (acc[JarType.DAR] || 0) + amtInBase * 0.05;
         }
         return acc;
    }, {} as Record<JarType, number>);

  const expensesByJar = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
        if (t.jarId) {
            // Convert to base currency
            const amtInBase = convertToBase(t.amount, t.currency);
            acc[t.jarId] = (acc[t.jarId] || 0) + amtInBase;
        }
        return acc;
    }, {} as Record<JarType, number>);

  const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + convertToBase(t.amount, t.currency), 0);
      
  const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + convertToBase(t.amount, t.currency), 0);
      
  const cashflow = totalIncome - totalExpenses;

  // -- LOGIC: Manual Distribution --
  const handleManualValueChange = (jarId: JarType, val: string) => {
      setManualDist(prev => ({ ...prev, [jarId]: val }));
  };

  const handleManualPercentChange = (jarId: JarType, pct: string) => {
      const total = parseFloat(amount);
      if (!total) return;
      const val = (total * (parseFloat(pct) / 100)).toFixed(2);
      setManualDist(prev => ({ ...prev, [jarId]: val }));
  };

  const getManualPercent = (jarId: JarType): string => {
      const total = parseFloat(amount);
      const val = parseFloat(manualDist[jarId]);
      if (!total || isNaN(val)) return '';
      return ((val / total) * 100).toFixed(1);
  };

  // Actions
  const handleAddIncome = () => {
    const totalAmt = parseFloat(amount);
    if (!totalAmt || totalAmt <= 0) return;
    
    // IMPORTANT: Convert to Base Currency for Jars Balance
    // NOTE: This actually converts to the *Jars Storage Currency* which we usually keep aligned with Base,
    // but to avoid complexity we will assume Jars store raw value or Base value. 
    // In this app, Jars are displayed in Base Currency, so we add the converted amount.
    const totalAmtInBase = convertToBase(totalAmt, currency);

    const newJars = { ...state.jars };
    let distribution: Record<JarType, number>;

    if (isManualDistribution) {
        // Manual dist assumes distribution amounts are in the INPUT currency
        // Need to sum them up, verify against totalAmt, then convert each to base
        const manualTotal = (Object.values(manualDist) as string[]).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        if (Math.abs(manualTotal - totalAmt) > 1) { 
            alert(`La distribución (${manualTotal.toFixed(2)}) no coincide con el monto total (${totalAmt}). Diferencia: ${(totalAmt - manualTotal).toFixed(2)}`);
            return;
        }
        distribution = {
            [JarType.NEC]: convertToBase(parseFloat(manualDist[JarType.NEC]) || 0, currency),
            [JarType.LIB]: convertToBase(parseFloat(manualDist[JarType.LIB]) || 0, currency),
            [JarType.ALP]: convertToBase(parseFloat(manualDist[JarType.ALP]) || 0, currency),
            [JarType.EDU]: convertToBase(parseFloat(manualDist[JarType.EDU]) || 0, currency),
            [JarType.JUE]: convertToBase(parseFloat(manualDist[JarType.JUE]) || 0, currency),
            [JarType.DAR]: convertToBase(parseFloat(manualDist[JarType.DAR]) || 0, currency),
        };
    } else {
        // Use current configured percentages on the Base Amount
        distribution = {
            [JarType.NEC]: totalAmtInBase * (state.jars[JarType.NEC].percentage / 100),
            [JarType.LIB]: totalAmtInBase * (state.jars[JarType.LIB].percentage / 100),
            [JarType.ALP]: totalAmtInBase * (state.jars[JarType.ALP].percentage / 100),
            [JarType.EDU]: totalAmtInBase * (state.jars[JarType.EDU].percentage / 100),
            [JarType.JUE]: totalAmtInBase * (state.jars[JarType.JUE].percentage / 100),
            [JarType.DAR]: totalAmtInBase * (state.jars[JarType.DAR].percentage / 100),
        };
    }

    Object.keys(distribution).forEach((key) => {
        newJars[key as JarType].balance += distribution[key as JarType];
    });

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      description: transactionDesc || 'Ingreso',
      amount: totalAmt,
      currency: currency,
      type: 'INCOME',
      isPassive: false 
    };

    updateStateWithTransaction(newJars, newTransaction);
  };

  const handleAddExpense = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    // Convert to base to check balance
    const amtInBase = convertToBase(amt, currency);

    const newJars = { ...state.jars };
    
    if (newJars[selectedJar].balance < amtInBase) {
        if (!window.confirm("Advertencia: El saldo de este jarrón será negativo. ¿Continuar?")) return;
    }
    newJars[selectedJar].balance -= amtInBase;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      description: transactionDesc || 'Gasto',
      amount: amt,
      currency: currency,
      type: 'EXPENSE',
      jarId: selectedJar,
      isPassive: false
    };

    updateStateWithTransaction(newJars, newTransaction);
  };

  const updateStateWithTransaction = (newJars: Record<JarType, any>, newTx: Transaction) => {
      // Save description if new
      let newDescriptions = [...state.savedDescriptions];
      if (transactionDesc && !newDescriptions.includes(transactionDesc)) {
          newDescriptions.push(transactionDesc);
      }

      // Update Net Worth stats logic (Mockup: just adding to last month)
      const currentNetWorth = state.monthlyStats[state.monthlyStats.length - 1].netWorth;
      const netChangeBase = newTx.type === 'INCOME' ? convertToBase(newTx.amount, newTx.currency) : -convertToBase(newTx.amount, newTx.currency);
      
      const newStats = [...state.monthlyStats];
      const lastIdx = newStats.length - 1;
      newStats[lastIdx] = {
          ...newStats[lastIdx],
          netWorth: currentNetWorth + netChangeBase,
          income: newTx.type === 'INCOME' ? newStats[lastIdx].income + convertToBase(newTx.amount, newTx.currency) : newStats[lastIdx].income,
          expenses: newTx.type === 'EXPENSE' ? newStats[lastIdx].expenses + convertToBase(newTx.amount, newTx.currency) : newStats[lastIdx].expenses
      };

      setState(prev => ({
        ...prev,
        jars: newJars,
        transactions: [newTx, ...prev.transactions],
        monthlyStats: newStats,
        savedDescriptions: newDescriptions
      }));
      
      resetForm();
      setActiveTab('dashboard');
  };

  const resetForm = () => {
    setAmount('');
    setTransactionDesc('');
    setCurrency(state.baseCurrency);
    setManualDist({
      [JarType.NEC]: '', [JarType.LIB]: '', [JarType.ALP]: '',
      [JarType.EDU]: '', [JarType.JUE]: '', [JarType.DAR]: ''
    });
  };

  // --- ASSET / LIABILITY LOGIC ---
  const handleSaveAsset = () => {
      if(!newItemName || !newItemValue) return;
      const newAsset: Asset = {
          id: Date.now().toString(),
          name: newItemName,
          value: parseFloat(newItemValue),
          currency: newItemCurrency,
          monthlyCashflow: parseFloat(newItemCashflow) || 0,
          type: (newItemType as any) || 'Paper'
      };
      setState(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
      setShowAssetModal(false);
      resetItemForm();
  };

  const handleSaveLiability = () => {
      if(!newItemName || !newItemValue) return;
      const newLiab: Liability = {
          id: Date.now().toString(),
          name: newItemName,
          totalOwed: parseFloat(newItemValue),
          currency: newItemCurrency,
          monthlyPayment: parseFloat(newItemCashflow) || 0,
          interestRate: parseFloat(newItemInterest) || 0,
          type: (newItemType as any) || 'Loan'
      };
      setState(prev => ({ ...prev, liabilities: [...prev.liabilities, newLiab] }));
      setShowLiabilityModal(false);
      resetItemForm();
  };
  
  const handleUpdateLiability = (updated: Liability) => {
      setState(prev => ({
          ...prev,
          liabilities: prev.liabilities.map(l => l.id === updated.id ? updated : l)
      }));
  };

  const saveGlobalConfig = () => {
      const usdRate = parseFloat(tempUSDRate);
      const eurRate = parseFloat(tempEURRate);
      
      if(usdRate > 0 && eurRate > 0) {
          // If we are changing the base currency, we might want to adjust Jar Balances strictly speaking,
          // but for this MVP we assume Jar Balances are stored as "units of value" that get rendered.
          // However, since we stored balances as numbers without currency ref, they are implicitly in Base Currency.
          // Ideally, we would convert the stored balances to the NEW Base Currency.
          
          let newJars = { ...state.jars };
          if (tempBaseCurrency !== state.baseCurrency) {
              // Convert jar balances from OLD Base to NEW Base
              // 1. Old Base -> Anchor (COP) -> New Base
              const convertBalance = (val: number) => {
                  let valInAnchor = val;
                  if (state.baseCurrency !== 'COP') {
                      valInAnchor = val * (state.exchangeRates[state.baseCurrency] || 1);
                  }
                  if (tempBaseCurrency === 'COP') return valInAnchor;
                  // Anchor -> New Base (e.g. COP -> USD, divide by 4000)
                  const rate = tempBaseCurrency === 'USD' ? usdRate : eurRate;
                  return valInAnchor / rate;
              };

              (Object.keys(newJars) as JarType[]).forEach(k => {
                  newJars[k].balance = convertBalance(newJars[k].balance);
              });
          }

          setState(prev => ({
              ...prev,
              baseCurrency: tempBaseCurrency,
              jars: newJars,
              exchangeRates: { 
                  ...prev.exchangeRates, 
                  'USD': usdRate,
                  'EUR': eurRate
              }
          }));
          setEditingRates(false);
      }
  };

  const deleteAsset = (id: string) => {
      if(window.confirm("¿Eliminar este activo?")) {
        setState(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) }));
      }
  }

  const deleteLiability = (id: string) => {
      if(window.confirm("¿Eliminar este pasivo?")) {
        setState(prev => ({ ...prev, liabilities: prev.liabilities.filter(l => l.id !== id) }));
      }
  }
  
  const handleSaveJarConfig = (updatedJars: Record<JarType, Jar>) => {
      setState(prev => ({ ...prev, jars: updatedJars }));
  };

  const resetItemForm = () => {
      setNewItemName(''); setNewItemValue(''); setNewItemCashflow(''); setNewItemType(''); setNewItemInterest(''); setNewItemCurrency('COP');
  };

  if (isLogin) {
    // Login Screen
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="w-full max-w-md p-8 space-y-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <PieChart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Mente Maestra<br/><span className="text-emerald-400">Financiera</span></h2>
          <p className="text-slate-400">Gestiona tu riqueza familiar con los principios de los millonarios.</p>
          <div className="space-y-4 pt-4">
             <div onClick={() => setIsLogin(false)} className="group cursor-pointer p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-4">
                <img src="https://picsum.photos/200" alt="User" className="w-12 h-12 rounded-full border-2 border-emerald-500" />
                <div className="text-left">
                  <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">Familia Rodríguez</h3>
                  <p className="text-xs text-slate-500">Último acceso: Hoy</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 w-full z-40 md:w-64 md:h-screen md:top-0 md:left-0 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex md:flex-col justify-around md:justify-start md:p-6 shadow-2xl">
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
           <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
             <PieChart className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold text-lg text-white">Mente Maestra</span>
        </div>

        <button onClick={() => setActiveTab('dashboard')} className={`p-4 md:px-4 md:py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <LayoutDashboard className="w-6 h-6" /> <span className="hidden md:inline font-medium">Panel Principal</span>
        </button>

        <button onClick={() => setActiveTab('add')} className={`p-4 md:px-4 md:py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'add' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <Wallet className="w-6 h-6" /> <span className="hidden md:inline font-medium">Transacciones</span>
        </button>
        
        <button onClick={() => setActiveTab('debt')} className={`p-4 md:px-4 md:py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'debt' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <Calculator className="w-6 h-6" /> <span className="hidden md:inline font-medium">Gestión Deuda</span>
        </button>

        <div className="hidden md:block mt-auto">
          {/* Exchange Rate / Global Config Widget */}
          <div className="mb-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-bold"><Globe className="w-3 h-3" /> CONFIG. MONEDA</span>
                  <button onClick={() => setEditingRates(!editingRates)} className="text-xs text-indigo-400 hover:text-indigo-300">
                      {editingRates ? <X className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                  </button>
              </div>
              
              {editingRates ? (
                  <div className="space-y-3 animate-in fade-in">
                      <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Moneda Principal</label>
                          <select 
                            value={tempBaseCurrency}
                            onChange={(e) => setTempBaseCurrency(e.target.value as CurrencyCode)}
                            className="w-full bg-slate-800 rounded border border-slate-600 px-2 py-1 text-xs text-white"
                          >
                            <option value="COP">COP (Peso Col)</option>
                            <option value="USD">USD (Dólar)</option>
                            <option value="EUR">EUR (Euro)</option>
                          </select>
                      </div>
                      
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                          <p className="text-[10px] text-slate-500 mb-1 text-center">Tasas Ref. (Base COP)</p>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-400 w-8">USD</span>
                            <input 
                                type="number" 
                                value={tempUSDRate} 
                                onChange={(e) => setTempUSDRate(e.target.value)} 
                                className="w-16 bg-slate-800 rounded border border-slate-600 px-1 text-xs text-right"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 w-8">EUR</span>
                            <input 
                                type="number" 
                                value={tempEURRate} 
                                onChange={(e) => setTempEURRate(e.target.value)} 
                                className="w-16 bg-slate-800 rounded border border-slate-600 px-1 text-xs text-right"
                            />
                          </div>
                      </div>

                      <button onClick={saveGlobalConfig} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded py-1 text-xs font-bold flex items-center justify-center gap-1">
                          <Check className="w-3 h-3" /> Guardar
                      </button>
                  </div>
              ) : (
                  <div className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-xs text-slate-400">Principal</span>
                         <span className="text-sm font-bold text-emerald-400">{state.baseCurrency}</span>
                      </div>
                      <div className="h-px bg-slate-800"></div>
                      <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">TRM USD</span>
                          <span className="text-slate-300 font-mono">${state.exchangeRates['USD']}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">TRM EUR</span>
                          <span className="text-slate-300 font-mono">${state.exchangeRates['EUR']}</span>
                      </div>
                  </div>
              )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 mb-4">
             <div className="flex items-center gap-3 mb-2">
               <img src={state.currentUser.avatar} className="w-8 h-8 rounded-full" />
               <div className="overflow-hidden">
                 <p className="text-sm font-semibold text-white truncate">{state.currentUser.name}</p>
                 <p className="text-xs text-slate-500">{state.currentUser.role}</p>
               </div>
             </div>
             <button onClick={() => setIsLogin(true)} className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-900 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                <LogOut className="w-3 h-3" /> Cerrar Sesión
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-6 pb-24 md:p-10 max-w-7xl mx-auto">
        
        {/* Header Mobile */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-white">Mente Maestra</h1>
          <img src={state.currentUser.avatar} className="w-8 h-8 rounded-full border border-slate-600" onClick={() => setIsLogin(true)} />
        </div>

        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Resumen Financiero</h1>
                  <p className="text-slate-400">"Tus ingresos solo pueden crecer hasta donde crezcas tú."</p>
                </div>
                
                {/* Cashflow Indicator */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 hidden sm:block min-w-[200px]">
                    <p className="text-xs text-slate-400 mb-1">Flujo de Caja ({state.baseCurrency})</p>
                    <div className={`text-2xl font-bold font-mono ${cashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {cashflow >= 0 ? '+' : ''}${cashflow.toLocaleString()}
                    </div>
                </div>
            </div>

            <FinancialCharts jars={state.jars} stats={state.monthlyStats} expensesByJar={expensesByJar} incomeByJar={incomeByJar} />

            <BalanceSheet 
                assets={state.assets} 
                liabilities={state.liabilities}
                baseCurrency={state.baseCurrency}
                exchangeRates={state.exchangeRates}
                onAddAsset={() => { setShowAssetModal(true); setNewItemType('Stock'); }}
                onAddLiability={() => { setShowLiabilityModal(true); setNewItemType('CreditCard'); }}
                onDeleteAsset={deleteAsset}
                onDeleteLiability={deleteLiability}
            />
            
            <JarsDisplay 
              jars={state.jars} 
              onConfig={() => setShowJarConfigModal(true)} 
              onJarClick={(jar) => setSelectedJarDetail(jar)} 
            />

          </div>
        )}
        
        {activeTab === 'debt' && (
             <div className="animate-in fade-in duration-500">
                <h1 className="text-3xl font-bold text-white mb-6">Salir de la "Carrera de la Rata"</h1>
                <DebtManager 
                    liabilities={state.liabilities} 
                    onUpdateLiability={handleUpdateLiability}
                    onDeleteLiability={deleteLiability}
                />
             </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-300">
             
             {/* Type Toggle */}
             <div className="flex bg-slate-800 p-1 rounded-2xl mb-6">
                 <button 
                    onClick={() => {setTransactionType('INCOME'); resetForm();}}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${transactionType === 'INCOME' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                 >
                    <TrendingUp className="w-5 h-5" /> Ingreso
                 </button>
                 <button 
                    onClick={() => {setTransactionType('EXPENSE'); resetForm();}}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${transactionType === 'EXPENSE' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                 >
                    <TrendingDown className="w-5 h-5" /> Gasto
                 </button>
             </div>

             <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  {transactionType === 'INCOME' ? (
                      <>
                        <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg"><PlusCircle className="w-6 h-6" /></div>
                        Registrar Ingreso
                      </>
                  ) : (
                      <>
                        <div className="p-2 bg-rose-500/20 text-rose-500 rounded-lg"><TrendingDown className="w-6 h-6" /></div>
                        Registrar Gasto
                      </>
                  )}
                </h2>
                
                <div className="space-y-6">
                  {/* Common Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Monto</label>
                        <div className="flex">
                            <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={`w-full bg-slate-900 border border-slate-600 rounded-l-xl p-4 text-2xl font-bold text-white outline-none transition-all ${transactionType === 'INCOME' ? 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' : 'focus:border-rose-500 focus:ring-1 focus:ring-rose-500'}`}
                            placeholder="0.00"
                            />
                            <select 
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                                className="bg-slate-800 border border-slate-600 border-l-0 rounded-r-xl px-4 text-white font-bold outline-none focus:border-indigo-500"
                            >
                                <option value="COP">COP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Descripción</label>
                        {/* Smart Input using Datalist */}
                        <input 
                          list="descriptions-list"
                          type="text" 
                          value={transactionDesc}
                          onChange={(e) => setTransactionDesc(e.target.value)}
                          className={`w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white outline-none ${transactionType === 'INCOME' ? 'focus:border-emerald-500' : 'focus:border-rose-500'}`}
                          placeholder={transactionType === 'INCOME' ? "Ej. Salario, Renta..." : "Ej. Comida, Cine..."}
                        />
                        <datalist id="descriptions-list">
                            {state.savedDescriptions.map((desc, idx) => (
                                <option key={idx} value={desc} />
                            ))}
                        </datalist>
                      </div>
                  </div>

                  {/* INCOME: Manual Distribution Logic */}
                  {transactionType === 'INCOME' && (
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm font-semibold text-slate-300">Distribución de Ingresos</p>
                            <label className="flex items-center cursor-pointer gap-2">
                                <span className="text-xs text-slate-500">{isManualDistribution ? 'Manual (Avanzado)' : 'Automática (6 Jarrones)'}</span>
                                <div className="relative">
                                    <input type="checkbox" checked={isManualDistribution} onChange={() => setIsManualDistribution(!isManualDistribution)} className="sr-only" />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${isManualDistribution ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isManualDistribution ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                        
                        {currency !== state.baseCurrency && (
                            <div className="text-xs text-indigo-400 mb-3 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Se convertirá a {state.baseCurrency} al guardar.
                            </div>
                        )}

                        {!isManualDistribution ? (
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                <div className="flex justify-between p-2 bg-blue-900/20 rounded border border-blue-900/30 text-blue-300"><span>{state.jars[JarType.NEC].name} ({state.jars[JarType.NEC].percentage}%)</span><span>${amount ? (parseFloat(amount)*(state.jars[JarType.NEC].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-emerald-900/20 rounded border border-emerald-900/30 text-emerald-400 font-bold"><span>{state.jars[JarType.LIB].name} ({state.jars[JarType.LIB].percentage}%)</span><span>${amount ? (parseFloat(amount)*(state.jars[JarType.LIB].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-cyan-900/20 rounded border border-cyan-900/30 text-cyan-400"><span>{state.jars[JarType.ALP].name} ({state.jars[JarType.ALP].percentage}%)</span><span>${amount ? (parseFloat(amount)*(state.jars[JarType.ALP].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-violet-900/20 rounded border border-violet-900/30 text-violet-400"><span>{state.jars[JarType.EDU].name} ({state.jars[JarType.EDU].percentage}%)</span><span>${amount ? (parseFloat(amount)*(state.jars[JarType.EDU].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-pink-900/20 rounded border border-pink-900/30 text-pink-400"><span>{state.jars[JarType.JUE].name} ({state.jars[JarType.JUE].percentage}%)</span><span>${amount ? (parseFloat(amount)*(state.jars[JarType.JUE].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-amber-900/20 rounded border border-amber-900/30 text-amber-400"><span>{state.jars[JarType.DAR].name} ({state.jars[JarType.DAR].percentage}%)</span><span>${amount ? (parseFloat(amount)*(state.jars[JarType.DAR].percentage/100)).toFixed(2) : 0}</span></div>
                            </div>
                        ) : (
                            <div className="space-y-3 animate-in fade-in">
                                <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 mb-1 px-1">
                                    <div className="col-span-6">Jarrón</div>
                                    <div className="col-span-3 text-center">Valor ($)</div>
                                    <div className="col-span-3 text-center">%</div>
                                </div>
                                {(Object.values(state.jars) as Jar[]).map((jar) => (
                                    <div key={jar.id} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-6 flex items-center gap-2">
                                            <div className={`w-1.5 h-6 rounded-full ${jar.color}`}></div>
                                            <span className="text-sm text-slate-300 truncate">{jar.name}</span>
                                        </div>
                                        <div className="col-span-3">
                                            <input 
                                                type="number"
                                                placeholder="0"
                                                value={manualDist[jar.id]}
                                                onChange={(e) => handleManualValueChange(jar.id, e.target.value)}
                                                className="w-full bg-slate-800 border-b border-slate-600 focus:border-emerald-500 outline-none text-sm py-1 text-center"
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <input 
                                                type="number"
                                                placeholder="0"
                                                value={getManualPercent(jar.id)}
                                                onChange={(e) => handleManualPercentChange(jar.id, e.target.value)}
                                                className="w-full bg-slate-800 border-b border-slate-600 focus:border-emerald-500 outline-none text-sm py-1 text-center pr-3"
                                            />
                                            <span className="absolute right-0 top-1.5 text-xs text-slate-500">%</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-slate-700 flex justify-between text-sm mt-2">
                                    <span className="text-slate-400">Total Distribuido:</span>
                                    <span className={(Object.values(manualDist) as string[]).reduce((a,b)=>a+(parseFloat(b)||0),0).toFixed(2) === parseFloat(amount || '0').toFixed(2) ? "text-emerald-400" : "text-rose-400"}>
                                        ${(Object.values(manualDist) as string[]).reduce((a,b)=>a+(parseFloat(b)||0),0).toFixed(2)} / ${parseFloat(amount || '0').toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                  )}

                  {/* EXPENSE: Jar Selection */}
                  {transactionType === 'EXPENSE' && (
                       <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                           <label className="block text-sm font-medium text-slate-400 mb-3">¿De qué Jarrón sale el dinero?</label>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                               {(Object.values(state.jars) as Jar[]).map((jar) => (
                                   <div 
                                    key={jar.id}
                                    onClick={() => setSelectedJar(jar.id)}
                                    className={`cursor-pointer p-3 rounded-xl border transition-all ${selectedJar === jar.id ? `bg-slate-800 border-rose-500 shadow-lg shadow-rose-900/20` : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
                                   >
                                       <div className="flex items-center justify-between mb-1">
                                           <div className={`w-3 h-3 rounded-full ${jar.color}`}></div>
                                           {selectedJar === jar.id && <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>}
                                       </div>
                                       <p className={`font-semibold text-sm ${selectedJar === jar.id ? 'text-white' : 'text-slate-400'}`}>{jar.name}</p>
                                       <p className="text-xs text-slate-500 font-mono mt-1">Disp: ${jar.balance.toLocaleString()}</p>
                                   </div>
                               ))}
                           </div>
                           
                           {currency !== state.baseCurrency && (
                            <div className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Conversión aprox: {convertToBase(parseFloat(amount||'0'), currency).toLocaleString()} {state.baseCurrency}
                            </div>
                           )}

                           {state.jars[selectedJar].balance < convertToBase(parseFloat(amount || '0'), currency) && (
                               <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm bg-rose-900/20 p-3 rounded-lg border border-rose-900/50">
                                   <AlertCircle className="w-4 h-4" />
                                   <span>¡Cuidado! Este gasto excede el saldo del jarrón.</span>
                               </div>
                           )}
                       </div>
                  )}

                  <button 
                    onClick={() => {
                        if (transactionType === 'INCOME') handleAddIncome();
                        else handleAddExpense();
                    }}
                    className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${transactionType === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'}`}
                  >
                    {transactionType === 'INCOME' ? 'Distribuir Ingreso' : 'Registrar Gasto'} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
             </div>
          </div>
        )}
      </main>

      <AICoach state={state} />

      {/* MODALS */}
      {showAssetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Nuevo Activo</h3>
                      <button onClick={() => setShowAssetModal(false)}><X className="text-slate-400 hover:text-white" /></button>
                  </div>
                  <div className="space-y-4">
                      <input className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-white" placeholder="Nombre (ej. Depto Miami)" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                      <div className="grid grid-cols-2 gap-4">
                          <input className="bg-slate-900 p-3 rounded-lg border border-slate-600 text-white" type="number" placeholder="Valor ($)" value={newItemValue} onChange={e => setNewItemValue(e.target.value)} />
                           <select 
                                className="bg-slate-900 p-3 rounded-lg border border-slate-600 text-white"
                                value={newItemCurrency}
                                onChange={(e) => setNewItemCurrency(e.target.value as CurrencyCode)}
                            >
                                <option value="COP">COP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input className="col-span-1 bg-slate-900 p-3 rounded-lg border border-slate-600 text-white" type="number" placeholder="Flujo/mes ($)" value={newItemCashflow} onChange={e => setNewItemCashflow(e.target.value)} />
                        <select className="col-span-1 w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-slate-300" value={newItemType} onChange={e => setNewItemType(e.target.value)}>
                            <option value="Stock">Acciones / Dividendos</option>
                            <option value="RealEstate">Bienes Raíces</option>
                            <option value="Business">Negocio</option>
                            <option value="Paper">Bonos / Papel</option>
                            <option value="Commodities">Oro / Materias</option>
                        </select>
                      </div>
                      <button onClick={handleSaveAsset} className="w-full bg-emerald-500 py-3 rounded-xl font-bold text-white mt-2 hover:bg-emerald-600">Guardar Activo</button>
                  </div>
              </div>
          </div>
      )}

      {showLiabilityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Nuevo Pasivo</h3>
                      <button onClick={() => setShowLiabilityModal(false)}><X className="text-slate-400 hover:text-white" /></button>
                  </div>
                  <div className="space-y-4">
                      <input className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-white" placeholder="Nombre (ej. Visa)" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                      <div className="grid grid-cols-3 gap-4">
                          <input className="col-span-2 bg-slate-900 p-3 rounded-lg border border-slate-600 text-white" type="number" placeholder="Deuda Total ($)" value={newItemValue} onChange={e => setNewItemValue(e.target.value)} />
                          <select 
                                className="col-span-1 bg-slate-900 p-3 rounded-lg border border-slate-600 text-white"
                                value={newItemCurrency}
                                onChange={(e) => setNewItemCurrency(e.target.value as CurrencyCode)}
                            >
                                <option value="COP">COP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input className="bg-slate-900 p-3 rounded-lg border border-slate-600 text-white" type="number" placeholder="Pago/mes ($)" value={newItemCashflow} onChange={e => setNewItemCashflow(e.target.value)} />
                          <input className="bg-slate-900 p-3 rounded-lg border border-slate-600 text-white" type="number" placeholder="Interés Anual (%)" value={newItemInterest} onChange={e => setNewItemInterest(e.target.value)} />
                      </div>
                      <select className="bg-slate-900 p-3 rounded-lg border border-slate-600 text-slate-300 w-full" value={newItemType} onChange={e => setNewItemType(e.target.value)}>
                            <option value="CreditCard">Tarjeta Crédito</option>
                            <option value="Loan">Préstamo</option>
                            <option value="Mortgage">Hipoteca</option>
                            <option value="Car">Auto</option>
                      </select>
                      <button onClick={handleSaveLiability} className="w-full bg-rose-500 py-3 rounded-xl font-bold text-white mt-2 hover:bg-rose-600">Guardar Pasivo</button>
                  </div>
              </div>
          </div>
      )}

      <JarConfigModal 
        jars={state.jars}
        isOpen={showJarConfigModal}
        onClose={() => setShowJarConfigModal(false)}
        onSave={handleSaveJarConfig}
      />
      
      <JarDetailModal 
        jar={selectedJarDetail}
        transactions={state.transactions}
        isOpen={!!selectedJarDetail}
        onClose={() => setSelectedJarDetail(null)}
      />

    </div>
  );
};

export default App;
