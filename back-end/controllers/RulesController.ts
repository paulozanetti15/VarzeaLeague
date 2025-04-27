import { get } from "http";
import Rules from "../models/RulesModel";
import MatchModel from "../models/MatchModel";
export const insertRules= async (req, res) => {
    try {
        const {idadeMaxima,idadeMinima,minimaIntegrantes,maximoIntegrante,limitestimes,dataLimite,sexo } = req.body;
        const idPartida = await MatchModel.findOne({
            order: [['id', 'DESC']]
        });
        await Rules.create({
            idademaxima:idadeMaxima,
            idademinima:idadeMinima,
            minparticipantes:minimaIntegrantes,
            maxparticipantes:maximoIntegrante,
            quantidade_times:limitestimes,
            datalimiteinscricao:dataLimite,
            partidaid:idPartida.id,
            sexo:sexo
        });   
        res.status(201).json({ message: "Regra criada com sucesso!" });
    } catch (error) {
        res.status(500).json({ message: "Erro para criar regra", error });
    }
}

export const deleteRules = async (req, res) => {
    try {
        const { partidaid } = req.params;
        Rules.destroy({ where: { partidaid:partidaid } });
        res.status(200).json({ message: "Regras deletada com sucesso!" });
    }
    catch (error) {
        res.status(500).json({ message: "Erro ao deletar as regras", error });
    }
}
export const updateRules = async (req, res) => {
    try {
        const { partidaId } = req.params;
        const { idadeMaxima,idadeMinima,minimaIntegrantes,maximoIntegrante,limitestimes,dataLimite,idPartida   } = req.body;
        await Rules.update({ 
            idademaxima:idadeMaxima,
            idademinima:idadeMinima,
            minIntegrantes:minimaIntegrantes,
            maxIntegrantes:maximoIntegrante,
            quantidade_times:limitestimes,
            datalimiteinscricao:dataLimite,
         }, { where: { partidaid:partidaId } });
        res.status(200).json({ message: "Regras atualizadas com sucesso!" });
    }
    catch (error) {
        res.status(500).json({ message: "Erro ao atualizar as regras", error });
    }
}
export const getAllRules = async (req, res) => {
    try {
        const regras = await Rules.findAll();
        res.status(200).json(regras);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar regras", error });
    }
}
export const getRuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const regras = await Rules.findOne({ where: { partidaid:id } });
        if (!regras) {
            return res.status(404).json({ message: "Não existem regras cadastradas" });
        }
        res.status(200).json(regras);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar regras", error });
    }
}


