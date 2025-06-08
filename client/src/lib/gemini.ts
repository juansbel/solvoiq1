export interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function callGeminiAPI(
  prompt: string,
  context?: string,
  schema?: any
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                 import.meta.env.GEMINI_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 "default_key";

  const fullPrompt = context 
    ? `Context: ${context}\n\nPrompt: ${prompt}` 
    : prompt;

  const requestBody: any = {
    contents: [{
      parts: [{
        text: fullPrompt
      }]
    }]
  };

  if (schema) {
    requestBody.generationConfig = {
      response_mime_type: "application/json",
      response_schema: schema
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    if (schema) {
      try {
        return JSON.parse(generatedText);
      } catch (e) {
        throw new Error('Failed to parse JSON response from Gemini API');
      }
    }
    
    return generatedText;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw new Error('Failed to generate AI content. Please try again.');
  }
}
