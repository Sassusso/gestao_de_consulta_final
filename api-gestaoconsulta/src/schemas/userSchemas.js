import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).default('PATIENT'),
  // Campos para paciente 
  dateOfBirth: z.string().optional()
    .transform(v => v ? new Date(v) : undefined)
    .refine(date => !date || date < new Date(), {
      message: 'Data de nascimento deve ser no passado'
    }),
  sex: z.enum(['M', 'F']).optional(),
  address: z.string().optional(),
  emergencyPhone: z.string().optional(),
  // Campos para médico
  specialtyId: z.string().regex(/^[0-9a-f]{24}$/).optional(),
  medicalLicense: z.string().optional(),
}).refine(data => {
  if (data.role === 'DOCTOR') {
    return data.specialtyId && data.medicalLicense;
  }
  return true;
}, {
  message: 'Especialidade e licença médica são obrigatórios para médicos'
});

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});