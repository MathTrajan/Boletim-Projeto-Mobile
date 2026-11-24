# Documentação do Sistema: Boletim

Documento técnico do aplicativo **Boletim**, projeto A2 da disciplina de
Desenvolvimento para Dispositivos Móveis.

---

## 1. Tecnologias utilizadas

### 1.1 Ionic Framework 9

Biblioteca de componentes de interface para aplicativos móveis. Entrega botões,
listas, modais, alertas e navegação já com a aparência nativa de cada
plataforma: no Android os componentes seguem o Material Design, no iOS seguem o
padrão da Apple, sem nenhuma linha de código condicional.

No projeto, o Ionic é responsável por toda a camada visual. Os componentes mais
relevantes:

| Componente | Onde aparece | Função |
|---|---|---|
| `IonApp` | `App.tsx` | Raiz da aplicação, define o contexto do Ionic |
| `IonTabs` / `IonTabBar` / `IonTabButton` | `App.tsx` | Barra de abas inferior com os quatro destinos |
| `IonRouterOutlet` | `App.tsx` | Área onde as telas são trocadas, com animação de transição |
| `IonPage` / `IonHeader` / `IonContent` | Todas as telas | Estrutura padrão de uma tela |
| `IonItemSliding` / `IonItemOptions` | `ItemAvaliacao`, `ItemCompromisso` | Arraste lateral revelando editar e excluir |
| `IonModal` | `ModalAvaliacao`, `Agenda` | Formulário sobreposto, com altura parcial |
| `IonAlert` | `AlertaConfirmacao` | Confirmação antes de apagar |
| `IonSegment` | `Agenda`, `Ajustes` | Alternância entre filtros e entre temas |
| `IonRange` | `Ajustes` | Controle deslizante do limite de faltas |
| `IonDatetime` | `Agenda` | Calendário de escolha da data |
| `IonSearchbar` | `Semestre` | Busca por matéria |

### 1.2 React 19

Biblioteca de construção de interfaces baseada em componentes. A tela é descrita
como função do estado: quando o estado muda, o React recalcula o que precisa ser
redesenhado e atualiza apenas aquela parte do DOM.

Recursos do React usados no projeto:

| Recurso | Onde aparece | Para quê |
|---|---|---|
| Componentes e JSX | Todo `src/components` e `src/pages` | Estrutura da interface descrita em sintaxe parecida com HTML |
| Props | Os oito componentes | Dados entram pelo pai, nenhum componente busca informação por conta própria |
| `useState` | Filtros, busca, campos de formulário, modais | Estado local de cada tela |
| `useEffect` | `BoletimContext`, `useTema` | Ler o armazenamento na montagem, gravar a cada mudança, ouvir o tema do sistema |
| `useContext` | `useBoletim` | Acesso ao estado compartilhado sem passar props por vários níveis |
| `useMemo` | `Semestre`, `Agenda`, `DetalheMateria` | Evita recalcular médias e ordenações em todo render |
| `useCallback` | `BoletimContext` | Mantém a identidade das funções, para os consumidores não redesenharem à toa |
| `useRef` | `ItemAvaliacao`, `ItemCompromisso` | Fecha o item deslizante antes de executar a ação |
| Hooks personalizados | `useBoletim`, `useTema` | Encapsulam lógica reaproveitada |

### 1.3 TypeScript 5

Superconjunto do JavaScript que adiciona tipagem estática. O erro aparece na
escrita do código, e não quando o usuário toca no botão.

O projeto roda em modo estrito (`strict: true`). Todos os tipos ficam em
`src/tipos.ts`, o que impede cada tela de inventar o seu próprio formato de
dado. Um exemplo do ganho: `nota` é declarada como `number | null`, então o
compilador obriga todo código que lê uma nota a tratar o caso de a prova ainda
não ter saído.

### 1.4 Capacitor 8 e @capacitor/preferences

O Capacitor é a ponte entre o código web e o aparelho. Ele empacota a aplicação
dentro de um projeto Android ou iOS nativo e expõe os recursos do sistema
através de plugins com a mesma API nos dois lados.

O plugin `@capacitor/preferences` guarda pares de chave e valor de forma
permanente, usando o mecanismo nativo de cada plataforma:

| Plataforma | Onde os dados realmente ficam |
|---|---|
| Android | `SharedPreferences` |
| iOS | `UserDefaults` |
| Navegador | `localStorage`, com o prefixo `CapacitorStorage.` |

