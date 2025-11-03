import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VarzeaLeague API',
      version: '1.0.0',
      description: 'API para gerenciamento de partidas amistosas, campeonatos, times e jogadores de futebol amador',
      contact: {
        name: 'VarzeaLeague Team',
        email: 'contato@varzealeague.com'
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
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            error: {
              type: 'string',
              description: 'Detalhes do erro'
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
            userTypeId: { 
              type: 'integer',
              description: '1=Admin Master, 2=Admin Eventos, 3=Admin Times, 4=Usuário Comum',
              example: 4
            }
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
            cidade: { 
              type: 'string',
              example: 'Curitiba'
            },
            estado: { 
              type: 'string',
              example: 'PR'
            },
            cep: { 
              type: 'string',
              example: '80000-000'
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
            nome: { 
              type: 'string',
              example: 'Carlos Oliveira'
            },
            sexo: { 
              type: 'string', 
              enum: ['Masculino', 'Feminino'],
              example: 'Masculino'
            },
            ano: { 
              type: 'string',
              example: '1995'
            },
            posicao: { 
              type: 'string',
              example: 'Atacante'
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
              example: 'Campo do Bairro - Rua Principal, 123'
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
              example: '90'
            },
            organizerId: { 
              type: 'integer',
              example: 1
            },
            modalidade: { 
              type: 'string',
              example: 'Futebol Society'
            },
            nomequadra: { 
              type: 'string',
              example: 'Arena Sports'
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
            genero: {
              type: 'string',
              enum: ['Masculino', 'Feminino', 'Misto'],
              example: 'Masculino'
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
            minPlayers: {
              type: 'integer',
              example: 5
            },
            maxPlayers: {
              type: 'integer',
              example: 11
            },
            minAge: {
              type: 'integer',
              nullable: true,
              example: 18
            },
            maxAge: {
              type: 'integer',
              nullable: true,
              example: 45
            },
            allowedGender: {
              type: 'string',
              enum: ['Masculino', 'Feminino', 'Misto'],
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
