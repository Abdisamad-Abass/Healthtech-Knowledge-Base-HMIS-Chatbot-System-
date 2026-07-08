const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Ask Groq using strict Retrieval-Augmented Generation (RAG).
 * The model is NOT allowed to use external knowledge.
 */
exports.askGroq = async ({ context, question }) => {
  const start = Date.now();

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",

    temperature: 0,

    max_tokens: 700,

    messages: [
      {
        role: "system",
        content: `
You are the HealthTech Knowledge Base Assistant.

You MUST obey these rules.

=========================
RULES
=========================

1.
Answer ONLY using the supplied knowledge.

2.
Never use outside knowledge.

3.
Never guess.

4.
Never hallucinate.

5.
If the supplied knowledge does not fully answer the question, reply EXACTLY:

I couldn't find an approved knowledge base article for that question.

Please contact support.

6.
Do NOT make assumptions.

7.
Do NOT say "I think", "probably", or "maybe".

8.
If multiple articles are retrieved,
combine them ONLY if they answer the same question.

9.
If an article conflicts with another article,
say:

"The retrieved articles contain conflicting information."

10.
Always include citations.

=========================
OUTPUT FORMAT
=========================

Return ONLY valid JSON.

{
  "answer":"...",
  "citations":[
      {
          "title":"...",
          "slug":"..."
      }
  ],
  "confidence":"HIGH"
}

Confidence values:

HIGH

MEDIUM

LOW

Nothing else.
`,
      },

      {
        role: "user",
        content: `
Knowledge Base

${context}

Question

${question}
`,
      },
    ],
  });

  const responseTime = Date.now() - start;

  let parsed;

  try {
    parsed = JSON.parse(completion.choices[0].message.content);
  } catch {
    parsed = {
      answer:
        "I couldn't find an approved knowledge base article for that question.\n\nPlease contact support.",
      citations: [],
      confidence: "LOW",
    };
  }

  return {
    answer: parsed.answer,

    citations: parsed.citations || [],

    confidence: parsed.confidence || "LOW",

    responseTime,
  };
};
