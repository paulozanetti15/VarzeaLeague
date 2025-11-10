# Diagrama de Sequência - Gestão de Times e Jogadores

Este diagrama mostra o fluxo completo de criação e gestão de times, incluindo adição e remoção de jogadores no sistema VarzeaLeague.

## 👥 Fluxo de Criação de Time

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant TeamController as 🏢 TeamController
    parameter UserModel as 👥 UserModel
    participant TeamModel as 🏢 TeamModel

    User->>+UI: Acessa "Criar Time"
    UI-->>-User: Exibe formulário

    User->>+UI: Preenche dados do time
    Note over User,UI: nome, descrição,<br/>cores, banner

    User->>+UI: Submete formulário
    UI->>UI: Validações frontend
    
    UI->>+AuthMiddleware: POST /teams + Bearer token
    
    AuthMiddleware->>AuthMiddleware: Verificar token JWT
    AuthMiddleware->>+TeamController: Dados + userId
    
    rect rgb(240, 248, 255)
        Note over TeamController: Validações do Backend
        TeamController->>TeamController: Verificar campos obrigatórios
        TeamController->>TeamController: Validar formato de cores
        TeamController->>TeamController: Validar tamanho da descrição
    end

    alt Validações falham
        TeamController-->>UI: 400 - Dados inválidos
        UI-->>User: Exibe erros específicos
    else Validações passam
        TeamController->>+UserModel: Verificar usuário existe
        UserModel-->>-TeamController: Dados do usuário
        
        TeamController->>+TeamModel: Verificar nome único
        TeamModel-->>-TeamController: Resultado da consulta
        
        alt Nome já existe
            TeamController-->>UI: 409 - Nome já existe
            UI-->>User: Sugerir nome diferente
        else Nome único
            TeamController->>+TeamModel: Criar time
            Note over TeamModel: userId como capitão,<br/>isDeleted: false
            TeamModel-->>-TeamController: Time criado
            
            TeamController-->>-UI: 201 - Time criado com sucesso
            UI-->>User: Confirma criação + redireciona
        end
    end
```

## ⚽ Fluxo de Adição de Jogador ao Time

```mermaid
sequenceDiagram
    autonumber
    participant Captain as 👑 Capitão
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant PlayerController as ⚽ PlayerController
    participant TeamModel as 🏢 TeamModel
    participant PlayerModel as 🏃 PlayerModel
    participant TeamPlayerModel as 🔗 TeamPlayerModel

    Captain->>+UI: Acessa gestão do time
    UI-->>-Captain: Interface de gerenciamento

    Captain->>+UI: Clica "Adicionar Jogador"
    
    alt Jogador já existe
        Captain->>UI: Busca jogador existente
        UI->>+PlayerController: GET /players/search?name=...
        PlayerController->>+PlayerModel: Buscar por nome
        PlayerModel-->>-PlayerController: Jogadores encontrados
        PlayerController-->>-UI: Lista de jogadores
        UI-->>Captain: Seleciona jogador da lista
    else Criar novo jogador
        Captain->>UI: Preenche dados do novo jogador
        Note over Captain,UI: nome, gênero, data nascimento,<br/>posição preferida
    end

    Captain->>+UI: Confirma adição ao time
    UI->>+AuthMiddleware: POST /teams/:id/players + token
    
    AuthMiddleware->>AuthMiddleware: Verificar token
    AuthMiddleware->>+PlayerController: Dados + userId + teamId
    
    rect rgb(255, 245, 245)
        Note over PlayerController: Validações de Adição
        PlayerController->>+TeamModel: Verificar time existe
        TeamModel-->>-PlayerController: Dados do time
        
        PlayerController->>PlayerController: Verificar se é capitão
        PlayerController->>PlayerController: Verificar limite de jogadores
    end

    alt Não é capitão
        PlayerController-->>UI: 403 - Sem permissão
        UI-->>Captain: Apenas capitão pode adicionar
    else Time lotado
        PlayerController-->>UI: 400 - Limite atingido
        UI-->>Captain: Time atingiu limite máximo
    else Validações passam
        opt Criar jogador se novo
            PlayerController->>+PlayerModel: Verificar nome disponível
            PlayerModel-->>-PlayerController: Status disponibilidade
            
            alt Nome já usado
                PlayerController-->>UI: 409 - Nome já existe
                UI-->>Captain: Escolher nome diferente
            else Nome disponível
                PlayerController->>+PlayerModel: Criar jogador
                PlayerModel-->>-PlayerController: Jogador criado
            end
        end
        
        PlayerController->>+TeamPlayerModel: Verificar vínculo existente
        TeamPlayerModel-->>-PlayerController: Status do vínculo
        
        alt Já vinculado a outro time
            PlayerController-->>UI: 409 - Jogador já vinculado
            UI-->>Captain: Jogador já está em outro time
        else Disponível
            PlayerController->>+TeamPlayerModel: Criar vínculo
            Note over TeamPlayerModel: teamId, playerId,<br/>joinDate: hoje, isActive: true
            TeamPlayerModel-->>-PlayerController: Vínculo criado
            
            PlayerController-->>-UI: 201 - Jogador adicionado
            UI-->>Captain: Confirma adição ao elenco
        end
    end
