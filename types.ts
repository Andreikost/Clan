
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
  ownerId?: string; // New: Who owns this asset
  name: string;
  value: number;
  currency: CurrencyCode;
  monthlyCashflow: number; // Ingreso pasivo
  type: 'RealEstate' | 'Business' | 'Stock' | 'Paper' | 'Commodities';
}

export interface Liability {
  id: string;
  ownerId?: string; // New: Who owns this debt
  name: string;
  totalOwed: number;
  currency: CurrencyCode;
  monthlyPayment: number;
  interestRate: number; 
  type: 'Mortgage' | 'Loan' | 'CreditCard' | 'Car';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  type: 'INCOME' | 'EXPENSE';
  jarId?: JarType; 
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

// Data specific to a single user
export interface UserFinancials {
  jars: Record<JarType, Jar>;
  assets: Asset[];
  liabilities: Liability[];
  transactions: Transaction[];
  monthlyStats: MonthlyStats[];
}

// Global Application State
export interface FinancialState {
  baseCurrency: CurrencyCode;
  exchangeRates: Record<string, number>;
  users: FamilyMember[]; // List of available users
  userData: Record<string, UserFinancials>; // Map userId -> Financial Data
  savedDescriptions: string[]; 
}
