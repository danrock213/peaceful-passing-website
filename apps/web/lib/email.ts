// /lib/email.ts

export async function sendEmail(to: string, subject: string, body: string) {
  // TODO: Replace with your real email sending code,
  // e.g., using Nodemailer, SendGrid, Resend, etc.
  console.log(`Sending email to ${to} with subject "${subject}"`);
  console.log(body);
}
