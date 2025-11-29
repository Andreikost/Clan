
export enum JarType {
  NEC = 'NEC', // Necesidades (55%)
  LIB = 'LIB', // Libertad Financiera (10%)
  ALP = 'ALP', // Ahorro a Largo Plazo (10%)
  EDU = 'EDU', // Educación (10%)
  JUE = 'JUE', // Juego / Ocio (10%)
  DAR = 'DAR'  // Dar / Donaciones (5%)
}

export type CurrencyCode = 'COP' | 'USD' | 'EUR';

export interface Jar {
  id: JarType;
  name: string;
  description: string;
  percentage: number;
  balance: number;
  color: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  currency: CurrencyCode; // New
  monthlyCashflow: number; // Ingreso pasivo
  type: 'RealEstate' | 'Business' | 'Stock' | 'Paper' | 'Commodities';
}

export interface Liability {
  id: string;
  name: string;
  totalOwed: number;
  currency: CurrencyCode; // New
  monthlyPayment: number;
  interestRate: number; // New: Tasa de interés anual para estrategia de deuda
  type: 'Mortgage' | 'Loan' | 'CreditCard' | 'Car';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: CurrencyCode; // New
  type: 'INCOME' | 'EXPENSE';
  jarId?: JarType; // If expense, which jar it came from. If income, usually distributed.
  isPassive: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Admin' | 'Member' | 'Child';
  avatar: string;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  netWorth: number;
}

export interface FinancialState {
  baseCurrency: CurrencyCode; // New: Moneda principal para reportes
  exchangeRates: Record<string, number>; // New: ej: { USD: 4000, EUR: 4300 } (Base es COP)
  jars: Record<JarType, Jar>;
  assets: Asset[];
  liabilities: Liability[];
  transactions: Transaction[];
  currentUser: FamilyMember;
  monthlyStats: MonthlyStats[];
  savedDescriptions: string[]; 
}
