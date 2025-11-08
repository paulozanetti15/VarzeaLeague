import Rules from "../models/FriendlyMatchesRulesModel";
import FriendlyMatchesModel from "../models/FriendlyMatchesModel";
import FriendlyMatchTeamsModel from "../models/FriendlyMatchTeamsModel";
import { Op } from "sequelize";

export const insertRules = async (req, res) => {
    try {
        const { registrationDeadline, minimumAge, maximumAge, gender, matchId } = req.body;
        
        if (!registrationDeadline || !minimumAge || !maximumAge || !gender || !matchId) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }

        if (parseInt(minimumAge) < 0 || parseInt(maximumAge) > 100) {
            return res.status(400).json({ message: "Idades devem estar entre 0 e 100 anos" });
        }

        if (parseInt(minimumAge) > parseInt(maximumAge)) {
            return res.status(400).json({ message: "Idade mínima não pode ser maior que idade máxima" });
        }

        if (!['Masculino', 'Feminino', 'Ambos'].includes(gender)) {
            return res.status(400).json({ message: "Gênero inválido" });
        }

        const match = await FriendlyMatchesModel.findByPk(matchId);
        if (!match) {
            return res.status(404).json({ message: "Partida não encontrada" });
        }

        const existingRules = await Rules.findOne({ where: { matchId } });
        if (existingRules) {
            return res.status(409).json({ message: "Regras já existem para esta partida" });
        }

        const newRules = await Rules.create({
            matchId: matchId,
            registrationDeadline: registrationDeadline,
            minimumAge: parseInt(minimumAge),
            maximumAge: parseInt(maximumAge),
            gender: gender
        });   

        res.status(201).json({ 
            message: "Regra criada com sucesso!",
            rules: newRules
        });
    } catch (error) {
        console.error("Erro ao criar regra:", error);
        res.status(500).json({ 
            message: "Erro ao criar regra",
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
}

export const deleteRules = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rules = await Rules.findOne({ where: { matchId: id } });
        if (!rules) {
            return res.status(404).json({ message: "Regras não encontradas" });
        }
        
        await rules.destroy();
        res.status(200).json({ message: "Regras deletadas com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar regras:", error);
        res.status(500).json({ 
            message: "Erro ao deletar as regras",
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
}

export const updateRules = async (req, res) => {
    try {
        const { id } = req.params;
        const { minimumAge, maximumAge, gender, registrationDeadline } = req.body;

        if (!registrationDeadline || !minimumAge || !maximumAge || !gender) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }

        if (parseInt(minimumAge) < 0 || parseInt(maximumAge) > 100) {
            return res.status(400).json({ message: "Idades devem estar entre 0 e 100 anos" });
        }

        if (parseInt(minimumAge) > parseInt(maximumAge)) {
            return res.status(400).json({ message: "Idade mínima não pode ser maior que idade máxima" });
        }

        if (!['Masculino', 'Feminino', 'Ambos'].includes(gender)) {
            return res.status(400).json({ message: "Gênero inválido" });
        }

        const parsedDeadline = new Date(registrationDeadline);
        if (isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({ message: "Data limite inválida" });
        }

        const rules = await Rules.findOne({ where: { matchId: id } });
        if (!rules) {
            return res.status(404).json({ message: "Regras não encontradas" });
        }
       
        await rules.update({
            registrationDeadline: parsedDeadline,
            minimumAge: parseInt(minimumAge),
            maximumAge: parseInt(maximumAge),
            gender: gender
        });

        const now = new Date();
        now.setHours(23, 59, 59, 999);
        
        const deadline = new Date(registrationDeadline);
        deadline.setHours(23, 59, 59, 999);
        
        const match = await FriendlyMatchesModel.findByPk(id);
        
        if (match) {
            const teamsCount = await FriendlyMatchTeamsModel.count({
                where: { matchId: id }
            });

            if (now > deadline) {
                if (teamsCount < 2 && (match.status === 'aberta' || match.status === 'sem_vagas')) {
                    await match.update({ 
                        status: 'cancelada'
                    });
                } else if (teamsCount >= 2 && match.status !== 'finalizada' && match.status !== 'cancelada') {
                    await match.update({
                        status: 'confirmada'
                    });
                }
            } else {
                if (match.status === 'cancelada') {
                    await match.update({ 
                        status: 'aberta'
                    });
                }
            }
        }

        res.status(200).json({ 
            message: "Regras atualizadas com sucesso!",
            rules: rules
        });
    } catch (error) {
        console.error("Erro ao atualizar regras:", error);
        res.status(500).json({ 
            message: "Erro ao atualizar as regras",
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
}

 

export const getRuleById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rules = await Rules.findOne({ where: { matchId: id } });
        if (!rules) {
            return res.status(404).json({ message: "Não existem regras cadastradas" });
        }
        
        res.status(200).json(rules);
    } catch (error) {
        console.error("Erro ao buscar regras:", error);
        res.status(500).json({ 
            message: "Erro ao buscar regras",
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
}


