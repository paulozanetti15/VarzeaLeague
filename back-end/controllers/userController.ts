import userModel from '../models/UserModel';
import { Request, Response } from 'express';
const bcrypt = require('bcrypt');
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
const returnUser = async (req: any, res: any) => {
    const userId = req.params.id
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const user = await userModel.findOne({ where: { id: userId } });
    if(!user){
        return res.status(404).json({error:'User not found'})
    }
    return res.status(200).json(user)
}
const updateUser = async (req,res) => {
    const {id} = req.params;
    const {name, email, phone, sexo} = req.body;
    console.log(name,email)
    const updatedUser = await userModel.update({
        name,
        email,
        phone,
        sexo,
    },{where:{id}})
   
    return res.status(200).json(updatedUser)
}
const deleteUser = async (req,res) => {
    const { id } = req.params
    const deletedUser = await userModel.destroy({where:{id}})
    if(!deletedUser){
        return res.status(404).json({error:'User not found'})
    }
    return res.status(200).json({message:'User deleted successfully'})
}
const updateUserPassword = async (req: any, res: any) => {
    const { id } = req.params;
    const { currentPassword, password } = req.body;
    const user = await userModel.findOne({ where: { id } });
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.update({ password: hashedPassword }, { where: { id } });
    return res.status(200).json({ message: 'Senha atualizada com sucesso' });
}

export default {
    returnUser,
    updateUser,
    deleteUser,
    updateUserPassword
}