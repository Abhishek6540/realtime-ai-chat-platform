import axios from "axios";

const MODEL_CANDIDATES = [
  { name: "gemini-2.0-flash", endpoint: "v1beta" },
  { name: "gemini-2.0-flash", endpoint: "v1" },
  { name: "gemini-1.5-flash", endpoint: "v1beta" },
  { name: "gemini-1.5-pro", endpoint: "v1beta" },
];

const buildFallbackReply = (messageContent) => {
  const cleaned = messageContent?.trim();
  if (!cleaned) return "Sounds good! Tell me more.";

  const lower = cleaned.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi")) return "Hi! How can I help you today?";
  if (lower.includes("thanks") || lower.includes("thank you")) return "You’re welcome! Glad to help.";
  if (lower.includes("how") || lower.includes("what")) return "That’s a great question. I’d be happy to help.";
  if (lower.includes("bye") || lower.includes("goodbye")) return "Goodbye! Take care.";

  return `That sounds interesting. I’d love to hear more about it.`;
};

export const generateSuggestedReply = async (messageContent) => {
  const prompt = `Generate a brief, natural reply to this message (max 50 words): "${messageContent}". Return only the reply text, no quotes.`;

  for (const { name, endpoint } of MODEL_CANDIDATES) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/${endpoint}/models/${name}:generateContent`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          params: {
            key: process.env.GEMINI_API_KEY,
          },
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );

      const reply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (reply) {
        return reply;
      }
    } catch (error) {
      console.warn(`Gemini model ${name} failed:`, error.message);
    }
  }

  console.warn("Gemini API unavailable; using local fallback reply");
  return buildFallbackReply(messageContent);
};