import OpenAI from "openai";

async function get_gpt_response(token: string, master_pseudo, text: string, prompt: string) {
  const openai = new OpenAI({
    apiKey: token, // defaults to process.env["OPENAI_API_KEY"]
  });
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt +  
          text,
      },
    ],
    model: "gpt-4o",
    response_format: { type: "json_object" },
  });

  return chatCompletion.choices[0].message.content;
}

export default get_gpt_response;
