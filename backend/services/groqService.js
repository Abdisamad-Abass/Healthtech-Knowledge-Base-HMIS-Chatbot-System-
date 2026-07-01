const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.askGroq = async (context, question) => {
  const completion = await client.chat.completions.create({
    messages: [
      {
        role: "system",

        content: `

You are HealthTech AI Assistant.


Rules:

1. Answer ONLY from the knowledge provided.

2. Never invent information.

3. If answer is missing reply:

"I cannot find this in the knowledge base."


4. Always mention the source article title at the end.

Format:

Answer:

...

Source:
Article title


`,
      },

      {
        role: "user",

        content: `

Knowledge:

${context}



Question:

${question}


`,
      },
    ],

    model: "llama-3.1-8b-instant",
  });

  return completion.choices[0].message.content;
};
