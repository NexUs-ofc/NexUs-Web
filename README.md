# NexUs Web

Portal em Vite, React e TypeScript. O dashboard fica em `/dashboard`, protegido pelo `PrivateRoute` e pelo contexto de autenticação existentes.

```sh
npm ci
npm run dev
npm run build
npm run lint
npm test
```

O Vite usa a porta 8080, ou a próxima livre. Para a integração de autenticação, acesse `http://localhost:8080`: essa é a origem autorizada pelo CORS do backend; outra porta ou `127.0.0.1` representa uma origem diferente. Configure as variáveis de ambiente conforme `.env.example`, sem versionar o `.env`. A autenticação mantém a integração existente; o dashboard e a tela de relatórios consomem a API de relatórios (`VITE_REPORTS_API_BASE_URL` e `VITE_REPORTS_API_KEY`, ver `.env.example`), que exige o token do login.

As telas de planos mantêm os nomes e benefícios de Ceris, Enterprise e Exclusive no frontend. `GET /api/plans` resolve os IDs e preços reais pela identificação de cada plano; somente opções disponíveis na API são oferecidas. O cadastro envia o ID escolhido ao Auth. A área da empresa consulta `GET /api/companies/me` e confirma a troca com `PATCH /api/companies/me/plan`. O CNPJ fica na resposta da empresa, sem duplicação em `/api/profile`.

O dashboard reproduz o [Figma](https://www.figma.com/design/3uQAwIRaRcBgGmSNR6bDBR/Nexus?node-id=805-756): quatro indicadores e sete gráficos funcionais. Usa Apache ECharts para linha com meta, mapa do Brasil por UF, barras empilhadas, heatmap, histograma, boxplot e ranking. Os módulos necessários e a malha local do IBGE são carregados sob demanda. A área principal tem rolagem vertical; gráficos estreitos permitem rolagem horizontal sem comprimir seus rótulos. Cada gráfico oferece **Ver dados**, com uma tabela semântica operável por teclado.

O fluxo dos dados é `services → hooks → páginas/componentes`. `src/services/dashboard.service.ts` fornece `getDashboard({ signal }): Promise<DashboardData>`. Para integrar o backend, substitua a origem mockada nesse serviço pela requisição do cliente HTTP existente, passando o `AbortSignal`, e adapte a resposta ao contrato em `src/types/dashboard.ts`. A resposta deve continuar passando por `toValidatedDashboard`, em `src/utils/validateDashboard.ts`. Categorias e regiões são identificadas por ID; não há dependência dos nomes nem da quantidade de categorias do Figma.

Os mocks ficam em `src/mocks/dashboard.ts`. As UFs usam as quatro classificações ilustrativas do design, sem taxas numéricas inventadas. A origem da malha está documentada em [assets/maps/README.md](assets/maps/README.md). Todo o CSS fica em `styles/` (incluindo `styles/components/` e `styles/pages/`) e as imagens em `assets/`, fora de `src`, que contém somente `.ts` e `.tsx`. Componentes e páginas mantêm suas próprias pastas com `index.tsx`; todas as dez páginas usam `React.lazy` com `Suspense` na composição das rotas.

As filiais usam o core em `VITE_CORE_API_BASE_URL` (padrão: `https://ceris-core.discloud.dev`) pelo mesmo cliente autenticado do perfil. Listagem, consulta individual, cadastro, edição, exclusão e imagens passam por `stores.service.ts`. O formulário oferece um telefone, enviado em `phones: [telefone]`, e máscaras `HH:mm` para abertura/fechamento. A edição consulta a filial por ID e envia PATCH para `/api/companies/me/stores/{id}`, mantendo o CNPJ no corpo e sem enviar e-mail. CEP e telefone sem valor disponível são omitidos para não enviar valores vazios no PATCH. A aceitação dessa omissão precisa ser confirmada no core. Fotos são enviadas em multipart após salvar os dados; falha da foto mantém o cadastro e exibe aviso para tentar novamente pela edição. Não há fallback para mocks nem persistência local das filiais.

No cadastro e na edição de filiais, um CEP com oito dígitos consulta o [ViaCEP](https://viacep.com.br/) e preenche rua, bairro, cidade e estado, que ficam desabilitados após a confirmação. O número permanece manual. Trocar o CEP limpa o endereço anterior, cancela a busca pendente e consulta novamente. Durante a busca ou em caso de erro, o salvamento fica bloqueado; CEP inexistente ou sem rua/bairro pede um CEP válido. A consulta não envia cookies nem token do core. O host usa `VITE_VIACEP_API_BASE_URL`, com padrão `https://viacep.com.br`, e está documentado em `.env.example`.

`npm test` executa testes de contratos, transporte autenticado, validação, CEP/ViaCEP, horários, telefone único, imagens, erros e cancelamento com HTTP interceptado, usando o runner nativo do Node e o transformador do Vite. Build, lint e conferência no navegador complementam a suíte; ela não substitui a validação autenticada no ambiente real. O [checklist completo da avaliação](docs/checklist-requisitos-avaliacao.md) registra o estado atualizado de cada requisito, sua localização e as evidências de cumprimento ou pendências.

**Publicação:** o endereço de produção em Vercel ou GitHub Pages ainda não foi informado nem configurado neste repositório. Acrescente aqui o link real após a publicação e confirme o acesso às rotas diretamente pelo navegador. O servidor local não substitui essa entrega.


A edicao de filiais abre em `/lojas/editar/:id` e usa `useParams`, com validacao de ID ausente/invalido antes da consulta ao core. Acesso direto, loading, erros e nova tentativa ficam na pagina; salvar ou cancelar retorna para `/lojas`. A exclusao continua usando dialogo.
