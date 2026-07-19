require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents: "Hello"
    });
    for await (const chunk of responseStream) {
      console.log(chunk.text);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
