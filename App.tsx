
import React, { useState, useEffect } from 'react';
import { JarType, FinancialState, FamilyMember, Transaction, MonthlyStats, Jar, Asset, Liability, CurrencyCode, UserFinancials } from './types';
import JarsDisplay from './components/JarsDisplay';
import BalanceSheet from './components/BalanceSheet';
import FinancialCharts from './components/FinancialCharts';
import AICoach from './components/AICoach';
import DebtManager from './components/DebtManager';
import JarConfigModal from './components/JarConfigModal';
import JarDetailModal from './components/JarDetailModal';
import { PieChart, LayoutDashboard, PlusCircle, LogOut, Wallet, TrendingDown, TrendingUp, AlertCircle, ArrowRight, X, Save, Calculator, Globe, RefreshCcw, Check, Settings, Users, User, Lock } from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_JARS_ROBERTO = {
  [JarType.NEC]: { id: JarType.NEC, name: "Necesidades", description: "Gastos básicos de vida", percentage: 55, balance: 10000000, color: "bg-blue-600" },
  [JarType.LIB]: { id: JarType.LIB, name: "Libertad Financiera", description: "Inversiones", percentage: 10, balance: 48000000, color: "bg-emerald-500" },
  [JarType.ALP]: { id: JarType.ALP, name: "Ahorro Largo Plazo", description: "Futuro", percentage: 10, balance: 6000000, color: "bg-cyan-600" },
  [JarType.EDU]: { id: JarType.EDU, name: "Educación", description: "Cursos", percentage: 10, balance: 1600000, color: "bg-violet-600" },
  [JarType.JUE]: { id: JarType.JUE, name: "Juego", description: "Ocio", percentage: 10, balance: 1200000, color: "bg-pink-500" },
  [JarType.DAR]: { id: JarType.DAR, name: "Dar", description: "Caridad", percentage: 5, balance: 600000, color: "bg-amber-500" },
};

const INITIAL_JARS_MARIA = {
    [JarType.NEC]: { id: JarType.NEC, name: "Necesidades", description: "Gastos del Hogar", percentage: 55, balance: 5000000, color: "bg-blue-600" },
    [JarType.LIB]: { id: JarType.LIB, name: "Libertad Financiera", description: "Fondo de Inversión", percentage: 10, balance: 12000000, color: "bg-emerald-500" },
    [JarType.ALP]: { id: JarType.ALP, name: "Ahorro Largo Plazo", description: "Viaje Europa", percentage: 10, balance: 3000000, color: "bg-cyan-600" },
    [JarType.EDU]: { id: JarType.EDU, name: "Educación", description: "Libros", percentage: 10, balance: 800000, color: "bg-violet-600" },
    [JarType.JUE]: { id: JarType.JUE, name: "Juego", description: "Salidas", percentage: 10, balance: 400000, color: "bg-pink-500" },
    [JarType.DAR]: { id: JarType.DAR, name: "Dar", description: "Iglesia", percentage: 5, balance: 200000, color: "bg-amber-500" },
};

