# Diagrama de Sequência - Registro e Login de Usuário

Este diagrama mostra o fluxo completo de registro e autenticação de usuários no sistema VarzeaLeague.

## 🔐 Fluxo de Registro de Usuário

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant UI as 🖥️ Interface
    participant AuthController as 🔑 AuthController
    participant UserModel as 🗃️ UserModel
    participant BCrypt as 🔒 BCrypt
    participant JWT as 🎫 JWT

    User->>+UI: Acessa página de registro
    UI-->>-User: Exibe formulário

    User->>+UI: Preenche dados (nome, email, CPF, etc.)
    UI->>UI: Validação frontend
    
    UI->>+AuthController: POST /auth/register
    
    rect rgb(255, 245, 204)
        Note over AuthController: Validações do Backend
        AuthController->>AuthController: Validar campos obrigatórios
        AuthController->>AuthController: Validar formato CPF
        AuthController->>AuthController: Validar formato telefone
        AuthController->>AuthController: Validar gênero
        AuthController->>AuthController: Validar senha (força)
    end

    alt Validações falham
        AuthController-->>UI: 400 - Erro de validação
        UI-->>User: Exibe mensagens de erro
    else Validações passam
        AuthController->>+UserModel: Verificar nome existente
        UserModel-->>-AuthController: Resultado da consulta
        
        AuthController->>+UserModel: Verificar email existente  
        UserModel-->>-AuthController: Resultado da consulta
        
        AuthController->>+UserModel: Verificar CPF existente
        UserModel-->>-AuthController: Resultado da consulta
        
        alt Dados já existem
            AuthController-->>UI: 409 - Conflito (nome/email/CPF)
            UI-->>User: Exibe erro específico
        else Dados únicos
            AuthController->>+BCrypt: Hash da senha
            BCrypt-->>-AuthController: Senha hasheada
            
            AuthController->>+UserModel: Criar usuário
            UserModel-->>-AuthController: Usuário criado
            
            AuthController->>+JWT: Gerar token
            JWT-->>-AuthController: Token JWT
            
            AuthController-->>-UI: 201 - Usuário criado + token
            UI-->>User: Redireciona para login
        end
    end
```

## 🔑 Fluxo de Login de Usuário

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant UI as 🖥️ Interface
    participant AuthController as 🔑 AuthController
    participant UserModel as 🗃️ UserModel
    participant BCrypt as 🔒 BCrypt
    participant JWT as 🎫 JWT
    participant LocalStorage as 💾 LocalStorage

    User->>+UI: Acessa página de login
    UI-->>-User: Exibe formulário

    User->>+UI: Insere email e senha
    UI->>UI: Validação frontend
    
    UI->>+AuthController: POST /auth/login

    rect rgb(255, 235, 235)
        Note over AuthController: Validações de Login
        AuthController->>AuthController: Verificar email obrigatório
        AuthController->>AuthController: Verificar senha obrigatória
    end

    alt Campos faltando
        AuthController-->>UI: 400 - Email e senha obrigatórios
        UI-->>User: Exibe erro de campos
    else Campos preenchidos
        AuthController->>+UserModel: Buscar usuário por email
        UserModel-->>-AuthController: Dados do usuário
        
        alt Usuário não encontrado
            AuthController-->>UI: 401 - Email ou senha incorretos
            UI-->>User: Exibe erro genérico
        else Usuário encontrado
            AuthController->>+BCrypt: Comparar senha
            BCrypt-->>-AuthController: Resultado da comparação
            
            alt Senha incorreta
                AuthController-->>UI: 401 - Email ou senha incorretos
                UI-->>User: Exibe erro genérico
            else Senha correta
                AuthController->>+JWT: Gerar token
                JWT-->>-AuthController: Token JWT
                
                AuthController-->>-UI: 200 - Login sucesso + token + dados
                UI->>+LocalStorage: Salvar token e usuário
                LocalStorage-->>-UI: Dados salvos
                UI-->>User: Redireciona para dashboard
            end
        end
    end
```

## 🛡️ Fluxo de Verificação de Token

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant UI as 🖥️ Interface
    participant AuthController as 🔑 AuthController
    participant JWT as 🎫 JWT
    participant UserModel as 🗃️ UserModel
    participant LocalStorage as 💾 LocalStorage

    User->>+UI: Acessa página protegida
    UI->>+LocalStorage: Recuperar token
    LocalStorage-->>-UI: Token JWT
    
    alt Token não existe
        UI-->>User: Redireciona para login
    else Token existe
        UI->>+AuthController: GET /auth/verify + Bearer token
        
        AuthController->>+JWT: Verificar token
        JWT-->>-AuthController: Token válido/inválido
        
        alt Token inválido/expirado
            AuthController-->>UI: 401 - Token inválido
            UI->>LocalStorage: Remover dados
            UI-->>User: Redireciona para login
        else Token válido
            AuthController->>+UserModel: Buscar usuário por ID
            UserModel-->>-AuthController: Dados do usuário
            
            alt Usuário não encontrado
                AuthController-->>UI: 404 - Usuário não encontrado
                UI->>LocalStorage: Remover dados
                UI-->>User: Redireciona para login
            else Usuário encontrado
                AuthController-->>-UI: 200 - Dados do usuário
                UI-->>User: Exibe página protegida
            end
        end
    end
```

## 🎯 **Principais Funcionalidades do Sistema de Auth:**

### 🔒 **Segurança:**
- **Validação rigorosa** de CPF, telefone e senha
- **Hash bcrypt** para senhas
- **Tokens JWT** com expiração de 24h
- **Mensagens genéricas** para login (não revela se email existe)

### ✅ **Validações:**
- **Nome único** no sistema
- **Email único** no sistema  
- **CPF único** e válido matematicamente
- **Senha forte** (maiúscula, minúscula, número, especial)
- **Telefone** no formato brasileiro

### 🎮 **Experiência do Usuário:**
- **Feedback específico** em validações de registro
- **Redirecionamento automático** após login
- **Persistência de sessão** via LocalStorage
- **Proteção de rotas** com verificação de token