# NexUs Web

O NexUs Web é o portal empresarial do ecossistema NexUs. Ele reúne informações da empresa e de suas filiais para apoiar o acompanhamento da operação e a tomada de decisões.

O projeto é desenvolvido com React, TypeScript e Vite e se conecta aos serviços de autenticação, gestão empresarial e análise de dados do ecossistema.

O Vite usa a porta 8080, ou a próxima livre. Para a integração de autenticação, acesse `http://localhost:8080`: essa é a origem autorizada pelo CORS do backend; outra porta ou `127.0.0.1` representa uma origem diferente. Configure as variáveis de ambiente conforme `.env.example`, sem versionar o `.env`. A autenticação mantém a integração existente; o dashboard e a tela de relatórios consomem a API NexUs-BI-AI, a mesma do chatbot (`VITE_CHATBOT_API_BASE_URL` e `VITE_CHATBOT_API_KEY`, ver `.env.example`), que exige o token do login.

Acesse o [NexUs Web](https://nex-us-web.vercel.app).

A documentação de acompanhamento está no [checklist do projeto](docs/checklist-requisitos-avaliacao.md).

## Containers e Kubernetes

Consulte o [guia de containers e Kubernetes](docs/containers.md) para build, configuração e execução em qualquer cluster.
