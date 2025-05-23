import { Router } from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/passwordResetController';

const routerReset = Router();

routerReset.post('/request-reset', requestPasswordReset);
routerReset.put('/reset', resetPassword);

export default routerReset; 
