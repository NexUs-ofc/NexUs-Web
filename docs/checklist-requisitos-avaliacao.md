# Checklist de requisitos da avaliação

**Revisão vigente: NI-550/refino-requisitos — 01/11/2026.** As linhas de requisitos e a contagem abaixo são atuais. Seções anteriores datadas são registros históricos.

Revisão aprofundada em 30/10/2026, sobre o commit `0a1aef4` e a árvore de trabalho atual. Cada requisito tem seu estado e suas evidências atualizados na própria linha. **Cumprido** significa confirmado no código; **Em andamento** indica implementação parcial ou validação ainda pendente, sem presumir trabalho ativo; **Não atendido** indica recurso ausente, falha comprovada ou demonstração ainda sem evidência. A inspeção de código não substitui a apresentação presencial nem certifica WCAG integralmente.

Atualizado após a refatoração pontual de 30/10/2026: CSS/imagens movidos para fora de `src`, dez páginas com `lazy`, contraste corrigido, `<main>` nas telas de autenticação e referências ARIA consistentes durante loading. Em 30/10/2026, foi adicionada configuração de rewrite da Vercel para deep links da SPA; o efeito no domínio publicado depende de deploy e ainda precisa ser confirmado.
Atualizado em 31/10/2026: filiais integradas ao core autenticado, com CRUD remoto, consulta individual e upload/remoção de imagem. As evidências e limitações desta integração estão na seção “Integração de filiais ao core”. Os demais resultados da auditoria de 30/10 permanecem com seus próprios estados.


**Estado atual dos 108 itens:** 98 cumpridos; 5 em andamento; 5 não atendidos. Contagem das linhas atuais após a revisão NI-550 em 01/11/2026.

Atualização final em 01/11/2026: edição por `/lojas/editar/:id` cobre os três requisitos de useParams, presença do ID e tratamento de undefined. O header compartilhado permanece no topo em todas as páginas do portal por `position:sticky`, `inset-block-start:0` e camada própria, sem sobrepor o fluxo do formulário. Verificado em navegador com página longa e componentes reais: após rolar 1.088px, headerTop permaneceu em 0 e altura em 80px. Dashboard e planos mantêm suas áreas internas de rolagem. Essa correção visual não altera a contagem dos requisitos nem comprova acessibilidade integral. A evidência atual substitui referências históricas ao modal de edição, às dez páginas e aos três requisitos de rota ainda ausentes: agora são onze páginas lazy; a exclusão de filial permanece em diálogo; o perfil da empresa também utiliza diálogo na PR #24.

## Perfil da empresa e planos — 01/11/2026

