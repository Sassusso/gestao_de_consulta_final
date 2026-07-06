import userRepository from "../repositories/userRepository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import emailSender from "../utils/emailSender.js";
import rateLimiter from "../utils/rateLimiter.js";
class AuthService {
    
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas");
    }

    if (user.status !== 'ACTIVE') {
      throw new Error("Conta inativa. Contacte o administrador.");
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } 
    );

    // Retornar token e dados do usuário
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async forgotPassword(email) {

    if (!rateLimiter.canAttempt(email)) {
      throw new Error('Muitas tentativas. Aguarde 10 minutos.');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await emailSender.send(
      user.email,
      "Recuperação de senha",
      `
        <p>Olá ${user.name},</p>
        <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para definir uma nova senha:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este link é válido por 15 minutos.</p>
        <p>Se não foi você, ignore este e‑mail.</p>
      `
    );
  }

  async resetPassword(token, newPassword) {
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Token inválido ou expirado");
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user.id, { password: hashedPassword });
  }

}

export default new AuthService();