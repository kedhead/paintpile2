import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || '',
      }
    : undefined,
});

const EMAIL_FROM = process.env.EMAIL_FROM || 'Paintpile <noreply@thepaintpile.com>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP not configured, skipping email');
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    return info;
  } catch (err) {
    console.error('Email delivery failed:', err);
    return null;
  }
}

// Rate limiting: track last email time per user+type
const emailRateMap = new Map<string, number>();
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

export function isRateLimited(userId: string, notificationType: string): boolean {
  const key = `${userId}:${notificationType}`;
  const lastSent = emailRateMap.get(key);
  if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
    return true;
  }
  emailRateMap.set(key, Date.now());
  return false;
}
