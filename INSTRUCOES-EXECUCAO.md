# Instruções para Execução do Projeto VarzeaLeague

Este documento contém instruções detalhadas para configurar e executar o sistema VarzeaLeague, dividido em backend e frontend.

## Requisitos

- Node.js 14+ instalado
- MySQL 8+ instalado e rodando
- Yarn ou NPM instalado

## Configuração do Backend

1. Navegue até a pasta do backend:
   ```
   cd Back-end
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure o arquivo `.env` com as credenciais do seu banco de dados MySQL:
   ```
   DB_HOST=localhost
   DB_USER=seu_usuario_mysql
   DB_PASSWORD=sua_senha_mysql
   DB_NAME=varzealeague_db
   DB_PORT=3306
   PORT=3001
   JWT_SECRET=seu_segredo_jwt
   ```

4. Certifique-se que o MySQL está rodando e crie o banco de dados:
   ```sql
   CREATE DATABASE varzealeague_db;
   ```

5. Inicie o servidor backend (no PowerShell, note o uso de `;` em vez de `&&`):
   ```
   cd Back-end; npm run dev
   ```
   
   Em outros terminais, você pode usar:
   ```
   cd Back-end && npm run dev
   ```

## Configuração do Frontend

1. Navegue até a pasta do frontend:
   ```
   cd Front-end
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Inicie o servidor frontend (no PowerShell, note o uso de `;` em vez de `&&`):
   ```
   cd Front-end; npm run dev
   ```
   
   Em outros terminais, você pode usar:
   ```
   cd Front-end && npm run dev
   ```

4. Acesse o aplicativo em seu navegador:
   ```
   http://localhost:3000
   ```

## Problemas Comuns e Soluções

### Erro 404 no Login

Se você receber erro 404 ao tentar fazer login, pode ser que:

1. O servidor backend não está rodando - certifique-se de iniciar o backend primeiro.
2. O banco de dados não está conectado corretamente - verifique suas credenciais no arquivo `.env`.
3. As tabelas não foram criadas - o sistema deve criar as tabelas automaticamente, mas você pode verificar no MySQL.

### Erro nas Imagens de Depoimentos

As imagens de depoimentos estão configuradas para usar URLs de placeholder. Se quiser usar imagens reais:

1. Coloque os arquivos de imagem na pasta `Front-end/public`:
   - testimonial1.jpg
   - testimonial2.jpg
   - testimonial3.jpg

2. Ou modifique o componente `Testimonials.tsx` para usar os caminhos corretos das suas imagens.

### PowerShell não aceita o operador &&

No PowerShell do Windows, use `;` como separador de comandos em vez de `&&`:

```
cd Back-end; npm run dev
```

### Problemas com Estilos Bootstrap

Se os estilos Bootstrap não estiverem carregando corretamente, verifique se o link para o CSS do Bootstrap está presente no arquivo `index.html`:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

## Verificação Rápida

Para verificar se o backend está funcionando corretamente, acesse:
```
http://localhost:3001/api/test
```

Deve retornar uma mensagem: `{"message":"API está funcionando!"}` 