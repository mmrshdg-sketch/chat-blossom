export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  generate: (prompt: string, context?: string) => Promise<string>;
  generateImage?: (prompt: string) => Promise<string>;
}

// Image keywords to detect when user wants an image
const IMAGE_KEYWORDS = [
  'image', 'photo', 'picture', 'draw', 'drawing', 'sketch', 'paint', 'painting',
  'generate image', 'create image', 'make image', 'show me', 'visualize',
  'illustration', 'art', 'artwork', 'graphic', 'design', 'logo', 'icon',
  'portrait', 'landscape', 'scene', 'render', 'photograph', 'pic', 'img'
];

export const isImageRequest = (text: string): boolean => {
  const lower = text.toLowerCase();
  return IMAGE_KEYWORDS.some(keyword => lower.includes(keyword));
};

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
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.text();
  },
  generateImage: async (prompt: string) => {
    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&nologo=true`;
  }
};

export const providers: AIProvider[] = [pollinationsAI];

export const getProvider = (): AIProvider => pollinationsAI;

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
