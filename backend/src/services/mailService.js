import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY saknas i env!');
}
if (!process.env.MAIL_FROM) {
  throw new Error('MAIL_FROM saknas i env!');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = async ({ to, inviteLink }) => {
  try {
    const response = await resend.emails.send({
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
    // Logga lyckade utskick för debug/senare analys (valfritt)
    console.log(
      '✉️ Invite email sent to:',
      to,
      'response:',
      response?.id || response,
    );
  } catch (error) {
    console.error('❌ Misslyckades skicka invite-mail:', error);
    throw error; // Propagera felet, så /invite-route kan hantera/visa användaren!
  }
};
