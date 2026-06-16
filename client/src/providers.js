// Known providers get hand-picked colors. Because admins can add new providers
// at runtime, anything unknown gets a stable color derived from its name.
const KNOWN = {
  OpenAI: "#0E8C6B",
  Anthropic: "#CC785C",
  Google: "#3B7DED",
  xAI: "#5B5B66",
  Meta: "#2D6FF7",
  DeepSeek: "#5B6CFF",
  Alibaba: "#9B59B6",
  "Mistral AI": "#FF6B4A",
  Moonshot: "#159C9C",
  "Z.ai": "#3FA34D",
};

export function colorFor(provider) {
  if (KNOWN[provider]) return KNOWN[provider];
  let hash = 0;
  for (let i = 0; i < provider.length; i++) {
    hash = (hash * 31 + provider.charCodeAt(i)) % 360;
  }
  return `hsl(${hash} 52% 48%)`;
}
