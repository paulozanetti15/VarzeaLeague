import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tooltip,
  TablePagination,
  CircularProgress,
  Avatar,
  Stack,
  useTheme,
  Fade,
  Slide
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

// Glassmorphism modal
const GlassDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    background: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(16px) saturate(180%)',
    borderRadius: 24,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
    border: '1px solid rgba(255,255,255,0.18)',
    padding: theme.spacing(2, 2, 2, 2),
    minWidth: 340,
    maxWidth: 480,
    margin: 'auto',
  },
}));

// Gradient avatar
const GradientAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #21cbf3 100%)',
  color: '#fff',
  width: 72,
  height: 72,
  fontSize: 36,
  fontWeight: 800,
  boxShadow: '0 4px 24px 0 rgba(33,203,243,0.25)',
  border: `3px solid ${theme.palette.background.paper}`,
}));

// Beautiful button
const FancyButton = styled(Button)(({ theme }) => ({
  borderRadius: 32,
  fontWeight: 700,
  fontSize: 18,
  padding: theme.spacing(1.2, 4),
  background: 'linear-gradient(90deg, #1976d2 0%, #21cbf3 100%)',
  color: '#fff',
  boxShadow: '0 2px 8px 0 rgba(33,203,243,0.15)',
  transition: 'all 0.2s',
  '&:hover': {
    background: 'linear-gradient(90deg, #21cbf3 0%, #1976d2 100%)',
    boxShadow: '0 4px 16px 0 rgba(33,203,243,0.25)',
    transform: 'translateY(-2px) scale(1.03)',
  },
}));

// Input with focus effect
const FancyTextField = styled(TextField)(({ theme }) => ({
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 4px 0 rgba(33,203,243,0.07)',
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 500,
    '& fieldset': {
      borderColor: theme.palette.primary.light,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: '#21cbf3',
      borderWidth: 2,
    },
  },
}));

const FancyFormControl = styled(FormControl)(({ theme }) => ({
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 4px 0 rgba(33,203,243,0.07)',
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 500,
    '& fieldset': {
      borderColor: theme.palette.primary.light,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: '#21cbf3',
      borderWidth: 2,
    },
  },
}));

const FancyTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 17,
  color: theme.palette.primary.dark,
  background: 'rgba(33,203,243,0.07)',
  borderBottom: `2px solid ${theme.palette.primary.light}`,
}));

const FancyTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background 0.2s',
  '&:hover': {
    background: 'rgba(33,203,243,0.10)',
  },
}));

interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  sexo: string;
  userTypeId: number;
  usertype?: {
    name: string;
  };
}

