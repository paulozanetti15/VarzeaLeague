import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, InputAdornment, IconButton } from '@mui/material';
import PasswordStrengthIndicator from '../../PasswordStrengthIndicator';
import { SEXO_OPTIONS, USER_TYPE_OPTIONS } from '../../../utils/userUtils';

interface UserFormProps {
  formData: any;
  formErrors: any;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordStrength: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUser: any;
  selectMenuProps: any;
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  formErrors,
  showPassword,
  showConfirmPassword,
  passwordStrength,
  handleInputChange,
  setShowPassword,
  setShowConfirmPassword,
  selectedUser,
  selectMenuProps
}) => (
  <Grid container spacing={3.5}>
    <Grid item xs={12} md={6}>
      <TextField
        margin="dense"
        label="Nome *"
        type="text"
        fullWidth
        variant="outlined"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        error={!!formErrors.name}
        helperText={formErrors.name}
        InputLabelProps={{ shrink: true }}
        className="user-management-fancy-text-field"
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        margin="dense"
        label="Email *"
        type="email"
        fullWidth
        variant="outlined"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        error={!!formErrors.email}
        helperText={formErrors.email}
        InputLabelProps={{ shrink: true }}
        className="user-management-fancy-text-field"
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        margin="dense"
        label="CPF *"
        type="text"
        fullWidth
        variant="outlined"
        name="cpf"
        value={formData.cpf}
        onChange={handleInputChange}
        error={!!formErrors.cpf}
        helperText={selectedUser ? 'CPF não pode ser alterado' : formErrors.cpf}
        InputLabelProps={{ shrink: true }}
        InputProps={{ readOnly: !!selectedUser }}
        className="user-management-fancy-text-field"
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        margin="dense"
        label="Telefone *"
        type="text"
        fullWidth
        variant="outlined"
        name="phone"
        value={formData.phone}
        onChange={handleInputChange}
        error={!!formErrors.phone}
        helperText={formErrors.phone}
        InputLabelProps={{ shrink: true }}
        className="user-management-fancy-text-field"
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <FormControl fullWidth margin="dense" error={!!formErrors.gender} className="user-management-fancy-form-control">
        <InputLabel id="gender-label" shrink>Gênero *</InputLabel>
        <Select
          labelId="gender-label"
          id="gender"
          name="gender"
          value={formData.gender}
          label="Gênero *"
          onChange={handleInputChange}
          MenuProps={selectMenuProps}
          className="user-management-select-white-bg"
        >
          {SEXO_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {formErrors.gender && <Typography color="error" fontSize={13}>{formErrors.gender}</Typography>}
      </FormControl>
    </Grid>
    <Grid item xs={12} md={6}>
      <FormControl fullWidth margin="dense" error={!!formErrors.userTypeId} className="user-management-fancy-form-control">
        <InputLabel id="userTypeId-label" shrink>Tipo de Usuário *</InputLabel>
        <Select
          labelId="userTypeId-label"
          id="userTypeId"
          name="userTypeId"
          value={formData.userTypeId}
          label="Tipo de Usuário *"
          onChange={handleInputChange}
          MenuProps={selectMenuProps}
          className="user-management-select-white-bg"
        >
          {USER_TYPE_OPTIONS.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </Select>
        {formErrors.userTypeId && <Typography color="error" fontSize={13}>{formErrors.userTypeId}</Typography>}
      </FormControl>
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        margin="dense"
        label="Senha *"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        variant="outlined"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        error={!!formErrors.password}
        helperText={formErrors.password}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <span className="material-icons">visibility_off</span> : <span className="material-icons">visibility</span>}
              </IconButton>
            </InputAdornment>
          ),
        }}
        className="user-management-fancy-text-field"
      />
      {formData.password && passwordStrength && (
        <PasswordStrengthIndicator passwordStrength={passwordStrength} />
      )}
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        margin="dense"
        label="Confirmar Senha *"
        type={showConfirmPassword ? 'text' : 'password'}
        fullWidth
        variant="outlined"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={!!formErrors.confirmPassword}
        helperText={formErrors.confirmPassword}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
              >
                {showConfirmPassword ? <span className="material-icons">visibility_off</span> : <span className="material-icons">visibility</span>}
              </IconButton>
            </InputAdornment>
          ),
        }}
        className="user-management-fancy-text-field"
      />
    </Grid>
  </Grid>
);

export default UserForm;
