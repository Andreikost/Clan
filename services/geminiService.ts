import { GoogleGenAI } from "@google/genai";
import { FinancialState, JarType, UserFinancials, FamilyMember } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Type for the data required by the AI service
export interface FinancialContext extends UserFinancials {
    currentUser: FamilyMember;
}

const SYSTEM_INSTRUCTION = `
Actúa como un experto financiero de clase mundial que combina las filosofías de dos libros legendarios: "Los Secretos de la Mente Millonaria" (T. Harv Eker) y "Padre Rico, Padre Pobre" (Robert Kiyosaki).

Tus principios clave son:
1. El sistema de los 6 jarrones: 55% Necesidades, 10% Libertad Financiera (FFA), 10% Ahorro Largo Plazo, 10% Educación, 10% Juego, 5% Dar.
2. La diferencia entre Activos (ponen dinero en tu bolsillo) y Pasivos (sacan dinero de tu bolsillo).
3. El objetivo final es salir de la "Carrera de la Rata" aumentando el Flujo de Caja (Cashflow) de los Activos para superar los Gastos Totales.
4. La mentalidad es clave. Habla con autoridad pero motivación.

Analiza los datos financieros proporcionados y da consejos breves, directos y accionables. Usa formato Markdown.
`;

export const getFinancialAdvice = async (data: FinancialContext, question?: string): Promise<string> => {
  try {
    const context = `
      Estado Financiero Actual:
      - Usuario: ${data.currentUser.name}
      - Total en Jarra Libertad Financiera: $${data.jars[JarType.LIB].balance}
      - Total Activos: $${data.assets.reduce((acc, curr) => acc + curr.value, 0)}
      - Flujo de Caja Mensual (Pasivo): $${data.assets.reduce((acc, curr) => acc + curr.monthlyCashflow, 0)}
      - Total Pasivos (Deuda): $${data.liabilities.reduce((acc, curr) => acc + curr.totalOwed, 0)}
      - Pago Mensual de Deuda: $${data.liabilities.reduce((acc, curr) => acc + curr.monthlyPayment, 0)}
    `;

    const prompt = question 
      ? `Pregunta del usuario: "${question}". \nContexto: ${context}`
      : `Analiza mi situación actual basada en el contexto y dame 3 consejos clave para mejorar mi riqueza hoy mismo. \nContexto: ${context}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "No pude generar un consejo en este momento.";
  } catch (error) {
    console.error("Error fetching financial advice:", error);
    return "Lo siento, hubo un error conectando con tu coach financiero virtual.";
  }
};