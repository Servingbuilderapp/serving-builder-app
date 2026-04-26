require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function test() {
  const transport = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: {
      user: 'resend',
      pass: 're_TyuFcseT_9nsf7m67J8Uh4mEGSTF8d9MS'
    }
  });

  try {
    const info = await transport.sendMail({
      from: '"ECOSERVING" <onboarding@resend.dev>',
      to: 'servingbuilderapp@gmail.com',
      subject: 'Prueba de Sistema ECOSERVING',
      text: 'El sistema de correos ha sido configurado correctamente y está funcional.'
    });
    console.log('Email enviado:', info.messageId);
  } catch (error) {
    console.error('Error enviando email:', error);
  }
}
test();
