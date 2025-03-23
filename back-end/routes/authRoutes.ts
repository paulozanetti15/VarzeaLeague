import express from 'express';
const router = express.Router();
import { register, login } from './../controllers/authController';

router.post('/register', register);
router.post('/login', login);

<<<<<<< HEAD
export default router;
=======
export default router; 
>>>>>>> 987950d283dcf61ec65394e1e354dee9ed69c3fb
