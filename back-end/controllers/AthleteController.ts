import { get } from "http";
import Athlete from "../models/AthleteModel";
export const insertAthlete = async (req, res) => {
    try {
        const {userId,altura,idade,peso } = req.body;
        const Atleta=Athlete.findOne({ where: {userId: userId } })
        if (!Atleta) {
            return res.status(400).json({ message: "Atleta já existe" });
        }
        await Athlete.create({
            userId,
            altura,
            idade,
            peso
        });
        
       
        res.status(201).json({ message: "Atleta criada com sucesso!" });
    } catch (error) {
        res.status(500).json({ message: "Erro para criar atleta", error });
    }
}

export const deleteAthlete = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        Athlete.destroy({ where: { userId:id } });
        res.status(200).json({ message: "Atleta deletada com sucesso!" });
    }
    catch (error) {
        res.status(500).json({ message: "Erro ao deletar atleta", error });
    }
}
export const updateAthlete = async (req, res) => {
    try {
        const { id } = req.params;
        const { altura, idade, peso } = req.body;
        await Athlete.update({ altura, idade, peso }, { where: { userId:id } });
        res.status(200).json({ message: "Atleta atualizada com sucesso!" });
    }
    catch (error) {
        res.status(500).json({ message: "Erro ao atualizar atleta", error });
    }
}
export const getAllAthletes = async (req, res) => {
    try {
        const athletes = await Athlete.findAll();
        res.status(200).json(athletes);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar atletas", error });
    }
}
export const getAthleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const athlete = await Athlete.findOne({ where: { userId:id } });
        if (!athlete) {
            return res.status(404).json({ message: "Atleta não encontrado" });
        }
        res.status(200).json(athlete);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar atleta", error });
    }
}


