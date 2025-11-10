import { Response } from 'express';
import { inserirPunicaoPartidaAmistosa } from '../../controllers/FriendlyMatchesPunishmentController';
import { AuthRequest } from '../../middleware/auth';
import UserModel from '../../models/UserModel';
import FriendlyMatch from '../../models/FriendlyMatchesModel';
import FriendlyMatchPenalty from '../../models/FriendlyMatchPenaltyModel';
import MatchReport from '../../models/FriendlyMatchReportModel';

jest.mock('../../models/UserModel');
jest.mock('../../models/FriendlyMatchesModel');
jest.mock('../../models/FriendlyMatchPenaltyModel');
jest.mock('../../models/FriendlyMatchReportModel');

describe('FriendlyMatchesPunishmentController - inserirPunicaoPartidaAmistosa', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnValue(undefined);
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    req = {
      user: { id: 1, userTypeId: 1 },
      params: { idAmistosaPartida: '1' },
      body: {
        teamId: 2,
        reason: 'Não comparecimento'
      }
    };

    res = {
      status: statusMock,
      json: jsonMock
    };

    jest.clearAllMocks();
  });

  describe('Authorization Checks', () => {
    it('should deny punishment creation for unauthorized users (userTypeId 4)', async () => {
      req.user = { id: 1, userTypeId: 4 };

      const mockUser = { id: 1, userTypeId: 4 };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const mockMatch = { id: 1, organizerId: 2 };
      (FriendlyMatch.findByPk as jest.Mock).mockResolvedValue(mockMatch);

      await inserirPunicaoPartidaAmistosa(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Permissão negada')
        })
      );
    });

    it('should deny punishment creation for non-organizer admin_times user', async () => {
      req.user = { id: 1, userTypeId: 3 };

      const mockUser = { id: 1, userTypeId: 3 };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const mockMatch = { id: 1, organizerId: 2 };
      (FriendlyMatch.findByPk as jest.Mock).mockResolvedValue(mockMatch);

      await inserirPunicaoPartidaAmistosa(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Permissão negada')
        })
      );
    });

    it('should allow punishment creation for match organizer', async () => {
      req.user = { id: 1, userTypeId: 3 };
      req.body = { teamId: 2, reason: 'Não comparecimento' };

      const mockUser = { id: 1, userTypeId: 3 };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const mockMatch = { id: 1, organizerId: 1, status: 'confirmada' };
      (FriendlyMatch.findByPk as jest.Mock).mockResolvedValue(mockMatch);

      const mockPenalty = {
        id: 1,
        idMatch: 1,
        idTeam: 2,
        reason: 'Não comparecimento',
        penaltyTeam: { id: 2, name: 'Time A' }
      };
      (FriendlyMatchPenalty.create as jest.Mock).mockResolvedValue(mockPenalty);
      (MatchReport.create as jest.Mock).mockResolvedValue({ id: 1 });
      (FriendlyMatch.prototype.update as jest.Mock).mockResolvedValue(mockMatch);

      await inserirPunicaoPartidaAmistosa(req as AuthRequest, res as Response);

      expect(FriendlyMatchPenalty.create).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should allow punishment creation for admin_master user', async () => {
      req.user = { id: 1, userTypeId: 1 };
      req.body = { teamId: 2, reason: 'Não comparecimento' };

      const mockUser = { id: 1, userTypeId: 1 };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const mockMatch = { id: 1, organizerId: 99, status: 'confirmada' };
      (FriendlyMatch.findByPk as jest.Mock).mockResolvedValue(mockMatch);

      const mockPenalty = {
        id: 1,
        idMatch: 1,
        idTeam: 2,
        reason: 'Não comparecimento'
      };
      (FriendlyMatchPenalty.create as jest.Mock).mockResolvedValue(mockPenalty);
      (MatchReport.create as jest.Mock).mockResolvedValue({ id: 1 });
      (FriendlyMatch.prototype.update as jest.Mock).mockResolvedValue(mockMatch);

      await inserirPunicaoPartidaAmistosa(req as AuthRequest, res as Response);

      expect(FriendlyMatchPenalty.create).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(201);
    });
  });

  describe('Match Validation', () => {
    it('should return 404 when match does not exist', async () => {
      (FriendlyMatch.findByPk as jest.Mock).mockResolvedValue(null);

      await inserirPunicaoPartidaAmistosa(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Partida não encontrada')
        })
      );
    });

    it('should reject punishment if match status is not confirmada', async () => {
      req.user = { id: 1, userTypeId: 1 };

      const mockUser = { id: 1, userTypeId: 1 };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const mockMatch = { id: 1, organizerId: 1, status: 'finalizada' };
      (FriendlyMatch.findByPk as jest.Mock).mockResolvedValue(mockMatch);

      await inserirPunicaoPartidaAmistosa(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('status')
        })
      );
    });
  });

  describe('Authentication Checks', () => {
    it('should return 401 when user is not authenticated', async () => {
      req.user = undefined;

      await inserirPunicaoPartidaAmistosa(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('não autenticado')
        })
      );
    });
  });

  describe('Data Creation', () => {
    it('should create a 3x0 summary report when punishment is applied', async () => {
      req.user = { id: 1, userTypeId: 1 };
      req.body = {
        teamId: 2,
        reason: 'Não comparecimento'
      };

      const mockUser = { id: 1, userTypeId: 1 };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const mockMatch = { id: 1, organizerId: 1, status: 'confirmada' };
      (FriendlyMatch.findByPk as jest.Mock).mockResolvedValue(mockMatch);

      const mockPenalty = { id: 1, idMatch: 1, idTeam: 2 };
      (FriendlyMatchPenalty.create as jest.Mock).mockResolvedValue(mockPenalty);
      (MatchReport.create as jest.Mock).mockResolvedValue({ id: 1 });

      await inserirPunicaoPartidaAmistosa(req as AuthRequest, res as Response);

      expect(MatchReport.create).toHaveBeenCalledWith(
        expect.objectContaining({
          match_id: 1,
          is_penalty: true
        })
      );
    });
  });
});
