import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getActiveModels() {
  try {
    const models = await groq.models.list();
    console.log("✅ Active Models for your API Key:");
    models.data.forEach(model => console.log(`- ${model.id}`));
  } catch (error) {
    console.error("❌ Error fetching models:", error.message);
  }
}

getActiveModels();