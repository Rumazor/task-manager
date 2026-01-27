import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Create transporter - in production, configure with real SMTP
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST') || 'smtp.ethereal.email',
      port: parseInt(this.configService.get('MAIL_PORT') || '587'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string, name?: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${token}`;

    const mailOptions = {
      from: this.configService.get('MAIL_FROM') || '"TaskFlow" <noreply@taskflow.com>',
      to: email,
      subject: 'Restablecer contraseña - TaskFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Restablecer Contraseña</h2>
          <p>Hola${name ? ` ${name}` : ''},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Restablecer Contraseña
          </a>
          <p style="color: #666; font-size: 14px;">Este enlace expirara en 1 hora.</p>
          <p style="color: #666; font-size: 14px;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px;">TaskFlow - Gestion de Tareas</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // In development, log the reset URL
      console.log('Password reset URL:', resetUrl);
    }
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('MAIL_FROM') || '"TaskFlow" <noreply@taskflow.com>',
      to: email,
      subject: 'Bienvenido a TaskFlow!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Bienvenido a TaskFlow!</h2>
          <p>Hola${name ? ` ${name}` : ''},</p>
          <p>Gracias por registrarte en TaskFlow. Estamos emocionados de tenerte con nosotros.</p>
          <p>Con TaskFlow podras:</p>
          <ul>
            <li>Crear y organizar tareas</li>
            <li>Establecer prioridades y fechas limite</li>
            <li>Colaborar con tu equipo</li>
            <li>Visualizar tu progreso con estadisticas</li>
          </ul>
          <p>Comienza a organizar tus tareas hoy!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px;">TaskFlow - Gestion de Tareas</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  async sendNotificationEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get('MAIL_FROM') || '"TaskFlow" <noreply@taskflow.com>',
      to: email,
      subject: `${subject} - TaskFlow`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">${subject}</h2>
          <p>${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px;">TaskFlow - Gestion de Tareas</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  }
}
