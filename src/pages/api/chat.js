import axios from "axios";
import https from "https";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido." });
  }

  const { model, messages, temperature, max_tokens } = req.body;

  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  const data = {
    model,
    messages,
    temperature,
    max_tokens,
  };

  try {
    const response = await axios.post(url, data, {
      headers,
      timeout: 120000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    // Envie a resposta ao cliente
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Erro na solicitação à API do OpenAI:", error);

    // Em caso de erro, ainda envie uma resposta para evitar o erro "API resolved without sending a response"
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}


