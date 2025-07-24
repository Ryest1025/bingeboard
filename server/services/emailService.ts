import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!emailUser || !emailPass) {
      if (isDevelopment) {
        console.warn('⚠️  Email service using DEVELOPMENT MODE (console logging)');
        this.isConfigured = true; // Allow development mode
        return;
      } else {
        console.warn('⚠️  Email service not configured (EMAIL_USER and EMAIL_PASS environment variables not set)');
        this.isConfigured = false;
        return;
      }
    }

    try {
      // Configure for Gmail (can be changed to other providers)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass // App password, not regular password
        }
      });
      this.isConfigured = true;
      console.log('✅ Email service configured successfully');
    } catch (error) {
      console.error('❌ Failed to configure email service:', error);
      this.isConfigured = false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, isCode: boolean = false): Promise<boolean> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    // Development mode: Log to console instead of sending email
    if (isDevelopment && !this.transporter) {
      console.log('\n🔗 PASSWORD RESET EMAIL (DEVELOPMENT MODE)');
      console.log('═══════════════════════════════════════════');
      console.log(`📧 To: ${email}`);
      console.log(`🔑 Reset Token: ${resetToken}`);
      console.log(`🌐 Reset URL: ${resetUrl}`);
      console.log('═══════════════════════════════════════════');
      console.log('💡 Click this link to reset password:', resetUrl);
      console.log('═══════════════════════════════════════════\n');
      return true;
    }

    if (!this.isConfigured || !this.transporter) {
      console.error('❌ Email service not configured - cannot send email');
      return false;
    }

    try {
      const fromName = process.env.EMAIL_FROM_NAME || 'BingeBoard';
      const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
      const replyTo = process.env.EMAIL_FROM_ADDRESS || 'support@joinbingeboard.com';
      
      const mailOptions = {
        from: `"${fromName}" <${process.env.EMAIL_USER}>`, // Display name with Gmail address
        replyTo: replyTo, // Reply address
        to: email,
        subject: 'BingeBoard Password Reset',
        html: isCode ? this.getCodeTemplate(resetToken) : this.getLinkTemplate(resetUrl)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  isEmailConfigured(): boolean {
    return this.isConfigured;
  }

  private getLinkTemplate(resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0f766e, #1e40af); padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
            <span style="color: #ffffff;">Binge</span><span style="color: #06b6d4;">Board</span>
          </h1>
          <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #06b6d4; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
          
          <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0f766e, #1e40af); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <div style="background-color: #1e293b; padding: 20px 30px; border-top: 1px solid #334155;">
          <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
            © 2025 BingeBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  private getCodeTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0f766e, #1e40af); padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
            <span style="color: #ffffff;">Binge</span><span style="color: #06b6d4;">Board</span>
          </h1>
          <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 16px;">Password Reset Code</p>
        </div>
        
        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="color: #06b6d4; margin: 0 0 20px 0; font-size: 24px;">Your Reset Code</h2>
          
          <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 30px;">
            Enter this code in the app to reset your password:
          </p>
          
          <div style="background-color: #1e293b; border: 2px solid #0f766e; border-radius: 12px; padding: 30px; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; color: #06b6d4; letter-spacing: 8px; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            If you didn't request this password reset, you can safely ignore this email.
          </p>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            This code will expire in 15 minutes for security reasons.
          </p>
        </div>
        
        <div style="background-color: #1e293b; padding: 20px 30px; border-top: 1px solid #334155;">
          <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
            © 2025 BingeBoard. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }
}
