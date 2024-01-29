import axios from "axios";

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

  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.post(url, data, { headers, timeout: 30000 });
      res.status(200).json(response.data);
      return;
    } catch (error) {
      console.error("Erro na solicitação à API do OpenAI:", error);
      retries++;
    }
  }

  // Se todas as retentativas falharem, envie uma resposta de erro
  res.status(500).json({ error: "Erro interno do servidor." });
}