A API é assíncrona e armazena apenas texto, por isso todo objeto passa por
`JSON.stringify` na gravação e `JSON.parse` na leitura.

### 1.5 React Router 6

Controla qual tela está visível a partir da URL. O Ionic integra com ele através
do pacote `@ionic/react-router`, que acrescenta as animações de transição e o
empilhamento de telas.

### 1.6 Vite 8

Servidor de desenvolvimento e empacotador. Em desenvolvimento serve os módulos
direto ao navegador, sem recompilar o projeto inteiro a cada alteração. Em
produção gera a pasta `dist`, que é exatamente o que o Capacitor copia para
dentro do aplicativo nativo.

O plugin `@vitejs/plugin-legacy` gera uma segunda versão do código para
navegadores antigos, relevante em aparelhos Android com WebView desatualizada.

### 1.7 Vitest 5, Testing Library e happy-dom

Vitest executa os testes automatizados, Testing Library renderiza componentes em
memória e happy-dom simula o navegador fora dele.

O `happy-dom` substitui o `jsdom` que vem no modelo oficial do Ionic. Motivo: o
`jsdom` depende do pacote `undici`, que exige Node 22 ou mais novo, e o ambiente
de desenvolvimento aqui roda Node 20.

---

## 2. Arquitetura: camadas e fluxo

O sistema tem quatro camadas, e a regra é que cada uma só conhece a de baixo.

```text
┌──────────────────────────────────────────────┐
│  APRESENTAÇÃO                                │
│  src/pages        telas, montam o layout     │
│  src/components   peças reutilizáveis        │
└───────────────────┬──────────────────────────┘
                    │ lê estado e dispara ações
┌───────────────────▼──────────────────────────┐
│  ESTADO                                      │
│  src/contextos    BoletimProvider            │
│  src/hooks        useBoletim, useTema        │
└───────────────────┬──────────────────────────┘
                    │ chama ler e gravar
┌───────────────────▼──────────────────────────┐
│  SERVIÇO                                     │
│  src/servicos     armazenamento.ts           │
│                   valida e serializa         │
└───────────────────┬──────────────────────────┘
                    │ Preferences.get / set
┌───────────────────▼──────────────────────────┐
│  PLATAFORMA                                  │
│  @capacitor/preferences                      │
│  SharedPreferences · UserDefaults · Storage  │
└──────────────────────────────────────────────┘

        src/utils  →  funções puras de cálculo e formatação,
                      sem estado e sem acesso ao armazenamento
```

### 2.1 Fluxo de leitura, na abertura do aplicativo

1. `main.tsx` monta o `App`, que envolve tudo no `BoletimProvider`.
2. Um `useEffect` do provedor dispara na montagem e chama `lerMaterias`,
   `lerCompromissos` e `lerConfiguracao` em paralelo.
3. A camada de serviço pede o texto ao `Preferences`, converte de JSON e passa
   por funções de saneamento que descartam registro inválido.
4. O provedor guarda o resultado no estado e marca `carregando` como falso.
5. As telas, que já estavam montadas mostrando um indicador de carregamento,
   redesenham com os dados.

### 2.2 Fluxo de escrita, ao lançar uma nota

1. O usuário preenche o `ModalAvaliacao` e confirma.
2. O modal chama `onSalvar`, recebido por props, que é `salvarAvaliacao` do
   contexto.
3. O contexto atualiza o estado de forma imutável, criando um novo array de
   matérias em vez de alterar o existente.
4. O React detecta a mudança e redesenha tudo que depende dela: a média no
   detalhe, o selo de situação, o cartão na tela do semestre e o painel de média
   geral.
5. Em paralelo, um `useEffect` observa o array de matérias, serializa e grava no
   `Preferences`.

O passo 4 é a renderização reativa: nenhuma tela precisa ser avisada de que algo
mudou nem recarregada à mão.

### 2.3 A trava de gravação

O efeito que grava começa com uma verificação:

```ts
useEffect(() => {
  if (carregando) return;
  gravarMaterias(materias).catch(...);
}, [materias, carregando]);
```

Sem a linha `if (carregando) return`, o efeito rodaria no primeiro render, quando
o estado ainda é um array vazio, e gravaria esse vazio por cima dos dados reais
antes de a leitura terminar. Todo o conteúdo do usuário seria perdido na
abertura seguinte.

---

## 3. Estrutura de pastas

