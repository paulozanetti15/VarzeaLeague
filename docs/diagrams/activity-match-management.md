# Diagramas de Atividades UML - Gerenciamento de Partidas Amistosas VarzeaLeague

Este documento apresenta os diagramas de atividades seguindo o padrão UML para o sistema completo de gerenciamento de partidas amistosas do VarzeaLeague.

## 🎯 **1. Criar Partida Amistosa**

```mermaid
stateDiagram-v2
    classDef userAction fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef database fill:#fff8e1,stroke:#fbc02d,stroke-width:2px

    [*] --> AcessarFormulario
    AcessarFormulario: 🖥️ Exibir Formulário
    AcessarFormulario --> PreencherDados
    
    PreencherDados: 👤 Preencher Dados da Partida
    PreencherDados --> ValidarDados
    
    ValidarDados: 🔍 Validar Dados
    ValidarDados --> ExibirErros : Dados inválidos
    ValidarDados --> VerificarTitulo : Dados válidos
    
    ExibirErros: 🔴 Exibir Erros de Validação
    ExibirErros --> PreencherDados
    
    VerificarTitulo: 🗃️ Verificar Título Único
    VerificarTitulo --> ErroDuplicado : Título existe
    VerificarTitulo --> CriarPartida : Título disponível
    
    ErroDuplicado: 🔴 Erro de Título Duplicado
    ErroDuplicado --> PreencherDados
    
    CriarPartida: ⚽ Criar Partida no Banco
    CriarPartida --> DefinirStatus
    
    DefinirStatus: 📊 Definir Status aberta
    DefinirStatus --> PartidaCriada
    
    PartidaCriada: ✅ Partida Criada com Sucesso
    PartidaCriada --> [*]

    class AcessarFormulario,PreencherDados userAction
    class ValidarDados,VerificarTitulo process
    class ExibirErros,ErroDuplicado error
    class PartidaCriada success
    class CriarPartida,DefinirStatus database
```

## ⚽ **2. Inscrever Time em Partida**

```mermaid
stateDiagram-v2
    classDef userAction fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#388e3c,stroke-width:2px

    [*] --> SelecionarPartida
    SelecionarPartida: 👑 Selecionar Partida
    SelecionarPartida --> ClicarParticipar
    
    ClicarParticipar: 🖱️ Clicar Participar com Time
    ClicarParticipar --> VerificarStatus
    
    VerificarStatus: 📋 Verificar Status da Partida
    VerificarStatus --> ErroFechada : Partida fechada
    VerificarStatus --> VerificarInscrito : Partida aberta
    
    ErroFechada: 🔴 Erro de Inscrições Encerradas
    ErroFechada --> [*]
    
    VerificarInscrito: 🔍 Verificar se Time já Inscrito
    VerificarInscrito --> ErroInscrito : Time já inscrito
    VerificarInscrito --> ValidarRegras : Time não inscrito
    
    ErroInscrito: 🔴 Erro de Time já Participando
    ErroInscrito --> [*]
    
    ValidarRegras: 📏 Verificar Regras da Partida
    ValidarRegras --> ErroRegras : Time não qualifica
    ValidarRegras --> InscreverTime : Time atende regras
    
    ErroRegras: 🔴 Erro de Time não Qualifica
    ErroRegras --> [*]
    
    InscreverTime: 📝 Inscrever Time na Partida
    InscreverTime --> AtualizarContadores
    
    AtualizarContadores: 📊 Atualizar Contadores
    AtualizarContadores --> VerificarLotacao
    
    VerificarLotacao: 🔢 Verificar Lotação
    VerificarLotacao --> DefinirSemVagas : Dois times inscritos
    VerificarLotacao --> ManterAberta : Ainda tem vagas
    
    DefinirSemVagas: 📊 Status sem vagas
    DefinirSemVagas --> SucessoInscricao
    
    ManterAberta: 📊 Manter Status aberta
    ManterAberta --> SucessoInscricao
    
    SucessoInscricao: ✅ Time Inscrito com Sucesso
    SucessoInscricao --> NotificarOrganizador
    
    NotificarOrganizador: 🔔 Notificar Organizador
    NotificarOrganizador --> [*]

    class SelecionarPartida,ClicarParticipar userAction
    class VerificarStatus,VerificarInscrito,ValidarRegras,AtualizarContadores,VerificarLotacao process
    class ErroFechada,ErroInscrito,ErroRegras error
    class SucessoInscricao success
```

