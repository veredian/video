import { GoogleGenAI } from "https://aistudiocdn.com/@google/genai@^1.25.0";

const aiResult = document.getElementById("aiResult");
const analyzeButton = document.getElementById("analyzeButton");
const fileInput = document.getElementById("fileInput");

if (!process.env.API_KEY) {
  aiResult.innerHTML = "<strong>Error:</strong> API key is missing. AI features are disabled.";
  if (analyzeButton) {
    analyzeButton.disabled = true;
    analyzeButton.textContent = "API Key Missing";
  }
} else {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const blobToBase64 = (blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          // remove the data:mime/type;base64, part
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    const analyzeFile = async () => {
      const file = fileInput.files[0];

      if (!file) {
        alert("Please select a file first.");
        return;
      }

      // Switch tab and show loading
      window.show('analyze');
      aiResult.innerHTML = "🧠 Analyzing... please wait.";
      analyzeButton.disabled = true;
      analyzeButton.textContent = "Analyzing...";

      try {
        const base64Data = await blobToBase64(file);
        const mediaPart = {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        };

        const textPart = {
          text: "Analyze this file in detail. Provide a comprehensive summary of its content. If it's an image, describe what you see. If it's a video or audio, summarize its contents. If it's a document, summarize the text.",
        };

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [mediaPart, textPart] },
        });

        aiResult.textContent = response.text;
      } catch (error) {
        console.error("AI Analysis Error:", error);
        aiResult.textContent = `Error during analysis: ${error.message}`;
      } finally {
        analyzeButton.disabled = false;
        analyzeButton.textContent = "🔍 Analyze with AI";
      }
    };

    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyzeFile);
    }
}