```text
Boletim-Projeto-Mobile/
├─ capacitor.config.ts     identificador do app e pasta de origem
├─ index.html              documento raiz, título e manifesto
├─ vite.config.ts          build e configuração dos testes
├─ docs/
│  ├─ Sistema.md           este documento
│  ├─ apresentacao.md      documento de apresentação
│  └─ capturas/            telas do aplicativo
├─ public/
│  ├─ icone.png            ícone 512x512
│  ├─ favicon.png          ícone 64x64
│  └─ manifest.json        metadados do PWA
├─ scripts/
│  └─ gerar-icones.py      desenha os ícones por função de distância
└─ src/
   ├─ App.tsx              rotas, abas e importação dos estilos do Ionic
   ├─ main.tsx             ponto de entrada do React
   ├─ tipos.ts             todos os tipos compartilhados
   ├─ components/          oito componentes reutilizáveis
   ├─ contextos/
   │  ├─ boletimContexto.ts   createContext e a interface do valor
   │  └─ BoletimContext.tsx   o provedor, com estado e efeitos
   ├─ dados/
   │  ├─ catalogo.ts       cores, tipos de compromisso e situações
   │  └─ exemplos.ts       semestre de demonstração
   ├─ hooks/
   │  ├─ useBoletim.ts     acesso ao contexto
   │  └─ useTema.ts        aplica a paleta clara ou escura
   ├─ pages/               as cinco telas
   ├─ servicos/
   │  └─ armazenamento.ts  única porta de entrada do Preferences
   ├─ theme/variables.css  identidade visual
   └─ utils/
      ├─ calculos.ts       regras acadêmicas, funções puras
      └─ formato.ts        moeda, data e texto em português
```

O contexto está dividido em dois arquivos de propósito. O recarregamento
automático do Vite só preserva o estado da tela quando um arquivo exporta apenas
componentes; separar o `createContext` do provedor mantém essa garantia.

---

## 4. Modelo de dados

### 4.1 Entidades

```text
Configuracao                 Materia 1 ──── N Avaliacao
├─ nome                      ├─ id             ├─ id
├─ mediaMinima               ├─ nome           ├─ nome
├─ limiteFaltas              ├─ professor      ├─ peso
└─ tema                      ├─ cor            └─ nota (pode ser nula)
                             ├─ aulasPrevistas
                             ├─ faltas
                             └─ avaliacoes[]
                                   │
                             Materia 1 ──── N Compromisso
                                             ├─ id
                                             ├─ materiaId
                                             ├─ titulo
                                             ├─ tipo
                                             ├─ data
                                             └─ concluido
```

As avaliações ficam aninhadas dentro da matéria porque não existem sem ela:
excluir a matéria não deixa registro órfão. Os compromissos ficam em uma lista
separada, com referência por `materiaId`, porque a tela da Agenda precisa
ordenar todos juntos, de todas as matérias.

### 4.2 Dicionário de dados

**Materia**

| Campo | Tipo | Regra |
|---|---|---|
| `id` | texto | Gerado na criação, prefixo `m` mais base 36 do relógio |
| `nome` | texto | Obrigatório, até 50 caracteres |
| `professor` | texto | Opcional, até 50 caracteres |
| `cor` | texto | Uma das oito cores do catálogo, em hexadecimal |
| `aulasPrevistas` | número | De 1 a 1000, usado para calcular o limite de faltas |
| `faltas` | número | Nunca negativo |
| `avaliacoes` | lista | Pode estar vazia |

**Avaliacao**

| Campo | Tipo | Regra |
|---|---|---|
| `id` | texto | Gerado na criação, prefixo `a` |
| `nome` | texto | Obrigatório, até 40 caracteres |
| `peso` | número | Maior que zero, até 100 |
| `nota` | número ou nulo | De 0 a 10. Nulo significa que a avaliação ainda não aconteceu |

**Compromisso**

| Campo | Tipo | Regra |
|---|---|---|
| `id` | texto | Gerado na criação, prefixo `c` |
| `materiaId` | texto | Referência a uma matéria existente |
| `titulo` | texto | Obrigatório, até 50 caracteres |
| `tipo` | texto | `prova`, `trabalho` ou `apresentacao` |
| `data` | texto | Formato `AAAA-MM-DD` |
| `concluido` | lógico | Começa falso |

**Configuracao**

| Campo | Tipo | Padrão | Regra |
|---|---|---|---|
| `nome` | texto | vazio | Usado na saudação |
| `mediaMinima` | número | 6 | De 0 a 10 |
| `limiteFaltas` | número | 25 | Percentual de 1 a 100 |
| `tema` | texto | `sistema` | `sistema`, `claro` ou `escuro` |