## 📝 **3. Registrar Súmula da Partida**

```mermaid
stateDiagram-v2
    classDef userAction fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef database fill:#fff8e1,stroke:#fbc02d,stroke-width:2px

    [*] --> AcessarSumula
    AcessarSumula: 👤 Acessar Súmula
    AcessarSumula --> SelecionarTimes
    
    SelecionarTimes: ⚽ Selecionar Times da Partida
    SelecionarTimes --> RegistrarGols
    
    RegistrarGols: 🥅 Registrar Gols Marcados
    RegistrarGols --> RegistrarCartoes
    
    RegistrarCartoes: 🟨🟥 Registrar Cartões
    RegistrarCartoes --> DefinirPlacar
    
    DefinirPlacar: 📊 Definir Placar Final
    DefinirPlacar --> ValidarDados
    
    ValidarDados: 🔍 Validar Dados
    ValidarDados --> ExibirErros : Dados inválidos
    ValidarDados --> SalvarSumula : Dados válidos
    
    ExibirErros: 🔴 Exibir Erros
    ExibirErros --> RegistrarGols
    
    SalvarSumula: 💾 Salvar Súmula
    SalvarSumula --> AtualizarStatus
    
    AtualizarStatus: 📊 Atualizar Status Partida
    AtualizarStatus --> DefinirFinalizada
    
    DefinirFinalizada: 📋 Status finalizada
    DefinirFinalizada --> GerarPDF
    
    GerarPDF: 📄 Gerar PDF da Súmula
    GerarPDF --> SumulaRegistrada
    
    SumulaRegistrada: ✅ Súmula Registrada
    SumulaRegistrada --> AtualizarEstatisticas
    
    AtualizarEstatisticas: 📊 Atualizar Estatísticas
    AtualizarEstatisticas --> [*]

    class AcessarSumula,SelecionarTimes,RegistrarGols,RegistrarCartoes,DefinirPlacar userAction
    class ValidarDados,AtualizarStatus,DefinirFinalizada,GerarPDF,AtualizarEstatisticas process
    class ExibirErros error
    class SumulaRegistrada success
    class SalvarSumula,AtualizarEstatisticas database
```

## ⚠️ **4. Aplicar Punição (WO)**

```mermaid
stateDiagram-v2
    classDef userAction fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef punishment fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    classDef database fill:#fff8e1,stroke:#fbc02d,stroke-width:2px

    [*] --> DetectarProblema
    DetectarProblema: 👨‍⚖️ Detectar Problema
    DetectarProblema --> AbrirModal
    
    AbrirModal: 🖱️ Acessar Modal de Punição
    AbrirModal --> SelecionarTime
    
    SelecionarTime: ⚽ Selecionar Time Punido
    SelecionarTime --> EscolherMotivo
    
    EscolherMotivo: 📝 Escolher Motivo da Punição
    EscolherMotivo --> DefinirTimes
    
    DefinirTimes: 🏟️ Definir Mandante Visitante
    DefinirTimes --> ValidarDados
    
    ValidarDados: 🔍 Validar Dados
    ValidarDados --> ExibirErros : Dados incompletos
    ValidarDados --> AplicarPunicao : Dados completos
    
    ExibirErros: 🔴 Exibir Erros
    ExibirErros --> SelecionarTime
    
    AplicarPunicao: ⚖️ Aplicar Punição
    AplicarPunicao --> GerarSumulaAuto
    
    GerarSumulaAuto: 📄 Gerar Súmula 3x0 Automática
    GerarSumulaAuto --> DefinirFinalizada
    
    DefinirFinalizada: 📋 Status finalizada
    DefinirFinalizada --> RegistrarTimePunido
    
    RegistrarTimePunido: 🔴 Registrar Time Punido
    RegistrarTimePunido --> NotificarTodos
    
    NotificarTodos: 🔔 Notificar Todos Envolvidos
    NotificarTodos --> AtualizarRanking
    
    AtualizarRanking: 📊 Atualizar Classificação
    AtualizarRanking --> [*]

    class DetectarProblema,AbrirModal,SelecionarTime,EscolherMotivo,DefinirTimes userAction
    class ValidarDados,AplicarPunicao,GerarSumulaAuto,DefinirFinalizada process
    class ExibirErros error
    class RegistrarTimePunido punishment
    class AtualizarRanking database
```

