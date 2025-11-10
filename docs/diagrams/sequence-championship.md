# Diagrama de Sequência - Sistema de Campeonatos

Este diagrama mostra o fluxo completo de criação e gestão de campeonatos no sistema VarzeaLeague.

## 🏆 Fluxo de Criação de Campeonato

```mermaid
sequenceDiagram
    autonumber
    participant Admin as 👑 Admin
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant ChampController as 🏆 ChampController
    participant ChampModel as 🗃️ ChampModel
    participant UserModel as 👥 UserModel
    participant JWT as 🎫 JWT

    Admin->>+UI: Acessa "Criar Campeonato"
    UI-->>-Admin: Exibe formulário

    Admin->>+UI: Preenche dados do campeonato
    Note over Admin,UI: nome, descrição, datas,<br/>modalidade, tipo, gênero

    Admin->>+UI: Submete formulário
    UI->>UI: Validações frontend
    
    UI->>+AuthMiddleware: POST /championships + Bearer token
    
    rect rgb(255, 245, 220)
        Note over AuthMiddleware: Verificação de Permissões
        AuthMiddleware->>AuthMiddleware: Verificar token JWT
        AuthMiddleware->>+JWT: Decodificar token
        JWT-->>-AuthMiddleware: UserId extraído
        
        AuthMiddleware->>+UserModel: Buscar usuário
        UserModel-->>-AuthMiddleware: Dados do usuário + userType
        
        AuthMiddleware->>AuthMiddleware: Verificar permissão (admin/eventos)
    end

    alt Sem permissão
        AuthMiddleware-->>UI: 403 - Acesso negado
        UI-->>Admin: Erro de permissão
    else Permissão válida
        AuthMiddleware->>+ChampController: Dados + userId + userType
        
        rect rgb(240, 248, 255)
            Note over ChampController: Validações do Backend
            ChampController->>ChampController: Verificar campos obrigatórios
            ChampController->>ChampController: Validar datas (início < fim)
            ChampController->>ChampController: Validar data início futura
            ChampController->>ChampController: Validar modalidade válida
            ChampController->>ChampController: Validar gênero válido
        end

        alt Validações falham
            ChampController-->>UI: 400 - Dados inválidos
            UI-->>Admin: Exibe erros específicos
        else Validações passam
            ChampController->>+ChampModel: Verificar nome único
            ChampModel-->>-ChampController: Resultado da consulta
            
            alt Nome já existe
                ChampController-->>UI: 409 - Nome já existe
                UI-->>Admin: Sugerir nome diferente
            else Nome único
                rect rgb(230, 255, 230)
                    Note over ChampController: Criação do Campeonato
                    ChampController->>ChampController: Definir status inicial (rascunho)
                    ChampController->>ChampController: Associar criador (created_by)
                    ChampController->>ChampController: Configurar tipo de campeonato
                end
                
                ChampController->>+ChampModel: Criar campeonato
                ChampModel-->>-ChampController: Campeonato criado
                
                ChampController-->>-UI: 201 - Campeonato criado
                UI-->>Admin: Confirma criação + redireciona
            end
        end
    end
```

## 📝 Fluxo de Inscrição de Time em Campeonato

