# NexUs Web

Portal em Vite, React e TypeScript. O dashboard fica em `/dashboard`, protegido pelo `PrivateRoute` e pelo contexto de autenticação existentes.

```sh
npm ci
npm run dev
npm run build
npm run lint
```

O Vite usa a porta 8080, ou a próxima livre. Para a integração de autenticação, acesse `http://localhost:8080`: essa é a origem autorizada pelo CORS do backend; outra porta ou `127.0.0.1` representa uma origem diferente. Configure as variáveis de ambiente conforme `.env.example`, sem versionar o `.env`. A autenticação mantém a integração existente; os indicadores do dashboard usam dados demonstrativos.

As telas de planos mantêm os nomes e benefícios de Ceris, Enterprise e Exclusive no frontend. `GET /api/plans` resolve os IDs e preços reais pela identificação de cada plano; somente opções disponíveis na API são oferecidas. O cadastro envia o ID escolhido ao Auth. A área da empresa consulta `GET /api/companies/me` e confirma a troca com `PATCH /api/companies/me/plan`. O CNPJ fica na resposta da empresa, sem duplicação em `/api/profile`.

O dashboard reproduz o [Figma](https://www.figma.com/design/3uQAwIRaRcBgGmSNR6bDBR/Nexus?node-id=805-756): quatro indicadores e sete gráficos funcionais. Usa Apache ECharts para linha com meta, mapa do Brasil por UF, barras empilhadas, heatmap, histograma, boxplot e ranking. Os módulos necessários e a malha local do IBGE são carregados sob demanda. A área principal tem rolagem vertical; gráficos estreitos permitem rolagem horizontal sem comprimir seus rótulos. Cada gráfico oferece **Ver dados**, com uma tabela semântica operável por teclado.

O fluxo dos dados é `services → hooks → páginas/componentes`. `src/services/dashboard.service.ts` fornece `getDashboard({ signal }): Promise<DashboardData>`. Para integrar o backend, substitua a origem mockada nesse serviço pela requisição do cliente HTTP existente, passando o `AbortSignal`, e adapte a resposta ao contrato em `src/types/dashboard.ts`. A resposta deve continuar passando por `toValidatedDashboard`, em `src/utils/validateDashboard.ts`. Categorias e regiões são identificadas por ID; não há dependência dos nomes nem da quantidade de categorias do Figma.

Os mocks ficam em `src/mocks/dashboard.ts`. As UFs usam as quatro classificações ilustrativas do design, sem taxas numéricas inventadas. A origem da malha está documentada em [assets/maps/README.md](assets/maps/README.md). Todo o CSS fica em `styles/` (incluindo `styles/components/` e `styles/pages/`) e as imagens em `assets/`, fora de `src`, que contém somente `.ts` e `.tsx`. Componentes e páginas mantêm suas próprias pastas com `index.tsx`; todas as dez páginas usam `React.lazy` com `Suspense` na composição das rotas.

O projeto não mantém uma suíte de testes automatizados neste momento. A validação usa build, lint e conferência dos fluxos no navegador. O [checklist completo da avaliação](docs/checklist-requisitos-avaliacao.md) registra o estado atualizado de cada requisito, sua localização e as evidências de cumprimento ou pendências.

**Publicação:** o endereço de produção em Vercel ou GitHub Pages ainda não foi informado nem configurado neste repositório. Acrescente aqui o link real após a publicação e confirme o acesso às rotas diretamente pelo navegador. O servidor local não substitui essa entrega.
