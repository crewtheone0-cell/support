import { GoogleGenAI, Type } from "@google/genai";
import { TicketPriority, Sentiment, AIAnalysisResult } from '../types';
import { getOrderDetails } from './mockData';

// Safe check for API key
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const analyzeComplaint = async (
  subject: string, 
  description: string, 
  orderId: string
): Promise<AIAnalysisResult> => {
  
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock analysis.");
    return {
      priority: TicketPriority.MEDIUM,
      sentiment: Sentiment.NEUTRAL,
      summary: "AI Analysis unavailable (Missing Key).",
      suggestedResponse: "Thank you for your message. A support agent will review it shortly."
    };
  }

  const orderContext = getOrderDetails(orderId);

  const prompt = `
    You are an expert customer support AI for 'kishanyadav.shop'.
    
    Task: Analyze the following customer complaint.
    
    Context - Order History: ${orderContext}
    
    Complaint Subject: ${subject}
    Complaint Description: ${description}
    
    Please provide:
    1. Priority (Low, Medium, High, Critical) based on urgency and sentiment.
    2. Sentiment (Positive, Neutral, Negative, Angry).
    3. A brief summary (max 15 words).
    4. A polite, professional, and personalized suggested response draft for the agent. Use the order context if relevant (e.g., mention specific items).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING, enum: Object.values(TicketPriority) },
            sentiment: { type: Type.STRING, enum: Object.values(Sentiment) },
            summary: { type: Type.STRING },
            suggestedResponse: { type: Type.STRING }
          },
          required: ["priority", "sentiment", "summary", "suggestedResponse"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const result = JSON.parse(text);
    return result as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      priority: TicketPriority.MEDIUM,
      sentiment: Sentiment.NEUTRAL,
      summary: "Error during AI analysis.",
      suggestedResponse: "Thank you for contacting us. We will review your request shortly."
    };
  }
};