require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function test() {
  const transport = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: {
      user: 'resend',
      pass: process.env.RESEND_API_KEY
    }
  });

  try {
    const info = await transport.sendMail({
      from: '"Arquitectura Digital" <onboarding@resend.dev>',
      to: 'servingbuilderapp@gmail.com',
      subject: 'Prueba de Sistema Arquitectura Digital',
      text: 'El sistema de correos ha sido configurado correctamente y está funcional.'
    });
    console.log('Email enviado:', info.messageId);
  } catch (error) {
    console.error('Error enviando email:', error);
  }
}
test();
