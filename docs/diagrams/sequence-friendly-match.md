# Diagrama de Sequência - Criação de Partida Amistosa

Este diagrama mostra o fluxo completo de criação de partidas amistosas no sistema VarzeaLeague.

## ⚽ Fluxo de Criação de Partida Amistosa

### 📋 **Legenda dos Participantes:**
| Participante | Descrição | Responsabilidade |
|-------------|-----------|------------------|
| 👤 **Usuário** | Usuário final logado no sistema | Criador da partida amistosa |
| 🖥️ **Interface** | Frontend da aplicação | Validações iniciais e exibição |
| 🛡️ **AuthMiddleware** | Middleware de autenticação | Verificação de token JWT |
| ⚽ **FriendlyMatchController** | Controller do backend | Lógica de negócio e validações |
| 👥 **UserModel** | Modelo de usuários | Persistência de dados de usuários |
| 🏃 **FriendlyModel** | Modelo de partidas amistosas | Persistência das partidas |
| 🌐 **ViaCEP API** | Serviço externo de CEP | Validação e dados de endereço |

### 🎨 **Códigos de Cores:**
- 🟡 **Amarelo claro** `rgb(255, 245, 220)` - Processos de autenticação
- 🔵 **Azul claro** `rgb(240, 248, 255)` - Validações de backend
- 🟢 **Verde claro** `rgb(230, 255, 230)` - Preparação e processamento de dados

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant FriendlyMatchController as ⚽ FriendlyMatchController(Backend)
    participant UserModel as 👥 UserModel 
    participant FriendlyModel as 🏃 FriendlyModel
    participant ViaCEP as 🌐 ViaCEP API

    User->>+UI: Acessa "Criar Partida"
    UI-->>-User: Exibe formulário

    User->>+UI: Preenche dados da partida
    Note over User,UI: título, data, hora, local,<br/>modalidade, quadra, CEP

    opt Busca CEP
        UI->>+ViaCEP: Consultar CEP
        ViaCEP-->>-UI: Dados do endereço
        UI->>UI: Preencher UF automaticamente
    end

    User->>+UI: Submete formulário
    UI->>UI: Validações frontend
    
    UI->>+AuthMiddleware: POST /friendly-matches + Bearer token
    
    rect rgb(255, 245, 220)
        Note over AuthMiddleware: Verificação de Autenticação
        AuthMiddleware->>AuthMiddleware: Verificar token JWT
        AuthMiddleware->>AuthMiddleware: Extrair userId do token
    end

    alt Token inválido
        AuthMiddleware-->>UI: 401 - Não autenticado
        UI-->>User: Redireciona para login
    else Token válido
        AuthMiddleware->>+FriendlyController: Dados + userId
        
        rect rgb(240, 248, 255)
            Note over FriendlyController: Validações do Backend
            FriendlyController->>FriendlyController: Verificar campos obrigatórios
            FriendlyController->>FriendlyController: Validar formato de data/hora
            FriendlyController->>FriendlyController: Verificar data futura
        end

        alt Validações falham
            FriendlyController-->>UI: 400 - Dados inválidos
            UI-->>User: Exibe erros específicos
        else Validações passam
            FriendlyController->>+UserModel: Verificar organizer existe
            UserModel-->>-FriendlyController: Dados do usuário
            
            alt Usuário não encontrado
                FriendlyController-->>UI: 404 - Usuário não encontrado
                UI-->>User: Erro de sistema
            else Usuário encontrado
                FriendlyController->>+FriendlyModel: Verificar título único
                FriendlyModel-->>-FriendlyController: Resultado da consulta
                
                alt Título já existe
                    FriendlyController-->>UI: 409 - Nome já existe
                    UI-->>User: Sugerir nome diferente
                else Título único
                    rect rgb(230, 255, 230)
                        Note over FriendlyController: Preparação dos Dados
                        FriendlyController->>FriendlyController: Limpar e formatar CEP
                        FriendlyController->>FriendlyController: Formatar UF (maiúscula)
                        FriendlyController->>FriendlyController: Validar duração (padrão 90min)
                        FriendlyController->>FriendlyController: Definir status inicial (aberta)
                    end
                    
                    FriendlyController->>+FriendlyModel: Criar partida
                    FriendlyModel-->>-FriendlyController: Partida criada
                    
                    FriendlyController-->>-UI: 201 - Partida criada com sucesso
                    UI-->>User: Confirma criação + redireciona
                end
            end
        end
    end
