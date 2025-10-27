# VARZEA LEAGUE

**VARZEA LEAGUE** é uma plataforma web voltada para a **organização de campeonatos amadores de futebol**, com funcionalidades que permitem o **gerenciamento de times, atletas, jogos e eventos esportivos**, além de promover a **visibilidade de torneios e atletas** por meio de estatísticas e rankings.

## 📌 Objetivos do Projeto

- Organizar campeonatos amadores de forma prática e transparente.
- Facilitar o gerenciamento de equipes e jogadores amadores.
- Analisar estatísticas e divulgar informações relevantes dos campeonatos.

## 👥 Atores/Usuários

- Administrador do sistema
- Administrador de eventos
- Administrador de times
- Usuário visitante

## 🛠️ Principais Funcionalidades

- Cadastro de equipes, jogadores e campeonatos.
- Divulgação de torneios e partidas em andamento.
- Registro de súmulas e estatísticas.
- Apresentação de rankings e calendários de eventos.
- Permitir avaliações e visualização pública de informações relevantes.

## 🏅 MVP da Partida (Votação)

Qualquer usuário autenticado pode votar no MVP de partidas finalizadas (amistosas ou de campeonato). A votação é feita por partida, um voto por usuário (pode alterar o voto a qualquer momento).

- Rota do frontend: `/mvp` (menu “Votar MVP” no topo)

APIs disponíveis:

- GET `/api/matches/status/finished/list` — lista as partidas com status `finalizada`
- GET `/api/matches/:id/players` — lista pública dos jogadores vinculados à partida
- GET `/api/matches/:id/mvp-votes/summary` — contagem de votos por jogador e líder atual
- POST `/api/matches/:id/mvp-votes` — registra/atualiza o voto (não requer login; usa cookie anônimo ao votar deslogado)

Notas:

- Se logado, o voto é atrelado ao usuário; se deslogado, é atrelado a um cookie (um voto por navegador/dispositivo por partida).
- A lista de jogadores respeita soft delete (somente jogadores ativos).
