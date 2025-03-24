import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey", // No SendGrid, o usuário é sempre "apikey"
    pass: process.env.SENDGRID_API_KEY, // Sua chave de API do SendGrid
  },
});



export const sendPasswordResetEmail = async (email: string, resetToken: string) => {

  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recuperação de Senha - Várzea League',
    html: `
      <div style="font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 0 auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
  <h2 style="color: #2c3e50;">Recuperação de Senha</h2>
  <p>Você solicitou a recuperação de senha da sua conta na Várzea League.</p>
  <p>Clique no botão abaixo para redefinir sua senha:</p>
  <div style="text-align: center; display: flex; justify-content: center;">
    <a href="${resetLink}"
       style="background-color: #3498db;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;">
      Redefinir Senha
    </a>
  </div>
  <p style="color: #666;">Se você não solicitou a recuperação de senha, ignore este email.</p>
  <p style="color: #666;">Este link expirará em 1 hora.</p>
  <hr style="border: 1px solid #eee; margin: 30px 0;" />
  <p style="color: #666; font-size: 12px;">
    Este é um email automático, por favor não responda.
  </p>
</div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}; 