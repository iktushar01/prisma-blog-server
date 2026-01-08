import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || process.env.APP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.APP_PASSWORD,
  },
});

// Email templates
const emailTemplates = {
  verification: (data: { user: any; verificationUrl: string; appName?: string }) => {
    const appName = data.appName || "Prisma Blog";
    return {
      subject: `Verify your email for ${appName}`,
      text: `Welcome to ${appName}!

Please verify your email by visiting the link below:
${data.verificationUrl}

This link will expire in 24 hours.

If you did not create this account, you can safely ignore this email.`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px 20px; 
            text-align: center;
        }
        .content { 
            padding: 30px; 
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        .footer { 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            font-size: 14px;
            border-top: 1px solid #eee;
        }
        .code-block {
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 12px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
        }
        .expiry-notice {
            background: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to ${appName}! 👋</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thanks for signing up! Please verify your email address to activate your account and get started.</p>
            
            <div style="text-align: center;">
                <a href="${data.verificationUrl}" class="button">
                    Verify Email Address
                </a>
            </div>
            
            <div class="expiry-notice">
                <strong>⚠️ This link expires in 24 hours</strong>
                <p>For security reasons, this verification link will expire after 24 hours.</p>
            </div>
            
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
            <div class="code-block">
                ${data.verificationUrl}
            </div>
            
            <p>If you didn't create an account with ${appName}, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p>This email was sent to ${data.user.email}</p>
        </div>
    </div>
</body>
</html>
      `,
    };
  },

  // Optional: Add more templates for other emails
  welcome: (data: { user: any; appName?: string }) => {
    const appName = data.appName || "Prisma Blog";
    return {
      subject: `Welcome to ${appName}!`,
      text: `Welcome to ${appName}, ${data.user.name || data.user.email}!

Your account has been successfully verified and is now active.

Get started by logging in to your account.

If you have any questions, please contact our support team.`,
      html: `...`, // Similar HTML template for welcome email
    };
  },

  // Optional: Password reset template
  resetPassword: (data: { user: any; resetUrl: string; appName?: string }) => {
    const appName = data.appName || "Prisma Blog";
    return {
      subject: `Reset your ${appName} password`,
      text: `We received a request to reset your password for ${appName}.

Click the link below to reset your password:
${data.resetUrl}

If you didn't request a password reset, please ignore this email.`,
      html: `...`, // Similar HTML template for password reset
    };
  },
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: process.env.TRUSTED_ORIGINS ? 
    process.env.TRUSTED_ORIGINS.split(",") : 
    ["http://localhost:3000"],
  
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
    sentOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const appName = process.env.APP_NAME || "Prisma Blog";
      const verificationUrl = `${process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
      
      const template = emailTemplates.verification({
        user,
        verificationUrl,
        appName,
      });

      try {
        const info = await transporter.sendMail({
          from: `"${appName}" <${process.env.SMTP_FROM || process.env.APP_USER}>`,
          to: user.email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        });

        console.log(`Verification email sent to ${user.email}:`, info.messageId);
        
        // Optional: You can log email sending for analytics
        await prisma.emailLog.create({
          data: {
            type: 'VERIFICATION',
            to: user.email,
            userId: user.id,
            sentAt: new Date(),
            messageId: info.messageId,
          },
        });

      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error; // Re-throw so Better Auth knows email sending failed
      }
    },
    
    // Optional: Add email verification settings
    expiresIn: 60 * 60 * 24, // 24 hours in seconds
  },

  // Optional: Add password reset configuration
  passwordReset: {
    enabled: true,
    sendResetEmail: async ({ user, url, token }, request) => {
      // Similar implementation for password reset emails
      const appName = process.env.APP_NAME || "Prisma Blog";
      const resetUrl = `${process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
      
      const template = emailTemplates.resetPassword({
        user,
        resetUrl,
        appName,
      });

      await transporter.sendMail({
        from: `"${appName}" <${process.env.SMTP_FROM || process.env.APP_USER}>`,
        to: user.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    },
  },
  socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});

// Optional: Helper function to test email configuration
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
}