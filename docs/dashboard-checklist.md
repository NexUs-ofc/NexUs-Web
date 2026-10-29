# Verificação dos requisitos — dashboard

Revisão em 29/10/2026. “Atendido no dashboard” descreve esta entrega. Itens globais e demonstrações presenciais são identificados separadamente; não representam certificação WCAG completa do site.

| Requisito | Verificação |
| --- | --- |
| Vite + React + TypeScript | Mantidos. `npm run build` executa TypeScript e Vite. |
| Somente `.ts`/`.tsx` dentro de `src` | Todos os arquivos novos em `src` seguem a regra. Pendência global preexistente: 23 CSS e 14 imagens/SVGs nessa pasta. O CSS novo e a malha ficam fora de `src`. |
| Proibição de `.js`/`.jsx` em `src` | Atendida; busca não encontrou essas extensões. |
| Componentes em `src/components`, páginas em `src/pages` | Atendido no dashboard. |
| Uma pasta e `index.tsx` por componente/página | Atendido nos sete componentes novos e na página. |
| Pelo menos seis componentes com responsabilidade única | Sete novos: Summary, StatCard, ChartsGrid, ChartCard, Chart, ChartLegend e DataTable. |
| Separar renderização, negócio e serviços | Componentes apresentam dados; hooks gerenciam carregamento e instâncias; utils preparam e validam; serviços fornecem os dados. Nenhum componente/página novo importa serviços. |
| Interfaces para todas as props | Atendido nos componentes novos. A página não recebe props. |
| Entidades de domínio em arquivos de `src/types` | `dashboard.ts` e `dashboardChart.ts`. |
| Proibição de `any` em `src` | Busca não encontrou ocorrências. |
| Comunicação externa isolada e separada por recurso | Serviços de dashboard e geografia dedicados. O dashboard não faz requisições externas neste estágio. O cliente HTTP preexistente continua em services. |
| Retornos `Promise<Tipo>` e `try/catch` em serviços | Atendido nos dois serviços novos. |
| Proibição de `fetch` em componentes/páginas | Atendida. Único `fetch` encontrado está em `src/services/apiClient.ts`. |
| URLs privadas/chaves em ambiente, sem versionamento | Esta entrega não acrescenta URLs privadas nem chaves. `.env` permanece ignorado. A revisão dos serviços preexistentes não foi ampliada para uma auditoria de segredos. |
| Estado local com `useState`, campos relacionados agrupados | `useDashboard` agrupa payload, mapa, loading, erro e revisão; cada card tem apenas o estado de exibição da tabela. |
| Sem mutação de arrays/objetos | Adaptação cria novos objetos; ranking ordena uma cópia. Teste confirma preservação da origem. |
| `useEffect` com dependências completas | Dependências explícitas em página e hooks. ESLint com regras de hooks passou. |
| Listas com IDs únicos, sem `key={index}` em listas mutáveis | Novas listas usam IDs de domínio/coluna. O índice de coluna apenas seleciona a célula; não é usado como key. O OTP preexistente usa índices em seis posições fixas, sem adição/remoção/reordenação. |
| `useParams` e tratamento de `undefined` | Não se aplica à rota estática `/dashboard`. Nenhuma rota atual usa parâmetros dinâmicos; permanece requisito global pendente, sem criar uma rota artificial nesta entrega. |
| Pelo menos três rotas em React Router | Já existem mais de três em `App.tsx`. |
| Navegação com Link/useNavigate; sem `window.location.href` | Mantida a navegação existente; busca não encontrou uso proibido. |
| Rota curinga e página de erro com retorno | Já existe `path="*"`, com `NotFoundPage` e botão que usa `useNavigate`. |
| Ações em buttons, sem `div onClick` | Atendido; controles de dados e tentativa são buttons. |
| Labels com `htmlFor` | Dashboard não tem formulário. FormInput, filtros e formulários existentes usam associação explícita. |
| Imagens com alt | Nenhuma imagem foi adicionada ao JSX do dashboard. Mapas e gráficos são SVGs dinâmicos com descrição acessível; assets do layout são reutilizados. |
| Texto com contraste AA | Texto do dashboard usa tons escuros; rótulos do heatmap escolhem preto/branco pelo contraste real. Teste varre 1.001 pontos da escala, todos ≥ 4,5:1. |
| Erros no DOM com `role="alert"` | `ErrorAlert` para carregamento e falha de desenho. Erro e recuperação do serviço verificados no navegador. |
| Operação completa por teclado e foco visível | Tab/Enter nas tabelas e tentativa; regiões de rolagem focáveis e navegáveis com setas. Foco permanece no acionador ao fechar a tabela. Verificado no Chrome. |
| Carregando, sucesso e erro no DOM | LoadingSpinner, status de sucesso e ErrorAlert. Estados e tentativa por teclado verificados no navegador. |
| Sem alert/console como único feedback | Nenhum `alert()` ou `console.log` no código novo. |
| Publicação em Vercel/GitHub Pages e link no README | Pendente global: não há endereço de produção confirmado. README registra a pendência, sem fabricar um link. |
| Aplicação acessível durante a apresentação | Exige publicação e conferência no dia. Não validado por um servidor local. |
| Pelo menos 20 commits cobrindo quatro semanas | Histórico existente: 66 commits entre 05/07/2026 e 29/10/2026. Nenhum histórico ou data foi fabricado. |
| Conventional Commits, sem mensagens genéricas | Há commits convencionais recentes; o histórico também contém merges automáticos e mensagens iniciais genéricas. Isso é uma pendência do histórico original, que não foi reescrito. |
| Context API com Provider, hook e tipos | AuthContext/useAuth e StoresContext/useStoresContext já existem. Esta entrega reutiliza o contexto de autenticação através do hook do dashboard para a saudação; não duplica autenticação. |
| Demonstração oral de prop drilling resolvido | Pendente presencial. Exemplo concreto existente: coleção e operações de lojas compartilhadas sem repasse pelo layout. |
| useReducer com state e actions union tipados | Já existe em AuthContext e useStoreCollection. O carregamento simples do dashboard usa useState, sem criar complexidade artificial. |
| Justificativa oral do useReducer | Pendente presencial: mostrar as transições de carregamento, gravação, falha e feedback de lojas, ou as transições da autenticação. |
| Hook customizado tipado, loading e erros | `useDashboard` tem interface de retorno e os três estados. |
| AbortController e prevenção de estado após unmount | Serviços recebem sinal; hook cancela e ignora resoluções abortadas. Teste de cancelamento e navegação durante carregamento passaram. |
| React.lazy + Suspense por página | Dashboard continua lazy em App, com Suspense existente. O renderizador ECharts e a malha também são módulos separados sob demanda. Pendência global preexistente: RegisterPage e VerifyRegistrationPage ainda são imports diretos. |
| Demonstração de chunks na aba Network | Build confirmou chunks distintos. A demonstração ao vivo continua pendente. |
| localStorage com `_versao`, validação e descarte | Já existe para sessão, cadastro e lojas. Dashboard não persiste métricas mockadas nem preferências sem requisito funcional. |
| useMemo e useCallback com justificativa | `useDashboardCharts` evita repetir agrupamentos, ordenação e criação das opções; cards usam memo. `reload` mantém identidade estável com useCallback. Otimizações adicionais já existem em useStores. |
| Demonstração no React DevTools Profiler | Pendente presencial: comparar a preparação dos modelos com/sem memoização; não confundir tempo de montagem inicial com rerenderizações. |
| Sem dangerouslySetInnerHTML externo | Busca não encontrou essa API. Tabelas/saudação/erros usam JSX. Tooltips usam richText em SVG, sem HTML. |
| Tratamento dos dados externos antes de renderizar | `toValidatedDashboard` valida objetos, finitude, limites, IDs, referências e quartis; sanitiza textos. Serviços retornam apenas o contrato validado. |
| Validação/sanitização tipada de formulários em utils | Nenhum formulário novo nesta página. Validadores existentes de login/cadastro/lojas foram preservados. |
| Tipo, tamanho máximo e erro específico por campo | Não se aplica ao dashboard sem formulário. Validação de payload tem tipos, tamanhos máximos e erros específicos, convertidos pelo serviço em feedback compreensível. Auditoria completa dos formulários é separada. |
| Nenhum dado de formulário enviado sem validação | Nenhum envio de formulário foi acrescentado. Dashboard é leitura. |
| PrivateRoute, redirecionamento ao login e auth no Context | Mantido o PrivateRoute preexistente envolvendo PortalLayout e dashboard. A página não verifica autenticação. |
| Modais, menus, abas e padrões ARIA adequados | Dashboard não introduz modal/menu/abas. O botão de tabela usa `aria-expanded` e `aria-controls`; não se acrescenta `aria-haspopup` ou `aria-selected` sem popup ou seleção. Modais de lojas existentes permanecem fora do escopo visual. |
| Gerenciamento de foco ao abrir/fechar | Título recebe foco ao entrar na rota e ao tentar recarregar após erro; expandir/recolher dados mantém o foco no botão, sem popup ou armadilha. `useDialog` existente gerencia foco dos modais de lojas. |
| Landmarks header/main/nav/footer | Presentes no dashboard e layout compartilhado. Nem todas as páginas antigas contêm todos os landmarks; requisito global ainda exige revisão. |
| Leitor de tela NVDA/VoiceOver sem perda de contexto | Tabelas, captions, escopos, descrições e live regions implementados. Validação presencial com leitor de tela ainda necessária; não realizada nesta entrega. |

Verificação de interface: Chrome em 1440, 1280, 1024, 768, 390 e 320 px; sete SVGs renderizados; sem overflow horizontal da página; rolagem horizontal restrita aos gráficos em telas estreitas; abertura/fechamento de tabela e recuperação de erro pelo teclado; navegação durante carregamento; nenhum erro de JavaScript observado.

O build ainda informa que o chunk sob demanda do renderizador ECharts excede 500 kB antes de gzip. Ele não faz parte do carregamento inicial de login ou das outras páginas. Não se adicionaram plugins, rotas, filtros, persistência ou autenticação fictícia para encobrir requisitos que pertencem ao projeto completo.
