import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

class EmailSender {
  async send(to, subject, html) {
    try {
      const info = await transporter.sendMail({
        from: `"Gestão de Consultas" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
      console.log(`E-mail enviado: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      return false;
    }
  }
}

export default new EmailSender();