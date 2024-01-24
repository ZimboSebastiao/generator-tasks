// Importar os módulos necessários
import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { Select, SelectItem } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { Button } from "@nextui-org/react";

// Definir as opções para o usuário escolher
const teams = ["Hermes", "Xtend", "Apollo"];
const types = ["Back-End", "Front-End"];
const tasks = ["Task", "Bug", "Melhoria", "Test"];

// Componente TaskGene
const TaskGene = () => {
  // Definir o estado da aplicação
  const [team, setTeam] = useState("");
  const [type, setType] = useState("");
  const [task, setTask] = useState("");
  const [info, setInfo] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Definir a função para gerar a resposta da tarefa usando o ChatGPT 3.5
  const generateTask = async () => {
    try {
      if (team && type && task && info) {
        setError("");

        setLoading(true);

        // Definir o endpoint da API do OpenAI para o ChatGPT 3.5
        const url = "https://api.openai.com/v1/chat/completions";
        const headers = {
          Authorization:
            "Bearer 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",
        };

        // Criar a conversa dinamicamente com base nas informações do usuário
        const conversation = [
          { role: "system", content: "You are a creative assistant." },
          {
            role: "user",
            content: `Cria uma tarefa de ${task}, para o ${type}:\n\ninformações da tarefa: \n${info}. Crie a tarefa descrevendo as seguintes informações como subtitulo: Titulo da tarefa, Descrição do Problema, Critério de Aceitação, Notas Adicionais. O titulo da tarefa deve ser montada seguindo esste critério (${team} - [${type}] + o titulo sobre a tarefa, faça titulos criativos). `,
          },
        ];

        // Fazer a requisição para o ChatGPT 3.5 e obter a resposta
        const response = await axios.post(
          url,
          {
            model: "gpt-3.5-turbo",
            messages: conversation,
          },
          { headers }
        );

        // Extrair o texto gerado pelo modelo
        const originalConversation = response.data.choices[0].message.content;

        setResponse(originalConversation);

        setLoading(false);
      } else {
        setError("Por favor, preencha todos os campos.");
      }
    } catch (error) {
      // Mostrar o erro na tela
      setError("Erro ao gerar tarefa. Por favor, tente novamente mais tarde.");
      console.error("Erro ao gerar tarefa:", error);
      // Esconder o indicador de carregamento
      setLoading(false);
    }
  };

  return (
    <StyledTask className="limitador">
      <div className="limitador">
        <h1>Gerador de Tarefa</h1>
        <p>
          Utilize este sistema para criar uma tarefa usando o OpenAI como
          inteligência artificial que irá gerar respostas criativas e extensas.
        </p>

        <form>
          <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <Select
              id="team"
              value={team}
              label="Squad"
              placeholder="Selecione a Squad"
              className="max-w-xs"
              onChange={(e) => setTeam(e.target.value)}
            >
              {teams.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </Select>

            <Select
              id="type"
              value={type}
              label="Stack"
              placeholder="Selecione a Stack"
              className="max-w-xs"
              onChange={(e) => setType(e.target.value)}
            >
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </Select>

            <Select
              id="task"
              value={task}
              label="Categoria"
              placeholder="Selecione a Categoria"
              className="max-w-xs"
              onChange={(e) => setTask(e.target.value)}
            >
              {tasks.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="select-format">
            <Textarea
              id="info"
              value={info}
              variant="faded"
              label="Descrição"
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Escreva algumas informações sobre a tarefa que você quer criar, como o objetivo, os requisitos, os critérios de aceitação, etc."
              minRows={20}
              className="max-w-xs max-w-[540px]"
            ></Textarea>
          </div>

          <div className="form-group">
            <Button
              color="primary"
              variant="ghost"
              type="button"
              onClick={generateTask}
            >
              Gerar Resposta
            </Button>
          </div>

          {loading && <p>Carregando...</p>}
          {error && <p className="error">{error}</p>}
          {response && (
            <div className="form-resp">
              <h2 className=" resp-p">Resposta</h2>
              <div dangerouslySetInnerHTML={{ __html: response }} />
            </div>
          )}
        </form>
      </div>
    </StyledTask>
  );
};

const StyledTask = styled.section`
  width: 100%;
  background-color: var(--cor-secundaria-fundo);
  box-shadow: var(--sombra-box);
  border-radius: var(--borda-arredondada);

  h1 {
    text-align: center;
    font-weight: bold;
    font-size: 2rem;
  }

  .select-format {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 2rem;
  }

  .resp-p {
    /* background-color: blue; */
    padding: 1rem;
    font-size: 2rem;
    text-align: center;
  }
  h2::before,
  h2::after {
    content: " 📝 ";
  }
  .form-resp {
    /* background-color: red; */
    padding: 1.5rem;
  }
`;

export default TaskGene;
