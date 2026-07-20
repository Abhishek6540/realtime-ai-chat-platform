import axios from "axios";

export const generateSuggestedReply = async (messageContent) => {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `Generate a brief, natural reply to this message (max 50 words): "${messageContent}". Return only the reply text, no quotes.`,
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
      }
    );

    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return null;
  }
};