import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../PunicaoModal.css';

interface PunicaoPartidaAmistosaModal {
  show: boolean;
  onHide: () => void;
  team: any;
  onClose: () => void;
  idmatch: number;
}

interface Dados {
  idtime: number;
  nomeTime: string;
  motivo: string;
}

const PunicaoUpdateModal: React.FC<PunicaoPartidaAmistosaModal> = ({ 
  show, 
  onHide, 
  team, 
  onClose,
  idmatch 
}) => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isChanged, setIsChanged] = useState(false);
  const [punicao, setPunicao] = useState<any>([]);
  const [permitirAlteracao, setPermitirAlteracao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataTeams, setDataTeams] = useState<any>([]);
  
  const [formData, setFormData] = useState<Dados>({
    idtime: 0,
    nomeTime: "",
    motivo: ""
  });
  
  const [initialData, setInitialData] = useState<Dados>({
    idtime: 0,
    nomeTime: "",
    motivo: ""
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "idtime") {
      // Find the selected team to get both id and name
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

  // Effect para buscar dados da punição e times
  useEffect(() => {
    if (!show || !idmatch) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Buscar dados da punição
        const fetchPunicao = async () => {
          try {
            const response = await axios.get(`http://localhost:3001/api/matches/${idmatch}/punicao`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (response.data && response.data.length > 0) {
              const newData = {
                idtime: response.data[0].idtime,
                nomeTime: response.data[0].team.name,
                motivo: response.data[0].motivo
              };
              
              setInitialData(newData);
              setFormData(newData);
            }
          } catch (error) {
            console.error("Error fetching punicao data:", error);
            setError("Erro ao carregar dados da punição");
          }
        };

        // Buscar times da partida
        const fetchTeamsMatch = async () => {
          try {
            const teamsResponse = await axios.get(`http://localhost:3001/api/matches/${idmatch}/join-team`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            // Acesse os dados corretamente da resposta
            setDataTeams(teamsResponse.data || []);
            console.log("Data teams:", teamsResponse.data);
          } catch (error) {
            console.error("Error fetching teams:", error);
            setError("Erro ao carregar times da partida");
          }
        };

        // Executar ambas as buscas
        await Promise.all([fetchPunicao(), fetchTeamsMatch()]);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [show, idmatch]); // Dependências corretas

  useEffect(() => {
    // Compare objects properly and ensure both have valid data
    if (initialData && formData && initialData.idtime !== 0) {
      const hasChanged = JSON.stringify(initialData) !== JSON.stringify(formData);
      setPermitirAlteracao(hasChanged);
    } else {
      setPermitirAlteracao(false);
    }
  }, [formData, initialData]);

  const UpdatePunicao = async (idMatch:number) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      console.log("Dados para enviar",formData)
      await axios.put(`http://localhost:3001/api/matches/${idMatch}/punicao`, {
        idtime: formData.idtime,
        motivo: formData.motivo
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSuccess("Punição alterada com sucesso!");
      setInitialData(formData); // Update initial data to reflect the change
      
      // Auto close after success (optional)
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

  const handleClose = () => {
    setError("");
    setSuccess("");
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      className="regras-modal"
      backdrop="static"
      keyboard={false}
      size="xl"
    > 
      <Modal.Body>
        <div className="modal-content-wrapper">
          <h2 className="modal-title">Alterar punição</h2>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <p style={{ justifyContent: 'center', display: 'flex' }}>{success}</p>
            </div>
          )}
          
          <br/>
          
          {loading ? (
            <div style={{ textAlign: 'center', color: 'white' }}>
              Carregando...
            </div>
          ) : (
            <>
              <div className="form-group">
                <label style={{color:"white"}}>Selecione time para punição: </label>
                <select 
                  className="form-select" 
                  name="idtime" 
                  onChange={(e)=>handleSelectChange(e)}
                  value={formData.idtime} 
                  aria-label="Selecione o time"
                >
                  {/* Show current selection */}
                  <option value={formData.idtime}>
                    {formData.nomeTime || "Selecione um time"}
                  </option>
                  
                  {/* Show other team options */}
                  {Array.isArray(dataTeams) && dataTeams
                    .filter((dado: any) => dado.name !== formData.nomeTime)
                    .map((dado: any) => (
                      <option key={dado.id} value={dado.id}>
                        {dado.name}
                      </option>
                    ))
                  }
                </select>
              </div> 
              
              <div className="form-row">
                <div className="form-group">
                  <label style={{color:"white"}}>Selecione motivo: </label>
                  <select 
                    className="form-select" 
                    name="motivo" 
                    value={formData.motivo} 
                    onChange={(e)=>handleSelectChange(e)} 
                    aria-label="Selecione o motivo"
                  >
                    <option value="">Selecione um motivo</option>
                    <option value="Desistencia">Desistência</option> 
                    <option value="Atraso">Atraso</option> 
                  </select>
                </div>
              </div>
            </>
          )}
          
          <div className="modal-buttons">
            <button
              type="button"
              className="btn btn-warning"
              onClick={()=>UpdatePunicao(idmatch)}   
              disabled={!permitirAlteracao || loading || !formData.motivo}
            >
              {loading ? "Alterando..." : "Alterar punição"}
            </button>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PunicaoUpdateModal;