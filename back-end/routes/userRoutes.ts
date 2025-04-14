import express from 'express';
import UserController  from '../controllers/userController'; // Corrected path
import { authenticateToken } from '../middleware/auth';
const router= express.Router();
router.get('/:id', authenticateToken, UserController.returnUser);
router.put('/:id', authenticateToken, UserController.updateUser);
router.delete('/:id', authenticateToken, UserController.deleteUser);
router.put('/password/:id', authenticateToken, UserController.updateUserPassword);
export default router;