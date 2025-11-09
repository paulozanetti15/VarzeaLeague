import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VarzeaLeague API',
      version: '1.0.0',
      description: 'API para gerenciamento de partidas amistosas, campeonatos, times e jogadores de futebol amador',
      contact: {
        name: 'Varze aLeague ',
        
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.varzealeague.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido após login. Formato: Bearer {token}'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro amigável para o usuário',
              example: 'Erro ao processar requisição'
            },
            error: {
              type: 'string',
              description: 'Detalhes técnicos do erro (presente apenas em erros 4xx, omitido em 5xx por segurança)',
              example: 'ValidationError: Campo obrigatório não fornecido'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { 
              type: 'integer',
              example: 1
            },
            name: { 
              type: 'string',
              example: 'João Silva'
            },
            email: { 
              type: 'string', 
              format: 'email',
              example: 'joao@example.com'
            },
            cpf: { 
              type: 'string',
              example: '123.456.789-00'
            },
            phone: { 
              type: 'string',
              example: '(41) 99999-9999'
            },
            gender: {
              type: 'string',
              example: 'Masculino'
            },
            userTypeId: { 
              type: 'integer',
              description: '1=Admin Master, 2=Admin Eventos, 3=Admin Times, 4=Usuário Comum',
              example: 4
            },
          }
        },
        Team: {
          type: 'object',
          properties: {
            id: { 
              type: 'integer',
              example: 1
            },
            name: { 
              type: 'string',
              example: 'Time dos Campeões'
            },
            description: { 
              type: 'string',
              example: 'Time de futebol amador da região'
            },
            banner: { 
              type: 'string', 
              nullable: true,
              example: 'uploads/teams/banner-1234567890.jpg'
            },
            primaryColor: { 
              type: 'string',
              example: '#FF0000'
            },
            secondaryColor: { 
              type: 'string',
              example: '#FFFFFF'
            },
            captainId: { 
              type: 'integer',
              example: 1
            },
            city: { 
              type: 'string',
              example: 'Curitiba'
            },
            state: { 
              type: 'string',
              example: 'PR'
            },
            CEP: { 
              type: 'string',
              example: '80000-000'
            },
            isDeleted: {
              type: 'boolean',
              example: false
            }
          }
        },
        Player: {
          type: 'object',
          properties: {
            id: { 
              type: 'integer',
              example: 1
            },
            name: { 
              type: 'string',
              example: 'Carlos Oliveira'
            },
            gender: { 
              type: 'string', 
              enum: ['Masculino', 'Feminino'],
              example: 'Masculino'
            },
            year: { 
              type: 'string',
              example: '1995'
            },
            position: { 
              type: 'string',
              example: 'Atacante'
            },
            isDeleted: {
              type: 'boolean',
              example: false
            }
          }
        },
        FriendlyMatch: {
          type: 'object',
          properties: {
            id: { 
              type: 'integer',
              example: 1
            },
            title: { 
              type: 'string',
              example: 'Rachão de Sábado'
            },
            description: { 
              type: 'string', 
              nullable: true,
              example: 'Partida amistosa entre amigos'
            },
            date: { 
              type: 'string', 
              format: 'date-time',
              example: '2025-01-20T15:00:00.000Z'
            },
            location: { 
              type: 'string',
              example: 'Rua Principal'
            },
            number: {
              type: 'string',
              example: '123'
            },
            complement: {
              type: 'string',
              example: 'Próximo ao mercado'
            },
            status: { 
              type: 'string', 
              enum: ['aberta', 'sem_vagas', 'confirmada', 'em_andamento', 'finalizada', 'cancelada'],
              example: 'aberta'
            },
            price: { 
              type: 'number', 
              format: 'decimal', 
              nullable: true,
              example: 30.00
            },
            duration: { 
              type: 'string',
              nullable: true,
              example: '90'
            },
            organizerId: { 
              type: 'integer',
              example: 1
            },
            matchType: { 
              type: 'string',
              example: 'Futebol Society'
            },
            square: { 
              type: 'string',
              example: 'Arena Sports'
            },
            Cep: {
              type: 'string',
              nullable: true,
              example: '80000-000'
            },
            Uf: {
              type: 'string',
              nullable: true,
              example: 'PR'
            }
          }
        },
        Championship: {
          type: 'object',
          properties: {
            id: { 
              type: 'integer',
              example: 1
            },
            name: { 
              type: 'string',
              example: 'Campeonato de Verão 2025'
            },
            description: { 
              type: 'string', 
              nullable: true,
              example: 'Campeonato amador de futebol society'
            },
            start_date: { 
              type: 'string', 
              format: 'date-time',
              example: '2025-01-15T00:00:00.000Z'
            },
            end_date: { 
              type: 'string', 
              format: 'date-time',
              example: '2025-03-15T00:00:00.000Z'
            },
            created_by: { 
              type: 'integer',
              example: 1
            },
            modalidade: { 
              type: 'string',
              example: 'Futebol Society'
            },
            nomequadra: { 
              type: 'string',
              example: 'Arena Central'
            },
            tipo: {
              type: 'string',
              enum: ['liga', 'mata-mata'],
              example: 'liga'
            },
            fase_grupos: {
              type: 'boolean',
              example: false
            },
            max_teams: {
              type: 'integer',
              example: 8
            },
            genero: {
              type: 'string',
              enum: ['masculino', 'feminino', 'misto'],
              example: 'masculino'
            },
            status: {
              type: 'string',
              enum: ['draft', 'open', 'closed', 'in_progress', 'finished'],
              example: 'draft'
            },
            num_grupos: {
              type: 'integer',
              nullable: true,
              example: 4
            },
            times_por_grupo: {
              type: 'integer',
              nullable: true,
              example: 4
            },
            num_equipes_liga: {
              type: 'integer',
              nullable: true,
              example: 10
            }
          }
        },
        MatchRules: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            matchId: {
              type: 'integer',
              example: 1
            },
            registrationDeadline: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-20T00:00:00.000Z'
            },
            minimumAge: {
              type: 'integer',
              example: 18
            },
            maximumAge: {
              type: 'integer',
              example: 45
            },
            gender: {
              type: 'string',
              enum: ['Masculino', 'Feminino', 'Ambos'],
              example: 'Masculino'
            }
          }
        },
        Evaluation: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            match_id: {
              type: 'integer',
              example: 1
            },
            evaluator_id: {
              type: 'integer',
              example: 1
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 4
            },
            comment: {
              type: 'string',
              nullable: true,
              example: 'Ótima partida, muito bem organizada!'
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.ts', './controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
