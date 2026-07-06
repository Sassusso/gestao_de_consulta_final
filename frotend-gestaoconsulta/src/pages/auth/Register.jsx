import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, User, Mail, Phone, Calendar, MapPin, PhoneCall, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// shadcn/ui components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

// Schema de validação Zod
const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a senha'),
  dateOfBirth: z.string().optional(),
  sex: z.enum(['M', 'F']).optional(),
  address: z.string().optional(),
  emergencyPhone: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      sex: '',
      address: '',
      emergencyPhone: '',
    },
  });

  const onSubmit = async (data) => {
    // Remove confirmPassword antes de enviar
    const payload = { ...data };
    delete payload.confirmPassword;
    payload.role = 'PATIENT';

    try {
      await api.post('/users', payload);
      toast.success('Conta criada com sucesso! Faça login.');
      navigate('/login');
    } catch (err) {
      console.error('Erro detalhado:', err.response?.data);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Erro ao criar conta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Criar Conta</CardTitle>
          <CardDescription className="text-gray-500">
            Preencha os dados abaixo para se registar
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome completo *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    className="pl-9"
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mail *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-9"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="+244 999 999 999"
                    className="pl-9"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-1">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                  Data de Nascimento
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="pl-9"
                    {...register('dateOfBirth')}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Sexo */}
              <div className="space-y-1">
                <Label htmlFor="sex" className="text-sm font-medium text-gray-700">
                  Sexo
                </Label>
                <select
                  id="sex"
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  {...register('sex')}
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
                {errors.sex && (
                  <p className="text-sm text-red-500">{errors.sex.message}</p>
                )}
              </div>

              {/* Endereço */}
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Endereço
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro, cidade"
                    className="pl-9"
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>

              {/* Contacto de Emergência */}
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="emergencyPhone" className="text-sm font-medium text-gray-700">
                  Contacto de Emergência
                </Label>
                <div className="relative">
                  <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="emergencyPhone"
                    placeholder="+244 999 999 999"
                    className="pl-9"
                    {...register('emergencyPhone')}
                  />
                </div>
                {errors.emergencyPhone && (
                  <p className="text-sm text-red-500">{errors.emergencyPhone.message}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-9 pr-9"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Senha *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme a senha"
                    className="pl-9 pr-9"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A criar conta...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-gray-600">
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};