## 🔄 **5. Atualização Automática de Status**

```mermaid
stateDiagram-v2
    classDef system fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef status fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef notification fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef canceled fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    [*] --> VerificacaoSistema: 🕒 Sistema executa verificação
    VerificacaoSistema: 🔍 Verificar Todas as Partidas
    VerificacaoSistema --> PartidaAberta: Analisar partidas abertas
    VerificacaoSistema --> PartidaConfirmada: Analisar partidas confirmadas
    VerificacaoSistema --> PartidaEmAndamento: Analisar partidas em andamento
    
    PartidaAberta: 📋 Partidas 'abertas'
    PartidaAberta --> VerificarDataPassou: Verificar data
    
    VerificarDataPassou: ⏰ Data Passou?
    VerificarDataPassou --> ManterAberta: ❌ Data não passou
    VerificarDataPassou --> VerificarTimes: ✅ Data passou
    
    VerificarTimes: ⚽ Tem 2 Times?
    VerificarTimes --> DefinirCancelada: ❌ Não tem times
    VerificarTimes --> DefinirConfirmada: ✅ Tem 2 times
    
    ManterAberta: 📊 Manter 'aberta'
    ManterAberta --> [*]: Verificação concluída
    
    DefinirCancelada: 🔴 Status: 'cancelada'
    DefinirCancelada --> NotificarCancelamento: Status atualizado
    
    DefinirConfirmada: ✅ Status: 'confirmada'
    DefinirConfirmada --> NotificarConfirmacao: Status atualizado
    
    PartidaConfirmada: ✅ Partidas 'confirmadas'
    PartidaConfirmada --> VerificarHora: Verificar horário
    
    VerificarHora: ⏰ Hora da Partida Chegou?
    VerificarHora --> ManterConfirmada: ❌ Ainda não chegou
    VerificarHora --> DefinirEmAndamento: ✅ Hora chegou
    
    ManterConfirmada: 📊 Manter 'confirmada'
    ManterConfirmada --> [*]: Verificação concluída
    
    DefinirEmAndamento: 🟡 Status: 'em_andamento'
    DefinirEmAndamento --> NotificarInicio: Status atualizado
    
    PartidaEmAndamento: 🟡 Partidas 'em_andamento'
    PartidaEmAndamento --> Verificar90Min: Verificar duração
    
    Verificar90Min: ⏱️ 90min Passaram?
    Verificar90Min --> ManterEmAndamento: ❌ Ainda não
    Verificar90Min --> VerificarSumula: ✅ 90min passaram
    
    VerificarSumula: 📄 Tem Súmula?
    VerificarSumula --> ManterFinalizada: ✅ Tem súmula
    VerificarSumula --> FinalizarAutomatico: ❌ Não tem súmula
    
    ManterEmAndamento: � Manter 'em_andamento'
    ManterEmAndamento --> [*]: Verificação concluída
    
    ManterFinalizada: 📊 Manter 'finalizada'
    ManterFinalizada --> [*]: Verificação concluída
    
    FinalizarAutomatico: 🔄 Status: 'finalizada' automático
    FinalizarAutomatico --> NotificarFinalizacao: Status atualizado
    
    NotificarCancelamento: 🔔 Notificar Cancelamento
    NotificarCancelamento --> [*]: Processo concluído
    
    NotificarConfirmacao: 🔔 Notificar Confirmação
    NotificarConfirmacao --> [*]: Processo concluído
    
    NotificarInicio: 🔔 Notificar Início
    NotificarInicio --> [*]: Processo concluído
    
    NotificarFinalizacao: 🔔 Notificar Finalização
    NotificarFinalizacao --> [*]: Processo concluído

    class VerificacaoSistema,PartidaAberta,PartidaConfirmada,PartidaEmAndamento system
    class VerificarDataPassou,VerificarTimes,VerificarHora,Verificar90Min,VerificarSumula decision
    class DefinirConfirmada,DefinirEmAndamento,FinalizarAutomatico,ManterAberta,ManterConfirmada,ManterEmAndamento,ManterFinalizada status
    class NotificarConfirmacao,NotificarInicio,NotificarFinalizacao notification
    class DefinirCancelada,NotificarCancelamento canceled
```