```mermaid
sequenceDiagram
    autonumber
    participant Captain as 👑 Capitão
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant ChampController as 🏆 ChampController
    participant ChampModel as 🗃️ ChampModel
    participant TeamModel as 🏢 TeamModel
    participant ChampAppModel as 📋 ChampAppModel
    participant NotificationService as 🔔 NotificationService

    Captain->>+UI: Visualiza campeonato disponível
    UI-->>-Captain: Detalhes do campeonato

    Captain->>+UI: Clica "Inscrever Time"
    UI->>UI: Selecionar time do usuário
    
    UI->>+AuthMiddleware: POST /championships/:id/applications + token
    
    AuthMiddleware->>AuthMiddleware: Verificar token
    AuthMiddleware->>+ChampController: Dados + userId
    
    rect rgb(255, 245, 245)
        Note over ChampController: Validações de Inscrição
        ChampController->>+ChampModel: Verificar campeonato existe
        ChampModel-->>-ChampController: Dados do campeonato
        
        ChampController->>+TeamModel: Verificar time existe
        TeamModel-->>-ChampController: Dados do time
        
        ChampController->>ChampController: Verificar se usuário é capitão
        ChampController->>ChampController: Verificar período de inscrições
    end

    alt Campeonato não encontrado
        ChampController-->>UI: 404 - Campeonato não encontrado
        UI-->>Captain: Erro de campeonato
    else Fora do período
        ChampController-->>UI: 400 - Inscrições encerradas
        UI-->>Captain: Período de inscrição encerrado
    else Não é capitão
        ChampController-->>UI: 403 - Sem permissão
        UI-->>Captain: Apenas capitão pode inscrever
    else Validações passam
        ChampController->>+ChampAppModel: Verificar inscrição existente
        ChampAppModel-->>-ChampController: Status de inscrição
        
        alt Já inscrito
            ChampController-->>UI: 409 - Time já inscrito
            UI-->>Captain: Time já possui inscrição
        else Não inscrito
            ChampController->>+TeamModel: Validar elenco (regras campeonato)
            TeamModel-->>-ChampController: Resultado da validação
            
            alt Elenco inadequado
                ChampController-->>UI: 400 - Elenco não atende regras
                UI-->>Captain: Detalhes dos problemas do elenco
            else Elenco adequado
                rect rgb(230, 255, 230)
                    Note over ChampController: Processamento da Inscrição
                    ChampController->>+ChampAppModel: Criar inscrição (status: pendente)
                    ChampAppModel-->>-ChampController: Inscrição criada
                    
                    ChampController->>+NotificationService: Notificar admin do campeonato
                    NotificationService-->>-ChampController: Notificação enviada
                end
                
                ChampController-->>-UI: 201 - Inscrição enviada
                UI-->>Captain: Confirma inscrição pendente
            end
        end
    end
```

## ✅ Fluxo de Aprovação de Inscrições

```mermaid
sequenceDiagram
    autonumber
    participant Admin as 👑 Admin Campeonato
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant ChampController as 🏆 ChampController
    participant ChampModel as 🗃️ ChampModel
    participant ChampAppModel as 📋 ChampAppModel
    participant TeamChampModel as 🏆 TeamChampModel
    participant NotificationService as 🔔 NotificationService

    Admin->>+UI: Acessa gestão do campeonato
    UI->>+ChampController: GET /championships/:id/applications
    ChampController->>+ChampAppModel: Buscar inscrições pendentes
    ChampAppModel-->>-ChampController: Lista de inscrições
    ChampController-->>-UI: Inscrições pendentes
    UI-->>-Admin: Lista para análise

    Admin->>+UI: Analisa e decide sobre inscrição
    UI->>+AuthMiddleware: PUT /championships/:id/applications/:appId/status + token
    
    AuthMiddleware->>AuthMiddleware: Verificar permissões admin/criador
    AuthMiddleware->>+ChampController: Dados + decisão (aprovado/rejeitado)
    
    rect rgb(255, 245, 245)
        Note over ChampController: Validações de Aprovação
        ChampController->>+ChampModel: Verificar campeonato existe
        ChampModel-->>-ChampController: Dados do campeonato
        
        ChampController->>+ChampAppModel: Verificar inscrição existe
        ChampAppModel-->>-ChampController: Dados da inscrição
        
        ChampController->>ChampController: Verificar permissão para aprovar
        ChampController->>ChampController: Verificar status atual (pendente)
    end

    alt Decisão: APROVADO
        ChampController->>+ChampAppModel: Atualizar status para "aprovado"
        ChampAppModel-->>-ChampController: Status atualizado
        
        ChampController->>+TeamChampModel: Criar participação oficial
        Note over TeamChampModel: Registro com pontuação zerada
        TeamChampModel-->>-ChampController: Participação criada
        
        ChampController->>+NotificationService: Notificar capitão (aprovação)
        NotificationService-->>-ChampController: Notificação enviada
        
        ChampController-->>UI: 200 - Time aprovado
        UI-->>Admin: Confirma aprovação
        
    else Decisão: REJEITADO
        ChampController->>+ChampAppModel: Atualizar status para "rejeitado"
        ChampAppModel-->>-ChampController: Status atualizado
        
        ChampController->>+NotificationService: Notificar capitão (rejeição)
        NotificationService-->>-ChampController: Notificação enviada
        
        ChampController-->>-UI: 200 - Time rejeitado
        UI-->>Admin: Confirma rejeição
    end
```

