import { useState } from 'react';
import { formatCPF, formatPhone, validateCPF, checkPasswordStrength } from '../utils/formUtils';
import { getUsers, createUser, updateUser, User, CreateUserData, UpdateUserData } from '../services/userServices';

export interface UserFormData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  sexo: string;
  userTypeId: string;
  password: string;
  confirmPassword: string;
}

export interface UserFormErrors {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  sexo?: string;
  userTypeId?: string;
  password?: string;
  confirmPassword?: string;
}

export interface UseUserFormReturn {
  formData: UserFormData;
  errors: UserFormErrors;
  loading: boolean;
  passwordStrength: any;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
  validateForm: (isEditing?: boolean, existingUsers?: User[], currentUserId?: number) => boolean;
  resetForm: () => void;
  submitForm: (isEditing?: boolean, userId?: number) => Promise<{ success: boolean; message: string }>;
}

const initialFormData: UserFormData = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  sexo: '',
  userTypeId: '',
  password: '',
  confirmPassword: '',
};

export const useUserForm = (): UseUserFormReturn => {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'cpf') {
      newValue = formatCPF(String(value));
    }

    if (name === 'phone') {
      newValue = formatPhone(String(value));
    }

    if (name === 'password') {
      const passwordCheck = checkPasswordStrength(String(value));
      setPasswordStrength(passwordCheck);
    }

    setFormData(prev => ({
      ...prev,
      [name as string]: newValue,
    }));
    setErrors((prev: any) => ({ ...prev, [name as string]: undefined }));
  };

  const validateForm = (isEditing = false, existingUsers: User[] = [], currentUserId?: number): boolean => {
    let tempErrors: UserFormErrors = {};

    // Validação do nome
    if (!formData.name.trim()) {
      tempErrors.name = "Nome é obrigatório";
    }

    // Validação do email
    if (!formData.email.trim()) {
      tempErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email inválido";
    } else {
      // Checar se email já existe em outro usuário
      const emailExists = existingUsers.some(u =>
        String(u.email).toLowerCase() === String(formData.email).toLowerCase() &&
        (!isEditing || u.id !== currentUserId)
      );
      if (emailExists) {
        tempErrors.email = 'Email já cadastrado';
      }
    }

    // Validação do CPF
    if (!formData.cpf.trim()) {
      tempErrors.cpf = "CPF é obrigatório";
    } else {
      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      if (!validateCPF(cpfLimpo)) {
        tempErrors.cpf = "CPF inválido";
      } else {
        // Verificar CPF duplicado
        const cpfExists = existingUsers.some(u =>
          String(u.cpf).replace(/\D/g, '') === cpfLimpo &&
          (!isEditing || u.id !== currentUserId)
        );
        if (cpfExists) {
          tempErrors.cpf = 'CPF já cadastrado';
        }
      }
    }

    // Validação do telefone
    if (!formData.phone.trim()) {
      tempErrors.phone = "Telefone é obrigatório";
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      tempErrors.phone = "Telefone inválido";
    }

    // Validação do gênero
    if (!formData.sexo) {
      tempErrors.sexo = "Gênero é obrigatório";
    }

    // Validação do tipo de usuário
    if (!formData.userTypeId) {
      tempErrors.userTypeId = "Tipo de usuário é obrigatório";
    }

    // Validação da senha (apenas para novos usuários ou quando senha é fornecida)
    if (!isEditing || (isEditing && formData.password)) {
      if (!formData.password) {
        tempErrors.password = "Senha é obrigatória";
      } else {
        const passwordCheck = checkPasswordStrength(formData.password);
        if (!passwordCheck.isStrong) {
          tempErrors.password = "A senha deve cumprir todos os requisitos de segurança";
        }
      }

      if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = "As senhas não coincidem";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setPasswordStrength(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const submitForm = async (isEditing = false, userId?: number): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const dataToSend: CreateUserData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf,
        phone: formData.phone,
        sexo: formData.sexo,
        userTypeId: formData.userTypeId,
        password: formData.password,
      };

      if (isEditing && userId) {
        await updateUser(userId, dataToSend);
        return { success: true, message: 'Usuário atualizado com sucesso!' };
      } else {
        await createUser(dataToSend);
        return { success: true, message: 'Usuário criado com sucesso!' };
      }
    } catch (error: any) {
      let errMsg = 'Erro ao salvar usuário';
      if (error?.response?.data) {
        errMsg = error.response.data.error || error.response.data.message || errMsg;
      } else if (error?.message) {
        errMsg = error.message;
      }
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    passwordStrength,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleInputChange,
    validateForm,
    resetForm,
    submitForm,
  };
};