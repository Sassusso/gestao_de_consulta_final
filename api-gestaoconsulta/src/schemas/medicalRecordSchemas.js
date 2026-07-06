import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
    //id desnecessarior, remover quando terminar de criar o back
  appointmentId: z.string().regex(/^[0-9a-f]{24}$/, 'ID de consulta inválido'),
  diagnosis: z.string().min(3, 'Diagnóstico obrigatório'),
  prescription: z.string().optional(),
  requestedExams: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export const updateMedicalRecordSchema = z.object({
  diagnosis: z.string().min(3).optional(),
  prescription: z.string().optional(),
  requestedExams: z.string().optional(),
  medicalNotes: z.string().optional(),
});