```

## 🏆 Fluxo de Participação de Time em Partida

```mermaid
sequenceDiagram
    autonumber
    participant Captain as 👑 Capitão
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant MatchTeamsController as 🤝 MatchTeamsController
    participant FriendlyModel as 🏃 FriendlyModel
    participant TeamModel as 🏢 TeamModel
    participant MatchTeamsModel as 🔗 MatchTeamsModel
    participant RulesModel as 📋 RulesModel

    Captain->>+UI: Visualiza partida disponível
    UI-->>-Captain: Detalhes da partida

    Captain->>+UI: Clica "Participar com Time"
    UI->>UI: Selecionar time do usuário
    
    UI->>+AuthMiddleware: POST /match-teams/join + Bearer token
    
    AuthMiddleware->>AuthMiddleware: Verificar token
    AuthMiddleware->>+MatchTeamsController: Dados + userId
    
    rect rgb(255, 245, 245)
        Note over MatchTeamsController: Validações de Participação
        MatchTeamsController->>+FriendlyModel: Verificar partida existe
        FriendlyModel-->>-MatchTeamsController: Dados da partida
        
        MatchTeamsController->>+TeamModel: Verificar time existe
        TeamModel-->>-MatchTeamsController: Dados do time
        
        MatchTeamsController->>MatchTeamsController: Verificar se usuário é capitão
    end

    alt Partida não encontrada
        MatchTeamsController-->>UI: 404 - Partida não encontrada
        UI-->>Captain: Erro de partida
    else Time não encontrado
        MatchTeamsController-->>UI: 404 - Time não encontrado
        UI-->>Captain: Erro de time
    else Não é capitão
        MatchTeamsController-->>UI: 403 - Sem permissão
        UI-->>Captain: Apenas capitão pode inscrever
    else Validações passam
        MatchTeamsController->>+MatchTeamsModel: Verificar já participando
        MatchTeamsModel-->>-MatchTeamsController: Status de participação
        
        alt Já participando
            MatchTeamsController-->>UI: 409 - Time já inscrito
            UI-->>Captain: Time já está participando
        else Não participando
            MatchTeamsController->>+RulesModel: Verificar regras da partida
            RulesModel-->>-MatchTeamsController: Regras (idade, gênero)
            
            MatchTeamsController->>+TeamModel: Validar elenco contra regras
            TeamModel-->>-MatchTeamsController: Resultado da validação
            
            alt Regras não atendidas
                MatchTeamsController-->>UI: 400 - Time não atende regras
                UI-->>Captain: Detalhes das regras não atendidas
            else Regras atendidas
                MatchTeamsController->>MatchTeamsController: Verificar vagas disponíveis
                
                alt Partida lotada
                    MatchTeamsController-->>UI: 409 - Partida sem vagas
                    UI-->>Captain: Partida já está completa
                else Vagas disponíveis
                    MatchTeamsController->>+MatchTeamsModel: Criar participação
                    MatchTeamsModel-->>-MatchTeamsController: Participação criada
                    
                    MatchTeamsController->>MatchTeamsController: Verificar se partida ficou completa
                    
                    opt Partida completa
                        MatchTeamsController->>+FriendlyModel: Atualizar status para "confirmada"
                        FriendlyModel-->>-MatchTeamsController: Status atualizado
                    end
                    
                    MatchTeamsController-->>-UI: 200 - Time inscrito com sucesso
                    UI-->>Captain: Confirma participação
                end
            end
        end
    end
```

## 🎯 Fluxo de Atualização Automática de Status

```mermaid
sequenceDiagram
    autonumber
    participant System as ⚙️ Sistema
    participant FriendlyController as ⚽ FriendlyController
    participant FriendlyModel as 🏃 FriendlyModel
    participant MatchTeamsModel as 🔗 MatchTeamsModel
    participant DateTime as 📅 DateTime

    System->>+FriendlyController: Trigger atualização status
    
    loop Para cada partida ativa
        FriendlyController->>+DateTime: Obter data/hora atual
        DateTime-->>-FriendlyController: Timestamp atual
        
        FriendlyController->>+FriendlyModel: Buscar partidas para verificar
        FriendlyModel-->>-FriendlyController: Lista de partidas
        
        rect rgb(255, 250, 240)
            Note over FriendlyController: Lógica de Status
            FriendlyController->>FriendlyController: Para cada partida verificar:
            FriendlyController->>FriendlyController: - Data passou? → cancelar se sem times
            FriendlyController->>FriendlyController: - 2 times? → confirmar partida
            FriendlyController->>FriendlyController: - Data chegou? → iniciar partida
        end
        
        alt Data passou e sem times suficientes
            FriendlyController->>+MatchTeamsModel: Contar times participantes
            MatchTeamsModel-->>-FriendlyController: Número de times
            
            FriendlyController->>+FriendlyModel: Atualizar status para "cancelada"
            FriendlyModel-->>-FriendlyController: Status atualizado
            
        else Partida com 2 times
            FriendlyController->>+FriendlyModel: Atualizar status para "confirmada"
            FriendlyModel-->>-FriendlyController: Status atualizado
            
        else Data chegou e confirmada
            FriendlyController->>+FriendlyModel: Atualizar status para "em_andamento"
            FriendlyModel-->>-FriendlyController: Status atualizado
        end
    end
    
    FriendlyController-->>-System: Atualização completa
```

## 🎮 **Principais Funcionalidades das Partidas Amistosas:**

### ⚽ **Criação de Partidas:**
- **Validação rigorosa** de dados obrigatórios
- **Integração com ViaCEP** para validação de endereços
- **Verificação de unicidade** de nomes de partidas
- **Configuração flexível** de modalidade e regras

### 🏆 **Participação de Times:**
- **Validação de regras** (idade, gênero, etc.)
- **Verificação de capacidade** do elenco
- **Controle de vagas** (máximo 2 times por partida)
- **Status automático** quando partida fica completa

### 🔄 **Gestão Automática:**
- **Atualização de status** baseada em data/hora
- **Cancelamento automático** de partidas sem participantes
- **Confirmação automática** quando atingir 2 times
- **Transição para andamento** no momento da partida