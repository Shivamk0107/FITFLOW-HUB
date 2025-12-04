import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const recognitionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    match: {
      type: Type.BOOLEAN,
      description: "Whether both faces belong to the same person."
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score between 0.0 and 1.0"
    }
  },
  required: ["match", "confidence"]
};

export const recognizeUser = async (
  userPhotoBase64: string,
  cameraFrameBase64: string
): Promise<{ match: boolean; confidence: number }> => {
  if (!ai) throw new Error("Gemini AI not initialized. Missing API key.");

  try {
    const prompt = `
      You are an advanced facial recognition AI.
      Determine if both images show the same person.
      Return JSON { "match": true/false, "confidence": 0.0–1.0 }.
      Be cautious — if unsure, return match:false.
    `;

    const userPhotoPart = {
      inlineData: { mimeType: "image/jpeg", data: userPhotoBase64.split(",")[1] }
    };
    const cameraFramePart = {
      inlineData: { mimeType: "image/jpeg", data: cameraFrameBase64.split(",")[1] }
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart, userPhotoPart, cameraFramePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: recognitionResponseSchema,
        temperature: 0.1
      }
    });

    const text = response.text;
    const parsed = JSON.parse(text.trim());

    if (typeof parsed.match === "boolean" && typeof parsed.confidence === "number") {
      return parsed;
    }

    throw new Error("Invalid AI response.");
  } catch (err) {
    console.error("Gemini recognition error:", err);
    throw new Error("Face recognition failed.");
  }
};
