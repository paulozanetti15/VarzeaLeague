import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import ToastSucessComponent from '../../Toast/ToastComponent';
import { set } from 'date-fns';
import { Category } from '@mui/icons-material';
import './RegrasStyles.css';
import { ca } from 'date-fns/locale';

interface regrasModalProps {
    userId: number;
    show: boolean;
    partidaDados: any;
    onHide: () => void;
}

export default function regrasModal({show, onHide,partidaDados}: regrasModalProps) {
   
    const [limitestimes, setLimitestimes] = useState<number | null>(null);
    const [sexo, setSexo] = useState<string | null>(null);
    const [dataLimite, setDataLimite] = useState<Date | null>(null);
    const [categoria, setCategoria] = useState<string | null>(null);
    const [empate, setEmpate] = useState<string | null>(null);
    const [error,setError]=useState<string>("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastBg, setToastBg] = useState('success');
    const navigate = useNavigate();
    
    const insertPartida = async () => {
        if(dataLimite && verificarDataLimite(dataLimite,partidaDados.date) === true 
              && limitestimes !== null &&
              isValidLimiteTime(limitestimes) === true){
            const insertPartida=await axios.post(
                "http://localhost:3001/api/matches/",
                {
                    title: partidaDados.title.trim(),
                    description: partidaDados.description?.trim(),
                    date: partidaDados.date,
                    location: partidaDados.location,
                    price: partidaDados.price ? parseFloat(partidaDados.price) : null,
                    city: partidaDados.city.trim(),
                    complement: partidaDados.complement?.trim(),
                    Uf: partidaDados.Uf,
                    Cep: partidaDados.Cep
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if(insertPartida.status === 201) {
                insertRegras();  
            }  
        }  
               
    };
    const insertRegras = async () => {
        try {
            const response = await axios.post(
                "http://localhost:3001/api/rules/",
                {
                    limitestimes: limitestimes, 
                    category: categoria,
                    empate: empate, 
                    dataLimite: dataLimite,
                    sexo: sexo,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if(response.status === 201) {
                onHide();
                setToastMessage("Regras cadastradas com sucesso");
                setToastBg("success");
                setShowToast(true);
                setTimeout(() => {
                    navigate("/matches");
                }, 2000);
                
            } else {
               setError("Erro ao cadastrar regras, verifique os campos obrigatórios");
            }
        } catch (error) {
            console.error("Erro ao cadastrar regras:", error);
            setError("Erro ao cadastrar regras, verifique os campos obrigatórios");
        }
    };
      
    const convertendoDataLimite = (data: string) => {
        const partes = data.split('-');
        const ano = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1; // Meses começam do zero em JavaScript
        const dia = parseInt(partes[2]);
        const dataLimite = new Date(ano, mes, dia);
        setDataLimite(dataLimite);
    }

    const verificarDataLimite = (dataLimite: Date,dataPartida:Date) => {
        const dataAtual = new Date();
        const dataLimiteFormatada = new Date(dataLimite);
        const verificandoData=dataLimiteFormatada >= dataAtual
        console.log("Data atual:", verificandoData);  
        if(!verificandoData) {
            setError("Data limite deve ser maior ou igual que a data atual")
            return false;
        };
        if(dataLimite > dataPartida) {
            setError("Data limite não deve ser maior que a data da partida")
            return false;
        }
        return true;
    }
    
    const isValidLimiteTime= (limitetime:number) => {
        if(!limitetime) {
            setError("Limite de times é obrigatório");
            return false;
        }
        else if(limitetime < 2) {
            setError("Limite de times deve ser maior que 2");
            return false;
        }
        return true;
    }
    
    return (
        <>
            <Modal 
                show={show} 
                onHide={onHide} 
                centered 
                dialogClassName="custom-modal-width"
                contentClassName="small-modal-content"
            >
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Cadastrar Regras</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-white">
                    <Form>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="limitesTimes">
                                    <Form.Label>Limites de times</Form.Label>
                                    <Form.Control 
                                        type="number"
                                        placeholder="Número de times"
                                        onChange={(e) => setLimitestimes(parseFloat(e.target.value) || null)}
                                        className="border-primary"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="sexo">
                                    <Form.Label>Genero permitido</Form.Label>
                                    <Form.Select 
                                        onChange={(e) => setSexo(e.target.value)} 
                                        className="border-primary"
                                        aria-label="Sexo permitido">
                                        <option value="">Selecione o sexo</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Ambos">Ambos</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-12">
                                <Form.Group className="mb-1" controlId="sexo">
                                    <Form.Label>Possui Empate?</Form.Label>
                                    <Form.Select 
                                        onChange={(e) => setEmpate(e.target.value)} 
                                        className="border-primary"
                                        aria-label="Possui Empate">
                                        <option value="">Selecione se possui empate</option>
                                        <option value="Sim">Sim</option>
                                        <option value="Não">Não</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-12">
                                <Form.Group className="mb-1" controlId="sexo">
                                    <Form.Label>Categoria</Form.Label>
                                    <Form.Select 
                                        onChange={(e) => setCategoria(e.target.value)} 
                                        className="border-primary"
                                        aria-label="Possui Empate">
                                        <option value="">Selecione uma categoria</option>
                                        <option value="sub-7">Sub-7</option>
                                        <option value="sub-8">Sub-8</option>
                                        <option value="sub-9">Sub-9</option>
                                        <option value="sub-11">Sub-11</option>
                                        <option value="sub-13">Sub-13</option>
                                        <option value="sub-15">Sub-15</option>
                                        <option value="sub-17">Sub-17</option>
                                        <option value="sub-20">Sub-20</option>
                                        <option value="adulto">Adulto</option>  
                                        <option value="Veterano">Vetereno</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group className="mb-3" controlId="dataLimite">
                            <Form.Label>Data limite para inscrição</Form.Label>
                            <Form.Control 
                                type="date"
                                onChange={(e) => convertendoDataLimite(e.target.value)}
                                className="border-primary"
                            />
                        </Form.Group>
                    </Form>
                    
                    {error && (
                        <div className="alert alert-danger mt-3" role="alert">
                            {error}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-white">
                    <Button variant="outline-secondary" onClick={onHide}>
                        Fechar
                    </Button>
                    <Button variant="primary" onClick={() => insertPartida()}>
                        Cadastrar Partida
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {showToast && (
                <ToastSucessComponent
                    message={toastMessage}
                    bg={toastBg}
                    onClose={() => setShowToast(false)}
                />
            )}
        </>
    );
}