## 📊 **6. Consultar Relatórios e Estatísticas**

```mermaid
stateDiagram-v2
    classDef userAction fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef report fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef database fill:#fff8e1,stroke:#fbc02d,stroke-width:2px

    [*] --> AcessarRelatorios: 👤 Usuário acessa relatórios
    AcessarRelatorios: 👤 Acessar Relatórios
    AcessarRelatorios --> EscolherTipo: Selecionar opção
    
    EscolherTipo: 📋 Escolher Tipo de Consulta
    EscolherTipo --> RelatorioTime: 🏢 Relatório de Time
    EscolherTipo --> RelatorioJogador: 👤 Relatório de Jogador
    EscolherTipo --> RelatorioSistema: 📊 Relatório do Sistema
    
    RelatorioTime: 📊 Buscar Histórico do Time
    RelatorioTime --> FiltrarPeriodo: Time selecionado
    
    FiltrarPeriodo: 📅 Filtrar por Período
    FiltrarPeriodo --> CalcularEstatisticas: Período definido
    
    CalcularEstatisticas: 📈 Calcular Vitórias/Derrotas
    CalcularEstatisticas --> CalcularGols: Estatísticas calculadas
    
    CalcularGols: 🥅 Calcular Gols/Cartões
    CalcularGols --> ExibirRelatorioTime: Dados processados
    
    ExibirRelatorioTime: 📋 Exibir Relatório do Time
    ExibirRelatorioTime --> OpcaoExportar: Relatório exibido
    
    RelatorioJogador: 🏃 Buscar Jogos do Jogador
    RelatorioJogador --> CalcularGolsJogador: Jogador selecionado
    
    CalcularGolsJogador: 🥅 Calcular Gols Marcados
    CalcularGolsJogador --> CalcularCartoes: Gols calculados
    
    CalcularCartoes: 🟨 Calcular Cartões Recebidos
    CalcularCartoes --> ExibirRelatorioJogador: Cartões calculados
    
    ExibirRelatorioJogador: 📋 Exibir Relatório do Jogador
    ExibirRelatorioJogador --> OpcaoExportar: Relatório exibido
    
    RelatorioSistema: 🗂️ Buscar Todas as Partidas
    RelatorioSistema --> CalcularMedias: Dados coletados
    
    CalcularMedias: 📊 Calcular Médias Gerais
    CalcularMedias --> GerarGraficos: Médias calculadas
    
    GerarGraficos: 📈 Gerar Gráficos
    GerarGraficos --> ExibirDashboard: Gráficos gerados
    
    ExibirDashboard: 🖥️ Exibir Dashboard Geral
    ExibirDashboard --> OpcaoExportar: Dashboard exibido
    
    OpcaoExportar: 📄 Opção de Exportar PDF
    OpcaoExportar --> [*]: Processo concluído

    class AcessarRelatorios userAction
    class EscolherTipo decision
    class RelatorioTime,RelatorioJogador,RelatorioSistema database
    class FiltrarPeriodo,CalcularEstatisticas,CalcularGols,CalcularGolsJogador,CalcularCartoes,CalcularMedias,GerarGraficos process
    class ExibirRelatorioTime,ExibirRelatorioJogador,ExibirDashboard,OpcaoExportar report
```

## 🗑️ **7. Cancelar/Deletar Partida**

