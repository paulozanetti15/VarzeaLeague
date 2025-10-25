import './reset.css';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "bootstrap/dist/css/bootstrap.min.css";

declare module 'bootstrap/dist/css/bootstrap.min.css';

// Adiciona estilos de reset diretamente antes da renderização
const style = document.createElement('style');
style.innerHTML = `
  html, body, #root {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
