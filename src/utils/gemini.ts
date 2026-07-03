import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the API only if the key exists
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function fetchFoodMacros(foodName: string, amount: string, unit: string) {
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are a nutrition expert. 
    Calculate the exact nutritional macros for ${amount} ${unit} of ${foodName}.
    
    Return the response STRICTLY as a valid JSON object with no markdown formatting, no code blocks, and no extra text. 
    The JSON must have the following keys, with numeric values only (no units like 'g' or 'kcal'):
    {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response in case the model added markdown blocks despite instructions
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }
    
    jsonStr = jsonStr.trim();
    
    const data = JSON.parse(jsonStr);
    return data;
  } catch (error) {
    console.error('Error fetching macros from Gemini:', error);
    throw error;
  }
}
