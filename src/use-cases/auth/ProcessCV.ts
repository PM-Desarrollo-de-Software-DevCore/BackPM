const { PDFParse } = require('pdf-parse');
import { OPENROUTER_API_KEY } from '../../config/env';

interface CVData {
  name: string;
  skills: string[];
  tools: string[];
  soft_skills: string[];
  experience_areas: string[];
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS = [
  "openai/gpt-oss-20b:free",          // mejor overall
  "meta-llama/llama-3.3-70b:free",   // lenguaje + estabilidad
  "qwen/qwen3-32b:free",             // parsing + multilenguaje
  "deepseek/deepseek-r1-distill:free", // razonamiento
  "openrouter/free"                  // fallback final
];

const buildMessages = (cvText: string) => [
  {
    role: 'system' as const,
    content: `You extract structured data from resumes.

STRICT RULES:
- Return ONLY valid JSON
- No explanations
- No reasoning
- No extra text
- If data is missing, return empty arrays or empty string
- Do not infer unless clearly supported

FIELD RULES:
- skills = programming languages and technical skills
- tools = software, platforms, frameworks
- soft_skills = interpersonal abilities
- experience_areas = domains explicitly mentioned`,
  },
  {
    role: 'user' as const,
    content: `Ensure the response is valid JSON. If not, fix it before responding. Extract the following fields from this resume:
- name
- skills (technical skills)
- tools
- soft_skills
- experience_areas

Return JSON with this format:
{
  "name": "",
  "skills": [],
  "tools": [],
  "soft_skills": [],
  "experience_areas": []
}

Resume: ${cvText}`,
  },
]

const isRetryableOpenRouterError = (status: number, body: string) => {
  return status === 429 || status === 500 || status === 502 || status === 503 || body.includes('no healthy upstream') || body.includes('Provider returned error')
}

const callOpenRouter = async (cvText: string) => {
  let lastError: Error | null = null

  for (const model of OPENROUTER_MODELS) {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://devcore.app',
        'X-OpenRouter-Title': 'DevCore PM',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(cvText),
      }),
    })

    if (response.ok) {
      return response.json() as Promise<any>
    }

    const errorBody = await response.text()
    lastError = new Error(`OpenRouter API error using ${model}: ${response.statusText} - ${errorBody}`)

    if (!isRetryableOpenRouterError(response.status, errorBody)) {
      throw lastError
    }
  }

  throw lastError ?? new Error('OpenRouter API error')
}

export const processCV = async (pdfBuffer: Buffer): Promise<CVData> => {
  // Extract text from PDF
  const parser = new PDFParse({ data: pdfBuffer });
  const pdfData = await parser.getText();
  const cvText = pdfData.text;

  if (!cvText || cvText.trim().length === 0) {
    throw new Error('No text found in the PDF');
  }

  // Call OpenRouter API with retry fallback if the first provider is unhealthy
  const data = await callOpenRouter(cvText)

  // Extract the response content
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenRouter API');
  }

  // Parse the JSON response
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const cvData: CVData = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!cvData.name || !Array.isArray(cvData.skills) || !Array.isArray(cvData.tools) ||
        !Array.isArray(cvData.soft_skills) || !Array.isArray(cvData.experience_areas)) {
      throw new Error('Invalid response structure from OpenRouter');
    }

    return cvData;
  } catch (error) {
    throw new Error(`Failed to parse OpenRouter response: ${error instanceof Error ? error.message : String(error)}`);
  }
};
