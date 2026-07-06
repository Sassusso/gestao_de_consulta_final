import authService from "../services/authService.js";

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }
      const result = await authService.login(email, password);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  
async forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório" });
    }
    await authService.forgotPassword(email);
    res.status(200).json({ message: "Enviaremos um link de recuperação para o seu e-mail." });
  } catch (error) {
    if (error.message.includes('Muitas tentativas')) {
      return res.status(429).json({ error: error.message });
    }
    next(error);
  }
}

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "erro ao definir nova senha" });
      }
      await authService.resetPassword(token, newPassword);
      res.status(200).json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      next(error);
    }
  }

}

export default new AuthController();