// src/pages/api/chat.js
import axios from "axios";

// Definir a chave de API do OpenAI como uma variável de ambiente
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// Exportar uma função assíncrona que recebe o pedido do lado do cliente e retorna a resposta do lado do servidor
export default async function handler(req, res) {
  // Verificar se o pedido é do tipo GET ou POST
  if (req.method === "GET") {
    // Extrair os dados do pedido
    // ... (existing code for GET requests)
  } else if (req.method === "POST") {
    // Extrair os dados do pedido
    const { model, messages, temperature, max_tokens } = req.body;

    // Definir a URL da API do OpenAI
    const url = "https://api.openai.com/v1/chat/completions";

    // Definir o cabeçalho com a chave de API
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    // Definir o corpo com os parâmetros do modelo
    const data = {
      model,
      messages,
      temperature,
      max_tokens,
    };

    try {
      // Fazer o pedido à API do OpenAI usando o método axios.post
      const response = await axios.post(url, data, { headers });

      // Retornar a resposta com o status 200 e os dados da API do OpenAI
      res.status(200).json(response.data);
    } catch (error) {
      // Retornar a resposta com o status 500 e o erro
      res.status(500).json(error);
    }
  } else {
    // Retornar a resposta com o status 405 e uma mensagem de erro para outros métodos
    res.status(405).json({ message: "Método não permitido." });
  }
}
