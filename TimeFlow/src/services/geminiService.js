import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("mykey");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const GeminiService = {
  generateStudentRecommendations: async (tasks) => {
    if (!tasks || tasks.length === 0) return [];

    try {
      const context = tasks.map((t) => ({
        t: t.title,
        c: t.completed ? "завършена" : "незавършена",
        d: t.duration || "няма данни",
      }));

      // 1. По-строги инструкции в промпта
      const prompt = `
        Ти си AI анализатор за приложението TimeFlow. 
        ДАННИ: ${JSON.stringify(context)}.
        ЗАДАЧА: Дай 3 кратки съвета на български.
        ФОРМАТ: Върни единствено и само валиден JSON масив от низове. 
        БЕЗ уводни думи, БЕЗ обяснения, БЕЗ markdown символи като \`\`\`json.
        Пример: ["съвет 1", "съвет 2", "съвет 3"]
      `;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();

      if (responseText.includes("```")) {
        responseText = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
      }

      const start = responseText.indexOf("[");
      const end = responseText.lastIndexOf("]") + 1;

      if (start === -1 || end === 0) {
        throw new Error("Невалиден формат от AI");
      }

      const cleanJson = responseText.substring(start, end);
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Gemini Service Error:", error);

      throw error;
    }
  },
};
