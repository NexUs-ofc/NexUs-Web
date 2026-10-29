# NexUs Web

Portal em Vite, React e TypeScript. O dashboard fica em `/dashboard`, protegido pelo `PrivateRoute` e pelo contexto de autenticação existentes.

```sh
npm ci
npm run dev
npm run build
npm run lint
```

O Vite usa a porta 8080, ou a próxima livre. Configure as variáveis de ambiente conforme `.env.example`, sem versionar o `.env`. A autenticação mantém a integração existente; os indicadores do dashboard usam dados demonstrativos.

O dashboard reproduz o [Figma](https://www.figma.com/design/3uQAwIRaRcBgGmSNR6bDBR/Nexus?node-id=805-756): quatro indicadores e sete gráficos funcionais. Usa Apache ECharts para linha com meta, mapa do Brasil por UF, barras empilhadas, heatmap, histograma, boxplot e ranking. Os módulos necessários e a malha local do IBGE são carregados sob demanda. A área principal tem rolagem vertical; gráficos estreitos permitem rolagem horizontal sem comprimir seus rótulos. Cada gráfico oferece **Ver dados**, com uma tabela semântica operável por teclado.

O fluxo dos dados é `services → hooks → páginas/componentes`. `src/services/dashboard.service.ts` fornece `getDashboard({ signal }): Promise<DashboardData>`. Para integrar o backend, substitua a origem mockada nesse serviço pela requisição do cliente HTTP existente, passando o `AbortSignal`, e adapte a resposta ao contrato em `src/types/dashboard.ts`. A resposta deve continuar passando por `toValidatedDashboard`, em `src/utils/validateDashboard.ts`. Categorias e regiões são identificadas por ID; não há dependência dos nomes nem da quantidade de categorias do Figma.

Os mocks ficam em `src/mocks/dashboard.ts`. As UFs usam as quatro classificações ilustrativas do design, sem taxas numéricas inventadas. A origem da malha está documentada em [assets/maps/README.md](assets/maps/README.md). O CSS novo fica em `styles/dashboard.css`, fora de `src`, para respeitar a exigência de adicionar somente `.ts` e `.tsx` nessa pasta. Componentes e páginas mantêm suas próprias pastas com `index.tsx`.

O projeto não mantém uma suíte de testes automatizados neste momento. A validação usa build, lint e conferência dos fluxos no navegador. O [checklist da avaliação](docs/dashboard-checklist.md) registra também os requisitos globais que ainda precisam de trabalho ou demonstração.

**Publicação:** o endereço de produção em Vercel ou GitHub Pages ainda não foi informado nem configurado neste repositório. Acrescente aqui o link real após a publicação e confirme o acesso às rotas diretamente pelo navegador. O servidor local não substitui essa entrega.