interface UserType {
  id: number;
  name: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    sexo: '',
    userTypeId: '',
    password: '',
  });
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [initialLoading, setInitialLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (user?.userTypeId === 1) {
      fetchUsers();
      fetchUserTypes();
    } else {
      setInitialLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user');
      setUsers(Array.isArray(response) ? response : []);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao buscar usuários',
        severity: 'error'
      });
      setUsers([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchUserTypes = async () => {
    try {
      const response = await api.get('/usertypes');
      setUserTypes(Array.isArray(response) ? response : []);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao buscar tipos de usuário',
        severity: 'error'
      });
      setUserTypes([]);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        sexo: user.sexo,
        userTypeId: user.userTypeId.toString(),
        password: '',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        sexo: '',
        userTypeId: '',
        password: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedUser) {
        await api.put(`/user/${selectedUser.id}`, formData);
        setSnackbar({open: true, message: 'Usuário atualizado com sucesso!', severity: 'success'});
      } else {
        await api.post('/user', formData);
        setSnackbar({open: true, message: 'Usuário criado com sucesso!', severity: 'success'});
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao salvar usuário',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setLoading(true);
      try {
        await api.delete(`/user/${userId}`);
        setSnackbar({open: true, message: 'Usuário excluído com sucesso!', severity: 'success'});
        fetchUsers();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.message || 'Erro ao excluir usuário',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (initialLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} color="primary" />
      </Container>
    );
  }

  if (user?.userTypeId !== 1) {
    return (
      <Container>
        <Fade in>
          <Typography variant="h5" color="error" sx={{ mt: 8, textAlign: 'center' }}>
            Acesso não autorizado
          </Typography>
        </Fade>
      </Container>
    );
  }

  // Filtro de busca
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-management-bg">
      <div className="user-management-card">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <div className="user-management-title">Gestão de Usuários</div>
          <Button
            variant="contained"
            className="user-management-add-btn"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Usuário
          </Button>
        </Box>
        <TextField
          label="Buscar por nome ou email"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          fullWidth
          className="user-management-search user-management-input"
        />
        <div className="user-management-table-container">
          <Table className="user-management-table">
            <TableHead>
              <TableRow>
                <TableCell className="user-avatar-cell">Avatar</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell className="user-email-cell">Email</TableCell>
                <TableCell className="user-cpf-cell">CPF</TableCell>
                <TableCell className="user-phone-cell">Telefone</TableCell>
                <TableCell>Sexo</TableCell>
                <TableCell>Tipo de Usuário</TableCell>
                <TableCell className="user-actions-cell" align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={40} color="primary" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell className="user-avatar-cell">
                      <Avatar className="user-avatar-premium">{user.name[0]}</Avatar>
                    </TableCell>
                    <TableCell style={{ fontWeight: 600 }}>{user.name}</TableCell>
                    <TableCell className="user-email-cell">{user.email}</TableCell>
                    <TableCell className="user-cpf-cell">{user.cpf}</TableCell>
                    <TableCell className="user-phone-cell">{user.phone}</TableCell>
                    <TableCell>{user.sexo}</TableCell>
                    <TableCell>{user.usertype?.name || 'Sem tipo'}</TableCell>
                    <TableCell className="user-actions-cell" align="right">
                      <Tooltip title="Ver detalhes" arrow>
                        <IconButton color="info" onClick={() => handleOpenDetail(user)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar" arrow>
                        <IconButton color="primary" onClick={() => handleOpenDialog(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir" arrow>
                        <IconButton color="error" onClick={() => handleDelete(user.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ 
              borderTop: `1px solid rgba(0,0,0,0.05)`,
              '.MuiTablePagination-select': {
                borderRadius: '8px',
                padding: '4px 8px'
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                margin: 0
              }
            }}
          />
        </div>
      </div>
      {/* Modais */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
        className="user-management-modal"
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle className="user-management-modal-title">Detalhes do Usuário</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={2} alignItems="center" sx={{ mt: 2, mb: 2 }}>
              <Avatar className="user-management-modal-avatar">{selectedUser.name[0]}</Avatar>
              <Typography className="user-management-modal-content"><b>Nome:</b> {selectedUser.name}</Typography>
              <Typography className="user-management-modal-content"><b>Email:</b> {selectedUser.email}</Typography>
              <Typography className="user-management-modal-content"><b>CPF:</b> {selectedUser.cpf}</Typography>
              <Typography className="user-management-modal-content"><b>Telefone:</b> {selectedUser.phone}</Typography>
              <Typography className="user-management-modal-content"><b>Sexo:</b> {selectedUser.sexo}</Typography>
              <Typography className="user-management-modal-content"><b>Tipo de Usuário:</b> {selectedUser.usertype?.name || 'Sem tipo'}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions className="user-management-modal-actions">
          <Button onClick={handleCloseDetail} variant="contained" color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        className="user-management-modal user-management-modal-edit"
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle className="user-management-modal-title user-management-modal-edit user-management-modal-title">
          {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={1.2} alignItems="center" sx={{ mt: 0, mb: 0 }}>
              <Avatar className="user-management-modal-avatar">
                {selectedUser ? selectedUser.name[0] : (formData.name ? formData.name[0] : '?')}
              </Avatar>
              <TextField
                fullWidth
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
                className="user-management-input"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                className="user-management-input"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                margin="normal"
                required
                className="user-management-input"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
                required
                className="user-management-input"
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth margin="normal" className="user-management-select">
                <InputLabel shrink>Sexo</InputLabel>
                <Select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleInputChange}
                  required
                  label="Sexo"
                >
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Feminino</MenuItem>
                  <MenuItem value="O">Outro</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" className="user-management-select">
                <InputLabel shrink>Tipo de Usuário</InputLabel>
                <Select
                  name="userTypeId"
                  value={formData.userTypeId}
                  onChange={handleInputChange}
                  required
                  label="Tipo de Usuário"
                >
                  {userTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {!selectedUser && (
                <TextField
                  fullWidth
                  label="Senha"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  className="user-management-input"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions className="user-management-modal-actions">
            <Button onClick={handleCloseDialog} variant="outlined" color="primary">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedUser ? 'Salvar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ fontWeight: 600, fontSize: 16, borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserManagement; 