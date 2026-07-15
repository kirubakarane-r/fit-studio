import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the API only if the key exists
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function fetchFoodMacros(
  foodName: string, 
  amount: string, 
  unit: string,
  cookingDetails?: string,
  imageBase64?: string
) {
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  let prompt = `
    You are a nutrition expert. 
    Calculate the exact nutritional macros for ${amount} ${unit} of ${foodName}.
  `;

  if (cookingDetails) {
    prompt += `
      Additionally, take into account these cooking details or extra ingredients added while cooking:
      "${cookingDetails}"
      Combine the macros of the base food item (${foodName}) and these extra cooking details/ingredients.
    `;
  }

  if (imageBase64) {
    prompt += `
      An image of the product, ingredients list, or nutrition facts table is provided. Use any nutrition facts, serving size adjustments, or other information visible in the image to make the calculation of ${foodName} (and the combined dish if cooking details are provided) as accurate as possible, overriding generic estimates when appropriate.
    `;
  }

  prompt += `
    Return the response STRICTLY as a valid JSON object with no markdown formatting, no code blocks, and no extra text. 
    The JSON must have the following keys, with numeric values only (no units like 'g' or 'kcal'):
    {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number
    }
  `;

  const contents: any[] = [prompt];

  if (imageBase64) {
    const match = imageBase64.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const data = match[2];
      contents.push({
        inlineData: {
          data,
          mimeType
        }
      });
    }
  }

  try {
    const result = await model.generateContent(contents);
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
