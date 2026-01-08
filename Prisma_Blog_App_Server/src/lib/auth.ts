import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.TRUSTED_ORIGINS!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "active",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log({ user, url, token }, request);

      const verificationUrl = `${process.env.BETTER_AUTH_URL}/verify-email?token=${token}`;

      await transporter.sendMail({
        from: '"Prisma Blog" <yourgmail@gmail.com>', // must be the same Gmail you use in SMTP
        to: "iktushar01@gmail.com",
        subject: "Verify your email address",
        text: `Welcome to Prisma Blog!

Please verify your email by visiting the link below:
${verificationUrl}

If you did not create this account, you can safely ignore this email.`,
        html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Welcome to Prisma Blog 👋</h2>
      <p>Thanks for signing up. Please verify your email address to activate your account.</p>
      <p style="margin: 24px 0;">
        <a href="${verificationUrl}"
           style="background:#000;color:#fff;padding:12px 18px;
                  text-decoration:none;border-radius:4px;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <hr />
      <p style="font-size:12px;color:#666;">
        If you didn’t create an account, you can safely ignore this email.
      </p>
    </div>
  `,
      });

      console.log("Message sent:", info.messageId);
    },
  },
});
