import userType from '../models/UserType';
async function getAllUserTypes(req, res) {
    try {
        const userTypes = await userType.findAll();
        res.status(200).json({data:userTypes});
    } catch (error) {
        res.status(500).json({ message: "Error fetching user types", error });
    }
}
async function createUserType(req, res) {
    const users = [
        {
          name: 'admin_sistema',  
          description: 'Responsável por gerenciar o sistema e conceder permissões.'
        },
        {
          name: 'admin_eventos',  
          description: 'Gerencia os eventos e suas configurações no sistema.'
        },
        {
          name: 'admin_times', 
          description: 'Responsável pela administração dos times e seus participantes.'
        }
    ];
    try {
        const newUserType = users.map(user => userType.create(user));
        await Promise.all(newUserType);
        res.status(201).json({ data: newUserType});
    } catch (error) {
        res.status(500).json({ message: "Error creating user type", error });
    }
}
async function updateUserType(req, res) {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userTypeToUpdate = await userType.findByPk(id);
        if (!userTypeToUpdate) {
            return res.status(404).json({ message: "User type not found" });
        }
        userTypeToUpdate.toJSON().name = name;
        userTypeToUpdate.toJSON().description = description;
        await userTypeToUpdate.save();
        res.status(200).json(userTypeToUpdate);
    } catch (error) {
        res.status(500).json({ message: "Error updating user type", error });
    }
}
async function deleteUserType(req, res) {
    try {
        const { id } = req.params;
        const userTypeToDelete = await userType.findByPk(id);
        if (!userTypeToDelete) {
            return res.status(404).json({ message: "User type not found" });
        }
        await userTypeToDelete.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting user type", error });
    }
}
export { getAllUserTypes, createUserType, updateUserType, deleteUserType };