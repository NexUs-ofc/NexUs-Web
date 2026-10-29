# Malha das unidades da federação

`brazil-states.geo.json` contém a malha simplificada das 27 UFs fornecida pelo [IBGE — API de Malhas Geográficas](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3), obtida em 29/10/2026.

Origem: `https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo%2Bjson&qualidade=minima&intrarregiao=UF`.

Foi acrescentada a propriedade `name` com a sigla correspondente ao `codarea` de cada UF, para associar a geometria aos dados do dashboard. As coordenadas não foram alteradas. A malha é distribuída com a aplicação; sua exibição não exige acesso à API do IBGE. As classes de desperdício são mocks independentes da fonte geográfica.
