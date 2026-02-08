import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const fromEmail = process.env.EMAIL_FROM || "noreply@example.com";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: html,
        },
        Text: {
          Data: text,
        },
      },
    },
  });

  try {
    await ses.send(command);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    // In development/sandbox, we might want to log the details even if it fails
    if (process.env.NODE_ENV === "development") {
      console.log("Development mode: Email details", { to, subject, html, text });
    }
    throw error;
  }
}

export async function sendMagicLinkEmail(email: string, url: string) {
  const subject = "Your Magic Link";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Sign in to Year-Make-Model</h2>
      <p>Click the button below to sign in to your account. This link will expire in 15 minutes.</p>
      <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Sign In</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this URL into your browser: <br /> ${url}</p>
    </div>
  `;
  const text = `Sign in to Year-Make-Model: ${url}`;

  return sendEmail({ to: email, subject, html, text });
}

export async function sendVerificationEmail(email: string, url: string) {
  const subject = "Verify your email";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email</h2>
      <p>Click the button below to verify your email address.</p>
      <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
      <hr />
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this URL into your browser: <br /> ${url}</p>
    </div>
  `;
  const text = `Verify your email: ${url}`;

  return sendEmail({ to: email, subject, html, text });
}

export async function sendPasswordResetEmail(email: string, url: string) {
  const subject = "Reset your password";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>Click the button below to reset your password.</p>
      <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this URL into your browser: <br /> ${url}</p>
    </div>
  `;
  const text = `Reset your password: ${url}`;

  return sendEmail({ to: email, subject, html, text });
}
