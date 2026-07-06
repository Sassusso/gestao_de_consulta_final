import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    // Validar e substituir req.body pelos dados parseados
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Formatar os erros
      const errors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ errors });
    }
    next(error);
  }
};