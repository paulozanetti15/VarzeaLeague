import { get } from "http";
import Rules from "../models/RulesModel";
import MatchModel from "../models/MatchModel";

export const insertRules = async (req, res) => {
    try {
        const { idade_minima, idade_maxima, sexo } = req.body;
        
        // Validações
        if (!idade_minima || !idade_maxima || !sexo) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }

        // Validação das idades
        if (parseInt(idade_minima) < 0 || parseInt(idade_maxima) > 100) {
            return res.status(400).json({ message: "Idades devem estar entre 0 e 100 anos" });
        }

        if (parseInt(idade_minima) > parseInt(idade_maxima)) {
            return res.status(400).json({ message: "Idade mínima não pode ser maior que idade máxima" });
        }

        // Validação do gênero
        if (!['Masculino', 'Feminino', 'Ambos'].includes(sexo)) {
            return res.status(400).json({ message: "Gênero inválido" });
        }

        const idPartida = await MatchModel.findOne({
            order: [['id', 'DESC']]
        });

        await Rules.create({
            partidaId: idPartida.id,
            idade_minima: parseInt(idade_minima),
            idade_maxima: parseInt(idade_maxima),
            sexo: sexo
        });   

        res.status(201).json({ message: "Regra criada com sucesso!" });
    } catch (error) {
        console.error("Erro ao criar regra:", error);
        res.status(500).json({ message: "Erro ao criar regra", error });
    }
}

export const deleteRules = async (req, res) => {
    try {
        const { partidaId } = req.params;
        await Rules.destroy({ where: { partidaId: partidaId } });
        res.status(200).json({ message: "Regras deletadas com sucesso!" });
    }
    catch (error) {
        console.error("Erro ao deletar regras:", error);
        res.status(500).json({ message: "Erro ao deletar as regras", error });
    }
}

export const updateRules = async (req, res) => {
    try {
        const { partidaId } = req.params;
        const { idade_minima, idade_maxima, sexo } = req.body;

        // Validações
        if (!idade_minima || !idade_maxima || !sexo) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }

        // Validação das idades
        if (parseInt(idade_minima) < 0 || parseInt(idade_maxima) > 100) {
            return res.status(400).json({ message: "Idades devem estar entre 0 e 100 anos" });
        }

        if (parseInt(idade_minima) > parseInt(idade_maxima)) {
            return res.status(400).json({ message: "Idade mínima não pode ser maior que idade máxima" });
        }

        // Validação do gênero
        if (!['Masculino', 'Feminino', 'Ambos'].includes(sexo)) {
            return res.status(400).json({ message: "Gênero inválido" });
        }

        await Rules.update({ 
            idade_minima: parseInt(idade_minima),
            idade_maxima: parseInt(idade_maxima),
            sexo: sexo
        }, { where: { partidaId: partidaId } });

        res.status(200).json({ message: "Regras atualizadas com sucesso!" });
    }
    catch (error) {
        console.error("Erro ao atualizar regras:", error);
        res.status(500).json({ message: "Erro ao atualizar as regras", error });
    }
}

export const getAllRules = async (req, res) => {
    try {
        const regras = await Rules.findAll();
        res.status(200).json(regras);
    } catch (error) {
        console.error("Erro ao buscar regras:", error);
        res.status(500).json({ message: "Erro ao buscar regras", error });
    }
}

export const getRuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const regras = await Rules.findOne({ where: { partidaId: id } });
        if (!regras) {
            return res.status(404).json({ message: "Não existem regras cadastradas" });
        }
        res.status(200).json(regras);
    } catch (error) {
        console.error("Erro ao buscar regras:", error);
        res.status(500).json({ message: "Erro ao buscar regras", error });
    }
}


