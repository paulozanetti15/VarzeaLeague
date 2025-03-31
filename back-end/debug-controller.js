require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Obtém o caminho absoluto do diretório controllers
const controllersPath = path.resolve(__dirname, 'controllers');
console.log('Diretório de controllers:', controllersPath);

// Verifica se o diretório existe
if (fs.existsSync(controllersPath)) {
  console.log('O diretório de controllers existe.');
  
  // Lista arquivos no diretório
  const files = fs.readdirSync(controllersPath);
  console.log('Arquivos no diretório:', files);
  
  // Verifica especificamente o TeamController.ts
  const teamControllerPath = path.join(controllersPath, 'TeamController.ts');
  if (fs.existsSync(teamControllerPath)) {
    console.log('TeamController.ts encontrado em:', teamControllerPath);
    
    // Lê o conteúdo do arquivo
    const content = fs.readFileSync(teamControllerPath, 'utf8');
    
    // Verifica se a string específica existe no arquivo
    if (content.includes('Você já possui um time')) {
      console.log('O arquivo contém a verificação problemática.');
      console.log('Trecho encontrado:', content.split('Você já possui um time')[0].slice(-200) + 'Você já possui um time' + content.split('Você já possui um time')[1].slice(0, 200));
    } else {
      console.log('O arquivo NÃO contém a verificação problemática.');
    }
  } else {
    console.log('TeamController.ts NÃO encontrado.');
  }
} else {
  console.log('O diretório de controllers NÃO existe.');
} 