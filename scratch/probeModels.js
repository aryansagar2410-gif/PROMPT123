import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const models = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

for (const model of models) {
  try {
    console.log('Testing model:', model);
    const res = await ai.models.generateContent({
      model,
      contents: 'Reply strictly with: {"pong": true}',
      config: { responseMimeType: 'application/json' },
    });
    console.log('✅ SUCCESS with model:', model);
    console.log('Response:', res.text);
    break;
  } catch (err) {
    console.log('❌ Failed with model:', model, '->', err.message);
  }
}