```

## 🔄 Fluxo de Transferência de Jogador

```mermaid
sequenceDiagram
    autonumber
    participant OldCaptain as 👑 Capitão Antigo
    participant NewCaptain as 👑 Capitão Novo
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant PlayerController as ⚽ PlayerController
    parameter TeamPlayerModel as 🔗 TeamPlayerModel
    participant PlayerModel as 🏃 PlayerModel

    OldCaptain->>+UI: Acessa "Remover Jogador"
    UI-->>-OldCaptain: Lista de jogadores do time

    OldCaptain->>+UI: Seleciona jogador para remover
    UI->>+AuthMiddleware: DELETE /teams/:teamId/players/:playerId + token
    
    AuthMiddleware->>+PlayerController: teamId + playerId + userId
    
    rect rgb(255, 245, 245)
        Note over PlayerController: Validações de Remoção
        PlayerController->>PlayerController: Verificar permissão de capitão
        PlayerController->>+TeamPlayerModel: Verificar vínculo ativo
        TeamPlayerModel-->>-PlayerController: Status do vínculo
    end

    alt Não é capitão
        PlayerController-->>UI: 403 - Sem permissão
        UI-->>OldCaptain: Apenas capitão pode remover
    else Jogador não vinculado
        PlayerController-->>UI: 404 - Vínculo não encontrado
        UI-->>OldCaptain: Jogador não está no time
    else Validações passam
        PlayerController->>+TeamPlayerModel: Desativar vínculo
        Note over TeamPlayerModel: isActive: false,<br/>leaveDate: hoje
        TeamPlayerModel-->>-PlayerController: Vínculo desativado
        
        PlayerController-->>-UI: 200 - Jogador removido
        UI-->>OldCaptain: Confirma remoção
    end

    Note over NewCaptain: Agora jogador está disponível

    NewCaptain->>+UI: Busca jogadores disponíveis
    UI->>+PlayerController: GET /players/available
    PlayerController->>+PlayerModel: Buscar jogadores sem vínculo ativo
    PlayerModel-->>-PlayerController: Jogadores disponíveis
    PlayerController-->>-UI: Lista filtrada
    UI-->>-NewCaptain: Jogadores para adicionar

    NewCaptain->>+UI: Adiciona jogador disponível
    Note over NewCaptain,PlayerController: Fluxo normal de adição<br/>(reutilizando jogador existente)
```

## 🏆 Fluxo de Upload de Banner do Time

```mermaid
sequenceDiagram
    autonumber
    participant Captain as 👑 Capitão
    participant UI as 🖥️ Interface
    participant AuthMiddleware as 🛡️ AuthMiddleware
    participant TeamController as 🏢 TeamController
    participant Multer as 📁 Multer
    participant FileSystem as 💾 FileSystem
    participant TeamModel as 🏢 TeamModel

    Captain->>+UI: Acessa "Editar Time"
    UI-->>-Captain: Interface de edição

    Captain->>+UI: Seleciona nova imagem
    UI->>UI: Validação frontend (tamanho, formato)
    
    Captain->>+UI: Envia arquivo
    UI->>+AuthMiddleware: POST /teams/:id/upload-banner + file + token
    
    AuthMiddleware->>AuthMiddleware: Verificar token
    AuthMiddleware->>+TeamController: teamId + userId + file
    
    rect rgb(255, 245, 245)
        Note over TeamController: Validações de Upload
        TeamController->>+TeamModel: Verificar time existe
        TeamModel-->>-TeamController: Dados do time
        
        TeamController->>TeamController: Verificar se é capitão
        TeamController->>TeamController: Verificar tipo de arquivo
        TeamController->>TeamController: Verificar tamanho do arquivo
    end

    alt Não é capitão
        TeamController-->>UI: 403 - Sem permissão
        UI-->>Captain: Apenas capitão pode alterar
    else Arquivo inválido
        TeamController-->>UI: 400 - Formato não suportado
        UI-->>Captain: Use formatos JPG, PNG ou GIF
    else Validações passam
        TeamController->>+Multer: Processar upload
        Multer->>+FileSystem: Salvar arquivo
        Note over FileSystem: Diretório: /uploads/teams/<br/>Nome único gerado
        FileSystem-->>-Multer: Caminho do arquivo
        Multer-->>-TeamController: Arquivo salvo
        
        opt Remover banner anterior
            TeamController->>+FileSystem: Deletar arquivo antigo
            FileSystem-->>-TeamController: Arquivo removido
        end
        
        TeamController->>+TeamModel: Atualizar caminho do banner
        TeamModel-->>-TeamController: Banner atualizado
        
        TeamController-->>-UI: 200 - Banner atualizado + nova URL
        UI-->>Captain: Exibe novo banner
    end
```

## 🎯 **Principais Funcionalidades da Gestão de Times:**

### 🏢 **Criação e Gestão de Times:**
- **Validação de nomes únicos** no sistema
- **Configuração visual** (cores primária/secundária, banner)
- **Controle de capitania** (apenas criador é capitão)
- **Soft delete** para preservar histórico

### ⚽ **Gestão de Elencos:**
- **Reutilização inteligente** de jogadores existentes
- **Sistema de vínculos ativos/inativos** para transferências
- **Controle de limites** de jogadores por time
- **Histórico completo** de participações

### 🔄 **Sistema de Transferências:**
- **Disponibilidade automática** após remoção
- **Prevenção de vínculos duplos** simultâneos
- **Rastreamento temporal** com datas de entrada/saída
- **Busca eficiente** de jogadores disponíveis

### 📁 **Gestão de Arquivos:**
- **Upload seguro** com validações de tipo/tamanho
- **Remoção automática** de arquivos antigos
- **Organização estruturada** no sistema de arquivos
- **URLs públicas** para exibição de banners