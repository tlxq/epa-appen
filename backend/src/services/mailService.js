import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = async ({ to, inviteLink }) => {
  await resend.emails.send({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Du är inbjuden till EPA-appen',
    html: `
      <h2>Välkommen!</h2>
      <p>Du har blivit inbjuden till EPA-appen.</p>
      <p>Klicka på länken nedan för att skapa ditt konto:</p>
      <a href="${inviteLink}">${inviteLink}</a>
      <p><small>Länken kan bara användas en gång.</small></p>
    `,
  });
};