### 4.3 Chaves de armazenamento

| Chave | Conteúdo |
|---|---|
| `boletim.materias` | Lista de matérias, com as avaliações aninhadas |
| `boletim.compromissos` | Lista de compromissos |
| `boletim.configuracao` | Objeto de configuração |

### 4.4 Validação na leitura

O armazenamento é texto livre: nada impede que uma versão anterior do aplicativo
tenha gravado um formato diferente, ou que o conteúdo esteja truncado. A camada
de serviço trata o dado lido como desconhecido e valida campo a campo.

Registros inválidos são descartados em silêncio, e os campos ausentes recebem um
padrão. O princípio é que um dado corrompido nunca deve derrubar a tela.

---

## 5. Regras de negócio

### 5.1 Média parcial

Média ponderada considerando apenas as avaliações que já têm nota:

```
mediaParcial = Σ(peso × nota) / Σ(peso)      somente das avaliações lançadas
```

Se nenhuma nota foi lançada, o resultado é nulo e a tela mostra dois traços, em
vez de zero. Zero significaria que o aluno tirou zero.

### 5.2 Nota necessária

```
notaNecessaria = (mediaMinima × pesoTotal − pontosObtidos) / pesoPendente
```

Onde `pesoTotal` soma todas as avaliações e `pesoPendente` soma apenas as que
ainda não têm nota.

O divisor é o peso que falta, mas o alvo é calculado sobre o peso total. Usar só
o peso pendente nos dois lados daria resultado errado em matéria com avaliações
de pesos diferentes.

Interpretação do resultado:

| Resultado | Significado na tela |
|---|---|
| Menor ou igual a zero | A média mínima já está garantida |
| Entre zero e 10 | O número que o aluno precisa alcançar |
| Maior que 10 | Não é mais possível alcançar a média |

### 5.3 Frequência

```
faltasMaximas  = parte inteira de (aulasPrevistas × limiteFaltas / 100)
faltasRestantes = máximo entre zero e (faltasMaximas − faltas)
reprovado por falta = faltas > faltasMaximas
```

A comparação usa "maior que", e não "maior ou igual". Faltar exatamente o limite
ainda aprova, que é como a regra dos 25% funciona na prática.

### 5.4 Situação da matéria

A ordem de verificação importa:

1. Se ultrapassou o limite de faltas, o resultado é **reprovado por falta**, por
   melhor que seja a nota.
2. Se não há nenhuma avaliação cadastrada, fica **em andamento**.
3. Se todas as avaliações já foram lançadas, compara a média com a mínima:
   **aprovado** ou **reprovado por nota**.
4. Com avaliações pendentes, decide pela nota necessária:

| Nota necessária | Situação |
|---|---|
| Menor ou igual a zero | Aprovado |
| Maior que 10 | Reprovado por nota |
| De 7 a 10 | Atenção |
| Menor que 7 | Em andamento |

### 5.5 Datas

Toda data circula como texto no formato `AAAA-MM-DD`, nunca como objeto `Date`.

O motivo é concreto: `new Date('2026-12-01')` é interpretado como meia-noite em
UTC e, no horário de Brasília, que é três horas atrás, resulta em 30 de novembro
às 21h. A data exibida seria um dia antes da digitada.

A conversão para `Date` acontece só na hora de formatar, e é feita manualmente,
separando ano, mês e dia:

```ts
export function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, (mes ?? 1) - 1, dia ?? 1);
}
```

---

## 6. Navegação

```text
IonTabs
├─ /semestre        aba 1   Semestre
│  └─ /semestre/:id         DetalheMateria, empilhada sobre a aba
├─ /agenda          aba 2   Agenda
├─ /materia         aba 3   FormularioMateria, modo cadastro
│  └─ /materia/:id          FormularioMateria, modo edição
├─ /ajustes         aba 4   Ajustes
└─ /                        redireciona para /semestre
```

O detalhe da matéria é uma rota filha da aba Semestre, e não uma aba própria,
porque não faz sentido abri-lo sem antes escolher uma matéria. Ele entra
empilhado, com botão de voltar, que é o padrão de navegação hierárquica em
celular.

O formulário atende duas rotas com o mesmo componente. A presença do parâmetro
`:id` decide se a tela cadastra ou edita, o que evita duplicar um formulário
inteiro.

As telas permanecem montadas ao trocar de aba, comportamento do `IonRouterOutlet`
que torna a volta instantânea. Isso tem uma consequência: o formulário precisa
se recarregar quando a rota muda, o que é feito comparando a chave da rota com a
chave do estado durante o render.

