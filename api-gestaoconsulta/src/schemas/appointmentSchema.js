import { z } from 'zod';

export const createAppointmentSchema = z.object({
    //remover os ids depois
  patientId: z.string().regex(/^[0-9a-f]{24}$/, 'ID de paciente inválido'),
  doctorId: z.string().regex(/^[0-9a-f]{24}$/, 'ID de médico inválido'),
  dateTime: z.string().datetime({ offset: true }).transform(v => new Date(v)),
  reason: z.string().min(5, 'Motivo deve ter pelo menos 5 caracteres'),
  notes: z.string().optional(),
  type: z.enum(['PRIVATE', 'PLAN']),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED']).optional(),
  notes: z.string().optional(),
  dateTime: z.string().datetime().optional().transform(v => v ? new Date(v) : undefined),
});