export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  generate: (prompt: string, context?: string) => Promise<string>;
  generateImage?: (prompt: string) => Promise<string>;
}

// Pollinations AI - Free, no auth
export const pollinationsAI: AIProvider = {
  id: 'pollinations',
  name: 'Pollinations',
  description: 'Free AI text & image generation',
  icon: '🌸',
  generate: async (prompt: string, context?: string) => {
    const fullPrompt = context 
      ? `${prompt}\n\nContext: ${context}`
      : prompt;
    
    const response = await fetch(
      `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai&seed=${Date.now()}`
    );
    return response.text();
  },
  generateImage: async (prompt: string) => {
    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&nologo=true`;
  }
};

// DeepInfra (Free tier with limits)
export const deepInfraAI: AIProvider = {
  id: 'deepinfra',
  name: 'DeepInfra',
  description: 'Meta Llama 3.1 8B - Fast & capable',
  icon: '🔮',
  generate: async (prompt: string, context?: string) => {
    const fullPrompt = context 
      ? `${prompt}\n\nContext: ${context}`
      : prompt;
    
    // Using the free demo endpoint
    const response = await fetch('https://api.deepinfra.com/v1/inference/meta-llama/Meta-Llama-3.1-8B-Instruct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: fullPrompt,
        max_new_tokens: 2048,
      }),
    });
    
    const data = await response.json();
    return data.results?.[0]?.generated_text || data.output || 'Error generating response';
  }
};

// Groq (Free tier - very fast)
export const groqAI: AIProvider = {
  id: 'groq',
  name: 'Groq (via Pollinations)',
  description: 'Ultra-fast inference via Pollinations',
  icon: '⚡',
  generate: async (prompt: string, context?: string) => {
    const fullPrompt = context 
      ? `${prompt}\n\nContext: ${context}`
      : prompt;
    
    const response = await fetch(
      `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=llama&seed=${Date.now()}`
    );
    return response.text();
  }
};

// HuggingFace Inference (Free tier)
export const huggingFaceAI: AIProvider = {
  id: 'huggingface',
  name: 'HuggingFace',
  description: 'Mistral 7B via HF Inference',
  icon: '🤗',
  generate: async (prompt: string, context?: string) => {
    const fullPrompt = context 
      ? `${prompt}\n\nContext: ${context}`
      : prompt;
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 2048,
            return_full_text: false,
          },
        }),
      }
    );
    
    const data = await response.json();
    return data[0]?.generated_text || 'Error generating response';
  }
};

export const providers: AIProvider[] = [
  pollinationsAI,
  deepInfraAI,
  groqAI,
  huggingFaceAI,
];

export const getProvider = (id: string): AIProvider => {
  return providers.find(p => p.id === id) || pollinationsAI;
};

// Code generation specific prompt
export const generateCodePrompt = (userPrompt: string, existingCode?: string): string => {
  const base = `Respond ONLY in this exact structure:
[FILES]
FILENAME: index.html
CODE: (html code here)
FILENAME: style.css
CODE: (css code here)
FILENAME: script.js
CODE: (javascript code here if needed)
[TALK] (one sentence description of what was created/changed)
[END]

Instructions: 
- Use only standard HTML/CSS/JS
- Do not use Markdown backticks or code fences
- Create beautiful, modern designs with animations
- Use CSS variables for theming
- Make it responsive`;

  if (existingCode) {
    return `${base}

Current code to modify:
${existingCode}

User request: ${userPrompt}`;
  }

  return `${base}

User request: ${userPrompt}`;
};
