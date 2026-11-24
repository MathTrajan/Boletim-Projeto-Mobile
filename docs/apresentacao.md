---
title: "Boletim: Acompanhamento Acadêmico"
subtitle: "Projeto A2 de Desenvolvimento para Dispositivos Móveis"
author:
  - "Matheus Trajano"
  - "Marcos Vinícius Moreira da Silva"
  - "Diego de Jesus Modesto Silva"
date: "Centro Universitário UniGoiás · Professor Gabriel de Oliveira Silva · Entrega em 01/12/2026"
lang: pt-BR
---

## 1. Identificação

| Item | Descrição |
|---|---|
| Nome do aplicativo | Boletim |
| Disciplina | Desenvolvimento para Dispositivos Móveis |
| Professor | Gabriel de Oliveira Silva |
| Avaliação | Projeto A2, valor 5,0 |
| Data de entrega | 01/12/2026 |
| Repositório | https://github.com/MathTrajan/Boletim-Projeto-Mobile |
| Tecnologias | Ionic 9, React 19, TypeScript 5, Capacitor 8 |

## 2. Problema e proposta

Todo aluno faz duas contas de cabeça no meio do semestre: quanto precisa tirar
na próxima prova para alcançar a média, e quantas aulas ainda pode perder antes
de reprovar por falta. As duas contas são simples, mas ninguém as refaz toda
semana, e a resposta costuma chegar tarde.

O Boletim transforma essas duas contas em tela. O aluno cadastra as matérias do
semestre com a carga horária e as avaliações com o peso de cada uma. A partir
daí o aplicativo calcula sozinho a média ponderada parcial, a nota necessária
nas avaliações que ainda faltam e a situação da matéria, que considera tanto a
nota quanto a frequência.

A escolha pelo tema é deliberada: é um problema que os três integrantes têm, o
que permitiu validar as regras contra a realidade do próprio curso em vez de
inventar um cenário.

## 3. Requisitos atendidos

| Requisito do enunciado | Como foi atendido |
|---|---|
| Aplicativo híbrido com Ionic e React | Ionic 9 com React 19 e TypeScript, empacotável por Capacitor 8 |
| Entrega via GitHub | Repositório público, com README documentando arquitetura e execução |
| Grupo de até três pessoas | Três integrantes |
| Identidade visual: cores, nome, ícone e interface | Nome Boletim, paleta azul com destaque dourado, ícone de birrete desenhado para o projeto, interface Ionic com tema claro e escuro |
| Mínimo de três telas com navegação | Cinco telas, com dois padrões de navegação: barra de abas e tela de detalhe empilhada |
| Componentização | Oito componentes reutilizáveis, cada um recebendo dados exclusivamente por props |
| Persistência com @capacitor/preferences | Três chaves de armazenamento, acessadas por uma única camada de serviço |

## 4. Telas e navegação

A navegação principal é uma barra de abas com quatro destinos. A tela de detalhe
da matéria é empilhada sobre a aba Semestre, com botão de voltar, porque pertence
ao contexto dela e não é um destino independente.

| Rota | Tela | Conteúdo |
|---|---|---|
| `/semestre` | Semestre | Painel com média geral, total de matérias e quantas estão em alerta, seguido do cartão de cada disciplina |
| `/semestre/:id` | Detalhe da matéria | Média parcial, nota necessária, contador de faltas, lista de avaliações e os compromissos da matéria |
| `/agenda` | Agenda | Provas, trabalhos e apresentações ordenados por data, com contagem regressiva e destaque para atrasos |
| `/materia` e `/materia/:id` | Formulário | Cadastro de matéria. Com o parâmetro na rota, a mesma tela funciona como edição |
| `/ajustes` | Ajustes | Nome do usuário, média mínima, limite de faltas, tema, dados de exemplo e exclusão dos dados |

## 5. Componentização

Nenhum componente conhece o contexto nem acessa o armazenamento. Todos recebem
dados por props, o que permite reaproveitá-los em telas diferentes.

| Componente | Responsabilidade | Onde é usado |
|---|---|---|
| CartaoMateria | Cartão da disciplina com sigla, média, situação e faltas | Semestre |
| BarraFaltas | Barra de frequência que muda de cor conforme o limite se aproxima | Semestre e Detalhe |
| EtiquetaSituacao | Selo colorido do veredito da matéria | Semestre e Detalhe |
| ItemAvaliacao | Linha da avaliação, com arraste para editar e excluir | Detalhe |
| ItemCompromisso | Linha da agenda, com marcação de concluído e prazo | Agenda e Detalhe |
| ModalAvaliacao | Formulário de avaliação em modal, para criar e editar | Detalhe |
| EstadoVazio | Bloco de lista vazia | Quatro situações diferentes |
| AlertaConfirmacao | Confirmação antes de apagar | Quatro pontos diferentes |

## 6. Conceitos de React aplicados