```mermaid
stateDiagram-v2
    classDef userAction fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef delete fill:#ffcdd2,stroke:#c62828,stroke-width:2px

    [*] --> AcessarPartida: 👤 Organizador acessa partida
    AcessarPartida: 👤 Acessar Partida
    AcessarPartida --> ClicarDeletar: Visualizar partida
    
    ClicarDeletar: 🗑️ Clicar em 'Deletar Partida'
    ClicarDeletar --> VerificarDeletavel: Solicitar deleção
    
    VerificarDeletavel: 🔍 Partida Pode ser Deletada?
    VerificarDeletavel --> ErroFinalizada: ❌ Partida finalizada
    VerificarDeletavel --> ModalConfirmacao: ✅ Pode deletar
    
    ErroFinalizada: 🔴 Erro: Não pode deletar partida finalizada
    ErroFinalizada --> [*]: Processo encerrado
    
    ModalConfirmacao: ⚠️ Modal de Confirmação
    ModalConfirmacao --> UsuarioConfirma: Aguardar resposta
    
    UsuarioConfirma: ❓ Usuário Confirmou?
    UsuarioConfirma --> VoltarLista: ❌ Cancelou
    UsuarioConfirma --> RemoverInscricoes: ✅ Confirmou
    
    VoltarLista: ↪️ Voltar para Lista
    VoltarLista --> [*]: Processo cancelado
    
    RemoverInscricoes: 🗑️ Remover Inscrições
    RemoverInscricoes --> RemoverRegras: Inscrições removidas
    
    RemoverRegras: 🗑️ Remover Regras
    RemoverRegras --> RemoverEventos: Regras removidas
    
    RemoverEventos: 🗑️ Remover Eventos/Súmulas
    RemoverEventos --> DeletarPartida: Eventos removidos
    
    DeletarPartida: 🗑️ Deletar Partida
    DeletarPartida --> NotificarParticipantes: Partida deletada
    
    NotificarParticipantes: 🔔 Notificar Participantes
    NotificarParticipantes --> PartidaRemovida: Notificações enviadas
    
    PartidaRemovida: ✅ Partida Removida com Sucesso
    PartidaRemovida --> RedirecionarLista: Confirmar remoção
    
    RedirecionarLista: ↪️ Redirecionar para Lista
    RedirecionarLista --> [*]: Processo concluído

    class AcessarPartida,ClicarDeletar userAction
    class VerificarDeletavel,UsuarioConfirma decision
    class ErroFinalizada error
    class PartidaRemovida success
    class RemoverInscricoes,RemoverRegras,RemoverEventos,DeletarPartida delete
    class ModalConfirmacao,VoltarLista,NotificarParticipantes,RedirecionarLista process
```

## 🎯 **Resumo dos Principais Fluxos:**

### **📋 Estados das Partidas:**
1. **'aberta'** → Aceita inscrições de times
2. **'sem_vagas'** → 2 times inscritos, não aceita mais
3. **'confirmada'** → Partida confirmada, aguardando início
4. **'em_andamento'** → Partida sendo jogada
5. **'finalizada'** → Partida encerrada com ou sem súmula
6. **'cancelada'** → Partida cancelada por falta de times

### **⚡ Transições Automáticas:**
- **Sistema verifica periodicamente** e atualiza status baseado em data/hora
- **Notificações automáticas** para todas as mudanças de status
- **Geração de relatórios** em tempo real
- **Sistema de punições** com súmulas automáticas

### **🔧 Funcionalidades Especiais:**
- **Validação de regras** por idade, gênero e quantidade de jogadores
- **Reutilização inteligente** de jogadores entre times
- **Upload de banners** para personalização visual
- **Geração de PDF** para súmulas e relatórios
- **Sistema de ranking** baseado em resultados

### **📐 Padrão UML Aplicado:**
- **Diagramas de Estado** utilizando sintaxe `stateDiagram-v2`
- **Estados bem definidos** com nomes descritivos
- **Transições claras** com condições explícitas
- **Estados inicial e final** marcados com `[*]`
- **Classificação visual** por cores para diferentes tipos de atividades
- **Conformidade UML** para representação de atividades

Estes diagramas representam fielmente todo o sistema de gerenciamento de partidas amistosas implementado no VarzeaLeague seguindo o padrão UML! 🚀