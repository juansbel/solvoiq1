import { config } from './config';

// A client for interacting with Google's Gemini API.
class AIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = config.ai.apiKey;
    // The Gemini API URL needs the key appended as a query parameter.
    this.apiUrl = `${config.ai.apiUrl}?key=${this.apiKey}`;

    if (!this.apiKey) {
      console.warn("AI service is not configured. Missing GEMINI_API_KEY.");
    }
  }

  // A generic method to rewrite a piece of text using Gemini.
  async rewriteText(text: string, prompt: string): Promise<string> {
    if (!this.apiKey) {
      return `(AI Service Offline) Original Text: ${text}`;
    }

    try {
      // Combine the prompt and text for the Gemini model.
      const fullPrompt = `${prompt}\n\n---\n\n${text}`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ "text": fullPrompt }]
          }]
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`AI API request failed with status ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      // Navigate the specific Gemini response structure.
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";

    } catch (error) {
      console.error("Error communicating with AI service:", error);
      throw new Error("Failed to get response from AI service.");
    }
  }
}

export const aiService = new AIService(); 