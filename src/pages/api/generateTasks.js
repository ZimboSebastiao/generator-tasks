// Importar os módulos necessários
import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { Select, SelectItem } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Spinner } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import dotenv from "dotenv";
dotenv.config();

process.env.OPENAI_API_KEY;

// Definir as opções para o usuário escolher
const teams = ["Hermes", "Xtend", "Apollo"];
const types = ["Back-End", "Front-End"];
const tasks = ["Task", "Bug", "Melhoria", "Test"];

// Componente TaskGene
const TaskGene = () => {
  // Definir o estado da aplicação
  const [forms, setForms] = useState([
    {
      team: "",
      type: "",
      task: "",
      info: "",
      response: "",
      loading: false,
      error: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [isAddButtonDisabled, setAddButtonDisabled] = useState(false);
  // Estado para armazenar as respostas globalmente
  const [globalResponses, setGlobalResponses] = useState([]);

  // Função para verificar se todos os campos estão preenchidos
  const areAllFieldsFilled = (form) => {
    return form.team && form.type && form.task && form.info;
  };

  // Função para verificar se o botão "Gerar Resposta" deve ser desativado
  const shouldDisableGenerateButton = forms.some(
    (form) => !areAllFieldsFilled(form)
  );

  // Função para gerar a resposta da tarefa usando o ChatGPT 3.5
  const generateTasks = async () => {
    try {
      const newForms = await Promise.all(
        forms.map(async (currentForm) => {
          const { team, type, task, info } = currentForm;

          if (team && type && task && info) {
            setLoading(true);
            const url = "https://api.openai.com/v1/chat/completions";
            const headers = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            };

            const conversation = [
              { role: "system", content: "You are a creative assistant." },
              {
                role: "user",
                content: generateUserContent(currentForm),
              },
            ];

            console.log("Request URL:", url);
            console.log("Request Headers:", headers);
            console.log("Request Body:", {
              model: "gpt-3.5-turbo",
              messages: conversation,
            });

            const response = await axios.post(
              url,
              { model: "gpt-3.5-turbo", messages: conversation },
              { headers }
            );

            console.log("Response Status:", response.status);
            console.log("Response Data:", response.data);

            const generatedText = response.data.choices[0].message.content;
            const formattedSections = formatResponse(generatedText);

            return {
              ...currentForm,
              loading: false,
              response: formattedSections,
            };
          } else {
            return {
              ...currentForm,
              error: "Por favor, preencha todos os campos.",
              loading: false,
            };
          }
        })
      );

      setForms(newForms);
      setLoading(false);

      // Atualizar o estado de respostas globais
      const allResponses = newForms
        .filter((form) => form.response)
        .map((form) => form.response);

      setGlobalResponses(allResponses.flat());
    } catch (error) {
      console.error("Erro ao gerar tarefa:", error);
      const updatedForms = forms.map((form) => ({
        ...form,
        error: "Erro ao gerar tarefa. Por favor, tente novamente mais tarde.",
        loading: false,
      }));
      setForms(updatedForms);
      setLoading(false);
    }
  };

  const generateUserContent = (form) => {
    const { task, type, info, team } = form;
    let userContent = "";

    if (task === "Task") {
      userContent = `Crie uma nova ${task.toLowerCase()} para a ${type}:\n\nInformações da tarefa:\n${info}\n\nInclua os seguintes subtítulos:\n- Título da Tarefa: [Inclua um título criativo aqui]\n- Descrição do Problema\n- Critério de Aceitação\n- Notas Adicionais\n\nO título da tarefa deve seguir o critério: (${team} - [${type}] + título sobre a tarefa, faça títulos criativos).`;
    } else if (task === "Bug") {
      userContent = `Crie um novo ${task.toLowerCase()} para a ${type}:\n\nInformações da tarefa:\n${info}\n\nInclua os seguintes subtítulos:\n- Título da Tarefa: [Inclua um título criativo aqui]\n- Descrição do Problema\n- Cenário de Reprodução\n- Critério de Aceitação\n- Notas Adicionais\n\nO título da tarefa deve seguir o critério: (${team} - [${type}] + título sobre a tarefa, faça títulos criativos).`;
    } else if (task === "Test") {
      userContent = `Crie um novo ${task.toLowerCase()} para a ${type}:\n\nInformações da tarefa:\n${info}\n\nInclua os seguintes subtítulos:\n- Título da Tarefa: [Inclua um título criativo aqui]\n- Objetivo\n- Passos Realizados\n- Resultados Observados\n- Notas Adicionais\n\nO título da tarefa deve seguir o critério: (${team} - [${type}] - Testar ...).`;
    } else if (task === "Melhoria") {
      userContent = `Crie uma nova ${task.toLowerCase()} para a ${type}:\n\nInformações da tarefa:\n${info}\n\nInclua os seguintes subtítulos:\n- Título da Tarefa: [Inclua um título criativo aqui]\n- Descrição do Problema\n- Critério de Aceitação\n- Notas Adicionais\n\nO título da tarefa deve seguir o critério: (${team} - [${type}] + título sobre a tarefa, faça títulos criativos).`;
    }

    return userContent;
  };

  const formatResponse = (generatedText) => {
    // Dividir o texto gerado em seções com base nos subtítulos
    const sections = generatedText.split(
      /\b(Título da Tarefa: |Descrição do Problema|Objetivo|Cenário de Reprodução|Passos Realizados|Resultados Observados|Critério de Aceitação|Notas Adicionais)\b/g
    );

    // Filtrar para remover strings vazias resultantes da divisão
    const filteredSections = sections.filter(
      (section) => section.trim() !== ""
    );

    // Mapear as seções formatadas para JSX
    const formattedSections = filteredSections.map((section, index) => {
      const trimmedSection = section.trim();

      // Se índice é par, e o subtítulo é "Título da Tarefa", então é um h2, senão, é um h3
      const isHeading = index % 2 === 0;
      const Element = isHeading
        ? trimmedSection === "Título da Tarefa:"
          ? "h2"
          : "h3"
        : "p";

      return <Element key={index}>{trimmedSection}</Element>;
    });

    return formattedSections;
  };

  // Função para duplicar o formulário
  const duplicateForm = () => {
    if (forms.length < 2) {
      setForms([
        ...forms,
        {
          team: "",
          type: "",
          task: "",
          info: "",
          response: "",
          loading: false,
          error: "",
        },
      ]);

      // Desabilitar o botão após atingir o limite
      if (forms.length === 1) {
        setAddButtonDisabled(true);
      }
    }
  };

  // Função para limpar todos os formulários e respostas
  const clearAll = () => {
    setForms([
      {
        team: "",
        type: "",
        task: "",
        info: "",
        response: "",
        loading: false,
        error: "",
      },
    ]);

    setLoading(false);
    setAddButtonDisabled(false);
    setGlobalResponses([]);
  };

  return (
    <>
      <StyledTask>
        <div className="limitador">
          <h1>Gerador de Tarefa</h1>
          <span>
            Utilize este sistema para gerar tarefas usando o OpenAI como
            inteligência artificial que irá gerar respostas criativas e
            estruturadas.
          </span>
          <div className="formart-botao   gap-2">
            <Button
              color="primary"
              type="button"
              // endContent={<PlusIcon />}
              onClick={duplicateForm}
              isDisabled={isAddButtonDisabled}
            >
              Adicionar
            </Button>
            <Button color="warning" type="button" onClick={clearAll}>
              Limpar
              {/* <Tooltip color="danger" content="Deletar Formulário">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <DeleteIcon />
                </span>
              </Tooltip> */}
            </Button>
          </div>
          {forms.map((form, index) => (
            <React.Fragment key={index}>
              <form>
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4 select-format">
                  <Select
                    id={`team-${index}`}
                    value={form.team}
                    label="Squad"
                    placeholder="Selecione a Squad"
                    className="max-w-[200px]"
                    onChange={(e) => {
                      const updatedForms = [...forms];
                      updatedForms[index].team = e.target.value;
                      setForms(updatedForms);
                    }}
                  >
                    {teams.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    id={`type-${index}`}
                    value={form.type}
                    label="Stack"
                    placeholder="Selecione a Stack"
                    className="max-w-[200px]"
                    onChange={(e) => {
                      const updatedForms = [...forms];
                      updatedForms[index].type = e.target.value;
                      setForms(updatedForms);
                    }}
                  >
                    {types.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    id={`task-${index}`}
                    value={form.task}
                    label="Categoria"
                    placeholder="Selecione a Categoria"
                    className="max-w-[200px]"
                    onChange={(e) => {
                      const updatedForms = [...forms];
                      updatedForms[index].task = e.target.value;
                      setForms(updatedForms);
                    }}
                  >
                    {tasks.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </Select>
                  <Textarea
                    id={`info-${index}`}
                    value={form.info}
                    variant="faded"
                    label="Descrição"
                    onChange={(e) => {
                      const updatedForms = [...forms];
                      updatedForms[index].info = e.target.value;
                      setForms(updatedForms);
                    }}
                    className="max-w-xs max-w-[590px]"
                    placeholder="Escreva algumas informações sobre a tarefa que você quer criar"
                  />
                </div>

                {index === forms.length - 1 && (
                  <div className="form-group">
                    <Button
                      color="primary"
                      type="button"
                      onClick={generateTasks}
                      isDisabled={shouldDisableGenerateButton}
                    >
                      Gerar Resposta
                    </Button>
                  </div>
                )}

                {loading && (
                  <Spinner
                    label="Carregando..."
                    color="warning"
                    labelColor="warning"
                  />
                )}
              </form>
            </React.Fragment>
          ))}
          {globalResponses.length > 0 && (
            <div className="form-resp">
              {globalResponses.map((response, index) => (
                <div key={index}>{response}</div>
              ))}
            </div>
          )}
        </div>
      </StyledTask>
    </>
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
    justify-content: space-evenly;
    align-items: center;
    padding: 2rem;
  }

  .resp-p {
    padding: 1rem;
    font-size: 2rem;
    text-align: center;
  }

  .form-resp {
    padding: 1.5rem;
    margin: 1rem 0;
    color: #111010;
    background-color: #ffffff;
    padding: 1rem;
    box-shadow: var(--sombra-box);
    border-radius: var(--borda-arredondada);
  }
  /* h2::before,
  h2::after {
    content: " 📝 ";
  } */

  div h3:first-child {
    font-weight: bold;
    font-size: 1.7rem;
    color: #06130c;
  }
  .form-group {
    display: flex;
    justify-content: center;
    width: 20%;
  }

  /* .form-resp > div > p:first-child {
  
    font-size: 16px;
    color: #cf2c2c;
   
  } */

  .formart-botao {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem;
    width: 97%;
  }
`;

export default TaskGene;
