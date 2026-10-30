# Checklist de requisitos da avaliação

Revisão aprofundada em 30/10/2026, sobre o commit `0a1aef4` e a árvore de trabalho atual. Cada requisito tem seu estado e suas evidências atualizados na própria linha. **Cumprido** significa confirmado no código; **Em andamento** indica implementação parcial ou validação ainda pendente, sem presumir trabalho ativo; **Não atendido** indica recurso ausente, falha comprovada ou demonstração ainda sem evidência. A inspeção de código não substitui a apresentação presencial nem certifica WCAG integralmente.

Atualizado após a refatoração pontual de 30/10/2026: CSS/imagens movidos para fora de `src`, dez páginas com `lazy`, contraste corrigido, `<main>` nas telas de autenticação e referências ARIA consistentes durante loading. As validações de OTP, reestruturações de estado e funcionalidades ausentes continuam com as pendências concretas registradas abaixo.


**Estado atual dos 108 itens:** 78 cumpridos; 19 em andamento; 11 não atendidos. A contagem inclui os itens finais e a condição histórica de desenvolvimento desde o início.

## Requisitos mínimos para nota 7,0

### Projeto e organização

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Criar o projeto utilizando Vite + React + TypeScript. | **Cumprido** | `package.json`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx` | Dependências e scripts Vite/React/TypeScript presentes; build executa `tsc -b && vite build`. |
| Todos os arquivos dentro de `src/` devem possuir extensão `.tsx` ou `.ts`. | **Cumprido** | `src/`; `styles/`; `assets/` | Após mover 23 CSS e 14 imagens, src contém somente 46 arquivos .ts e 39 .tsx. Estilos ficam em styles/components, styles/pages e styles/; imagens em assets/. Imports e URLs foram atualizados e o build resolve os recursos. |
| Não utilizar `.js` ou `.jsx` dentro de `src/`. | **Cumprido** | `src/` — inventário completo dos 85 arquivos | A árvore atual contém 46 arquivos .ts e 39 .tsx. Não há .js, .jsx, CSS nem imagens dentro de src. Os estilos e imagens estão em diretórios da raiz. |
| Organizar componentes em `src/components/`. | **Cumprido** | `src/components/` | Componentes de interface estão agrupados nessa pasta. |
| Organizar páginas em `src/pages/`. | **Cumprido** | `src/pages/` | Páginas de login, cadastro, lojas, planos, dashboard e erro estão agrupadas nessa pasta. |
| Cada componente deve estar em sua própria pasta e conter `index.tsx`. | **Cumprido** | `src/components/*/index.tsx; src/contexts/*/index.tsx` | Os 25 componentes de UI têm pasta própria e index.tsx. Os dois Providers também seguem a convenção em contexts. App é a composição raiz; main é o ponto de entrada. DashboardDataTable segue a regra e não constitui exceção. |
| Cada página deve estar em sua própria pasta e conter `index.tsx`. | **Cumprido** | `src/pages/*/index.tsx` | As dez páginas têm diretório próprio e index.tsx: CreateStorePage, DashboardPage, LoginPage, NotFoundPage, PlansPage, RegisterPage, ReportsPage, StoresPage, UpdatePlansPage e VerifyRegistrationPage. |
| Aplicar consistentemente a convenção de pastas e arquivos em todo o projeto. | **Cumprido** | `src/components/`, `src/pages/`, `src/contexts/`, `styles/`, `assets/` | Todos os 25 componentes, 10 páginas e 2 Providers continuam com pasta individual e index.tsx. A organização também atende à regra de extensões: CSS e imagens foram movidos para fora de src com imports relativos atualizados. |

### Componentes e tipagem

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Criar no mínimo 6 componentes, cada um com responsabilidade única. | **Cumprido** | `src/components/FormInput/, PrimaryButton/, LoadingSpinner/, ErrorAlert/, Navbar/, StoresTable/` | 25 componentes de UI lidos. Exemplos de responsabilidade única: campo/erro associado, botão de envio, anúncio de carga, anúncio de erro, navegação e apresentação tabular. Lógica de acesso fica nos serviços/hooks, com exceções de separação descritas no item seguinte. |
| Não misturar renderização, lógica de negócio ou acesso a `src/services/` em componentes. | **Em andamento** | `src/contexts/AuthContext/index.tsx: AuthProvider; src/pages/RegisterPage/index.tsx: handleSubmit; src/pages/LoginPage/index.tsx: handleChange/handleSubmit` | Componentes de UI não importam services; StoreForm delega o fluxo a useStoreForm e DashboardChart a useDashboardChart. Contudo AuthProvider combina JSX, restauração/persistência e chamadas diretas a refreshSession/getProfile; páginas de login/cadastro também validam e orquestram o fluxo dentro da renderização. A separação não é integral. |
| Criar interfaces TypeScript para as props de todos os componentes. | **Cumprido** | `src/components/*/index.tsx; src/contexts/AuthContext/index.tsx: AuthProviderProps; src/contexts/StoresContext/index.tsx: StoresProviderProps` | Todos os componentes que recebem props declaram interface própria, inclusive os wrappers memoizados. PortalLayout, RootRedirect, App e páginas não recebem props e não precisam de interface vazia. renderInput e field são helpers de renderização, não componentes adicionais. |
| Criar interfaces para entidades do domínio em `src/types/`. | **Cumprido** | `src/types/` | Tipos por domínio incluem `store.ts`, `registration.ts`, `profile.ts`, `dashboard.ts` e `auth.ts`. |
| Organizar os tipos por arquivo de domínio. | **Cumprido** | `src/types/` | Arquivos separados por autenticação, perfil, lojas, cadastro e dashboard. |
| Não utilizar `any` em `src/`. | **Cumprido** | `src/types/; src/hooks/; src/services/; src/utils/; componentes e páginas` | Leitura das assinaturas, estados, handlers, parsers e assertions confirmou tipos explícitos/inferidos, Record<string, unknown> e unknown, sem any. Isso não elimina os casts sem validação de runtime documentados em segurança. |

### Serviços, estado e efeitos

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Isolar toda comunicação com APIs externas em `src/services/`. | **Cumprido** | `src/services/apiClient.ts: apiRequest; auth.service.ts; profile.service.ts; coreClient.ts` | Login, renovação e verificação usam auth.service; perfil usa profile.service → coreClient → apiRequest. A requisição HTTP só ocorre em apiRequest. Lojas são um repositório local; dashboard usa mock validado e geografia é import local de arquivo. |
| Criar arquivos de serviço separados por recurso. | **Cumprido** | `src/services/auth.service.ts`, `stores.service.ts`, `profile.service.ts`, `geography.service.ts`, `dashboard.service.ts` | Módulos separados por recurso. |
| Tipar os retornos dos serviços como `Promise<Tipo>`. | **Cumprido** | `src/services/apiClient.ts; coreClient.ts; auth.service.ts; profile.service.ts; dashboard.service.ts; geography.service.ts; stores.service.ts` | Todos os métodos assíncronos declaram Promise<T>: tokens, cadastro, perfil, dados dashboard, mapa string e Store[]. setCoreAuthToken/getCoreAuthToken são auxiliares síncronos tipados; ApiError é classe de erro, não recurso assíncrono. |
| Utilizar `try/catch` nos serviços. | **Cumprido** | `src/services/apiClient.ts: apiRequest; coreClient.ts: coreRequest; todos os métodos *.service.ts` | Cada operação assíncrona tem try/catch. Cliente trata erro HTTP/conexão e erro de JSON; recursos repassam Error ou criam mensagens específicas. Cancelamentos são filtrados pelos hooks e serviços locais verificam signal.throwIfAborted. |
| Não utilizar `fetch` diretamente em componentes ou páginas. | **Cumprido** | `src/services/apiClient.ts: apiRequest; páginas/componentes → hooks` | Leitura dos imports e chamadas de todas as páginas/componentes confirmou delegação ao hook/context. O transporte HTTP está apenas no apiRequest. |
| Manter chaves e URLs privadas em variáveis de ambiente, sem versioná-las. | **Em andamento** | `src/services/auth.service.ts: AUTH_API_BASE_URL/AUTH_API_KEY; src/services/coreClient.ts: CORE_API_BASE_URL; .env.example; .gitignore` | Variáveis import.meta.env são utilizadas e .env está ignorado e não rastreado; o histórico local de .env não tem commits. Porém os serviços têm fallbacks de URLs embutidos, repetidos em .env.example, e chave fallback default. Não se comprovou que as URLs sejam privadas; não há segredo real visível nesses arquivos. VITE_* é enviado ao navegador, portanto não armazena uma chave que deva permanecer secreta. |
| Gerenciar estado local com `useState`. | **Cumprido** | `src/hooks/`, `src/contexts/`, páginas | Estado local implementado com useState e estado compartilhado por Context/reducer. |
| Agrupar campos de estado relacionados em um único objeto. | **Em andamento** | `src/hooks/useLogin.ts; useRegistration.ts; useVerifyRegistration.ts; useDashboard.ts; useStores.ts` | Dashboard agrupa dados/mapa/loading/erro/revisão; filtros e formulários também agrupam campos. Login e verificação mantêm loading, error e success em useState separados; cadastro ainda separa registrationId. Portanto a regra não é aplicada consistentemente. |
| Não realizar mutação direta de arrays ou objetos. | **Cumprido** | `src/hooks/useStoreCollection.ts: reducer; src/hooks/useStoreForm.ts: changeField; src/pages/VerifyRegistrationPage/index.tsx: handlers; src/utils/dashboardCharts.ts: belowMinimumChart` | Reducers e setters constroem novos objetos; exclusão usa filter e edição map. OTP copia digits antes de atribuir posições, touchedFields copia Set antes de add, ranking copia antes de sort. Mutações de refs/DOM, arrays temporários e instância ECharts não são mutação do estado React. |
| Usar `useEffect` com array de dependências explícito e correto. | **Cumprido** | `src/contexts/AuthContext/index.tsx; src/hooks/useDashboard.ts; useDashboardChart.ts; useDialog.ts; useStoreCollection.ts; páginas com efeitos` | Lidos todos os efeitos: restore captura apenas bindings estáveis; token/persistência dependem dos campos usados; dashboard depende de revision; gráficos de container/option/mapSource; diálogo de fallbackFocusId; coleção de reload; páginas capturam IDs constantes ou navigate e estados OTP explicitados. |
| Incluir todas as dependências necessárias nos efeitos. | **Cumprido** | `src/hooks/useVerifyRegistration.ts; src/pages/VerifyRegistrationPage/index.tsx; demais efeitos citados acima` | Efeitos de OTP listam isComplete, otp, execute, registrationId, loading, success e error; redirecionamentos listam navigate; refs e setters são estáveis. Revisão das closures não encontrou dependência reativa omitida. A estabilidade/concentração de chamadas é assunto distinto de omitir dependências. |

### Listas e rotas

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Renderizar listas dinâmicas com `key` baseado no identificador único do dado. | **Cumprido** | `src/components/StoresTable/index.tsx; StoresFilters/index.tsx; DashboardDataTable/index.tsx; DashboardChartLegend/index.tsx; DashboardChartsGrid/index.tsx` | Lojas usam store.id; opções usam city/state consolidado em Map; linhas/colunas/legendas/cards usam IDs. Dashboard rejeita IDs duplicados no adaptador; armazenamento rejeita lojas duplicadas; novas lojas recebem crypto.randomUUID. Planos usam plan.id, benefícios usam texto único na configuração atual, UFs usam a sigla. |
| Não utilizar `key={index}` em listas que permitam adição, remoção ou reordenação. | **Cumprido** | `src/pages/VerifyRegistrationPage/index.tsx: digits.map; src/components/DashboardDataTable/index.tsx` | Índice é key apenas nos seis slots fixos do OTP: não há adição, remoção ou reordenação de slots. Na tabela dashboard o índice serve somente para acessar a célula e escolher th/td; a key é column.id. Listas mutáveis de lojas usam store.id. |
| Recuperar parâmetros de rota utilizando `useParams`. | **Não atendido** | `src/App.tsx: Routes; src/pages/VerifyRegistrationPage/index.tsx` | As dez páginas recebem rotas estáticas. registrationId vem de localStorage; planId é estado/dado; nenhum deles é parâmetro de rota. Falta um fluxo com rota dinâmica e useParams. |
| Verificar se cada parâmetro de rota está presente antes de utilizá-lo. | **Não atendido** | `src/App.tsx; páginas em src/pages/` | Não existe fluxo com parâmetro de rota para demonstrar a verificação. O guard de registrationId na verificação protege um valor de localStorage e não satisfaz useParams. |
| Tratar a possibilidade de `undefined` ao acessar parâmetros de rota. | **Não atendido** | `src/App.tsx; páginas em src/pages/` | Falta implementar parâmetro opcional recebido de useParams e tratar a ausência antes de usar o valor; não foi encontrado acesso inseguro porque o recurso ainda não existe. |
| Implementar no mínimo 3 rotas utilizando React Router. | **Cumprido** | `src/App.tsx: Routes; src/main.tsx: BrowserRouter` | Existem /, /login, /cadastro, /cadastro/verificacao, /planos, /dashboard, /dashboard/planos, /lojas, /lojas/nova, /relatorios e *. Cinco destinos estão sob PrivateRoute. |
| Fazer a navegação com `<Link>` ou `useNavigate`. | **Cumprido** | `src/components/Navbar/index.tsx; PrivateRoute/index.tsx; RootRedirect/index.tsx; páginas com navegação` | Sidebar usa NavLink; cadastro/login/breadcrumbs usam Link; transições após ações usam useNavigate. Guards usam Navigate. Link Esqueci minha senha aponta /esqueci-senha, ainda sem página e resolvido pela rota curinga. |
| Não utilizar `window.location.href` para navegação. | **Cumprido** | `src/components/Navbar/, PrivateRoute/, RootRedirect/, PortalLayout/; src/pages/` | Todos os caminhos de navegação lidos usam mecanismos do React Router, sem atribuição a window.location.href. |
| Criar rota curinga `path="*"` com página de erro e botão de retorno. | **Cumprido** | `src/App.tsx`, `src/pages/NotFoundPage/index.tsx` | `path="*"` mostra erro e botão de retorno via `useNavigate`. |

### Acessibilidade mínima — WCAG 2.1 nível AA

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Utilizar `<button>` para todas as ações. | **Cumprido** | `src/components/PlanCard/, PrimaryButton/, FormInput/, StoresTable/, StorePhotoPicker/, StoreForm/, DeleteStoreModal/, Navbar/, DashboardChartCard/; NotFoundPage` | Contratar/selecionar plano, exibir senha, CRUD, foto, cancelar, sair, alternar dados e repetir operação são buttons. Links/NavLink são usados para deslocamento entre rotas; inputs e selects mantêm controles nativos. Não há ação de UI implementada como div clicável. |
| Não utilizar `<div onClick>`. | **Cumprido** | `JSX de todos os arquivos src/components/*/index.tsx e src/pages/*/index.tsx` | Handlers de ação estão em button ou controles de formulário. Divs são agrupadores, regiões/tabelas ou containers de gráficos; não receberam ação onClick. |
| Associar cada `<label>` ao seu `<input>` usando `htmlFor`. | **Cumprido** | `src/components/FormInput/index.tsx: inputId; StorePhotoPicker/index.tsx; StoreStateSelect/index.tsx; StoresFilters/index.tsx; VerifyRegistrationPage/index.tsx` | Cada label aponta ao id do controle: useId em controles reutilizáveis e otp-0 até otp-5 nos slots. Os filtros associam search/status/location, incluindo selects. Não existem outros inputs fora desses componentes/OTP. |
| Fornecer `alt` descritivo para imagens ou `alt=""` para imagens decorativas. | **Cumprido** | `src/pages/LoginPage/, RegisterPage/, VerifyRegistrationPage/; src/components/StorePhotoPicker/, PortalHeader/, Navbar/, StoresTable/, StoresFilters/, StoreStateSelect/, CreateStorePage` | Todos os img têm alt. Logos textuais têm Logotipo Ceris; foto tem Pré-visualização da foto da loja; ícones, chevrons, símbolo de marca e avatar redundante são decorativos e têm alt vazio. SVGs inline decorativos dos planos possuem aria-hidden=true/focusable=false; a marca lateral possui nome acessível via role=img/aria-label. |
| Garantir contraste mínimo de 4,5:1 para texto normal. | **Cumprido** | `styles/components/Navbar/navbar.css`: hover; `styles/auth.css`: slogan; `src/utils/dashboardColors.ts` | Hover dos links usa #626270 sobre #f8f7fb = 5,62:1; sair usa #b91c1c sobre #fff1f2 = 5,89:1. O slogan recebe scrim escuro de 65% sobre a foto: mesmo sobre branco puro o texto branco mantém pelo menos 6,30:1. Demais pares sólidos da revisão permanecem adequados; o heatmap seleciona texto por luminância. |
| Garantir contraste mínimo de 3:1 para texto grande. | **Cumprido** | `styles/auth.css`: .slogan-section; `styles/components/PlanCard/plan-card.css`; `styles/components/PortalLayout/portal-layout.css`; `styles/dashboard.css` | Títulos/indicadores continuam escuros sobre fundos claros. O slogan branco agora tem limite de contraste calculável independente dos pixels da fotografia: scrim rgb(17 5 27 / 65%) limita o fundo mais claro a #655d6b (arredondamento conservador), fornecendo pelo menos 6,30:1. Isso supera 3:1 e 4,5:1, inclusive nos breakpoints com texto menor. |
| Exibir erros no DOM com `role="alert"`. | **Cumprido** | `src/components/ErrorAlert/index.tsx`, `FormInput/index.tsx` | Erros renderizados com `role="alert"`. |
| Tornar a aplicação completamente operável por teclado. | **Em andamento** | `src/hooks/useDialog.ts; src/pages/VerifyRegistrationPage/index.tsx; src/components/StorePhotoPicker/; src/components/DashboardChartCard/` | Botões/links/selects nativos e regiões roláveis focáveis dão acesso por teclado. No preview foram confirmados Enter na tabela alternativa do dashboard, Enter para abrir edição e Escape para fechar com retorno ao botão de origem. OTP ainda remove inputs no loading e os recria após erro sem novo foco explícito (activeIndex pode ficar igual); esse percurso e a navegação integral continuam pendentes. |
| Garantir foco visível em todos os elementos interativos. | **Cumprido** | `styles/index.css`; `styles/components/FormInput/form-input.css`, `StoreForm/store-form.css`, `StoresFilters/stores-filters.css`, `StoresTable/stores-table.css`; `styles/dashboard.css`; CSS de verificação | Controles e regiões roláveis mantêm seus outlines/regras de foco. O título do dashboard agora também recebe outline roxo ao ganhar foco programático, em vez de outline:none. Ícones SVG decorativos dos planos foram marcados aria-hidden e focusable=false; não geram controles extras. |
| Validar ao vivo a navegação por teclado durante a apresentação, sem utilizar mouse. | **Não atendido** | Demonstração da aplicação | Evidência ao vivo sem mouse não pode ser estabelecida por arquivos do repositório. |

### Feedback assíncrono

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Exibir estado de carregamento no DOM (spinner, skeleton ou `aria-live`). | **Cumprido** | `src/components/LoadingSpinner/`, `src/App.tsx`, hooks | Spinner exibido durante Suspense/carregamento assíncrono. |
| Exibir estado de sucesso no DOM. | **Em andamento** | `src/pages/DashboardPage/index.tsx; StoresPage/index.tsx; LoginPage/index.tsx; PlansPage/index.tsx; VerifyRegistrationPage/index.tsx` | Dashboard anuncia carregamento e lojas anunciam mutação/contagem via role=status. Login define success e navega imediatamente, sem garantir leitura da mensagem. PlansPage redireciona ao sucesso; VerifyRegistrationPage retorna null quando success e navega sem mensagem de sucesso no DOM. Portanto os três estados não são consistentes em todas as operações. |
| Exibir estado de erro no DOM. | **Cumprido** | `src/components/ErrorAlert/`, páginas e hooks | Erros aparecem na interface com alerta acessível. |
| Não usar `alert()` ou `console.log` como único tratamento dos estados assíncronos. | **Cumprido** | `Hooks assíncronos e JSX de páginas/componentes` | Erros viram estado e ErrorAlert/formFieldError; carregamento usa LoadingSpinner/role=status; dados e mensagens de sucesso são renderizados onde indicado. Não há fluxo cujo único tratamento seja popup ou log. |

### Publicação e histórico Git

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Publicar a aplicação em Vercel ou GitHub Pages. | **Não atendido** | Deploy | README informa que URL de produção não foi configurada/informada. |
| Incluir no `README.md` o link da aplicação publicada. | **Não atendido** | `README.md` | Publicação explicitamente indicada como pendente; nenhum link de aplicação publicado presente. |
| Garantir que a aplicação publicada esteja acessível ao vivo durante a apresentação. | **Não atendido** | URL de produção | Não há URL/deploy para verificar disponibilidade durante apresentação. |
| Manter histórico de desenvolvimento no Git com no mínimo 20 commits. | **Cumprido** | `git log até 0a1aef4; git log --no-merges` | 73 commits alcançáveis a partir do HEAD, dos quais 53 não são merges. Mesmo excluindo merges, a contagem excede 20; mudanças incluem autenticação, layout, cadastro, lojas, dashboard e infraestrutura. |
| Utilizar Conventional Commits, como `feat:`, `fix:`, `refactor:` e `docs:`. | **Em andamento** | `histórico Git: a932f1a, 3f3f6d5, eddf14a` | 50 dos 53 commits que não são merges seguem prefixo de tipo. Exceções: Revert automático a932f1a, First build 3f3f6d5 e Initial commit eddf14a. Merges são registrados pelo Git/GitHub e separados dessa contagem. |
| Cobrir pelo menos 4 semanas de desenvolvimento com os commits. | **Cumprido** | `histórico Git: ff96b5d (15/09), 8357776 (22/09), 337f96b (28/09), 9a3f06d (02/10), 967d310 (16/10), ac8ffe2 (29/10)` | Datas de commits de desenvolvimento cobrem julho a outubro; há atividade em pelo menos as semanas de 14/09, 21/09, 28/09, 12/10, 19/10 e 26/10. A conclusão anterior de concentração insuficiente em outubro estava incorreta. |
| Não utilizar mensagens de commit genéricas. | **Em andamento** | `histórico Git: eddf14a e 3f3f6d5` | Initial commit e First build são genéricos. As demais mensagens de desenvolvimento descrevem mudanças concretas, como add auth context with reducer and login hooks e build responsive dashboard with accessible interactive charts. |

## Requisitos extras — até nota 10,0

### Gerenciamento de estado

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Implementar Context API. | **Cumprido** | `src/contexts/AuthContext/index.tsx`, `StoresContext/index.tsx` | Contextos de autenticação e lojas implementados. |
| Criar um Provider dedicado. | **Cumprido** | `src/contexts/AuthContext/index.tsx`, `StoresContext/index.tsx` | Providers dedicados publicados para os contextos. |
| Criar um hook customizado para consumo do Context. | **Cumprido** | `src/hooks/useAuth.ts`, `useStoresContext.ts` | Hooks próprios consomem Context e expõem valores tipados. |
| Aplicar tipagem completa ao Context, Provider e hook. | **Cumprido** | `src/contexts/AuthContext/index.tsx: AuthContextValue/AuthProviderProps/AuthState/AuthAction; StoresContext/index.tsx; src/hooks/useAuth.ts e useStoresContext.ts` | Contexts aceitam valor tipado ou null; hooks lançam erro fora do Provider e retornam contrato não nulo. Providers tipam children e profileId; coleção tipa dados, operações e transições. |
| Demonstrar oralmente o problema de prop drilling resolvido e apontá-lo no código. | **Em andamento** | `src/contexts/StoresContext/index.tsx`, `src/components/PortalLayout/index.tsx`, `src/hooks/useStoresContext.ts`, páginas de lojas | A solução está pronta para demonstrar: StoresProvider envolve Outlet; StoresPage e CreateStorePage acessam coleção/operações pelo hook, sem receber a coleção como props do layout. Falta evidência da explicação oral do grupo para concluir a parte presencial. |
| Implementar `useReducer`. | **Cumprido** | `src/contexts/AuthContext/index.tsx`, `src/hooks/useStoreCollection.ts` | Reducers usados em estados com múltiplas transições. |
| Tipar o state do reducer. | **Cumprido** | `src/contexts/AuthContext/index.tsx` | `AuthState` tipa o estado do reducer; coleção também tem estado tipado. |
| Tipar as actions com union types. | **Cumprido** | `src/contexts/AuthContext/index.tsx` | `AuthAction` é union discriminada por `type`. |
| Demonstrar oralmente por que `useReducer` foi escolhido em vez de múltiplos `useState`, apontando a complexidade real do estado no código. | **Em andamento** | `src/hooks/useStoreCollection.ts`: StoreCollectionState/StoreCollectionAction/reducer; `src/contexts/AuthContext/index.tsx`: authReducer | Há complexidade real para explicar: transições load/loaded/start/saved/error atualizam coleção, loading, saving, erro e sucesso de forma coordenada; autenticação coordena perfil e tokens. Implementação demonstrável, com apresentação oral ainda pendente. |

### Hooks e carregamento

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Criar um hook customizado com retorno tipado. | **Cumprido** | `src/hooks/useDashboard.ts: UseDashboardResult/useDashboard; src/hooks/useStoreCollection.ts: UseStoreCollectionResult` | useDashboard retorna dados, mapa, loading, error, companyName e reload com interface explícita; useStoreCollection também tem contrato de retorno tipado para estado e operações. |
| Incluir estado de loading no hook. | **Cumprido** | `src/hooks/useDashboard.ts: DashboardLoadState; useStoreCollection.ts: StoreCollectionState; useLogin.ts; useRegistration.ts; useVerifyRegistration.ts; useStorePhoto.ts` | Estado de carregamento declarado no retorno; lojas distingue loading de saving, e foto distingue leitura de salvamento. Esses campos são consumidos pelos spinners, mensagens e desabilitação de controles. |
| Tratar erros no hook. | **Cumprido** | `src/hooks/useDashboard.ts; useStoreCollection.ts; useLogin.ts; useRegistration.ts; useVerifyRegistration.ts; useStorePhoto.ts; useDashboardChart.ts` | Handlers catch convertem falhas para mensagens no estado, consumidas no DOM. Gráfico falho orienta usar tabela. Hooks puros de cálculo/contexto não realizam requisições e não precisam de loading próprio. |
| Cancelar operações com `AbortController`. | **Cumprido** | `src/hooks/useDashboard.ts; useStoreCollection.ts; useLogin.ts; useRegistration.ts; useVerifyRegistration.ts; useStorePhoto.ts; src/services/apiClient.ts` | Cleanup aborta controllers; signal atravessa os recursos até fetch ou FileReader. Import dinâmico da malha não pode ser cancelado em transporte, mas verifica abort antes de devolver; o hook bloqueia atualização após cancelamento. |
| Evitar atualização de estado após o componente ser desmontado. | **Cumprido** | `src/hooks/useDashboard.ts: cleanup/then/catch; useStoreCollection.ts: mounted/controllers; hooks de autenticação: mountedRef; useDashboardChart.ts: disposed` | Dashboard e coleção checam abort/montagem antes de atualizar; autenticação desmarca mountedRef no cleanup; gráfico marca disposed e desconecta ResizeObserver; foto verifica signal.aborted. Chamadas concorrentes de autenticação têm risco separado: catch de chamada abortada enquanto montado não testa signal e pode sobrescrever feedback de uma chamada nova. |
| Utilizar `React.lazy` e `Suspense` por página. | **Cumprido** | `src/App.tsx`: dez imports lazy e Suspense | RegisterPage e VerifyRegistrationPage foram convertidas de imports estáticos para lazy. As dez páginas estão cobertas pelo Suspense compartilhado, cujo fallback agora usa main. Build confirmado com chunks separados também para RegisterPage e VerifyRegistrationPage. |
| Demonstrar ao vivo, na aba Network do DevTools, o carregamento inicial de cada rota. | **Não atendido** | DevTools Network | Exige demonstração durante apresentação; não há evidência gravada no projeto. |

### Persistência

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Implementar `localStorage` com schema versionado. | **Cumprido** | `src/utils/storeStorage.ts`, `registrationStorage.ts`, `authStorage.ts` | Persistência local com schemas e validação. |
| Incluir o campo `_versao` no objeto salvo. | **Cumprido** | `src/utils/authStorage.ts: PersistedAuthSession/saveAuthSession; registrationStorage.ts: PersistedRegistrationDraft/PersistedRegistrationId; storeStorage.ts: PersistedStores` | Payload de sessão versão 3; rascunho, ID de cadastro e coleção de lojas versão 1. Todos os quatro formatos incluem _versao no objeto salvo. |
| Verificar a versão ao carregar os dados. | **Cumprido** | `src/utils/authStorage.ts: isPersistedAuthSession; registrationStorage.ts: isPersistedRegistrationDraft/isPersistedRegistrationId; storeStorage.ts: loadStores` | Cada leitura compara _versao com sua constante. Isso valida compatibilidade de schema; não significa validação completa dos campos internos, conforme item de dados externos. |
| Migrar ou descartar os dados com segurança quando a versão for incompatível. | **Cumprido** | `src/utils/authStorage.ts: clearAuthSession; registrationStorage.ts: clearRegistrationDraft/clearRegistrationId; storeStorage.ts: loadStores` | Versão incompatível faz removeItem e retorno null. JSON inválido também é descartado. Lojas remove a chave por perfil; sessão ainda verifica expiração. Estratégia implementada é descarte, não migração. |

### Performance

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Utilizar `useCallback` com justificativa de performance. | **Cumprido** | `src/hooks/useStoreDialogs.ts: openEdit/openDelete; src/hooks/useStores.ts: setSearch/setLocation; src/components/StoresTable/index.tsx e StoresFilters/index.tsx` | Handlers estáveis são passados à tabela e filtros memoizados. Abrir um diálogo sem alterar lojas/filtros pode preservar props da tabela e pular sua renderização. Há benefício identificável no código; medição em Profiler é requisito separado. Nem todo useCallback existente traz o mesmo benefício. |
| Utilizar `useMemo` com justificativa de performance. | **Cumprido** | `src/hooks/useDashboardCharts.ts`, `src/hooks/useStores.ts`, `src/components/DashboardChartCard/index.tsx` | Mantida a memoização útil de modelos de gráficos e listas derivadas para filhos memoizados. Foi removido de LoginPage o useMemo(() => fieldErrors), que apenas devolvia a mesma referência. A medição ao vivo no Profiler continua como requisito separado. |
| Estar preparado para explicar a otimização durante a avaliação ao vivo. | **Em andamento** | `src/hooks/useDashboardCharts.ts`, `src/hooks/useStores.ts`, `src/hooks/useStoreDialogs.ts`, `src/components/StoresTable/index.tsx` | A justificativa pode ser apontada: preservar modelos de gráficos e lista filtrada, além de handlers estáveis para filhos memoizados. Não há registro de ensaio/explicação pelo grupo; desempenho medido em Profiler permanece pendente no item seguinte. |
| Demonstrar a diferença utilizando o React DevTools Profiler. | **Não atendido** | React DevTools Profiler | Não há evidência de gravação/comparação do Profiler. |

### Segurança, validação e sanitização

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Implementar proteção contra XSS. | **Cumprido** | `src/utils/validateDashboard.ts: text; src/utils/dashboardCharts.ts: base; src/utils/validateStore.ts: sanitizeStoreData/isStorePhotoDataUrl; componentes de UI` | Campos textuais de perfil, loja e erro são interpolados em JSX, que escapa HTML. Dashboard remove tags/controles/chaves e usa tooltip richText/SVG, não HTML. Fotos aceitam PNG/JPEG/WebP com assinatura e data URL permitida; avatar é img, sem injeção de markup. Proteção de renderização atendida; validação estrutural de respostas ainda tem lacunas descritas abaixo. |
| Não utilizar `dangerouslySetInnerHTML` com dados externos. | **Cumprido** | `Todos os componentes/páginas; src/utils/dashboardCharts.ts: base` | Conteúdo é JSX e texto no renderer SVG; não há destino de HTML externo ou uso de dangerouslySetInnerHTML no fluxo lido. |
| Renderizar conteúdo dinâmico por interpolação JSX, como `{variavel}`. | **Cumprido** | páginas e componentes em `src/` | Conteúdo exibido por JSX; nenhum HTML externo injetado encontrado. |
| Demonstrar no código onde dados externos são tratados antes da renderização. | **Em andamento** | `src/utils/validateDashboard.ts: toValidatedDashboard; src/utils/storeStorage.ts: isStore/loadStores; src/services/apiClient.ts: return data as T; src/services/profile.service.ts` | Dashboard valida formato, IDs, números, relações e textos; lojas valida e reconstrói armazenamento. Perfil/tokens/cadastro remoto passam por data as T sem schema; erro só checa message. AuthStorage checa presença de chaves, não tipos internos; RegistrationStorage aceita data sem validar estrutura. Logo o tratamento não abrange todas as fontes. |
| Implementar validação e sanitização dos formulários. | **Em andamento** | `src/utils/validateLogin.ts; validateRegistration.ts; validateStore.ts; src/hooks/useVerifyRegistration.ts` | Login, cadastro e lojas validam/sanitizam. OTP é filtrado na página, mas não possui validador em utils nem verificação no hook/serviço. validatePlanId aceita qualquer número >=0, inclusive fora de AVAILABLE_PLANS; validação do CNPJ de cadastro só verifica máscara, enquanto lojas verifica dígitos. |
| Definir o tipo de cada campo do formulário. | **Cumprido** | `src/types/registration.ts`, `store.ts`, utilitários de validação | Formulários tipados por entidade. |
| Definir tamanho máximo para cada campo. | **Em andamento** | `src/pages/LoginPage/, RegisterPage/, VerifyRegistrationPage/; src/components/StoreForm/; src/utils/validateLogin.ts e validateRegistration.ts` | Inputs textuais têm maxLength; OTP tem 1 dígito/slot, UF tem conjunto fixo e foto limite de 1 MB. Porém login sanitiza com slice antes de validar, então entradas programáticas longas são truncadas sem erro específico; passwordConfirmation não tem validação explícita de máximo; registrationId vindo do storage não é limitado. |
| Exibir mensagem de erro específica para cada campo. | **Em andamento** | `src/components/FormInput/; StoreStateSelect/; StorePhotoPicker/; src/pages/VerifyRegistrationPage/` | Login/cadastro/lojas possuem mensagens por campo e aria-invalid/describedby. OTP não expõe erro por slot/formato em utils: incompleto apenas desabilita envio, erro remoto é geral. A confirmação de senha cobre vazio/divergência, mas não erro próprio de tamanho máximo. |
| Implementar validações em `src/utils/`. | **Cumprido** | `src/utils/validate*.ts` | Validações de login, cadastro, loja e dashboard concentradas em utils. |
| Garantir que nenhum dado seja enviado ao serviço sem passar por uma função de validação tipada. | **Em andamento** | `src/hooks/useLogin.ts: execute; useRegistration.ts: execute; useStoreForm.ts: submit; useVerifyRegistration.ts: execute; src/services/auth.service.ts` | Login/cadastro passam por validadores antes do serviço; lojas valida no hook e novamente em createStore/updateStore. verifyRegistration recebe payload diretamente sem função validadora em utils; o filtro de dígitos na página não satisfaz a regra. Renovação de sessão envia refreshToken carregado com guard estrutural superficial, sem validação tipada do payload. |

### Rotas privadas

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Criar um componente `PrivateRoute`. | **Cumprido** | `src/components/PrivateRoute/index.tsx` | Componente guarda layout/rotas privadas. |
| Redirecionar usuários não autenticados para a página de login. | **Cumprido** | `src/components/PrivateRoute/index.tsx`, `src/App.tsx` | Usuários não autenticados são enviados ao login. |
| Controlar o estado de autenticação por Context. | **Cumprido** | `src/contexts/AuthContext/index.tsx` | Context mantém status de autenticação e sessão. |
| Não verificar autenticação diretamente dentro dos componentes de página. | **Cumprido** | `src/App.tsx`, `src/components/PrivateRoute/` | Checagem centralizada na rota privada/context, não no corpo das páginas. |

### Acessibilidade avançada — WCAG 2.1 nível AA

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Implementar componente interativo complexo, como modal, menu ou abas. | **Cumprido** | `src/components/Modal/`, `EditStoreModal/`, `DeleteStoreModal/` | Diálogos nativos acessíveis para editar/excluir lojas. |
| Utilizar corretamente `aria-expanded`. | **Cumprido** | `src/components/DashboardChartCard/index.tsx` | Botão expandir dados sincroniza atributo com estado. |
| Utilizar corretamente `aria-controls`. | **Cumprido** | `src/components/StoresFilters/index.tsx`: loading; `src/pages/StoresPage/index.tsx`; `src/components/DashboardChartCard/index.tsx` | StoresPage passa loading aos filtros. Enquanto a tabela não existe, aria-controls é omitido; após a carga aponta para stores-table. O botão Ver dados continua referenciando uma div persistente, com aria-expanded sincronizado. Ação de filtrar não foi alterada. |
| Utilizar corretamente `aria-haspopup`. | **Cumprido** | `src/components/StoresTable/index.tsx` | Ações de editar/excluir indicam abertura de diálogo. |
| Utilizar corretamente `aria-selected`. | **Não atendido** | `src/components/Navbar/index.tsx`, `PlanCard/index.tsx` e demais componentes interativos | A navegação usa NavLink/aria-current e os planos usam aria-pressed em botões; não há componente com padrão de abas, listbox ou outro item selecionável que implemente aria-selected. Esses atributos existentes não substituem o requisito explícito da avaliação. |
| Mover o foco programaticamente para o elemento correto ao abrir um componente interativo. | **Cumprido** | `src/hooks/useDialog.ts`; `src/components/Modal/index.tsx` | Hook usa showModal e foca data-initial-focus ou primeiro campo/botão. Confirmado em execução: edição aberta com Enter colocou foco no campo name. Contenção de Tab/Shift+Tab implementada no hook. |
| Devolver o foco ao elemento de origem ao fechar um componente interativo. | **Cumprido** | `src/hooks/useDialog.ts` | Cleanup fecha diálogo, restaura overflow e devolve foco à origem conectada ou ao título fallback. Confirmado no preview: Escape fechou edição e restaurou foco ao botão Editar da mesma loja. |
| Incluir o landmark `<header>` em todas as páginas. | **Em andamento** | `src/pages/NotFoundPage/index.tsx; demais páginas e PortalHeader` | Erro 404 não tem header. Telas de autenticação têm header na marca; planos têm header próprio; rotas privadas têm PortalHeader e cabeçalhos locais. |
| Incluir o landmark `<main>` em todas as páginas. | **Cumprido** | `src/pages/LoginPage/index.tsx`, `RegisterPage/index.tsx`, `VerifyRegistrationPage/index.tsx`, `PlansPage/index.tsx`; `src/App.tsx`; `src/components/PrivateRoute/`, `RootRedirect/` | A seção de formulário de login/cadastro/verificação tornou-se main, preservando classes e layout. As outras sete páginas já têm main. Loading de planos/verificação, Suspense e guards de autenticação também usam main; os retornos null durante redirecionamento continuam sem conteúdo de página. |
| Incluir o landmark `<nav>` em todas as páginas. | **Em andamento** | `src/components/PortalLayout/index.tsx e Navbar/index.tsx; src/pages/CreateStorePage/index.tsx` | Cinco páginas privadas recebem nav da sidebar; criação tem breadcrumbs adicionais. Login, cadastro, verificação, planos públicos e 404 não têm nav: links soltos não criam landmark. |
| Incluir o landmark `<footer>` em todas as páginas. | **Em andamento** | `src/pages/DashboardPage/index.tsx; StoresPage/index.tsx; src/components/StoreForm/index.tsx; demais páginas` | Dashboard e lojas possuem footer de feedback; criação herda footer das ações do formulário. Login, cadastro, verificação, planos públicos/privados, relatórios e 404 não têm footer de página; footer de card não equivale a rodapé global. |
| Demonstrar navegação ao vivo com leitor de tela (NVDA ou VoiceOver), sem perda de contexto ou armadilhas de foco. | **Não atendido** | Apresentação com NVDA/VoiceOver | Requer teste ao vivo; não verificável no repositório. |

## Checklist final obrigatório

| Verificação final | Status | Onde exatamente | Como foi verificado / evidência |
| --- | --- | --- | --- |
| Verificar item por item todos os requisitos mínimos antes de considerar a implementação concluída. | **Cumprido** | Seção “Requisitos mínimos para nota 7,0” deste documento; arquivos e funções indicados em cada linha; registro de ESLint, TypeScript e build em “Verificações executadas”. | A auditoria de todos os itens mínimos foi concluída: cada requisito tem classificação, localização e evidência. Foram confirmados estrutura, props, dependências de efeitos, chaves de listas, serviços e navegação; as falhas encontradas estão descritas nas linhas correspondentes. Este item avalia a realização da conferência; os requisitos de implementação que falharam continuam com seus próprios estados. |
| Verificar item por item todos os requisitos extras antes de considerar a implementação concluída. | **Cumprido** | Seção “Requisitos extras — até nota 10,0” deste documento; contextos, hooks, reducers, persistência, validadores e componentes referenciados em cada linha. | A auditoria de todos os itens extras foi concluída. Foram examinados os contratos de Context/reducers, cancelamento, schema versionado, memoização, renderização de conteúdo externo, formulários, proteção de rotas e ARIA. A conferência identificou exceções concretas e distinguiu as demonstrações presenciais; a existência dessas pendências não deixa a auditoria do código em andamento. |


## Evidências complementares da revisão

### Pendências de auditoria encerradas

A revisão abaixo já foi realizada. Estes requisitos não aguardam mais auditoria de código e estão marcados como **Cumprido** nas tabelas:

- **Pastas individuais e index.tsx:** conferidos os 25 componentes, 10 páginas e 2 Providers.
- **Interfaces de props:** conferidos todos os componentes que recebem propriedades; componentes sem props não exigem interface vazia.
- **Dependências dos efeitos:** lidas as closures e seus arrays; ESLint de src concluído sem erros.
- **Chaves das listas:** conferidas as listas de lojas, planos, benefícios, UFs, gráficos e tabelas; os índices do OTP correspondem a slots fixos.
- **Botões, labels e imagens:** lido todo o JSX das páginas e componentes; ações, associações htmlFor/id e atributos alt estão descritos nas respectivas linhas.
- **Histórico Git:** conferidos os 73 commits, incluindo 53 sem merges, com atividade por mais de quatro semanas. As exceções de mensagens convencionais/genéricas estão identificadas separadamente.
- **useCallback e useMemo:** identificados os consumidores memoizados e os cálculos preservados; o requisito separado de demonstração no Profiler continua pendente.
- **Proteção de renderização contra XSS:** conferidos os destinos JSX, o renderer de tooltip e os formatos de imagem aceitos. As lacunas de validação estrutural de respostas estão identificadas em seu próprio requisito.
- **Conferência final dos requisitos mínimos e extras:** concluída e marcada como **Cumprido**. Auditar o projeto e encontrar falhas não significa que a auditoria esteja incompleta.


### Percursos analisados

| Percurso | Arquivos e encadeamento verificado | Conclusão adicional |
| --- | --- | --- |
| Login e sessão | LoginPage → useLogin → validateLogin/toLoginPayload → auth.service.login → apiClient; token → coreClient → profile.service → AuthContext → PrivateRoute/PortalLayout | Formulário valida antes de enviar. Perfil/tokens usam assertion de tipo sem parser. AuthContext restaura/salva sessão e compartilha perfil sem repassá-lo por toda a árvore. |
| Cadastro e planos | RegisterPage → validateRegistrationFormData → registrationStorage → PlansPage → useRegistration → validateRegistrationForm/toRegistrationPayload → startRegistration → armazenamento de registrationId | CNPJ do cadastro verifica formato, não dígitos verificadores; validatePlanId só rejeita negativos. Rascunho persiste senha em texto no armazenamento local e o guard não valida sua estrutura interna. São riscos adicionais, não prova de XSS por renderização. |
| Verificação | VerifyRegistrationPage → digits/otp → useVerifyRegistration → verifyRegistration → perfil → AuthContext → redirecionamento | Falta validador tipado de OTP/registrationId antes do serviço. Campos saem do DOM durante loading e o sucesso não tem mensagem própria no DOM. Colagem sem dígitos na primeira posição pode calcular activeIndex=-1; não há guard explícito desse índice. |
| Coleção e CRUD de lojas | PortalLayout → StoresProvider → useStoreCollection → stores.service → validateStore/storeStorage; StoresPage → useStores → storeFilters → StoresTable; criação/edição → useStoreForm; diálogos → useStoreDialogs/useDialog | Providers eliminam prop drilling entre layout e páginas. Coleção/reducer centraliza carga, salvamento e feedback. Formulário valida antes de chamar onSave e serviços revalidam. Dados são locais, não CRUD remoto. |
| Foto da loja | StorePhotoPicker → useStorePhoto → readStorePhoto → FileReader → StoreForm → validateStore | MIME, tamanho, assinatura e cancelamento estão implementados; sem upload remoto. Somente PNG/JPEG/WebP são permitidos, excluindo SVG/HTML. |
| Dashboard | DashboardPage → useDashboard → dashboard.service/toValidatedDashboard e geography.service → useDashboardCharts/buildDashboardCharts → cards → useDashboardChart/chartEngine | Dados demonstrativos validados, sete modelos e tabelas alternativas. Tooltip usa richText/SVG, sem HTML externo. Região de gráfico é focável e tabela expõe os mesmos valores. |
| Rotas e layouts | main → BrowserRouter → App/AuthProvider/Suspense → PrivateRoute/RootRedirect/PortalLayout | Guards são componentes, páginas não verificam login diretamente. Todas as dez páginas usam lazy após a refatoração. /relatorios só contém título; atualização de plano só altera seleção local, sem envio ao backend. |

### Cobertura dos arquivos próprios

A leitura cobriu os 85 arquivos `.ts`/`.tsx` de `src/`: 25 componentes, 10 páginas, 2 contextos, 14 hooks, 8 arquivos de serviços, 7 arquivos de tipos, 14 utilitários, 2 mocks, `App.tsx`, `main.tsx` e `vite-env.d.ts`. Incluiu as assinaturas, corpos das funções, JSX, efeitos, consumers e caminhos de erro/cancelamento, não apenas a presença de palavras-chave.

Também foram examinados os 23 arquivos CSS que estavam em `src/` (agora movidos para `styles/`), `styles/dashboard.css`, a configuração Vite/TypeScript/ESLint, o HTML de entrada, `package.json`, README, `.env.example`, regras de ignore, pipeline CI, Dockerfile, manifesto Kubernetes e a documentação da malha local. `node_modules`, caches e `dist` são dependências/saídas geradas, não implementação própria a auditar linha por linha. Os arquivos visuais foram conferidos por seus usos, atributos e formatos. A garantia do contraste do slogan agora decorre do scrim de 65% calculado para uma fotografia inteiramente branca, sem depender de medir cada pixel da foto.

### Verificações executadas

| Verificação | Resultado e limite |
| --- | --- |
| ESLint de `src` | `node node_modules/eslint/bin/eslint.js src`: exit code 0. Corrobora a leitura de tipos e dependências dos hooks. |
| Compilação TypeScript | `node node_modules/typescript/bin/tsc -b`: exit code 0. O tsconfig atual não habilita strict; compilar não valida payloads em runtime. |
| Build de produção | `node node_modules/vite/bin/vite.js build`: concluído, 731 módulos transformados. Primeiro bloqueado pelo ambiente com spawn EPERM, depois executado com a permissão apropriada. O bundle de gráfico tem cerca de 661 kB e gera aviso de tamanho, sem falhar o build. |
| Divisão em chunks | Novo build gera chunks separados para as dez páginas, incluindo RegisterPage e VerifyRegistrationPage, e para gráfico/malha. Isto comprova divisão de bundle; a demonstração Network continua sendo presencial. |
| Contraste de cores sólidas | Cálculo sRGB com linearização dos canais e razão (Lmaisclaro + 0,05)/(Lmaisescuro + 0,05). Após correção, hovers medidos em 5,62:1 e 5,89:1. Scrim do slogan garante mínimo conservador de 6,30:1 sobre a foto. Não foi usada somente comparação visual. |
| Histórico | Lidos os 73 títulos e datas do histórico alcançável do HEAD; 53 commits sem merge, 50 destes com prefixo convencional. Evidências de semanas e exceções estão nas linhas correspondentes. |
| Navegador e teclado | Preview de produção conferido em localhost:8080: login real concluído, dashboard, tabela alternativa aberta com Enter, lojas, edição aberta com Enter/fechada com Escape e retorno de foco ao botão de origem; planos e cadastro carregados. Login também conferido nas larguras padrão e 1280px; imagens carregadas e um main por página inspecionada. Nenhum dado de loja foi salvo/excluído. Isso não substitui a navegação completa de todos os fluxos. |
| Leitor de tela, apresentação e Profiler | Não executados. Demonstração Network ao vivo e verificação de todos os percursos com leitor de tela continuam pendentes nos itens próprios. |

### Condição de desenvolvimento desde o início

| Requisito | Status | Onde exatamente | Como foi avaliado |
| --- | --- | --- | --- |
| Construir o projeto já seguindo as regras, sem apenas adaptá-lo posteriormente para a avaliação. | **Em andamento** | Histórico: `9f7b937` em 28/09/2026 e estado atual de `src/` | O commit de refatoração introduz componentes com responsabilidade única e campo acessível após o início do projeto. O estado atual ainda tem requisitos ausentes. Não é possível afirmar que todas as regras foram adotadas desde a criação; a documentação registra o estado atual e evidências históricas disponíveis. |

## Refatoração pontual aplicada

Em 30/10/2026 foram realizados ajustes de estrutura, imports, semântica, ARIA e estilos:

- Movidos 23 arquivos CSS e 14 imagens para `styles/` e `assets/`, mantendo componentes/páginas em suas pastas com `index.tsx` e corrigindo imports e URLs.
- Convertidas as duas páginas restantes para `lazy`; `Suspense` segue compartilhado e as rotas permanecem as mesmas.
- Adicionado `main` aos formulários de autenticação e aos fallbacks de carregamento. O seletor global `main` do CSS de planos foi limitado a `.plansPage > main`, evitando vazamento de layout entre páginas.
- Corrigidos contraste em hover, contraste do slogan e outline do título do dashboard.
- Corrigido `aria-controls` enquanto a tabela de lojas não está no DOM; SVGs decorativos dos planos foram retirados da árvore de acessibilidade.
- Removida a memoização redundante de erros no login e organizado o import de tipo da legenda.

Essas alterações não criam rotas, abas, endpoints ou novos fluxos de negócio. Agrupamento dos estados assíncronos, validação de OTP, schemas de respostas e mudanças de autenticação permanecem fora desta rodada por exigirem mudanças de lógica.

Validação após a refatoração: ESLint de `src` e TypeScript passaram; build Vite concluído com dez chunks de página e 731 módulos. As 14 imagens mantêm o conteúdo original (considerando apenas normalização de finais de linha dos SVGs) e todos os imports/URLs relativos de CSS e imagens resolvem para arquivos existentes.

Conferência no navegador após a refatoração: autenticação real funcionou em `http://localhost:8080`. O preview inicial em outra origem falhou ao conectar; usou-se a origem permitida pelo backend, sem alteração de CORS ou autenticação. Credenciais e tokens não foram registrados nesta documentação.
