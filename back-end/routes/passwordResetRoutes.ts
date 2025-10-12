import { Router } from 'express';
import { requestPasswordReset, resetPassword,updatePassword } from '../controllers/passwordResetController';
import { authenticateToken } from '../middleware/auth';
const routerReset = Router();
routerReset.use(authenticateToken);
routerReset.post('/request-reset', requestPasswordReset);
routerReset.put('/reset', resetPassword);
routerReset.put('/:id/update', updatePassword);
export default routerReset; 