| Conceito | Onde aparece |
|---|---|
| Componentes e JSX | Todos os arquivos de `src/components` e `src/pages` |
| Props | Os oito componentes recebem tudo por props, sem acesso ao estado global |
| Estado com `useState` | Filtros, busca, campos de formulário e controle dos modais |
| Efeitos com `useEffect` | Carga inicial do armazenamento, gravação automática e aplicação do tema |
| Hooks personalizados | `useBoletim`, que expõe o estado compartilhado, e `useTema`, que troca a paleta |
| Contexto com `useContext` | `BoletimProvider` entrega a mesma fonte de dados para todas as telas |
| Memoização | `useMemo` nos cálculos derivados e `useCallback` nas ações do contexto |
| Renderização reativa | Lançar uma nota atualiza na hora a média, a situação e o painel do semestre |

## 7. Persistência de dados

Todo acesso ao plugin passa por um único arquivo, `src/servicos/armazenamento.ts`,
com três chaves.

| Chave | Conteúdo |
|---|---|
| `boletim.materias` | Matérias com as avaliações aninhadas |
| `boletim.compromissos` | Agenda de provas e trabalhos |
| `boletim.configuracao` | Nome, média mínima, limite de faltas e preferência de tema |

Dois cuidados merecem destaque na defesa do projeto.

O primeiro é a validação na leitura. Os dados gravados são texto JSON, e nada
garante que estejam íntegros: uma versão anterior do aplicativo pode ter gravado
um formato diferente. A camada de serviço valida campo a campo e descarta o
registro inválido, em vez de deixar a tela quebrar.

O segundo é a trava na gravação. A gravação é disparada por efeito sempre que o
estado muda, mas só é liberada depois que a leitura inicial termina. Sem essa
trava, o primeiro render salvaria a lista vazia por cima do que já estava
gravado e apagaria tudo.

## 8. Regras de cálculo

| Regra | Fórmula |
|---|---|
| Média parcial | Média ponderada apenas das avaliações que já têm nota |
| Nota necessária | (média mínima x peso total - pontos já obtidos) / peso pendente |
| Limite de faltas | Parte inteira de (aulas do semestre x percentual permitido) |
| Reprovado por falta | Faltas acima do limite. Faltar exatamente o limite ainda aprova |
| Situação de atenção | Precisa de 7,0 ou mais nas avaliações restantes |
| Reprovado por nota | Nota necessária acima de 10, ou média final abaixo da mínima |

A regra da nota necessária merece atenção: o divisor é o peso que ainda falta,
mas o alvo é calculado sobre o peso total. Usar só o peso pendente daria um
resultado errado em matéria com avaliações de pesos diferentes.

## 9. Qualidade e testes

As regras de cálculo ficam em funções puras, fora dos componentes, e por isso
podem ser testadas sem renderizar tela. São 34 testes automatizados com Vitest,
executados com `npm test`.

Os testes cobrem o que falha em silêncio: média ponderada com avaliação ainda
pendente, nota necessária em matéria com pesos diferentes, a fronteira entre
faltar exatamente o limite e ultrapassá-lo, reprovação por falta em matéria com
nota alta, contagem de dias atravessando a virada de mês e ordenação de nomes
com acento.

O projeto também passa por verificação de tipos com TypeScript em modo estrito,
sem nenhum erro.

## 10. Como executar

Requer Node 20.19 ou mais novo.

```
git clone https://github.com/MathTrajan/Boletim-Projeto-Mobile.git
cd Boletim-Projeto-Mobile
npm install
npm run dev
```

A interface abre em http://localhost:5173.

Para avaliar sem precisar digitar nada, abra Ajustes, role até Dados salvos e
toque em Carregar dados de exemplo. Um semestre completo de demonstração é
criado, com matérias em todas as situações possíveis.

Para gerar o aplicativo Android, com o Android Studio instalado:

```
npm run build
npx cap add android
npx cap sync
npx cap open android
```

## 11. Decisões técnicas

| Decisão | Motivo |
|---|---|
| Datas circulam como texto no formato AAAA-MM-DD | Converter com `new Date` interpretaria em UTC e exibiria o dia anterior no horário de Brasília |
| Avaliação sem nota é nula, não zero | Zero entraria na média e mostraria o aluno reprovado antes de a prova acontecer |
| Reprovação por falta é verificada antes da nota | Nenhuma média salva quem perdeu a frequência |
| Avaliações aninhadas dentro da matéria | Não existe avaliação sem matéria, e assim excluir a matéria não deixa registro órfão |
| Cálculos em funções puras | Permite testar as regras acadêmicas sem renderizar tela |
| Estado centralizado em contexto | Sem isso, cada tela leria o armazenamento por conta própria e mostraria um retrato diferente dos mesmos dados |
| Campos numéricos guardados como texto no formulário | Reformatar o número a cada tecla trocaria a vírgula por ponto no meio da digitação |
| Gráficos em CSS, sem biblioteca | Uma biblioteca de gráfico somaria centenas de quilobytes ao pacote para desenhar retângulos |

## 12. Limitações conhecidas e evolução

O aplicativo guarda os dados apenas no aparelho. Trocar de celular ou
desinstalar o aplicativo significa perder o histórico, já que não existe conta
de usuário nem sincronização. Essa foi uma escolha consciente, porque o
enunciado pede persistência local, mas é a primeira limitação a tratar numa
versão seguinte.

Entre as evoluções possíveis estão a notificação local avisando na véspera de
cada prova, a exportação do boletim em PDF, o histórico de semestres anteriores
com o cálculo do coeficiente de rendimento e o suporte a avaliações
substitutivas.
