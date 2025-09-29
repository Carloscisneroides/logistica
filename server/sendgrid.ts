/*
 * YCore SaaS Ecosystem - SendGrid Email Service
 * Copyright © 2025 YCore SRL Innovativa - All Rights Reserved
 * 
 * WATERMARK: ycore-email-d7e8f9a0-1b2c-3d4e-5f6a-7b8c9d0e1f2a
 * MODULE: SendGrid Email Notifications
 */

import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email notifications disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[EMAIL] DISABLED - Would send: ${params.subject} to ${params.to}`);
    return true; // Return true for development without API key
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html,
    });
    
    console.log(`[EMAIL] SUCCESS | To: ${params.to} | Subject: ${params.subject}`);
    return true;
  } catch (error: any) {
    console.error(`[EMAIL] ERROR | To: ${params.to} | Error: ${error.message}`);
    return false;
  }
}

// **NOTIFICA ADMIN NUOVA REGISTRAZIONE**
export async function sendRegistrationNotification(
  adminEmail: string,
  registrationData: {
    username: string;
    email: string;
    companyName?: string;
    businessType?: string;
    message?: string;
    ipAddress?: string;
  }
): Promise<boolean> {
  const subject = `🔔 YCore - Nuova richiesta registrazione: ${registrationData.username}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #003366; color: white; padding: 20px; text-align: center;">
        <h1>🔔 YCore - Nuova Richiesta Registrazione</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #003366;">Dettagli del Richiedente</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Username:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${registrationData.username}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${registrationData.email}</td>
          </tr>
          ${registrationData.companyName ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Azienda:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${registrationData.companyName}</td>
          </tr>` : ''}
          ${registrationData.businessType ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Tipo Business:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${registrationData.businessType}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">IP Address:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${registrationData.ipAddress || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Data Richiesta:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date().toLocaleString('it-IT')}</td>
          </tr>
        </table>

        ${registrationData.message ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #003366;">Messaggio del richiedente:</h3>
          <div style="background: white; padding: 15px; border-left: 4px solid #C8B560; margin: 10px 0;">
            ${registrationData.message}
          </div>
        </div>` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666; margin-bottom: 20px;">
            Accedi al pannello admin per approvare o rifiutare questa richiesta
          </p>
          <a href="https://your-domain.replit.app/admin/registrations" 
             style="background: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Gestisci Richieste
          </a>
        </div>
      </div>
      
      <div style="background: #2C2C2C; color: #999; padding: 15px; text-align: center; font-size: 12px;">
        © 2025 YCore SRL Innovativa - Sistema Automatico di Notifiche
        <br>Questa email è stata generata automaticamente dal sistema YCore.
      </div>
    </div>
  `;

  const text = `
YCore - Nuova Richiesta Registrazione

Username: ${registrationData.username}
Email: ${registrationData.email}
${registrationData.companyName ? `Azienda: ${registrationData.companyName}` : ''}
${registrationData.businessType ? `Business: ${registrationData.businessType}` : ''}
IP: ${registrationData.ipAddress || 'N/A'}
Data: ${new Date().toLocaleString('it-IT')}

${registrationData.message ? `Messaggio: ${registrationData.message}` : ''}

Accedi al pannello admin per gestire questa richiesta.
  `;

  return await sendEmail({
    to: adminEmail,
    from: 'noreply@ycore.it', // Personalizza con il tuo dominio
    subject,
    text,
    html
  });
}