import { useEffect, useState } from 'react';
import { getPunicao, getJoinedTeams, updatePunicao } from '../services/matchesFriendlyServices';

interface Dados {
  idtime: number;
  nomeTime: string;
  motivo: string;
  team_home: number;
  team_away: number;
}

export const usePunicaoUpdate = (show: boolean, idmatch: number, onClose: () => void) => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dataTeams, setDataTeams] = useState<any>([]);
  const [permitirAlteracao, setPermitirAlteracao] = useState(false);

  const [formData, setFormData] = useState<Dados>({
    idtime: 0,
    nomeTime: "",
    motivo: "",
    team_home: 0,
    team_away: 0
  });

  const [initialData, setInitialData] = useState<Dados>({
    idtime: 0,
    nomeTime: "",
    motivo: "",
    team_home: 0,
    team_away: 0
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "idtime") {
      const selectedTeam = Array.isArray(dataTeams)
        ? dataTeams.find((t: any) => t.id === parseInt(value))
        : null;

      setFormData((prevData) => ({
        ...prevData,
        idtime: parseInt(value),
        nomeTime: selectedTeam ? selectedTeam.name : ""
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const punicaoResp = await getPunicao(idmatch);
      if (punicaoResp.data && punicaoResp.data.length > 0) {
        const punicaoData = punicaoResp.data[0];
        const newData = {
          idtime: punicaoData.idTeam || punicaoData.idtime || 0,
          nomeTime: punicaoData.team?.name || '',
          motivo: punicaoData.reason || punicaoData.motivo || '',
          team_home: punicaoData.team_home || 0,
          team_away: punicaoData.team_away || 0
        };
        setInitialData(newData);
        setFormData(newData);
      }

      const teamsResp = await getJoinedTeams(idmatch);
      setDataTeams(Array.isArray(teamsResp.data) ? teamsResp.data : []);
    } catch (err) {
      console.error('Error fetching punicao or teams:', err);
      setError('Erro ao carregar dados da punição');
    } finally {
      setLoading(false);
    }
  };

  const submitUpdate = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await updatePunicao(idmatch, {
        idTeam: formData.idtime,
        reason: formData.motivo,
        team_home: formData.team_home,
        team_away: formData.team_away
      });

      setSuccess("Punição alterada com sucesso!");
      setInitialData(formData);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating punicao:", error);
      setError("Erro ao alterar punição");
    } finally {
      setLoading(false);
    }
  };

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    if (show && idmatch) {
      loadData();
    }
  }, [show, idmatch]);

  useEffect(() => {
    if (initialData && formData && initialData.idtime !== 0) {
      const hasChanged = JSON.stringify(initialData) !== JSON.stringify(formData);
      setPermitirAlteracao(hasChanged);
    } else {
      setPermitirAlteracao(false);
    }
  }, [formData, initialData]);

  return {
    formData,
    dataTeams,
    loading,
    error,
    success,
    permitirAlteracao,
    handleSelectChange,
    submitUpdate,
    resetMessages
  };
};