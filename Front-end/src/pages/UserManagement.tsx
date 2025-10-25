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
  InputAdornment,
  Table,
  TableBody,
  TableCell,
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
  Slide,
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { getUsers, createUser, updateUser, deleteUser, User as UserService } from '../services/userServices';
import { useUserForm } from '../hooks/useUserForm';
import { useUserSearch } from '../hooks/useUserSearch';
import { useUserManagement } from '../hooks/useUserManagement';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import UserForm from '../components/features/user/UserForm';
import UserDetailDialog from '../components/features/user/UserDetailDialog';
import ConfirmDeleteDialog from '../components/features/user/ConfirmDeleteDialog';
import { validateCPF, checkPasswordStrength } from '../utils/formUtils';
import { SEXO_OPTIONS, USER_TYPE_OPTIONS, userTypeLabel, getSelectMenuProps, sexoValue } from '../utils/userUtils';
import './UserManagement.css';

// Transition helper to pass direction without typing errors
const TransitionUp = React.forwardRef(function TransitionUp(
  props: any,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// (Removed unused FancyTableCell and FancyTableRow)

interface User extends UserService {}



const UserManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { user } = useAuth();
  const theme = useTheme();
  const { users, loading, initialLoading, fetchUsers, deleteUserById } = useUserManagement();
  const { filteredUsers } = useUserSearch(users, search);
  const {
    formData,
    errors: formErrors,
    loading: formLoading,
    passwordStrength,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleInputChange,
    validateForm,
    resetForm,
    submitForm,
  } = useUserForm();

  // MenuProps to force white background for Select dropdowns (overrides global CSS)
  const selectMenuProps = getSelectMenuProps(theme);

  useEffect(() => {
    if (user?.userTypeId === 1) {
      fetchUsers();
    } else {
      // Note: initialLoading is handled by useUserManagement hook
    }
  }, [user]);

  // Removed fetchUserTypes (no longer used)

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      // Set form data for editing
      handleInputChange({ target: { name: 'name', value: user.name } } as any);
      handleInputChange({ target: { name: 'email', value: user.email } } as any);
      handleInputChange({ target: { name: 'cpf', value: user.cpf } } as any);
      handleInputChange({ target: { name: 'phone', value: user.phone } } as any);
      handleInputChange({ target: { name: 'sexo', value: sexoValue(user.sexo) } } as any);
      handleInputChange({ target: { name: 'userTypeId', value: user.userTypeId.toString() } } as any);
      handleInputChange({ target: { name: 'password', value: '' } } as any);
      handleInputChange({ target: { name: 'confirmPassword', value: '' } } as any);
    } else {
      setSelectedUser(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedUser(null);
  };





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(!!selectedUser, users, selectedUser?.id)) {
      return;
    }
    const result = await submitForm(!!selectedUser, selectedUser?.id);
    if (result.success) {
      setSnackbar({open: true, message: result.message, severity: 'success'});
      fetchUsers();
      handleCloseDialog();
    } else {
      setSnackbar({
        open: true,
        message: result.message,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (userId: number) => {
    setUserToDeleteId(userId);
  setDeleteError(null);
  setOpenDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (userToDeleteId === null) return;

    try {
      await deleteUserById(userToDeleteId);
      setSnackbar({open: true, message: 'Usuário excluído com sucesso!', severity: 'success'});
      // success: close modal and clear
      setOpenDeleteConfirm(false);
      setUserToDeleteId(null);
      setDeleteError(null);
    } catch (error: any) {
      // show snackbar and also show inside modal
      setSnackbar({ open: true, message: error.message, severity: 'error' });
      setDeleteError(error.message);
    }
  };

  const handleCloseDeleteConfirm = () => {
  setOpenDeleteConfirm(false);
  setUserToDeleteId(null);
  setDeleteError(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (initialLoading) {
    return (
      <Container className="user-management-loading-container">
        <CircularProgress size={60} thickness={4} color="primary" />
      </Container>
    );
  }

  if (user?.userTypeId !== 1) {
    return (
      <Container>
        <Fade in>
          <Typography variant="h5" color="error" className="user-management-access-denied-title">
            Acesso não autorizado
          </Typography>
        </Fade>
      </Container>
    );
  }



  return (
    <div className="user-management-bg">
      <div className="user-management-card">
        <Box className="user-management-header-box">
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
          className="user-management-search user-management-input user-management-fancy-text-field"
          placeholder="Buscar por nome ou email"
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
                filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell className="user-avatar-cell">
                      <Avatar className="user-avatar-premium">{u.name[0]}</Avatar>
                    </TableCell>
                    <TableCell className="user-management-user-name">{u.name}</TableCell>
                    <TableCell className="user-email-cell">{u.email}</TableCell>
                    <TableCell className="user-cpf-cell">{u.cpf}</TableCell>
                    <TableCell className="user-phone-cell">{u.phone}</TableCell>
                    <TableCell>{u.sexo}</TableCell>
                    <TableCell>{userTypeLabel(u.userTypeId)}</TableCell>
                    <TableCell className="user-actions-cell" align="right">
                      <Tooltip title="Ver detalhes" arrow>
                        <IconButton color="info" onClick={() => handleOpenDetail(u)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar" arrow>
                        <IconButton color="primary" onClick={() => handleOpenDialog(u)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {/* Não mostrar botão de excluir para o próprio usuário logado */}
                      {u.id !== user?.id && (
                        <Tooltip title="Excluir" arrow>
                          <IconButton color="error" onClick={() => handleDelete(u.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`}
            className="user-management-table-pagination"
          />
        </div>
      </div>
      {/* Modais */}
      <UserDetailDialog open={openDetail} onClose={handleCloseDetail} user={selectedUser} />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        TransitionComponent={TransitionUp}
        transitionDuration={400}
        className="user-management-custom-dialog"
      >
        <DialogTitle className="user-management-create-dialog-title">
          <Box className="user-management-create-dialog-avatar-box">
            <Avatar className="user-management-styled-avatar">
              {selectedUser ? selectedUser.name[0] : <AddIcon fontSize="large" />}
            </Avatar>
          </Box>
          <Typography 
            variant="h4" 
            component="div" 
            fontWeight={800} 
            className="user-management-create-dialog-main-title"
          >
            {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
          </Typography>
          <Typography 
            variant="body1" 
            className="user-management-create-dialog-subtitle"
          >
            {selectedUser ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo usuário'}
          </Typography>
        </DialogTitle>
        <DialogContent className="user-management-create-dialog-content">
          <form onSubmit={handleSubmit}>
            <UserForm
              formData={formData}
              formErrors={formErrors}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              passwordStrength={passwordStrength}
              handleInputChange={handleInputChange}
              setShowPassword={setShowPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              selectedUser={selectedUser}
              selectMenuProps={selectMenuProps}
            />
            <DialogActions className="user-management-create-dialog-actions">
              <Button 
                onClick={handleCloseDialog} 
                variant="outlined" 
                color="primary"
                className="user-management-create-dialog-cancel-btn"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                className="user-management-create-dialog-submit-btn"
              >
                {selectedUser ? 'Atualizar' : 'Criar Usuário'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDeleteDialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={confirmDelete}
        error={deleteError}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} className="user-management-snackbar-alert">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserManagement; 