## ⚽ Fluxo de Agendamento de Partidas

```mermaid
sequenceDiagram
    autonumber
    participant Admin as 👑 Admin Campeonato
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant ChampController as 🏆 ChampController
    participant ChampModel as 🗃️ ChampModel
    participant TeamChampModel as 🏆 TeamChampModel
    participant FriendlyModel as 🏃 FriendlyModel
    participant MatchChampModel as ⚽ MatchChampModel
    participant MatchTeamsModel as 🔗 MatchTeamsModel

    Admin->>+UI: Acessa "Agendar Partidas"
    UI->>+ChampController: GET /championships/:id/teams
    ChampController->>+TeamChampModel: Buscar times aprovados
    TeamChampModel-->>-ChampController: Lista de times
    ChampController-->>-UI: Times disponíveis
    UI-->>-Admin: Interface de agendamento

    Admin->>+UI: Define partida (times, data, local, rodada)
    UI->>+AuthMiddleware: POST /championships/:id/matches + token
    
    AuthMiddleware->>AuthMiddleware: Verificar permissões
    AuthMiddleware->>+ChampController: Dados da partida + userId
    
    rect rgb(255, 245, 245)
        Note over ChampController: Validações do Agendamento
        ChampController->>+ChampModel: Verificar campeonato existe
        ChampModel-->>-ChampController: Dados do campeonato
        
        ChampController->>ChampController: Verificar times diferentes
        ChampController->>ChampController: Verificar data futura
        ChampController->>ChampController: Verificar times participam do campeonato
        ChampController->>ChampController: Verificar conflitos de agenda
    end

    alt Validações falham
        ChampController-->>UI: 400 - Dados inválidos
        UI-->>Admin: Exibe erros específicos
    else Validações passam
        rect rgb(230, 255, 230)
            Note over ChampController: Criação da Partida
            ChampController->>+FriendlyModel: Criar partida base
            Note over FriendlyModel: Cria na tabela principal<br/>com status "confirmada"
            FriendlyModel-->>-ChampController: Partida criada (ID)
            
            ChampController->>+MatchChampModel: Vincular ao campeonato
            Note over MatchChampModel: Mesmo ID, dados específicos<br/>do campeonato (rodada, etc.)
            MatchChampModel-->>-ChampController: Vínculo criado
            
            ChampController->>+MatchTeamsModel: Vincular time mandante
            MatchTeamsModel-->>-ChampController: Time mandante vinculado
            
            ChampController->>+MatchTeamsModel: Vincular time visitante
            MatchTeamsModel-->>-ChampController: Time visitante vinculado
        end
        
        ChampController-->>-UI: 201 - Partida agendada
        UI-->>Admin: Confirma agendamento
    end
```

## 🏅 **Principais Funcionalidades do Sistema de Campeonatos:**

### 🏆 **Criação e Gestão:**
- **Controle de permissões** (apenas admins podem criar)
- **Validações rigorosas** de datas e configurações
- **Sistema de status** (rascunho → publicado → iniciado)
- **Configuração flexível** de modalidades e gêneros

### 📝 **Sistema de Inscrições:**
- **Processo de aprovação** controlado pelo admin
- **Validação automática** do elenco contra regras
- **Notificações automáticas** para todas as partes
- **Controle de períodos** de inscrição

### ⚽ **Agendamento de Partidas:**
- **Integração com sistema** de partidas principal
- **Controle de rodadas** e classificação
- **Verificação de conflitos** de agenda
- **Gestão automática** de status das partidas

### 🎯 **Funcionalidades Avançadas:**
- **Sistema dual** (FriendlyMatches + MatchChampionship)
- **Classificação automática** com pontuação
- **Gestão de elencos** e validações de regras
- **Notificações** em tempo real para participantes