---

## 7. Componentes

| Componente | Props que recebe | Estado próprio | Onde é usado |
|---|---|---|---|
| `CartaoMateria` | matéria, desempenho, frequência, limite, ação de abrir | não | Semestre |
| `BarraFaltas` | faltas, frequência, limite, modo compacto | não | Semestre, Detalhe |
| `EtiquetaSituacao` | situação | não | Semestre, Detalhe |
| `ItemAvaliacao` | avaliação, média mínima, ações | referência ao item deslizante | Detalhe |
| `ItemCompromisso` | compromisso, matéria, ações | referência ao item deslizante | Agenda, Detalhe |
| `ModalAvaliacao` | aberto, avaliação, ações | campos do formulário | Detalhe |
| `EstadoVazio` | ícone, título, descrição | não | Quatro telas |
| `AlertaConfirmacao` | aberto, título, mensagem, ações | não | Quatro pontos |

Nenhum componente importa o contexto nem a camada de serviço. Todos recebem
dados por props e devolvem intenção por funções de retorno. A consequência
prática é que `BarraFaltas` funciona tanto no cartão da lista quanto na tela de
detalhe, mudando apenas uma propriedade.

---

## 8. Identidade visual

| Elemento | Valor |
|---|---|
| Nome | Boletim |
| Cor primária | `#1D4ED8` |
| Fim do gradiente | `#0E2F8F` |
| Cor de destaque | `#D97706` |
| Cores de matéria | Oito opções, de azul a cinza-ardósia |
| Tipografia | Fonte do sistema, para parecer nativo em cada plataforma |

As cores são definidas como variáveis CSS em `src/theme/variables.css`,
sobrescrevendo as do Ionic. O tema escuro redefine as mesmas variáveis dentro da
classe `ion-palette-dark`, que o hook `useTema` aplica no elemento `<html>`.

O ícone é um birrete desenhado por `scripts/gerar-icones.py`, um script Python
que calcula a cor de cada pixel por função de distância e grava o PNG usando
apenas a biblioteca padrão. Nenhum editor de imagem participou, e o resultado é
reproduzível: rodar o script de novo gera arquivos idênticos.

---

## 9. Testes e verificação

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `npx tsc --noEmit` | Sem erros |
| Testes automatizados | `npm test` | 34 testes, todos passando |
| Build de produção | `npm run build` | Gera `dist` em aproximadamente 3,5 segundos |

Os 34 testes cobrem as funções puras de `src/utils`, mais a montagem do
aplicativo. Os casos escolhidos são os que falham em silêncio:

- média ponderada ignorando avaliação ainda pendente;
- nota necessária em matéria com pesos diferentes;
- a fronteira entre faltar exatamente o limite e ultrapassá-lo;
- reprovação por falta em matéria com nota alta;
- carga horária zerada, que causaria divisão por zero;
- contagem de dias atravessando a virada de mês;
- ordenação de nomes com acento.

Foi feita também uma validação funcional no navegador, percorrendo o fluxo
completo: cadastro com campo obrigatório vazio, cadastro válido, lançamento de
avaliação, registro de faltas até ultrapassar o limite, recarregamento da página
para conferir a persistência e exclusão da matéria.

---

## 10. Pontos para a apresentação

**Por que híbrido.** Um código em TypeScript gera o aplicativo para Android e
iOS. O mesmo código roda no navegador durante o desenvolvimento, o que encurta
muito o ciclo de teste comparado a compilar para o emulador a cada alteração.

**Onde os dados ficam.** Não existe servidor. Abrir o aplicativo sem internet
funciona porque o `Preferences` grava no armazenamento nativo do aparelho. A
contrapartida é que trocar de celular significa perder o histórico.

**Por que o cálculo fica fora dos componentes.** As regras acadêmicas estão em
funções puras, que recebem dados e devolvem números sem tocar em tela nem em
armazenamento. É isso que permite testá-las em milissegundos, sem abrir o
aplicativo.

**O detalhe que mais custa se esquecido.** A trava de gravação descrita na seção
2.3. Sem ela, o aplicativo apaga os dados do usuário na segunda abertura, e o
erro é difícil de perceber durante o desenvolvimento, quando o armazenamento
costuma estar vazio.

**Limitação assumida.** Sem conta de usuário e sem sincronização. A evolução
natural é notificação local avisando na véspera da prova, exportação do boletim
e histórico de semestres anteriores com o cálculo do coeficiente de rendimento.
