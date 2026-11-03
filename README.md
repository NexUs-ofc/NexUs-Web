# NexUs Web

Portal empresarial do ecossistema NexUs, voltado a empresas e suas filiais. A aplicação reúne ferramentas para acompanhar a operação e apoiar decisões: autenticação e cadastro, dashboard analítico, gestão de lojas, relatórios, planos e pagamentos, ranking de produtos, perfil da empresa e assistente chatbot. O frontend integra serviços externos de autenticação, dados empresariais, consulta de endereço e análise NexUs-BI-AI.

Acesse a aplicação publicada em [nex-us-web.vercel.app](https://nex-us-web.vercel.app).

## Stack e escolhas

- **React 19** organiza a interface em componentes reutilizáveis e páginas orientadas a funcionalidades.
- **TypeScript 6** tipa páginas, serviços e contratos de API, ajudando a detectar inconsistências durante o build.
- **Vite 8** fornece servidor de desenvolvimento rápido e empacota a SPA para publicação estática.
- **React Router 7** gerencia rotas e navegação da aplicação.
- **Apache ECharts 6** apresenta os dados analíticos do dashboard em gráficos.
- **ESLint 10** aplica verificações estáticas de qualidade e padrões do React.

A interface é uma SPA. O bundle pode ser servido por hospedagens estáticas ou pelo Nginx da imagem Docker. A infraestrutura Kubernetes é uma opção portátil, enquanto os manifests de CI não publicam imagens nem fazem deploy automático.

## Requisitos e execução local

Use uma versão do Node.js compatível com Vite 8 e npm. Configure as variáveis copiando `.env.example` para `.env`; os valores `VITE_*` são incorporados ao bundle e visíveis no navegador, portanto não coloque segredos privados neles. Configure as URLs e chaves de cliente apropriadas ao ambiente.

```sh
npm ci
npm run dev
```

O servidor usa a porta 8080 (ou a próxima disponível). Para a integração de autenticação, acesse `http://localhost:8080`, origem autorizada pelo CORS do backend; outra porta ou `127.0.0.1` é uma origem diferente.

Comandos disponíveis em `package.json`:

```sh
npm run build    # checagem TypeScript e build de produção
npm run lint     # análise estática com ESLint
npm run preview  # visualização local do build
npm start        # preview acessível na porta 8080
```

## Integrações

A configuração de endpoints está documentada em `.env.example`. Os serviços em `src/services/` encapsulam as chamadas HTTP: autenticação, API principal, ViaCEP e API NexUs-BI-AI. Dashboard, relatórios, ranking e chatbot usam a API NexUs-BI-AI; essa integração requer a chave de cliente e o token Bearer da sessão. O login também depende da origem autorizada pelo CORS. Não versione o `.env` real.

### Por que algumas chaves de API são públicas?

`VITE_AUTH_API_KEY` e `VITE_CHATBOT_API_KEY` são configurações de cliente destinadas ao navegador. Como toda variável `VITE_*` usada pela aplicação, seus valores entram no bundle e podem ser consultados nas requisições. A visibilidade dessas chaves é esperada; elas não devem ser tratadas como segredos ou conceder privilégios administrativos. Isso não se aplica a senhas, tokens de sessão, chaves privadas ou de service role.

Conforme a configuração dos backends informada pelos responsáveis pelo projeto, há CORS e rate limit: o primeiro restringe as origens que podem ler respostas pelo navegador, e o segundo limita o volume de chamadas. CORS não impede chamadas diretas por ferramentas ou outros servidores, e rate limit não substitui autorização. A proteção dos dados depende também da autenticação e das permissões verificadas no backend; o frontend envia o Bearer da sessão aos serviços protegidos. A chave pública sozinha não deve permitir acesso aos dados de outra empresa.

Os backends ficam em outros repositórios; esta documentação registra a configuração informada, sem auditar suas regras ou limites. Referências: [variáveis de ambiente do Vite](https://vite.dev/guide/env-and-mode) e [CORS no MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).

O dashboard carrega os dados de `GET /dashboard`, com validação da resposta e tratamento de erro, sem fallback para mocks locais.

## Estrutura de diretórios

| Caminho | Responsabilidade |
| --- | --- |
| `src/pages/` | Páginas associadas às rotas e fluxos principais. |
| `src/components/` | Componentes reutilizáveis de interface, formulários, tabelas e diálogos. |
| `src/contexts/` | Estado compartilhado, como sessão e acessibilidade. |
| `src/hooks/` | Estado e lógica reutilizável dos fluxos de página e integração. |
| `src/services/` | Clientes HTTP e serviços que integram as APIs externas. |
| `src/types/` | Tipos dos dados de domínio, formulários e respostas. |
| `src/utils/` | Validação, parsing, formatação, filtros e utilitários. |
| `src/config/` | Configuração funcional, como planos. |
| `styles/` | Estilos globais e recursos de estilo. |
| `public/` | Arquivos servidos sem processamento pelo Vite, incluindo fontes. |
| `assets/` | Recursos de desenvolvimento, como mapas e seus materiais de apoio. |
| `docs/` | Documentação de requisitos e operação de containers/Kubernetes. |
| `docker/` | Configuração de runtime do container. |
| `k8s/` | Manifests Kubernetes organizados com Kustomize. |
| `.github/workflows/` | Automação de integração contínua. |

`src/main.tsx` inicializa a aplicação e `src/App.tsx` compõe o roteamento e a estrutura principal. Configurações de build e tipos ficam em `vite.config.ts`, `tsconfig*.json` e `eslint.config.js`.

## Build e hospedagem em container

O build de produção gera os arquivos estáticos em `dist/`. Para imagem Docker, execução, variáveis de build, healthcheck e implantação em cluster, consulte o [guia de containers e Kubernetes](docs/containers.md). A lista de requisitos e acompanhamento do projeto está no [checklist](docs/checklist-requisitos-avaliacao.md).
