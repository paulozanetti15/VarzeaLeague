import { Response } from 'express';
import TeamController from '../../controllers/TeamController';
import { AuthRequest } from '../../middleware/auth';
import Team from '../../models/TeamModel';
import UserModel from '../../models/UserModel';

jest.mock('../../models/TeamModel');
jest.mock('../../models/UserModel');

describe('TeamController - Authorization Rules', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnValue(undefined);
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    req = {
      user: { id: 1, userTypeId: 3 },
      body: {
        name: 'Time Test',
        city: 'Curitiba'
      }
    };

    res = {
      status: statusMock,
      json: jsonMock
    };

    jest.clearAllMocks();
  });

  describe('One Team Per User Constraint (admin_times - userTypeId 3)', () => {
    it('should allow first team creation for admin_times user', async () => {
      (Team.count as jest.Mock).mockResolvedValue(0);
      (Team.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Time Test',
        captainId: 1,
        city: 'Curitiba'
      });

      await TeamController.createTeam(req as AuthRequest, res as Response);

      expect(Team.create).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should deny second team creation for admin_times user', async () => {
      req.user = { id: 1, userTypeId: 3 };

      (Team.count as jest.Mock).mockResolvedValue(1);

      await TeamController.createTeam(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('um time')
        })
      );
      expect(Team.create).not.toHaveBeenCalled();
    });

    it('should allow team creation for admin_eventos user (userTypeId 2)', async () => {
      req.user = { id: 2, userTypeId: 2 };
      (Team.count as jest.Mock).mockResolvedValue(5);
      (Team.create as jest.Mock).mockResolvedValue({ id: 1, name: 'Time Test' });

      await TeamController.createTeam(req as AuthRequest, res as Response);

      expect(Team.create).toHaveBeenCalled();
    });

    it('should allow team creation for admin_master user (userTypeId 1)', async () => {
      req.user = { id: 1, userTypeId: 1 };
      (Team.count as jest.Mock).mockResolvedValue(10);
      (Team.create as jest.Mock).mockResolvedValue({ id: 1, name: 'Time Test' });

      await TeamController.createTeam(req as AuthRequest, res as Response);

      expect(Team.create).toHaveBeenCalled();
    });

    it('should count teams correctly by userId and exclude soft deleted teams', async () => {
      req.user = { id: 1, userTypeId: 3 };
      req.body = { name: 'New Team', city: 'Curitiba' };

      (Team.count as jest.Mock).mockResolvedValue(0);
      (Team.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'New Team',
        captainId: 1,
        city: 'Curitiba'
      });

      await TeamController.createTeam(req as AuthRequest, res as Response);

      expect(Team.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            captainId: 1,
            isDeleted: false
          })
        })
      );
    });
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      req.user = undefined;

      await TeamController.createTeam(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      req.body = { name: '' };

      await TeamController.createTeam(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });
});
