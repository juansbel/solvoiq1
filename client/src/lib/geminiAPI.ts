const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || "default_key";

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export async function callGeminiAPI(
  prompt: string,
  schema?: object,
  model: string = "gemini-2.0-flash"
): Promise<string> {
  try {
    const requestBody: any = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    if (schema) {
      requestBody.generationConfig = {
        response_mime_type: "application/json"
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response generated from Gemini API');
    }

    return text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

export async function rewriteEmail(draftEmail: string, context: string): Promise<string> {
  const prompt = `You are a professional email assistant. Please rewrite the following draft email to make it more professional, clear, and polished while maintaining the original intent and key information.

Context: ${context}

Draft Email: ${draftEmail}

Please provide a rewritten version that is professional, well-structured, and appropriate for business communication.`;

  return callGeminiAPI(prompt);
}

export async function generateFollowup(notes: string, context: string): Promise<string> {
  const prompt = `You are a professional communication assistant. Generate a contextually relevant follow-up email based on the provided information.

Context: ${context}

Specific Notes/Points to Include: ${notes}

Please generate a professional follow-up email that includes the specified points and maintains a professional tone appropriate for client communication.`;

  return callGeminiAPI(prompt);
}

export async function analyzeEmail(emailContent: string, context: string): Promise<string> {
  const prompt = `You are a business communication analyst. Analyze the following client email and provide insights and actionable next steps.

Context: ${context}

Client Email: ${emailContent}

Please provide:
1. Key insights about the client's concerns, urgency level, and sentiment
2. Recommended next steps with specific actions
3. Priority level for response
4. Any potential risks or opportunities identified

Format your response as a structured analysis with clear sections.`;

  return callGeminiAPI(prompt);
}

export async function generateTasks(context: string, suggestions?: string): Promise<any[]> {
  const prompt = `Generate actionable tasks based on the provided context and suggestions. Return a JSON array of tasks with the following structure:

[
  {
    "name": "Task title",
    "description": "Detailed task description",
    "suggestedDueDate": "YYYY-MM-DD"
  }
]

Context: ${context}
Suggestions: ${suggestions || 'Generate tasks from general context'}

Please provide 3-5 specific, actionable tasks.`;

  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        suggestedDueDate: { type: "string" }
      }
    }
  };

  try {
    const response = await callGeminiAPI(prompt, schema);
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse tasks JSON:', error);
    return [
      {
        name: "Follow up on generated suggestions",
        description: "Review and implement the suggestions from the analysis",
        suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];
  }
}

export async function generateEmailTemplates(context: string, suggestions: string): Promise<any[]> {
  const prompt = `Generate 2-3 email templates based on the provided context and suggestions. Return a JSON array with the following structure:

[
  {
    "title": "Template title",
    "body": "Email template content with placeholder variables in brackets like [Client Name]"
  }
]

Context: ${context}
Suggestions: ${suggestions}

Create professional email templates that can be reused for similar situations.`;

  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" }
      }
    }
  };

  try {
    const response = await callGeminiAPI(prompt, schema);
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse templates JSON:', error);
    return [
      {
        title: "Professional Follow-up",
        body: "Dear [Client Name],\n\nI hope this message finds you well. I wanted to follow up on our recent discussion and provide you with an update.\n\nBest regards,\n[Your Name]"
      }
    ];
  }
}

export async function generateReport(
  context: string, 
  highlights: string, 
  startDate: string, 
  endDate: string
): Promise<string> {
  const prompt = `Generate a comprehensive client activity report for the period ${startDate} to ${endDate}.

Context: ${context}
Key Highlights: ${highlights}

Please create a professional report with the following sections:
1. Executive Summary
2. Key Achievements
3. Performance Metrics
4. Next Steps

The report should be well-structured, professional, and suitable for client presentation.`;

  return callGeminiAPI(prompt);
}
