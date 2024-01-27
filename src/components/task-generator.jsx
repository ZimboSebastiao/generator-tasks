// Importar os módulos necessários
import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { Select, SelectItem } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Spinner } from "@nextui-org/react";
import { Input } from "@nextui-org/react";

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
              Authorization:
                "Bearer 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",
            };

            const conversation = [
              { role: "system", content: "You are a creative assistant." },
              {
                role: "user",
                content: generateUserContent(currentForm),
              },
            ];

            const response = await axios.post(
              url,
              {
                model: "gpt-3.5-turbo",
                messages: conversation,
              },
              { headers }
            );

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
    if (task === "Task" || task === "Melhoria") {
      userContent = `Cria uma tarefa de ${task}, para o ${type}:\n\ninformações da tarefa: \n${info} descrevendo as seguintes informações como subtítulo: Titulo da tarefa, Descrição do Problema, Critério de Aceitação, Notas Adicionais. O titulo da tarefa deve ser montada seguindo este critério (${team} - [${type}] + o titulo sobre a tarefa, faça títulos criativos).`;
    } else if (task === "Bug") {
      userContent = `Cria uma tarefa de ${task}, para o ${type}:\n\ninformações da tarefa: \n${info}  descrevendo as seguintes informações como subtítulo: Titulo da tarefa, Descrição do Problema, Cenário de Reprodução, Critério de Aceitação, Notas Adicionais. O titulo da tarefa deve ser montada seguindo este critério (${team} - [${type}] + o titulo sobre a tarefa, faça títulos criativos).`;
    } else if (task === "Test") {
      userContent = `Cria uma tarefa de ${task}, para o ${type}:\n\ninformações da tarefa: \n${info}  descrevendo as seguintes informações como subtítulo: Titulo da tarefa, Objetivo, Passos Realizados, Resultados Observados, Critério de Aceitação, Notas Adicionais. O titulo da tarefa deve ser montada seguindo este critério (Caso de Teste - ${team} - [${type}] - Testar).`;
    }
    return userContent;
  };

  const formatResponse = (generatedText) => {
    // Dividir o texto gerado em seções com base nos subtítulos
    const sections = generatedText.split(
      /\b(Titulo da tarefa|Descrição do Problema|Objetivo|Cenário de Reprodução|Passos Realizados|Resultados Observados|Critério de Aceitação|Notas Adicionais)\b/g
    );

    // Filtrar para remover strings vazias resultantes da divisão
    const filteredSections = sections.filter(
      (section) => section.trim() !== ""
    );

    // Mapear as seções formatadas para JSX
    const formattedSections = filteredSections.map((section, index) => {
      if (index % 2 === 0) {
        // Se índice é par, e o subtítulo é "Titulo da Tarefa", então é um h2
        if (section.trim() === "Titulo da tarefa") {
          return <h2 key={index}>{section.trim()}</h2>;
        } else {
          // Para outros subtítulos, renderize como p
          return <p key={index}>{section.trim()}</p>;
        }
      } else {
        // Se índice é ímpar, então é um parágrafo
        return <h3 key={index}>{section.trim()}</h3>;
      }
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

  // Função para excluir um formulário
  const deleteForm = (index) => {
    const updatedForms = [...forms];
    updatedForms.splice(index, 1);
    setForms(updatedForms);
    setAddButtonDisabled(false);
  };

  // Função para excluir todos os formulários, exceto o primeiro
  const deleteAllFormsExceptFirst = () => {
    if (forms.length > 1) {
      setForms([forms[0]]);
      setAddButtonDisabled(false);
    }
  };

  return (
    <>
      <StyledTask>
        <div className="limitador">
          <h1>Gerador de Tarefa</h1>
          <span>
            Utilize este sistema para criar uma tarefa usando o OpenAI como
            inteligência artificial que irá gerar respostas criativas e
            extensas.
          </span>
          <div>
            <Button
              color="primary"
              type="button"
              onClick={duplicateForm}
              isDisabled={isAddButtonDisabled}
            >
              Adicionar Formulário
            </Button>
            <Button
              color="danger"
              type="button"
              onClick={deleteAllFormsExceptFirst}
            >
              Excluir formulário
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

                  <Input
                    id={`info-${index}`}
                    value={form.info}
                    variant="faded"
                    type="email"
                    label="Descrição"
                    onChange={(e) => {
                      const updatedForms = [...forms];
                      updatedForms[index].info = e.target.value;
                      setForms(updatedForms);
                    }}
                    className="max-w-xs max-w-[560px]"
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

                {index !== forms.length - 1 && (
                  <div className="form-group">
                    <Button
                      color="error"
                      type="button"
                      onClick={() => deleteForm(index)}
                    >
                      Excluir Formulário
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
              <h2 className="resp-p">Respostas Globais</h2>
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
    color: #262626;
    background-color: #f3eeee;
    padding: 1rem;
    box-shadow: var(--sombra-box);
    border-radius: var(--borda-arredondada);
  }
  h2::before,
  h2::after {
    content: " 📝 ";
  }

  div h3:first-child {
    font-weight: bold;
    font-size: 1.7rem;
    color: #1f1f9a;
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
`;

export default TaskGene;