const USERS: FamilyMember[] = [
    { id: '1', name: 'Roberto', role: 'Admin', avatar: 'https://picsum.photos/seed/rob/200' },
    { id: '2', name: 'Maria', role: 'Admin', avatar: 'https://picsum.photos/seed/mar/200' },
];

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
  exchangeRates: { 'USD': 4000, 'EUR': 4300, 'COP': 1 },
  users: USERS,
  savedDescriptions: INITIAL_DESCRIPTIONS,
  userData: {
      '1': {
          jars: INITIAL_JARS_ROBERTO,
          assets: [
            { id: '1', ownerId: '1', name: 'Apartamento Renta', value: 600000000, currency: 'COP', monthlyCashflow: 3200000, type: 'RealEstate' },
            { id: '2', ownerId: '1', name: 'Portafolio Dividendos', value: 10000, currency: 'USD', monthlyCashflow: 40, type: 'Stock' }
          ],
          liabilities: [
            { id: '1', ownerId: '1', name: 'Hipoteca Casa', totalOwed: 480000000, currency: 'COP', monthlyPayment: 3600000, type: 'Mortgage', interestRate: 12.5 },
            { id: '2', ownerId: '1', name: 'Préstamo Auto', totalOwed: 6000, currency: 'USD', monthlyPayment: 150, type: 'Car', interestRate: 7.2 }
          ],
          transactions: [],
          monthlyStats: INITIAL_STATS
      },
      '2': {
          jars: INITIAL_JARS_MARIA,
          assets: [
              { id: '3', ownerId: '2', name: 'CDT Banco', value: 20000000, currency: 'COP', monthlyCashflow: 200000, type: 'Paper' }
          ],
          liabilities: [
              { id: '3', ownerId: '2', name: 'Tarjeta Crédito', totalOwed: 5000000, currency: 'COP', monthlyPayment: 300000, type: 'CreditCard', interestRate: 24.5 }
          ],
          transactions: [],
          monthlyStats: INITIAL_STATS.map(s => ({ ...s, income: s.income * 0.6, netWorth: s.netWorth * 0.3 })) // Mock diff stats
      }
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<FinancialState>(INITIAL_STATE);
  const [currentUserId, setCurrentUserId] = useState<string>('1');
  const [viewMode, setViewMode] = useState<'INDIVIDUAL' | 'FAMILY'>('INDIVIDUAL');

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
  
  const [selectedJarDetail, setSelectedJarDetail] = useState<Jar | null>(null);
  
  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState(''); 
  const [newItemCashflow, setNewItemCashflow] = useState(''); 
  const [newItemType, setNewItemType] = useState<string>('');
  const [newItemInterest, setNewItemInterest] = useState('');
  const [newItemCurrency, setNewItemCurrency] = useState<CurrencyCode>('COP');

  const [editingRates, setEditingRates] = useState(false);
  const [tempUSDRate, setTempUSDRate] = useState(state.exchangeRates['USD'].toString());
  const [tempEURRate, setTempEURRate] = useState(state.exchangeRates['EUR'].toString());
  const [tempBaseCurrency, setTempBaseCurrency] = useState<CurrencyCode>(state.baseCurrency);

  const currentUserProfile = state.users.find(u => u.id === currentUserId) || state.users[0];
  const currentUserData = state.userData[currentUserId];

  // --- HELPERS ---
  const convertToBase = (amt: number, fromCurrency: CurrencyCode): number => {
      if (fromCurrency === state.baseCurrency) return amt;
      let valInAnchor = amt;
      if (fromCurrency !== 'COP') {
          valInAnchor = amt * (state.exchangeRates[fromCurrency] || 1);
      }
      if (state.baseCurrency === 'COP') return valInAnchor;
      return valInAnchor / (state.exchangeRates[state.baseCurrency] || 1);
  };

  // --- AGGREGATION LOGIC ---
  const getDisplayedState = (): UserFinancials => {
      if (viewMode === 'INDIVIDUAL') {
          return currentUserData;
      }

      // Family Aggregation
      const jarKeys = Object.keys(currentUserData.jars) as JarType[];
      const aggregatedJars: Record<JarType, Jar> = JSON.parse(JSON.stringify(currentUserData.jars)); // Clone structure
      
      // Reset Balances
      jarKeys.forEach(key => aggregatedJars[key].balance = 0);

      const allAssets: Asset[] = [];
      const allLiabilities: Liability[] = [];
      const allTransactions: Transaction[] = [];

      Object.values(state.userData).forEach((uData: UserFinancials) => {
          // Sum Jars
          jarKeys.forEach(key => {
             aggregatedJars[key].balance += uData.jars[key].balance;
          });
          allAssets.push(...uData.assets);
          allLiabilities.push(...uData.liabilities);
          allTransactions.push(...uData.transactions);
      });

      // Stats aggregation (simplified: just taking current user stats for charts trend, but summing last net worth)
      // For a real app, we'd need to merge monthly history. 
      const aggStats = [...currentUserData.monthlyStats]; 

      return {
          jars: aggregatedJars,
          assets: allAssets,
          liabilities: allLiabilities,
          transactions: allTransactions,
          monthlyStats: aggStats
      };
  };

  const displayedData = getDisplayedState();

  // Derived Calculations for Charts
  const currentMonthTransactions = displayedData.transactions; 

  const incomeByJar = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
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

  // Actions - ALWAYS AFFECT CURRENT USER ONLY
  const handleAddIncome = () => {
    if (viewMode === 'FAMILY') return; // Safety

    const totalAmt = parseFloat(amount);
    if (!totalAmt || totalAmt <= 0) return;
    
    const totalAmtInBase = convertToBase(totalAmt, currency);

    const newJars = { ...currentUserData.jars };
    let distribution: Record<JarType, number>;

    if (isManualDistribution) {
        const manualTotal = (Object.values(manualDist) as string[]).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        if (Math.abs(manualTotal - totalAmt) > 1) { 
            alert(`La distribución no coincide con el total.`);
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
        distribution = {
            [JarType.NEC]: totalAmtInBase * (currentUserData.jars[JarType.NEC].percentage / 100),
            [JarType.LIB]: totalAmtInBase * (currentUserData.jars[JarType.LIB].percentage / 100),
            [JarType.ALP]: totalAmtInBase * (currentUserData.jars[JarType.ALP].percentage / 100),
            [JarType.EDU]: totalAmtInBase * (currentUserData.jars[JarType.EDU].percentage / 100),
            [JarType.JUE]: totalAmtInBase * (currentUserData.jars[JarType.JUE].percentage / 100),
            [JarType.DAR]: totalAmtInBase * (currentUserData.jars[JarType.DAR].percentage / 100),
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

    updateUserState(newJars, newTransaction);
  };

  const handleAddExpense = () => {
    if (viewMode === 'FAMILY') return; // Safety
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    const amtInBase = convertToBase(amt, currency);
    const newJars = { ...currentUserData.jars };
    
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

    updateUserState(newJars, newTransaction);
  };

  const updateUserState = (newJars: Record<JarType, Jar>, newTx: Transaction) => {
      let newDescriptions = [...state.savedDescriptions];
      if (transactionDesc && !newDescriptions.includes(transactionDesc)) {
          newDescriptions.push(transactionDesc);
      }

      // Update current user data
      const newStats = [...currentUserData.monthlyStats];
      const lastIdx = newStats.length - 1;
      const netChangeBase = newTx.type === 'INCOME' ? convertToBase(newTx.amount, newTx.currency) : -convertToBase(newTx.amount, newTx.currency);
      
      newStats[lastIdx] = {
          ...newStats[lastIdx],
          netWorth: newStats[lastIdx].netWorth + netChangeBase,
          income: newTx.type === 'INCOME' ? newStats[lastIdx].income + convertToBase(newTx.amount, newTx.currency) : newStats[lastIdx].income,
          expenses: newTx.type === 'EXPENSE' ? newStats[lastIdx].expenses + convertToBase(newTx.amount, newTx.currency) : newStats[lastIdx].expenses
      };

      setState(prev => ({
        ...prev,
        savedDescriptions: newDescriptions,
        userData: {
            ...prev.userData,
            [currentUserId]: {
                ...prev.userData[currentUserId],
                jars: newJars,
                transactions: [newTx, ...prev.userData[currentUserId].transactions],
                monthlyStats: newStats
            }
        }
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
      if(viewMode === 'FAMILY') return;
      if(!newItemName || !newItemValue) return;
      const newAsset: Asset = {
          id: Date.now().toString(),
          ownerId: currentUserId,
          name: newItemName,
          value: parseFloat(newItemValue),
          currency: newItemCurrency,
          monthlyCashflow: parseFloat(newItemCashflow) || 0,
          type: (newItemType as any) || 'Paper'
      };
      
      setState(prev => ({
          ...prev,
          userData: {
              ...prev.userData,
              [currentUserId]: {
                  ...prev.userData[currentUserId],
                  assets: [...prev.userData[currentUserId].assets, newAsset]
              }
          }
      }));
      setShowAssetModal(false);
      resetItemForm();
  };

  const handleSaveLiability = () => {
      if(viewMode === 'FAMILY') return;
      if(!newItemName || !newItemValue) return;
      const newLiab: Liability = {
          id: Date.now().toString(),
          ownerId: currentUserId,
          name: newItemName,
          totalOwed: parseFloat(newItemValue),
          currency: newItemCurrency,
          monthlyPayment: parseFloat(newItemCashflow) || 0,
          interestRate: parseFloat(newItemInterest) || 0,
          type: (newItemType as any) || 'Loan'
      };
      setState(prev => ({
          ...prev,
          userData: {
              ...prev.userData,
              [currentUserId]: {
                  ...prev.userData[currentUserId],
                  liabilities: [...prev.userData[currentUserId].liabilities, newLiab]
              }
          }
      }));
      setShowLiabilityModal(false);
      resetItemForm();
  };
  
  const handleUpdateLiability = (updated: Liability) => {
      if(viewMode === 'FAMILY') return;
      setState(prev => ({
          ...prev,
          userData: {
              ...prev.userData,
              [currentUserId]: {
                  ...prev.userData[currentUserId],
                  liabilities: prev.userData[currentUserId].liabilities.map(l => l.id === updated.id ? updated : l)
              }
          }
      }));
  };

  const saveGlobalConfig = () => {
      const usdRate = parseFloat(tempUSDRate);
      const eurRate = parseFloat(tempEURRate);
      
      if(usdRate > 0 && eurRate > 0) {
          setState(prev => ({
              ...prev,
              baseCurrency: tempBaseCurrency,
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
      if(viewMode === 'FAMILY') return;
      if(window.confirm("¿Eliminar este activo?")) {
        setState(prev => ({
            ...prev,
            userData: {
                ...prev.userData,
                [currentUserId]: {
                    ...prev.userData[currentUserId],
                    assets: prev.userData[currentUserId].assets.filter(a => a.id !== id)
                }
            }
        }));
      }
  }

  const deleteLiability = (id: string) => {
      if(viewMode === 'FAMILY') return;
      if(window.confirm("¿Eliminar este pasivo?")) {
        setState(prev => ({
            ...prev,
            userData: {
                ...prev.userData,
                [currentUserId]: {
                    ...prev.userData[currentUserId],
                    liabilities: prev.userData[currentUserId].liabilities.filter(l => l.id !== id)
                }
            }
        }));
      }
  }
  
  const handleSaveJarConfig = (updatedJars: Record<JarType, Jar>) => {
      if(viewMode === 'FAMILY') return;
      setState(prev => ({
          ...prev,
          userData: {
              ...prev.userData,
              [currentUserId]: {
                  ...prev.userData[currentUserId],
                  jars: updatedJars
              }
          }
      }));
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
          <p className="text-slate-400">Selecciona el perfil para ingresar.</p>
          <div className="space-y-4 pt-4">
             {state.users.map(user => (
                 <div 
                    key={user.id} 
                    onClick={() => { setCurrentUserId(user.id); setIsLogin(false); }} 
                    className="group cursor-pointer p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-4"
                 >
                    <img src={user.avatar} alt="User" className="w-12 h-12 rounded-full border-2 border-emerald-500" />
                    <div className="text-left">
                    <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">{user.name}</h3>
                    <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER ---
  const isFamily = viewMode === 'FAMILY';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* Sidebar */}
      <nav className="fixed bottom-0 w-full z-40 md:w-64 md:h-screen md:top-0 md:left-0 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex md:flex-col justify-around md:justify-start md:p-6 shadow-2xl">
        <div className="hidden md:flex items-center gap-3 mb-8 px-2">
           <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
             <PieChart className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold text-lg text-white">Mente Maestra</span>
        </div>

        {/* User Switcher Widget */}
        <div className="hidden md:block mb-6 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
             <label className="text-[10px] uppercase text-slate-500 font-bold mb-2 block tracking-wider">Perfil Activo</label>
             <div className="flex items-center gap-2 mb-3">
                 <img src={currentUserProfile.avatar} className="w-8 h-8 rounded-full border border-slate-600" />
                 <select 
                    value={currentUserId} 
                    onChange={(e) => setCurrentUserId(e.target.value)}
                    className="bg-transparent text-white font-semibold text-sm outline-none w-full"
                 >
                     {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                 </select>
             </div>
             
             {/* View Mode Toggle */}
             <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                 <button 
                    onClick={() => setViewMode('INDIVIDUAL')}
                    className={`flex-1 py-1.5 text-xs rounded transition-all flex items-center justify-center gap-1 ${!isFamily ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
                 >
                     <User className="w-3 h-3" /> Yo
                 </button>
                 <button 
                    onClick={() => setViewMode('FAMILY')}
                    className={`flex-1 py-1.5 text-xs rounded transition-all flex items-center justify-center gap-1 ${isFamily ? 'bg-purple-600 text-white shadow' : 'text-slate-400'}`}
                 >
                     <Users className="w-3 h-3" /> Familia
                 </button>
             </div>
        </div>

        <button onClick={() => setActiveTab('dashboard')} className={`p-4 md:px-4 md:py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <LayoutDashboard className="w-6 h-6" /> <span className="hidden md:inline font-medium">Panel {isFamily ? 'Familiar' : 'Principal'}</span>
        </button>

        <button 
            disabled={isFamily}
            onClick={() => setActiveTab('add')} 
            className={`p-4 md:px-4 md:py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'add' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'} ${isFamily ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isFamily ? <Lock className="w-6 h-6" /> : <Wallet className="w-6 h-6" />} 
          <span className="hidden md:inline font-medium">Transacciones</span>
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

          <button onClick={() => setIsLogin(true)} className="w-full py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
              <LogOut className="w-3 h-3" /> Salir
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-6 pb-24 md:p-10 max-w-7xl mx-auto">
        
        {/* Header Mobile */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-white">Mente Maestra</h1>
          <img src={currentUserProfile.avatar} className="w-8 h-8 rounded-full border border-slate-600" onClick={() => setIsLogin(true)} />
        </div>

        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isFamily && (
                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-full"><Users className="w-5 h-5 text-purple-400" /></div>
                    <div>
                        <h3 className="text-purple-300 font-bold text-sm">Modo Familiar Activo</h3>
                        <p className="text-xs text-purple-200/60">Viendo la suma de todos los perfiles. La edición está deshabilitada en esta vista.</p>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Resumen {isFamily ? 'Familiar' : 'Financiero'}</h1>
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

            <FinancialCharts jars={displayedData.jars} stats={displayedData.monthlyStats} expensesByJar={expensesByJar} incomeByJar={incomeByJar} />

            <BalanceSheet 
                assets={displayedData.assets} 
                liabilities={displayedData.liabilities}
                baseCurrency={state.baseCurrency}
                exchangeRates={state.exchangeRates}
                isFamilyView={isFamily}
                users={state.users}
                onAddAsset={() => { setShowAssetModal(true); setNewItemType('Stock'); }}
                onAddLiability={() => { setShowLiabilityModal(true); setNewItemType('CreditCard'); }}
                onDeleteAsset={deleteAsset}
                onDeleteLiability={deleteLiability}
            />
            
            <JarsDisplay 
              jars={displayedData.jars} 
              onConfig={() => setShowJarConfigModal(true)} 
              onJarClick={(jar) => setSelectedJarDetail(jar)} 
            />

          </div>
        )}
        
        {activeTab === 'debt' && (
             <div className="animate-in fade-in duration-500">
                <h1 className="text-3xl font-bold text-white mb-6">Salir de la "Carrera de la Rata"</h1>
                <DebtManager 
                    liabilities={displayedData.liabilities} 
                    users={state.users}
                    isFamilyView={isFamily}
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
                        Registrar Ingreso ({currentUserProfile.name})
                      </>
                  ) : (
                      <>
                        <div className="p-2 bg-rose-500/20 text-rose-500 rounded-lg"><TrendingDown className="w-6 h-6" /></div>
                        Registrar Gasto ({currentUserProfile.name})
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
                                <div className="flex justify-between p-2 bg-blue-900/20 rounded border border-blue-900/30 text-blue-300"><span>{currentUserData.jars[JarType.NEC].name} ({currentUserData.jars[JarType.NEC].percentage}%)</span><span>${amount ? (parseFloat(amount)*(currentUserData.jars[JarType.NEC].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-emerald-900/20 rounded border border-emerald-900/30 text-emerald-400 font-bold"><span>{currentUserData.jars[JarType.LIB].name} ({currentUserData.jars[JarType.LIB].percentage}%)</span><span>${amount ? (parseFloat(amount)*(currentUserData.jars[JarType.LIB].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-cyan-900/20 rounded border border-cyan-900/30 text-cyan-400"><span>{currentUserData.jars[JarType.ALP].name} ({currentUserData.jars[JarType.ALP].percentage}%)</span><span>${amount ? (parseFloat(amount)*(currentUserData.jars[JarType.ALP].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-violet-900/20 rounded border border-violet-900/30 text-violet-400"><span>{currentUserData.jars[JarType.EDU].name} ({currentUserData.jars[JarType.EDU].percentage}%)</span><span>${amount ? (parseFloat(amount)*(currentUserData.jars[JarType.EDU].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-pink-900/20 rounded border border-pink-900/30 text-pink-400"><span>{currentUserData.jars[JarType.JUE].name} ({currentUserData.jars[JarType.JUE].percentage}%)</span><span>${amount ? (parseFloat(amount)*(currentUserData.jars[JarType.JUE].percentage/100)).toFixed(2) : 0}</span></div>
                                <div className="flex justify-between p-2 bg-amber-900/20 rounded border border-amber-900/30 text-amber-400"><span>{currentUserData.jars[JarType.DAR].name} ({currentUserData.jars[JarType.DAR].percentage}%)</span><span>${amount ? (parseFloat(amount)*(currentUserData.jars[JarType.DAR].percentage/100)).toFixed(2) : 0}</span></div>
                            </div>
                        ) : (
                            <div className="space-y-3 animate-in fade-in">
                                <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 mb-1 px-1">
                                    <div className="col-span-6">Jarrón</div>
                                    <div className="col-span-3 text-center">Valor ($)</div>
                                    <div className="col-span-3 text-center">%</div>
                                </div>
                                {(Object.values(currentUserData.jars) as Jar[]).map((jar) => (
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
                               {(Object.values(currentUserData.jars) as Jar[]).map((jar) => (
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

                           {currentUserData.jars[selectedJar].balance < convertToBase(parseFloat(amount || '0'), currency) && (
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

      {/* Since AI Coach depends on state.currentUser, we update it to use the new structure or pass relevant data. 
          For now, we pass a composed object that matches the old interface expected by AICoach or update AICoach props.
          Ideally, update AICoach to accept current user data.
       */}
      <AICoach state={{ ...state, currentUser: currentUserProfile, ...currentUserData }} />

      {/* MODALS */}
      {showAssetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Nuevo Activo ({currentUserProfile.name})</h3>
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
                      <h3 className="text-xl font-bold text-white">Nuevo Pasivo ({currentUserProfile.name})</h3>
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
        jars={displayedData.jars}
        isOpen={showJarConfigModal}
        onClose={() => setShowJarConfigModal(false)}
        onSave={handleSaveJarConfig}
      />
      
      <JarDetailModal 
        jar={selectedJarDetail}
        transactions={displayedData.transactions}
        isOpen={!!selectedJarDetail}
        onClose={() => setSelectedJarDetail(null)}
      />

    </div>
  );
};

export default App;