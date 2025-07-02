"use server"

import nodemailer from 'nodemailer';

export async function sendContactEmail({ name, email, message }: { name: string; email: string; message: string }) {
  if (!name || !email || !message) {
    throw new Error('Missing fields');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `MediMeet Contact <${process.env.SMTP_USER}>`,
    to: 'abhisheksingh159084@gmail.com',
    subject: `Contact Form Submission from ${name}`,
    replyTo: email,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, '<br/>')}</p>`,
  });

  return { success: true };
}