Atualização baseada na [PR #22](https://github.com/NexUs-ofc/NexUs-Web/pull/22) (filiais e autocomplete), na [PR #23](https://github.com/NexUs-ofc/NexUs-Web/pull/23) (cadastro e troca de planos) e na [PR #24](https://github.com/NexUs-ofc/NexUs-Web/pull/24) (popup de perfil, ainda em revisão). As PRs #22 e #23 estão mergeadas na main, incorporada à branch do perfil pelo commit `8cbcbff`. Esta seção descreve o código desta branch; não afirma que a PR #24 já foi mergeada ou publicada.

| Entrega | Evidência atual e limites |
| --- | --- |
| Popup de perfil | `PortalHeader → PortalLayout → ProfileModal/ProfileForm`: clicar na foto/identidade abre dialog nativo; fechamento por botão, Cancelar ou Escape com retorno do foco. `useProfileEditor` envia PATCH `/api/profile`, atualiza o AuthContext e a persistência existente da sessão. Campos incluem nome, telefones com máscara e endereço. |
| Foto e salvamento parcial | `useProfilePhoto` valida PNG/JPEG/WebP até 5 MB e 16 megapixels. `profile.service.ts` envia PUT multipart ou DELETE em `/api/profile/image`. Dados e imagem são operações distintas; falha na foto após salvar dados conserva o resultado parcial. Save tem limite de 30 segundos, cancelamento na desmontagem e mensagem de erro no DOM. Upload remoto com a conta real ainda precisa ser conferido. |
| CNPJ e tag do plano | `useCompanyDetails → plans.service.getCompany → coreClient` consulta GET `/api/companies/me` apenas para perfil COMPANY. CNPJ é formatado e somente leitura; `CompanyPlanBadge` usa planName para Ceris, Enterprise e Exclusive. Há loading, retry, cancelamento e limite de espera de 15 segundos. Tipagem Company e consulta são compartilhadas com a integração da PR #23; não há serviço duplicado de empresa. |
| Autocomplete compartilhado | O hook `useStoreAddress` da PR #22 foi generalizado para `useAddressLookup`, consumido por `useStoreForm` e `useProfileForm`. Ambos usam `address.service.ts`, `PostalAddress` e `validateAddress.ts`. Removidos `useCepLookup.ts`, `cep.service.ts` e `types/cep.ts`. Busca após oito dígitos e 300 ms; limpa endereço na troca do CEP e ignora respostas canceladas. Rua/bairro/cidade/UF ficam bloqueados durante busca e após sucesso, número é manual; CEP inexistente ou incompleto bloqueia salvar. |
| Catálogo e cadastro de planos (#23) | `plans.service.getPlans` consulta GET público `/api/plans` sem credenciais. `toValidatedPlans` valida IDs, nomes, preços e duplicatas; combina IDs/preços reais com a apresentação de `config/plans.ts`. `PlansPage` só aceita seleção presente no catálogo recebido e envia o planId no cadastro. `validatePlanId` exige inteiro seguro positivo. Loading, erro, retry e catálogo vazio têm estados no DOM. |
| Troca do plano (#23) | `UpdatePlansPage → useCompanyPlan` consulta catálogo/empresa e envia PATCH autenticado `/api/companies/me/plan` com planId. Impede chamadas simultâneas ou seleção do plano atual; atualiza pelo retorno do servidor, confere o ID confirmado e apresenta sucesso/erro. Plano atual indisponível no catálogo tem aviso próprio. Não foi feita contratação real nesta revisão. |
| Verificações desta revisão | `npm test`: 25 testes passaram com HTTP interceptado, cobrindo CEP/filiais. `npm run lint` e `npm run build` passaram; 776 módulos no build e aviso existente do gráfico (~661 kB). No navegador local, perfil com HTTP simulado confirmou oito dígitos, preenchimento/bloqueio, número preservado, troca concorrente, CEP inexistente/genérico, retry e ausência de credenciais no ViaCEP. A suíte não mede coverage nem comprova 80%; o roteiro de navegador não é teste unitário. |
| Limites e estados globais | Mantidos 81 cumpridos, 19 em andamento e 8 não atendidos (108 requisitos). Esta entrega acrescenta evidências sem encerrar pendências globais de OTP, schemas de perfil/autenticação/empresa, persistência de senha no rascunho, publicação, WCAG integral ou demonstrações presenciais. CNPJ/plano/foto/salvamento real do perfil e contratação real não foram validados no ambiente remoto nesta revisão. |

## Integração de filiais ao core — 31/10/2026

O fluxo mantém `services → hooks → Context → componentes/páginas`, sem acesso HTTP nos componentes. Os estados globais dos requisitos acima não foram promovidos por esta entrega: os itens parciais de validação, apresentação e acessibilidade ainda têm pendências fora de filiais.

| Entrega | Evidência atual e limites |
| --- | --- |
| Dados reais e autenticação | `stores.service.ts` usa `coreClient`/`apiClient` em `https://ceris-core.discloud.dev` (configurável por `VITE_CORE_API_BASE_URL`), com o Bearer e os cookies da sessão do perfil. Removidos `src/mocks/stores.ts` e `src/utils/storeStorage.ts`; não há fallback local em erro. |
| CRUD e consulta individual | GET/POST na coleção `/api/companies/me/stores`; GET/PATCH/DELETE em `/{id}`. Endpoint de edição corrigido em 01/11/2026 conforme informado pelo usuário: PATCH identifica a filial pelo ID no caminho, mantendo CNPJ no corpo. Teste de contrato confere `/stores/42`. `useStoreDetails` carrega a filial antes de editar; `useStoreCollection` só atualiza a coleção após confirmação do core. DELETE aceita 204. |
| Formulário e contrato | Rua, número e bairro separados; nome, CNPJ, rua/endereço e e-mail do cadastro são obrigatórios. E-mail e responsável não são enviados no PATCH. Telefone único na UI vira `phones: [telefone]`, sem máscara no payload; CNPJ e CEP também são enviados em dígitos. Abertura/fechamento recebem máscara `HH:mm` e rejeitam horas/minutos fora da faixa. Horários são opcionais e admitem turno noturno. |
| Campos ausentes na leitura | O contrato informado não inclui CEP/telefones nas respostas. Se vierem, o parser os valida; valores confirmados no salvamento podem ser reaproveitados durante a sessão. Sem valor, CEP/telefone são omitidos do PATCH em vez de enviar vazios. O usuário indicou que acredita haver suporte à omissão; a aceitação e a preservação desses campos ainda precisam ser confirmadas no core real. |
| Imagens e resultado parcial | PUT `/{id}/image` usa `multipart/form-data`, chave `file`, sem Content-Type manual; DELETE usa o mesmo caminho. Resposta `profileImageUrl` atualiza `storeImageUrl`. MIME, tamanho e assinatura são revalidados antes do upload. Se a imagem falhar após salvar os dados, a filial permanece na coleção e um aviso pede nova tentativa pela edição, evitando repetir o POST. |
| Dados externos e cancelamento | Respostas chegam como `unknown` a `parseStore/parseStores/parseStoreImageResponse`. Validam campos usados, IDs, duplicatas, horários e URLs de imagem HTTP/HTTPS. AbortSignal atravessa serviço/cliente; hooks ignoram respostas canceladas após desmontagem e bloqueiam mutações simultâneas. |
| Acessibilidade do fluxo alterado | Labels, erros por campo, aria-invalid/describedby, fieldset desabilitado ao salvar, loading/sucesso/aviso no DOM. Na edição assíncrona, Cancelar e Tentar novamente usam o rodapé de ações e estilos do próprio Modal desde loading/erro, com altura mínima de 44px, sem depender da montagem do formulário (correção em 01/11/2026). Conferidos no navegador com consulta pendente e erro simulados: botões estilizados de 44px, foco visível e Cancelar funcional; TypeScript e ESLint do componente passaram. Ao montar o formulário, o foco vai ao nome. Mantidos diálogo nativo, Escape e retorno de foco. |
| Verificações executadas | `node --test tests/stores.test.mjs`: **15 testes passaram**, com HTTP interceptado; TypeScript e ESLint do projeto passaram; build Vite concluído com 733 módulos e aviso já existente do chunk de gráfico (~661 kB). Nenhuma dependência de testes adicionada. |
| Conferência no navegador | Formulário isolado com os componentes reais: digitação `0800` → `08:00`, colagem `1830` → `18:30`, campo único de telefone, mensagens dos campos obrigatórios e foco no primeiro erro; edição abriu com foco no nome e campos de endereço/horário presentes. A página temporária de conferência foi removida. Não foram gravados dados no core. |
| Validação ainda pendente | GET, POST e PATCH autenticados foram confirmados no core durante a criação e redistribuição das dez filiais. Ainda faltam DELETE real, preservação de telefone omitido, upload/remoção de imagem (inclusive 10 MB) e CORS no fluxo completo do navegador. O core rejeitou telefone nacional em dígitos; o formato aceito precisa ser confirmado antes de considerar esse campo integrado. Testes locais de contrato e UI não comprovam esses comportamentos no ambiente remoto. Não foi realizada nova auditoria WCAG integral nem apresentação presencial. |

## Requisitos mínimos para nota 7,0

### Autocomplete de endereço por CEP — 01/11/2026

Implementado em `address.service.ts → useAddressLookup → useStoreForm → StoreForm`, tanto no cadastro quanto na edição. O contrato foi conferido na [documentação oficial do ViaCEP](https://viacep.com.br/); o comportamento para CEP genérico foi confirmado pelo usuário: pedir um CEP válido, sem aceitar endereço incompleto.

| Entrega | Evidência atual e limites |
| --- | --- |
| Consulta isolada e configuração | `src/services/address.service.ts` consulta GET `/ws/{cep}/json/` pelo `apiClient`, com `credentials:omit` e sem Authorization/X-API-KEY. Host configurável em `VITE_VIACEP_API_BASE_URL`, tipado em `vite-env.d.ts` e incluído em `.env.example`. GET sem corpo não envia Content-Type, evitando preflight desnecessário; JSON/multipart do core mantêm seus contratos. |
| Formato e dados externos | `src/types/address.ts` define PostalAddress; `src/utils/validateAddress.ts` valida os oito dígitos antes da rede e reconstrói a resposta unknown. Confere correspondência do CEP, tipos, limites, município, UF, rua e bairro. `erro:true` e retorno incompleto viram mensagem no campo CEP. Número não é inferido pela API. |
| Preenchimento e bloqueio | `useStoreForm` aplica rua, bairro, cidade e estado ao estado tipado; `FormInput` e `StoreStateSelect` recebem disabled durante a consulta e após sucesso. Valores bloqueados continuam no payload porque o salvamento usa o estado React. CEP e número permanecem editáveis. A obrigatoriedade dos demais campos existentes não foi ampliada. |
| Concorrência e cancelamento | `useAddressLookup` aguarda 300 ms após completar os oito dígitos. Cleanup limpa o timer e aborta o transporte; respostas canceladas são ignoradas. Trocar o CEP invalida o resultado e limpa o endereço anterior, inclusive ao voltar a um CEP já consultado. |
| Loading, erros e teclado | `role=status` anuncia busca/preenchimento, erro é associado ao CEP via aria-invalid/describedby e o botão de salvar fica bloqueado durante busca/erro. Submit também verifica esse estado no hook. Nova tentativa retorna o foco ao CEP; desabilitação tem aparência própria com texto legível. CEP sem rua/bairro pede um CEP válido e impede salvar. |
| Conferência de interface | No navegador, consulta real de `01001-000` preencheu Praça da Sé/Sé/São Paulo/SP no cadastro e na edição, bloqueando os quatro campos e mantendo número manual. Salvamento local confirmou os valores bloqueados no payload. Respostas simuladas comprovaram erro de CEP genérico/inexistente, retry, resposta antiga ignorada após trocar CEP e nova busca ao voltar ao CEP anterior. A página temporária foi removida; nenhum dado foi gravado no core. |
| Validação final | `node --test tests/*.test.mjs`: **23 testes passaram** (oito de CEP e 15 de regressão das filiais). TypeScript e ESLint do projeto passaram. Build Vite concluído com 736 módulos; permanece o aviso anterior do chunk de gráfico (~661 kB). As suítes usam HTTP interceptado e não adicionam dependências. |

Os requisitos globais parcialmente atendidos continuam com o mesmo estado: esta entrega acrescenta evidências ao fluxo de filiais, sem declarar auditoria completa das outras funcionalidades.

### Projeto e organização

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Criar o projeto utilizando Vite + React + TypeScript. | **Cumprido** | `package.json`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx` | Dependências e scripts Vite/React/TypeScript presentes; build executa `tsc -b && vite build`. |
| Todos os arquivos dentro de `src/` devem possuir extensão `.tsx` ou `.ts`. | **Cumprido** | `src/`; `styles/`; `assets/` | Inventário desta branch em 01/11/2026: 88 arquivos .ts e 51 .tsx. Estilos ficam em styles e imagens em assets; perfil, planos e autocomplete seguem a estrutura. |
| Não utilizar `.js` ou `.jsx` dentro de `src/`. | **Cumprido** | `src/` — inventário dos 139 arquivos | 88 arquivos .ts e 51 .tsx; não há .js, .jsx, CSS nem imagens em src. |
| Organizar componentes em `src/components/`. | **Cumprido** | `src/components/` | Componentes de interface estão agrupados nessa pasta. |
| Organizar páginas em `src/pages/`. | **Cumprido** | `src/pages/` | Páginas de login, cadastro, lojas, planos, dashboard e erro estão agrupadas nessa pasta. |
| Cada componente deve estar em sua própria pasta e conter `index.tsx`. | **Cumprido** | `src/components/*/index.tsx`; `src/contexts/*/index.tsx` | 36 componentes e dois Providers com pasta própria e index.tsx; inclui ProfileModal, ProfileForm, ProfileAddressForm, ProfilePhotoPicker e CompanyPlanBadge. |
| Cada página deve estar em sua própria pasta e conter `index.tsx`. | **Cumprido** | `src/pages/*/index.tsx` | Onze páginas em diretórios próprios com index.tsx; EditStorePage foi adicionada pela PR #22. Perfil abre em componente de diálogo e não acrescenta página. |
| Aplicar consistentemente a convenção de pastas e arquivos em todo o projeto. | **Cumprido** | `src/components/`, `src/pages/`, `src/contexts/`, `styles/`, `assets/` | 36 componentes, 11 páginas e dois Providers seguem pasta individual/index.tsx. CSS e imagens ficam fora de src; tipos, hooks e serviços têm arquivos de domínio. |

### Componentes e tipagem

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Criar no mínimo 6 componentes, cada um com responsabilidade única. | **Cumprido** | `src/components/`; componentes de perfil e CompanyPlanBadge | 36 componentes de UI. Perfil separa diálogo, formulário, endereço, foto e tag; lógica assíncrona fica nos hooks e serviços. As exceções globais de separação continuam no requisito seguinte. |
| Não misturar renderização, lógica de negócio ou acesso a `src/services/` em componentes. | **Cumprido** | `src/hooks/useAuthSession.ts`, `useLoginForm.ts`, `useRegisterForm.ts`, `useVerificationForm.ts`, `usePlansPage.ts`, `useStoresPage.ts`, `useCreateStorePage.ts`, `useEditStorePage.ts` | Revisão NI-550: restauração/persistência e serviços saíram do AuthProvider; validação, submissão e orquestração das páginas foram movidas para hooks. Busca global em components/pages/contexts não encontra imports de services nem fetch. Componentes mantêm estado e efeitos de apresentação. |
| Criar interfaces TypeScript para as props de todos os componentes. | **Cumprido** | `src/components/*/index.tsx; src/contexts/AuthContext/index.tsx: AuthProviderProps; src/contexts/StoresContext/index.tsx: StoresProviderProps` | Todos os componentes que recebem props declaram interface própria, inclusive os wrappers memoizados. PortalLayout, RootRedirect, App e páginas não recebem props e não precisam de interface vazia. renderInput e field são helpers de renderização, não componentes adicionais. |
| Criar interfaces para entidades do domínio em `src/types/`. | **Cumprido** | `src/types/` | Tipos por domínio incluem `store.ts`, `registration.ts`, `profile.ts`, `dashboard.ts` e `auth.ts`. |
| Organizar os tipos por arquivo de domínio. | **Cumprido** | `src/types/` | Arquivos separados por autenticação, perfil, lojas, cadastro e dashboard. |
| Não utilizar `any` em `src/`. | **Cumprido** | `src/types/; src/hooks/; src/services/; src/utils/; componentes e páginas` | Leitura das assinaturas, estados, handlers, parsers e assertions confirmou tipos explícitos/inferidos, Record<string, unknown> e unknown, sem any. Isso não elimina os casts sem validação de runtime documentados em segurança. |

### Serviços, estado e efeitos

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Isolar toda comunicação com APIs externas em `src/services/`. | **Cumprido** | `apiClient.ts`; `coreClient.ts`; `auth.service.ts`; `profile.service.ts`; `stores.service.ts`; `address.service.ts`; `plans.service.ts`; serviços de relatórios | Perfil e filiais usam cliente autenticado; ViaCEP e catálogo público de planos omitem credenciais. Componentes delegam a hooks. O serviço duplicado de CEP foi removido. |
| Criar arquivos de serviço separados por recurso. | **Cumprido** | `src/services/auth.service.ts`, `stores.service.ts`, `profile.service.ts`, `geography.service.ts`, `dashboard.service.ts` | Módulos separados por recurso. |
| Tipar os retornos dos serviços como `Promise<Tipo>`. | **Cumprido** | `src/services/apiClient.ts; coreClient.ts; auth.service.ts; profile.service.ts; dashboard.service.ts; geography.service.ts; stores.service.ts` | Todos os métodos assíncronos declaram Promise<T>: tokens, cadastro, perfil, dashboard, mapa string e, em filiais, Store[], Store, StoreImageResponse ou void. Auxiliares síncronos também são tipados. |
| Utilizar `try/catch` nos serviços. | **Cumprido** | `src/services/apiClient.ts`; `coreClient.ts`; serviços de recursos | Clientes compartilhados tratam HTTP, conexão e cancelamento. Recursos adicionam erros específicos/parsers quando necessário; mutações do perfil e changeCompanyPlan delegam a captura ao coreRequest. Não há try/catch local redundante em cada wrapper. |
| Não utilizar `fetch` diretamente em componentes ou páginas. | **Cumprido** | `src/services/apiClient.ts: apiRequest; páginas/componentes → hooks` | Leitura dos imports e chamadas de todas as páginas/componentes confirmou delegação ao hook/context. O transporte HTTP está apenas no apiRequest. |
| Manter chaves e URLs privadas em variáveis de ambiente, sem versioná-las. | **Cumprido** | `src/services/auth.service.ts: AUTH_API_BASE_URL/AUTH_API_KEY; src/services/coreClient.ts: CORE_API_BASE_URL; .env.example; .gitignore` | Configuração atual aceita pelo usuário em 01/11/2026 após esclarecimento: usa import.meta.env, .env ignorado e não rastreado. URLs públicas e valores padrão não comprovam exposição de segredo. Mantidos os valores existentes; VITE_* é configuração pública do navegador e não deve conter segredos de backend. |
| Gerenciar estado local com `useState`. | **Cumprido** | `src/hooks/`, `src/contexts/`, páginas | Estado local implementado com useState e estado compartilhado por Context/reducer. |
| Agrupar campos de estado relacionados em um único objeto. | **Cumprido** | `src/hooks/useLogin.ts`, `useRegistration.ts`, `useVerifyRegistration.ts`, `usePlans.ts`, `useCompanyPlan.ts`, hooks de formulário e `PortalLayout` | Revisão NI-550: loading/erro/sucesso/ID e dados/revisão foram agrupados por fluxo; dados e erros dos formulários compartilham estado. OTP agrupa dígitos, seleção, submissão e ID. O diálogo de perfil agrupa abertura e feedback. Atualizações preservam imutabilidade. |
| Não realizar mutação direta de arrays ou objetos. | **Cumprido** | `src/hooks/useStoreCollection.ts: reducer; src/hooks/useStoreForm.ts: changeField; src/pages/VerifyRegistrationPage/index.tsx: handlers; src/utils/dashboardCharts.ts: belowMinimumChart` | Reducers e setters constroem novos objetos; exclusão usa filter e edição map. OTP copia digits antes de atribuir posições, touchedFields copia Set antes de add, ranking copia antes de sort. Mutações de refs/DOM, arrays temporários e instância ECharts não são mutação do estado React. |
| Usar `useEffect` com array de dependências explícito e correto. | **Cumprido** | `src/contexts/AuthContext/index.tsx; src/hooks/useDashboard.ts; useDashboardChart.ts; useDialog.ts; useStoreCollection.ts; páginas com efeitos` | Lidos todos os efeitos: restore captura apenas bindings estáveis; token/persistência dependem dos campos usados; dashboard depende de revision; gráficos de container/option/mapSource; diálogo de fallbackFocusId; coleção de reload; páginas capturam IDs constantes ou navigate e estados OTP explicitados. |
| Incluir todas as dependências necessárias nos efeitos. | **Cumprido** | `src/hooks/useVerifyRegistration.ts; src/pages/VerifyRegistrationPage/index.tsx; demais efeitos citados acima` | Efeitos de OTP listam isComplete, otp, execute, registrationId, loading, success e error; redirecionamentos listam navigate; refs e setters são estáveis. Revisão das closures não encontrou dependência reativa omitida. A estabilidade/concentração de chamadas é assunto distinto de omitir dependências. |

### Listas e rotas

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Renderizar listas dinâmicas com `key` baseado no identificador único do dado. | **Cumprido** | `src/components/StoresTable/index.tsx; StoresFilters/index.tsx; DashboardDataTable/index.tsx; DashboardChartLegend/index.tsx; DashboardChartsGrid/index.tsx; src/utils/parseStore.ts` | Lojas usam o ID numérico do core normalizado para string; parseStores rejeita IDs repetidos/inválidos. Opções usam city/state consolidado em Map; linhas/colunas/legendas/cards usam IDs. Planos usam plan.id, benefícios usam texto único na configuração atual, UFs usam a sigla. |
| Não utilizar `key={index}` em listas que permitam adição, remoção ou reordenação. | **Cumprido** | `src/hooks/useProfileForm.ts`, `ProfileForm`, listas de domínio | Revisão NI-550 encontrou e corrigiu o índice na lista mutável de telefones do perfil: agora usa phoneKeys estáveis. Remoção preserva o campo sobrevivente, seu valor e useId, conferidos no navegador. Índices permanecem somente nos seis slots fixos de OTP. Lojas, relatórios, gráficos e planos usam IDs. |
| Recuperar parâmetros de rota utilizando `useParams`. | **Cumprido** | `src/App.tsx`; `src/hooks/useEditStorePage.ts` | A rota privada lazy `/lojas/editar/:id` recebe o identificador por `useParams<{ id: string }>()`. A ação Editar navega para a URL; o hook carrega os dados pelo ID, sem depender da seleção anterior na tabela. |
| Verificar se cada parâmetro de rota está presente antes de utilizá-lo. | **Cumprido** | `src/utils/storeRoute.ts: resolveStoreRouteId`; `src/hooks/useStoreDetails.ts` | Guard trata ID ausente/vazio antes do acesso ao serviço e valida formato numérico, sinal e faixa de inteiro seguro. `/lojas/editar` renderiza mensagem de ID ausente e retorno para a lista; valor inválido não dispara consulta individual. |
| Tratar a possibilidade de `undefined` ao acessar parâmetros de rota. | **Cumprido** | `src/pages/EditStorePage/index.tsx`; `src/utils/storeRoute.ts`; `src/hooks/useStoreDetails.ts`; `tests/stores.test.mjs` | O resolver aceita `string ou undefined`; o hook só consulta quando há ID validado e o salvamento também protege a ausência. Testes cobrem undefined, vazio, texto, negativo, decimal, caminho indevido, overflow, ID zero e normalização de zeros à esquerda. |
| Implementar no mínimo 3 rotas utilizando React Router. | **Cumprido** | `src/App.tsx`; `src/main.tsx` | Rotas públicas de login/cadastro/planos e privadas de dashboard/planos/lojas/relatórios; PR #22 adiciona /lojas/editar e /lojas/editar/:id. Há onze páginas lazy e rota curinga. |
| Fazer a navegação com `<Link>` ou `useNavigate`. | **Cumprido** | `src/components/Navbar/index.tsx; PrivateRoute/index.tsx; RootRedirect/index.tsx; páginas com navegação` | Sidebar usa NavLink; cadastro/login/breadcrumbs usam Link; transições após ações usam useNavigate. Guards usam Navigate. Link Esqueci minha senha aponta /esqueci-senha, ainda sem página e resolvido pela rota curinga. |
| Não utilizar `window.location.href` para navegação. | **Cumprido** | `src/components/Navbar/, PrivateRoute/, RootRedirect/, PortalLayout/; src/pages/` | Todos os caminhos de navegação lidos usam mecanismos do React Router, sem atribuição a window.location.href. |
| Criar rota curinga `path="*"` com página de erro e botão de retorno. | **Cumprido** | `src/App.tsx`, `src/pages/NotFoundPage/index.tsx` | `path="*"` mostra erro e botão de retorno via `useNavigate`. |

### Acessibilidade mínima — WCAG 2.1 nível AA

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Utilizar `<button>` para todas as ações. | **Cumprido** | `src/components/PlanCard/, PrimaryButton/, FormInput/, StoresTable/, StorePhotoPicker/, StoreForm/, DeleteStoreModal/, Navbar/, DashboardChartCard/; NotFoundPage` | Contratar/selecionar plano, exibir senha, CRUD, foto, cancelar, sair, alternar dados e repetir operação são buttons. Links/NavLink são usados para deslocamento entre rotas; inputs e selects mantêm controles nativos. Não há ação de UI implementada como div clicável. |
| Não utilizar `<div onClick>`. | **Cumprido** | `JSX de todos os arquivos src/components/*/index.tsx e src/pages/*/index.tsx` | Handlers de ação estão em button ou controles de formulário. Divs são agrupadores, regiões/tabelas ou containers de gráficos; não receberam ação onClick. |
| Associar cada `<label>` ao seu `<input>` usando `htmlFor`. | **Cumprido** | `src/components/FormInput/index.tsx: inputId; StorePhotoPicker/index.tsx; StoreStateSelect/index.tsx; StoresFilters/index.tsx; VerifyRegistrationPage/index.tsx` | Cada label aponta ao id do controle: useId em controles reutilizáveis e otp-0 até otp-5 nos slots. Os filtros associam search/city/state, incluindo selects. Não existem outros inputs fora desses componentes/OTP. |
| Fornecer `alt` descritivo para imagens ou `alt=""` para imagens decorativas. | **Cumprido** | `src/pages/LoginPage/, RegisterPage/, VerifyRegistrationPage/; src/components/StorePhotoPicker/, PortalHeader/, Navbar/, StoresTable/, StoresFilters/, StoreStateSelect/, CreateStorePage` | Todos os img têm alt. Logos textuais têm Logotipo Ceris; foto tem Pré-visualização da foto da loja; ícones, chevrons, símbolo de marca e avatar redundante são decorativos e têm alt vazio. SVGs inline decorativos dos planos possuem aria-hidden=true/focusable=false; a marca lateral possui nome acessível via role=img/aria-label. |
| Garantir contraste mínimo de 4,5:1 para texto normal. | **Cumprido** | `styles/components/Navbar/navbar.css`: hover; `styles/auth.css`: slogan; `src/utils/dashboardColors.ts` | Hover dos links usa #626270 sobre #f8f7fb = 5,62:1; sair usa #b91c1c sobre #fff1f2 = 5,89:1. O slogan recebe scrim escuro de 65% sobre a foto: mesmo sobre branco puro o texto branco mantém pelo menos 6,30:1. Demais pares sólidos da revisão permanecem adequados; o heatmap seleciona texto por luminância. |
| Garantir contraste mínimo de 3:1 para texto grande. | **Cumprido** | `styles/auth.css`: .slogan-section; `styles/components/PlanCard/plan-card.css`; `styles/components/PortalLayout/portal-layout.css`; `styles/dashboard.css` | Títulos/indicadores continuam escuros sobre fundos claros. O slogan branco agora tem limite de contraste calculável independente dos pixels da fotografia: scrim rgb(17 5 27 / 65%) limita o fundo mais claro a #655d6b (arredondamento conservador), fornecendo pelo menos 6,30:1. Isso supera 3:1 e 4,5:1, inclusive nos breakpoints com texto menor. |
| Exibir erros no DOM com `role="alert"`. | **Cumprido** | `src/components/ErrorAlert/index.tsx`, `FormInput/index.tsx` | Erros renderizados com `role="alert"`. |
| Tornar a aplicação completamente operável por teclado. | **Cumprido** | `src/hooks/useVerificationForm.ts`, `useChartView.ts`, `useProfileForm.ts`, `useDialog.ts`; controles nativos | Implementação atual revisada: ações usam botões/links/inputs/selects e diálogos contêm/devolvem foco. OTP permanece montado no envio, devolve foco após erro, protege índice na colagem vazia e foca o primeiro dígito ausente. Formulários focam o primeiro erro; adicionar/remover telefone preserva foco. Abas usam setas/Home/End e tabIndex móvel. Navegador confirmou OTP, erros de cadastro, lista de telefones e abas. A demonstração presencial e auditoria WCAG integral continuam separadas. |
| Garantir foco visível em todos os elementos interativos. | **Cumprido** | `styles/index.css`; `styles/components/FormInput/form-input.css`, `StoreForm/store-form.css`, `StoresFilters/stores-filters.css`, `StoresTable/stores-table.css`; `styles/dashboard.css`; CSS de verificação | Controles e regiões roláveis mantêm seus outlines/regras de foco. O título do dashboard agora também recebe outline roxo ao ganhar foco programático, em vez de outline:none. Ícones SVG decorativos dos planos foram marcados aria-hidden e focusable=false; não geram controles extras. |
| Validar ao vivo a navegação por teclado durante a apresentação, sem utilizar mouse. | **Não atendido** | Demonstração da aplicação | Evidência ao vivo sem mouse não pode ser estabelecida por arquivos do repositório. |

### Feedback assíncrono

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Exibir estado de carregamento no DOM (spinner, skeleton ou `aria-live`). | **Cumprido** | `src/components/LoadingSpinner/`, `src/App.tsx`, hooks | Spinner exibido durante Suspense/carregamento assíncrono. |
| Exibir estado de sucesso no DOM. | **Cumprido** | `src/contexts/AuthContext/index.tsx`, `src/utils/authState.ts`, `VerifyRegistrationPage`; feedbacks de lojas/perfil/planos/relatórios/dashboard | Revisão NI-550: região role=status persistente no Provider anuncia autenticação mesmo após navegar; a verificação mantém mensagem de cadastro iniciado no destino e mensagem própria de sucesso. Lojas, perfil, troca de plano, dashboard e relatórios mantêm seus feedbacks no DOM. |
| Exibir estado de erro no DOM. | **Cumprido** | `src/components/ErrorAlert/`, páginas e hooks | Erros aparecem na interface com alerta acessível. |
| Não usar `alert()` ou `console.log` como único tratamento dos estados assíncronos. | **Cumprido** | `Hooks assíncronos e JSX de páginas/componentes` | Erros viram estado e ErrorAlert/formFieldError; carregamento usa LoadingSpinner/role=status; dados e mensagens de sucesso são renderizados onde indicado. Não há fluxo cujo único tratamento seja popup ou log. |

### Publicação e histórico Git

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Publicar a aplicação em Vercel ou GitHub Pages. | **Cumprido** | [NexUs Web](https://nex-us-web.vercel.app) | URL fornecida pelo usuário e aberta no navegador em 01/11/2026: login carregou; acesso direto a /dashboard redirecionou ao login sem sessão, sem 404 do servidor. Isso comprova a publicação existente; as alterações NI-550 ainda precisam ser integradas/publicadas. |
| Incluir no `README.md` o link da aplicação publicada. | **Cumprido** | `README.md` | README reduzido à apresentação do projeto, tecnologias, link público e referência a este checklist. Detalhes de implementação e pendências ficam no checklist. |
| Garantir que a aplicação publicada esteja acessível ao vivo durante a apresentação. | **Não atendido** | [Produção](https://nex-us-web.vercel.app) | Publicação confirmada em 01/11/2026. A disponibilidade durante a apresentação precisa ser demonstrada naquele momento; requisito presencial preservado. |
| Manter histórico de desenvolvimento no Git com no mínimo 20 commits. | **Cumprido** | `git log até 0a1aef4; git log --no-merges` | 73 commits alcançáveis a partir do HEAD, dos quais 53 não são merges. Mesmo excluindo merges, a contagem excede 20; mudanças incluem autenticação, layout, cadastro, lojas, dashboard e infraestrutura. |
| Utilizar Conventional Commits, como `feat:`, `fix:`, `refactor:` e `docs:`. | **Em andamento** | `histórico Git: 3f3f6d5, eddf14a` | Revert automático a932f1a aceito como exceção pelo usuário em 01/11/2026, assim como mensagens automáticas de merge. Restam somente First build (3f3f6d5) e Initial commit (eddf14a), sem prefixo convencional. Renomeação ainda em análise; histórico não reescrito. |
| Cobrir pelo menos 4 semanas de desenvolvimento com os commits. | **Cumprido** | `histórico Git: ff96b5d (15/09), 8357776 (22/09), 337f96b (28/09), 9a3f06d (02/10), 967d310 (16/10), ac8ffe2 (29/10)` | Datas de commits de desenvolvimento cobrem julho a outubro; há atividade em pelo menos as semanas de 14/09, 21/09, 28/09, 12/10, 19/10 e 26/10. A conclusão anterior de concentração insuficiente em outubro estava incorreta. |
| Não utilizar mensagens de commit genéricas. | **Em andamento** | `histórico Git: eddf14a e 3f3f6d5` | Initial commit e First build são genéricos. As demais mensagens de desenvolvimento descrevem mudanças concretas, como add auth context with reducer and login hooks e build responsive dashboard with accessible interactive charts. |

## Requisitos extras — até nota 10,0

### Gerenciamento de estado

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Implementar Context API. | **Cumprido** | `src/contexts/AuthContext/index.tsx`, `StoresContext/index.tsx` | Contextos de autenticação e lojas implementados. |
| Criar um Provider dedicado. | **Cumprido** | `src/contexts/AuthContext/index.tsx`, `StoresContext/index.tsx` | Providers dedicados publicados para os contextos. |
| Criar um hook customizado para consumo do Context. | **Cumprido** | `src/hooks/useAuth.ts`, `useStoresContext.ts` | Hooks próprios consomem Context e expõem valores tipados. |
| Aplicar tipagem completa ao Context, Provider e hook. | **Cumprido** | `src/contexts/AuthContext/index.tsx: AuthContextValue/AuthProviderProps/AuthState/AuthAction; StoresContext/index.tsx; src/hooks/useAuth.ts e useStoresContext.ts` | Contexts aceitam valor tipado ou null; hooks lançam erro fora do Provider e retornam contrato não nulo. Providers tipam children; coleção tipa dados, operações, aviso de foto e transições. StoresProvider continua remontando por profile.id, isolando sessões; a identificação remota usa o cliente autenticado. |
| Demonstrar oralmente o problema de prop drilling resolvido e apontá-lo no código. | **Em andamento** | `src/contexts/StoresContext/index.tsx`, `src/components/PortalLayout/index.tsx`, `src/hooks/useStoresContext.ts`, páginas de lojas | A solução está pronta para demonstrar: StoresProvider envolve Outlet; StoresPage e CreateStorePage acessam coleção/operações pelo hook, sem receber a coleção como props do layout. Falta evidência da explicação oral do grupo para concluir a parte presencial. |
| Implementar `useReducer`. | **Cumprido** | `src/contexts/AuthContext/index.tsx`, `src/hooks/useStoreCollection.ts` | Reducers usados em estados com múltiplas transições. |
| Tipar o state do reducer. | **Cumprido** | `src/contexts/AuthContext/index.tsx` | `AuthState` tipa o estado do reducer; coleção também tem estado tipado. |
| Tipar as actions com union types. | **Cumprido** | `src/contexts/AuthContext/index.tsx` | `AuthAction` é union discriminada por `type`. |
| Demonstrar oralmente por que `useReducer` foi escolhido em vez de múltiplos `useState`, apontando a complexidade real do estado no código. | **Em andamento** | `src/hooks/useStoreCollection.ts`: StoreCollectionState/StoreCollectionAction/reducer; `src/utils/authState.ts`: authReducer | Há complexidade real para explicar: transições load/loaded/start/saved/error atualizam coleção, loading, saving, erro e sucesso de forma coordenada; autenticação coordena perfil e tokens. Implementação demonstrável, com apresentação oral ainda pendente. |

### Hooks e carregamento

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Criar um hook customizado com retorno tipado. | **Cumprido** | `src/hooks/useDashboard.ts: UseDashboardResult/useDashboard; src/hooks/useStoreCollection.ts: UseStoreCollectionResult` | useDashboard retorna dados, mapa, loading, error, companyName e reload com interface explícita; useStoreCollection também tem contrato de retorno tipado para estado e operações. |
| Incluir estado de loading no hook. | **Cumprido** | `src/hooks/useDashboard.ts: DashboardLoadState; useStoreCollection.ts: StoreCollectionState; useLogin.ts; useRegistration.ts; useVerifyRegistration.ts; useStorePhoto.ts` | Estado de carregamento declarado no retorno; lojas distingue loading de saving, e foto distingue leitura de salvamento. Esses campos são consumidos pelos spinners, mensagens e desabilitação de controles. |
| Tratar erros no hook. | **Cumprido** | `src/hooks/useDashboard.ts; useStoreCollection.ts; useLogin.ts; useRegistration.ts; useVerifyRegistration.ts; useStorePhoto.ts; useDashboardChart.ts` | Handlers catch convertem falhas para mensagens no estado, consumidas no DOM. Gráfico falho orienta usar tabela. Hooks puros de cálculo/contexto não realizam requisições e não precisam de loading próprio. |
| Cancelar operações com `AbortController`. | **Cumprido** | `src/hooks/useDashboard.ts; useStoreCollection.ts; useLogin.ts; useRegistration.ts; useVerifyRegistration.ts; useStorePhoto.ts; src/services/apiClient.ts` | Cleanup aborta controllers; signal atravessa os recursos até fetch ou FileReader. Import dinâmico da malha não pode ser cancelado em transporte, mas verifica abort antes de devolver; o hook bloqueia atualização após cancelamento. |
| Evitar atualização de estado após o componente ser desmontado. | **Cumprido** | `src/hooks/useDashboard.ts: cleanup/then/catch; useStoreCollection.ts: mounted/controllers; hooks de autenticação: mountedRef; useDashboardChart.ts: disposed` | Dashboard e coleção checam abort/montagem antes de atualizar; autenticação desmarca mountedRef no cleanup; gráfico marca disposed e desconecta ResizeObserver; foto verifica signal.aborted. Chamadas concorrentes de autenticação têm risco separado: catch de chamada abortada enquanto montado não testa signal e pode sobrescrever feedback de uma chamada nova. |
| Utilizar `React.lazy` e `Suspense` por página. | **Cumprido** | `src/App.tsx`: onze imports lazy e Suspense | As onze páginas, incluindo EditStorePage, usam lazy e o Suspense compartilhado. O build gera chunks por página; o modal do perfil é um componente, não uma nova rota. |
| Demonstrar ao vivo, na aba Network do DevTools, o carregamento inicial de cada rota. | **Não atendido** | DevTools Network | Exige demonstração durante apresentação; não há evidência gravada no projeto. |

### Persistência

| Requisito | Status | Onde exatamente | Como foi atendido / evidência |
| --- | --- | --- | --- |
| Implementar `localStorage` com schema versionado. | **Cumprido** | `src/utils/authStorage.ts`, `registrationStorage.ts` | Sessão versão 3 e ID do cadastro versão 1 permanecem versionados. Por decisão do usuário, o rascunho com senha fica somente em memória; eventual cópia antiga é removida. Filiais usam o core. |
| Incluir o campo `_versao` no objeto salvo. | **Cumprido** | `authStorage.ts`, `registrationStorage.ts` | Sessão persistida inclui _versao=3; ID do cadastro inclui _versao=1. Rascunho não é persistido. |
| Verificar a versão ao carregar os dados. | **Cumprido** | `authStorage.ts`, `registrationStorage.ts` | Leituras conferem versão e estrutura; sessão valida perfil, tokens e datas; ID valida formato e comprimento. Estrutura incompatível/inválida é descartada. |
| Migrar ou descartar os dados com segurança quando a versão for incompatível. | **Cumprido** | `src/utils/authStorage.ts: clearAuthSession; registrationStorage.ts: clearRegistrationDraft/clearRegistrationId` | Versão incompatível faz removeItem e retorno null. JSON inválido também é descartado; sessão ainda verifica expiração. Estratégia implementada é descarte, não migração. |

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
| Demonstrar no código onde dados externos são tratados antes da renderização. | **Cumprido** | `src/utils/parseProfile.ts`, `validateAuth.ts`, `authStorage.ts`, parsers de filiais/dashboard/relatórios/planos/CEP | Revisão NI-550: perfil, imagem, empresa, tokens e ID de cadastro passam de unknown a estruturas reconstruídas/validadas. Conferidos IDs, tipos, enums, datas, listas, números e protocolos de imagem. Sessão armazenada valida campos e reconstrói perfil; rascunho agora é interno em memória. Testes cobrem estruturas e URLs inválidas. A exposição do fluxo no código está implementada; explicações presenciais não foram executadas. |
| Implementar validação e sanitização dos formulários. | **Cumprido** | `src/utils/validateLogin.ts`, `validateRegistration.ts`, `validateStore.ts`, `validateProfile.ts`, `validateAuth.ts`, `profilePhoto.ts` | Revisão NI-550: cadastro reutiliza verificação dos dígitos do CNPJ; limites não são ocultados por truncamento prévio; confirmação possui limite próprio. OTP/ID e refreshToken têm validadores tipados. Perfil mantém validação de nome/telefones/endereço e ganha limite/formato de telefone; fotos validam MIME, bytes, assinatura e pixels antes do envio. Máscaras e payloads existentes foram preservados. |
| Definir o tipo de cada campo do formulário. | **Cumprido** | `src/types/registration.ts`, `store.ts`, utilitários de validação | Formulários tipados por entidade. |
| Definir tamanho máximo para cada campo. | **Cumprido** | `validateLogin.ts`, `validateRegistration.ts`, `validateProfile.ts`, `validateAuth.ts`; componentes de formulário | Revisão NI-550: limites de login/cadastro são verificados sem slice prévio; confirmação tem erro de máximo; telefone do perfil tem maxLength=30 e validação; OTP limita 1 dígito por slot e 6 no payload; registrationId limita 256, token 16384. Mantidos limites de endereço/filiais/filtros/fotos. Campos somente leitura recebem dados já validados. |
| Exibir mensagem de erro específica para cada campo. | **Cumprido** | `FormInput`, `StoreStateSelect`, seletores de foto, `ProfileAddressForm`, `VerifyRegistrationPage` | Revisão NI-550: cada dígito ausente recebe mensagem própria com role=alert, aria-invalid e aria-describedby ao submeter; confirmação de senha tem erro de tamanho máximo; telefone de perfil tem mensagens de tamanho/formato. Mensagens por campo dos demais formulários foram conferidas; falhas remotas continuam como erros da operação. |
| Implementar validações em `src/utils/`. | **Cumprido** | `src/utils/validate*.ts` | Validações de login, cadastro, loja e dashboard concentradas em utils. |
| Garantir que nenhum dado seja enviado ao serviço sem passar por uma função de validação tipada. | **Cumprido** | Hooks de formulário/autenticação, `validateAuth.ts`, `profilePhoto.ts`, serviços de filiais/planos/perfil | Revisão NI-550: acrescentados validateVerification para OTP/ID e validateRefresh para renovação, antes do transporte; fotos de perfil também são revalidadas no serviço. Login/cadastro/perfil/filiais passam por seus validadores e planos exigem ID inteiro positivo e pertencente ao catálogo validado. Consultas individuais usam IDs validados; relatórios usam período vindo da lista validada. |

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
| Implementar componente interativo complexo, como modal, menu ou abas. | **Cumprido** | `ProfileModal`, `DeleteStoreModal`, `ReportPdfDialog`, `DashboardChartCard` | Diálogos nativos com contenção/retorno de foco e abas Gráfico/Dados com seleção e navegação por teclado. Edição de filial é uma página própria. |
| Utilizar corretamente `aria-expanded`. | **Cumprido** | `src/components/PortalHeader/index.tsx` | O botão de perfil sincroniza aria-expanded com profileOpen e abre dialog. Gráficos agora usam semântica de abas, com aria-selected; não usam aria-expanded para seleção. |
| Utilizar corretamente `aria-controls`. | **Cumprido** | `src/components/DashboardChartCard/index.tsx`, `StoresFilters` | Abas apontam para painéis persistentes por IDs exclusivos. Filtros omitem referência à tabela durante loading e a incluem quando montada. |
| Utilizar corretamente `aria-haspopup`. | **Cumprido** | `src/components/PortalHeader/index.tsx`, `StoresTable` | Perfil e exclusão anunciam aria-haspopup=dialog. Editar filial navega para rota e não anuncia popup. |
| Utilizar corretamente `aria-selected`. | **Cumprido** | `src/components/DashboardChartCard/index.tsx`, `src/hooks/useChartView.ts` | Revisão NI-550: visualizações Gráfico/Dados formam tablist com tabs/tabpanel, IDs/aria-controls/aria-labelledby e apenas a aba ativa com aria-selected=true/tabIndex=0. Setas alternam com retorno circular; Home/End selecionam extremos; Enter/Espaço funcionam como botões nativos. Navegador confirmou seleção, painel e foco. Segue o padrão de [abas da WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). |
| Mover o foco programaticamente para o elemento correto ao abrir um componente interativo. | **Cumprido** | `src/hooks/useDialog.ts`; `src/components/Modal/index.tsx` | Hook usa showModal e foca data-initial-focus ou primeiro campo/botão. Confirmado em execução: edição aberta com Enter colocou foco no campo name. Contenção de Tab/Shift+Tab implementada no hook. |
| Devolver o foco ao elemento de origem ao fechar um componente interativo. | **Cumprido** | `src/hooks/useDialog.ts` | Cleanup fecha diálogo, restaura overflow e devolve foco à origem conectada ou ao título fallback. Confirmado no preview: Escape fechou edição e restaurou foco ao botão Editar da mesma loja. |
| Incluir o landmark `<header>` em todas as páginas. | **Cumprido** | Páginas públicas e `src/components/PortalHeader/index.tsx` | Revisão NI-550: painel de marca da autenticação é header de página, preservando seu estilo; planos públicos e 404 têm header com papel banner explícito; páginas privadas recebem PortalHeader do layout. Cabeçalhos de cards mantêm seu escopo próprio. |
| Incluir o landmark `<main>` em todas as páginas. | **Cumprido** | `src/pages/LoginPage/index.tsx`, `RegisterPage/index.tsx`, `VerifyRegistrationPage/index.tsx`, `PlansPage/index.tsx`; `src/App.tsx`; `src/components/PrivateRoute/`, `RootRedirect/` | A seção de formulário de login/cadastro/verificação tornou-se main, preservando classes e layout. As outras sete páginas já têm main. Loading de planos/verificação, Suspense e guards de autenticação também usam main; os retornos null durante redirecionamento continuam sem conteúdo de página. |
| Incluir o landmark `<nav>` em todas as páginas. | **Cumprido** | LoginPage, RegisterPage, VerifyRegistrationPage, PlansPage, NotFoundPage e Navbar | Revisão NI-550: links existentes de acesso à conta foram agrupados em nav nomeado; planos públicos oferecem retorno ao cadastro, 404 agrupa retorno ao portal. Rotas privadas mantêm navegação principal da sidebar e breadcrumbs onde aplicáveis. |
| Incluir o landmark `<footer>` em todas as páginas. | **Cumprido** | `src/components/PageFooter/index.tsx`, `PortalLayout`, páginas públicas | Revisão NI-550: rodapé compartilhado com identificação do portal fica fora do main em autenticação/planos/404 e no layout de todas as páginas privadas. Rodapés de cards e ações de formulário continuam locais. CSS preserva distribuição flex e permite rolagem do formulário em altura pequena. |
| Demonstrar navegação ao vivo com leitor de tela (NVDA ou VoiceOver), sem perda de contexto ou armadilhas de foco. | **Não atendido** | Apresentação com NVDA/VoiceOver | Requer teste ao vivo; não verificável no repositório. |

## Checklist final obrigatório

| Verificação final | Status | Onde exatamente | Como foi verificado / evidência |
| --- | --- | --- | --- |
| Verificar item por item todos os requisitos mínimos antes de considerar a implementação concluída. | **Cumprido** | Seção “Requisitos mínimos para nota 7,0” deste documento; arquivos e funções indicados em cada linha; registro de ESLint, TypeScript e build em “Verificações executadas”. | A auditoria de todos os itens mínimos foi concluída: cada requisito tem classificação, localização e evidência. Foram confirmados estrutura, props, dependências de efeitos, chaves de listas, serviços e navegação; as falhas encontradas estão descritas nas linhas correspondentes. Este item avalia a realização da conferência; os requisitos de implementação que falharam continuam com seus próprios estados. |
| Verificar item por item todos os requisitos extras antes de considerar a implementação concluída. | **Cumprido** | Seção “Requisitos extras — até nota 10,0” deste documento; contextos, hooks, reducers, persistência, validadores e componentes referenciados em cada linha. | A auditoria de todos os itens extras foi concluída. Foram examinados os contratos de Context/reducers, cancelamento, schema versionado, memoização, renderização de conteúdo externo, formulários, proteção de rotas e ARIA. A conferência identificou exceções concretas e distinguiu as demonstrações presenciais; a existência dessas pendências não deixa a auditoria do código em andamento. |


## Evidências complementares da revisão

### Pendências de auditoria encerradas — registro histórico de 30/10/2026

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


| Deep links na Vercel | **Cumprido no repositório e conferido na publicação existente** | `vercel.json`; domínio Vercel | Em 01/11/2026, acesso direto a /dashboard abriu o app e redirecionou para /login sem sessão. A branch NI-550 ainda não foi publicada. |

### Percursos analisados

| Percurso | Arquivos e encadeamento verificado | Conclusão adicional |
| --- | --- | --- |
| Login e sessão | LoginPage → useLogin → validateLogin/toLoginPayload → auth.service.login → apiClient; token → coreClient → profile.service → AuthContext → PrivateRoute/PortalLayout | Formulário valida antes de enviar. Perfil/tokens usam assertion de tipo sem parser. AuthContext restaura/salva sessão e compartilha perfil sem repassá-lo por toda a árvore. |
| Cadastro e planos | RegisterPage → validateRegistrationFormData → registrationStorage → PlansPage → useRegistration → validateRegistrationForm/toRegistrationPayload → startRegistration → armazenamento de registrationId | CNPJ do cadastro verifica formato, não dígitos verificadores; validatePlanId exige inteiro seguro positivo e a seleção é conferida no catálogo remoto. Rascunho persiste senha em texto no armazenamento local e o guard não valida sua estrutura interna. São riscos adicionais, não prova de XSS por renderização. |
| Verificação | VerifyRegistrationPage → digits/otp → useVerifyRegistration → verifyRegistration → perfil → AuthContext → redirecionamento | Falta validador tipado de OTP/registrationId antes do serviço. Campos saem do DOM durante loading e o sucesso não tem mensagem própria no DOM. Colagem sem dígitos na primeira posição pode calcular activeIndex=-1; não há guard explícito desse índice. |
| Coleção e CRUD de lojas | PortalLayout → StoresProvider → useStoreCollection → stores.service → coreClient → apiRequest; respostas → parseStore; formulário → useStoreForm/validateStore; edição → useStoreDetails/getStore | CRUD remoto autenticado. Reducer atualiza a lista com o retorno confirmado, mantém ordem da edição e remove após DELETE 204. Consulta individual tem loading/erro/retry/cancelamento. Nenhuma coleção mock/local é usada. |
| Foto da loja | StorePhotoPicker → useStorePhoto → readStorePhoto/validateStorePhoto → StoreForm → useStoreCollection → updateStoreImage/deleteStoreImage | PNG/JPEG/WebP até 10 MB com validação de assinatura. PUT envia File em multipart, chave file; navegador define boundary. DELETE remove imagem. Erro na foto após salvar dados gera aviso separado, sem repetir POST nem perder a filial criada. |
| Dashboard | DashboardPage → useDashboard → dashboard.service/toValidatedDashboard e geography.service → useDashboardCharts/buildDashboardCharts → cards → useDashboardChart/chartEngine | Dados demonstrativos validados, sete modelos e tabelas alternativas. Tooltip usa richText/SVG, sem HTML externo. Região de gráfico é focável e tabela expõe os mesmos valores. |
| Relatórios | ReportsPage → useReportsPage → useReports (AbortController) / useReportFilters (sanitizeReportSearch/Year/Month) / useReportPdf (useReducer) → reports.service → reportsClient → apiClient; toValidatedReports (validateReports) → filterReportGroups (ano, mês e nome; ordem do mais antigo para o mais novo) → ReportsFilters / ReportsMonthSection / ReportRow / ReportActions / ReportPdfDialog (useDialog) |
| Rotas e layouts | main → BrowserRouter → App/AuthProvider/Suspense → PrivateRoute/RootRedirect/PortalLayout | Guards são componentes, páginas não verificam login diretamente. Onze páginas usam lazy, com edição de filial por ID. Relatórios têm listagem/filtros/PDF; atualização de plano consulta a empresa e envia PATCH autenticado para /api/companies/me/plan. |

### Cobertura dos arquivos próprios — registro histórico de 30/10/2026

A leitura cobriu os 85 arquivos `.ts`/`.tsx` de `src/`: 25 componentes, 10 páginas, 2 contextos, 14 hooks, 8 arquivos de serviços, 7 arquivos de tipos, 14 utilitários, 2 mocks, `App.tsx`, `main.tsx` e `vite-env.d.ts`. Incluiu as assinaturas, corpos das funções, JSX, efeitos, consumers e caminhos de erro/cancelamento, não apenas a presença de palavras-chave.

Também foram examinados os 23 arquivos CSS que estavam em `src/` (agora movidos para `styles/`), `styles/dashboard.css`, a configuração Vite/TypeScript/ESLint, o HTML de entrada, `package.json`, README, `.env.example`, regras de ignore, pipeline CI, Dockerfile, manifesto Kubernetes e a documentação da malha local. `node_modules`, caches e `dist` são dependências/saídas geradas, não implementação própria a auditar linha por linha. Os arquivos visuais foram conferidos por seus usos, atributos e formatos. A garantia do contraste do slogan agora decorre do scrim de 65% calculado para uma fotografia inteiramente branca, sem depender de medir cada pixel da foto.

### Verificações executadas — registro histórico de 30/10/2026

| Verificação | Resultado e limite |
| --- | --- |
| ESLint de `src` | `node node_modules/eslint/bin/eslint.js src`: exit code 0. Corrobora a leitura de tipos e dependências dos hooks. |
| Compilação TypeScript | `node node_modules/typescript/bin/tsc -b`: exit code 0. O tsconfig atual não habilita strict; compilar não valida payloads em runtime. |
| Tela de relatórios (31/10/2026) | `node node_modules/typescript/bin/tsc -b --noEmit` e `node node_modules/eslint/bin/eslint.js src`: sem erros após a integração com a API de relatórios. Busca nos arquivos de relatórios: nenhum `any`, `console.*`, `key={index}`, `dangerouslySetInnerHTML`, `window.location` ou `fetch` fora de `src/services/`. Contraste medido (sRGB): texto #475569 sobre #fff 7,58:1 e sobre #fafafc 7,27:1; placeholder #64748b sobre #fafafc 4,57:1; botão #4f2078 sobre #fff 11,6:1 e no hover 10,18:1. O build do Vite não foi executado nesta verificação (binários nativos do Windows); a visualização do PDF no navegador depende de teste manual. |
| Build de produção | `node node_modules/vite/bin/vite.js build`: concluído, 731 módulos transformados. Primeiro bloqueado pelo ambiente com spawn EPERM, depois executado com a permissão apropriada. O bundle de gráfico tem cerca de 661 kB e gera aviso de tamanho, sem falhar o build. |
| Divisão em chunks | Novo build gera chunks separados para as dez páginas, incluindo RegisterPage e VerifyRegistrationPage, e para gráfico/malha. Isto comprova divisão de bundle; a demonstração Network continua sendo presencial. |
| Contraste de cores sólidas | Cálculo sRGB com linearização dos canais e razão (Lmaisclaro + 0,05)/(Lmaisescuro + 0,05). Após correção, hovers medidos em 5,62:1 e 5,89:1. Scrim do slogan garante mínimo conservador de 6,30:1 sobre a foto. Não foi usada somente comparação visual. |
| Histórico | Lidos os 73 títulos e datas do histórico alcançável do HEAD; 53 commits sem merge, 50 destes com prefixo convencional. Evidências de semanas e exceções estão nas linhas correspondentes. |
| Navegador e teclado | Preview de produção conferido em localhost:8080: login real concluído, dashboard, tabela alternativa aberta com Enter, lojas, edição aberta com Enter/fechada com Escape e retorno de foco ao botão de origem; planos e cadastro carregados. Login também conferido nas larguras padrão e 1280px; imagens carregadas e um main por página inspecionada. Nenhum dado de loja foi salvo/excluído. Isso não substitui a navegação completa de todos os fluxos. |
| Leitor de tela, apresentação e Profiler | Não executados. Demonstração Network ao vivo e verificação de todos os percursos com leitor de tela continuam pendentes nos itens próprios. |

### Condição de desenvolvimento desde o início

| Requisito | Status | Onde exatamente | Como foi avaliado |
| --- | --- | --- | --- |
| Construir o projeto já seguindo as regras, sem apenas adaptá-lo posteriormente para a avaliação. | **Cumprido** | Decisão explícita do usuário em 01/11/2026; implementação atual e histórico Git | Marcado como concluído conforme orientação explícita do usuário nesta revisão final. O código atual foi refinado segundo a estrutura e os requisitos existentes. Essa decisão de classificação não reescreve o histórico nem afirma retroativamente que todas as regras estavam presentes no primeiro commit. |

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

### Massa de testes e limite de fotos — 01/11/2026

Limite de foto de filial aumentado no frontend para 10 MB (10 × 1024 × 1024 bytes), incluindo validação do arquivo, limite da representação base64 e mensagens do formulário. Mantidos tipos PNG/JPEG/WebP e verificação de assinatura. TypeScript e ESLint dos arquivos alterados passaram. A aceitação de arquivos de 10 MB pelo core ainda depende dos limites do servidor.

Criadas dez filiais de teste sem imagem, identificadas por `Filial Teste 01 - Massa 01-11` até `Filial Teste 10 - Massa 01-11`, com dados sintéticos de empresa e endereço público de referência. Não foram armazenados credenciais nem tokens no repositório. Telefone opcional omitido da massa (lista vazia), pois o core rejeitou o formato nacional em dígitos; a compatibilidade do formato enviado pelo formulário deve ser conferida separadamente.

### Filtros e distribuição da massa — 01/11/2026

Removido o controle indisponível de status de `StoresFilters`; permanecem busca por nome/cidade e seleção de localização. TypeScript e ESLint do componente passaram. As dez filiais de teste existentes foram redistribuídas para 3 em SP, 5 no RJ, 1 em MG e 1 no PR, com endereços consultados no ViaCEP e distribuição verificada pela listagem do core. A filial original da conta foi preservada.

### Filtros separados de cidade e estado — 01/11/2026

Substituído o filtro de localização por dois selects acessíveis: cidade e estado. Opções únicas e ordenadas são derivadas das filiais cadastradas; escolher um estado restringe as cidades disponíveis e limpa uma cidade incompatível. Busca, cidade e estado são combinados na filtragem. Tipos, hook, utilitário, componente e página foram atualizados mantendo a arquitetura existente. TypeScript e ESLint dos arquivos alterados passaram.


## Revisão final antes dos commits — 01/11/2026

Recontadas as 108 linhas de requisitos: **78 cumpridos, 19 em andamento e 11 não atendidos**. Revisados contratos, separação services/hooks/UI, efeitos e cancelamento, tipos, validação de respostas, filtros combinados, bloqueio do endereço e feedback do modal. As evidências históricas de 30/10 permanecem identificadas como revisão anterior; não representam nova execução de todos os percursos.

Validação atual: TypeScript, ESLint do projeto, 23 testes automatizados e build de produção passaram. Build com 736 módulos e dez páginas carregadas por lazy; permanece o aviso de chunk de gráfico de aproximadamente 661 kB. Nenhuma credencial/token ou arquivo .env real foi incluído nos commits. A massa é dado remoto de teste, não código versionado.

Distribuição final confirmada no core: SP — São Paulo, Campinas e Santos; RJ — Rio de Janeiro, Niterói, Petrópolis, Nova Iguaçu e Duque de Caxias; MG — Belo Horizonte; PR — Curitiba. Foram alteradas apenas as dez filiais de teste, preservando a filial original.

Pendências principais: rotas dinâmicas/useParams (três requisitos), aria-selected em um padrão apropriado, publicação/link/disponibilidade (três requisitos), demonstrações presenciais de teclado, Network, Profiler e leitor de tela. Os 19 itens parciais incluem separação completa da lógica de autenticação, agrupamento de estados, schemas das demais APIs, validação de OTP/planos, mensagens de sucesso, landmarks e evidências orais/históricas. Esta revisão não declara conformidade WCAG integral nem garante nota da avaliação.


## Edicao por rota e useParams — 01/11/2026

A edicao deixou o modal e agora usa `/lojas/editar/:id`, com pagina propria carregada por lazy e protegida pelo layout autenticado. `/lojas/editar` trata ID ausente. A pagina usa useParams e resolveStoreRouteId antes da consulta; IDs invalidos/ausentes nunca chegam ao GET individual. Erros HTTP, inclusive filial inexistente, sao exibidos com nova tentativa e retorno para a lista. A troca de ID cancela a consulta anterior e nao exibe dados de outra filial. Salvar/cancelar retorna para /lojas. Mantidos o formulario, imagens e ViaCEP. Exclusao continua em dialogo; a acao Editar nao anuncia mais aria-haspopup.

Resultado atualizado: **81 cumpridos, 19 em andamento e 8 nao atendidos**, de 108 requisitos. As contagens das revisoes anteriores acima sao historicas e ficam substituidas por este resultado e pelo resumo inicial. Os tres requisitos de parametros de rota foram promovidos com evidencia no codigo e testes. Verificacao atual: TypeScript, ESLint, 25 testes e build passaram (738 modulos, onze paginas lazy); permanece o aviso de tamanho do grafico. Nao houve nova verificacao no navegador nem gravacao no core nesta alteracao.

## Refinamento NI-550 — 01/11/2026

Resultado: **98 cumpridos, 5 em andamento e 5 não atendidos**, de 108. Foram concluídos **17 dos 27 requisitos pendentes** da revisão anterior. Restam **10**: oito sobre apresentação e dois sobre histórico.

As demonstrações presenciais foram preservadas sem promoção de estado. A disponibilidade futura durante a apresentação permanece pendente, embora a publicação atual tenha sido confirmada no navegador. Conventional Commits e mensagens genéricas continuam parciais: o usuário decidiu preservar os hashes existentes. O requisito de ambiente foi concluído por orientação do usuário após esclarecimento; a configuração foi preservada, sem alterar .env ou presumir sigilo de VITE_*.

O requisito histórico de desenvolvimento desde o início foi marcado por orientação explícita do usuário; não houve reescrita do Git. A classificação de teclado refere-se à implementação revisada e às verificações registradas neste checklist, sem certificação WCAG integral.

As validações autenticadas reais de telefone, omissão de campos, imagens, perfil e contratação de plano permanecem descritas como pendências de integração; testes com HTTP interceptado não as substituem.

### Preparação da PR NI-550 — 01/11/2026

Alterações separadas em commits de acessibilidade, autenticação/validação, filiais, perfil, planos, remoção dos testes e documentação. Mantida a contagem de **98 cumpridos, 5 em andamento e 5 não atendidos** (108 itens). O revert automático do GitHub é uma exceção aceita; os dois commits antigos genéricos permanecem pendentes até um teste futuro de reescrita em branch própria, preservando datas de autor e committer. A PR usa o template fornecido e registra os 35 testes aprovados, lint/build aprovados e a ausência de medição de coverage.

### Remoção dos testes a pedido do usuário — 01/11/2026

Os 35 testes aprovados citados nesta revisão foram usados somente como validação temporária. Por solicitação do usuário, todos os arquivos de tests/ e o script test do package.json foram removidos da versão final. Referências anteriores a suítes e caminhos de testes registram evidências históricas, não arquivos ou comandos disponíveis atualmente. A CI permanece com lint/build; não foi afirmada cobertura de 80%. Essa decisão não altera a contagem dos 108 requisitos.

Task: https://nexus2026inter.atlassian.net/browse/NI-550

Verificação final da versão sem testes: build de produção aprovado (Vite 8.3.5), lint aprovado na revisão anterior do mesmo código; build com 789 módulos, onze páginas lazy e aviso existente de ECharts (~661 kB). Arquivos de teste e script test removidos. Relatório NI-550 removido por solicitação do usuário; o acompanhamento permanece neste checklist.
