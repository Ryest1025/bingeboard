import twilio from 'twilio';

export class SmsService {
  private client: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.warn('⚠️  Twilio credentials not configured. SMS functionality will be disabled.');
      return;
    }
    
    this.client = twilio(accountSid, authToken);
  }

  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.client) {
      console.error('❌ Twilio client not initialized');
      return false;
    }

    try {
      // Ensure phone number is in E.164 format
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const message = await this.client.messages.create({
        body: `Your BingeBoard password reset code is: ${code}. This code expires in 15 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });

      console.log(`✅ SMS sent successfully to ${formattedPhone}. SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      return false;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 1 and has 11 digits (US/Canada), keep as is
    if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
      return `+${digitsOnly}`;
    }
    
    // If it has 10 digits, assume US/Canada and add +1
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    }
    
    // For other formats, assume it already includes country code
    return `+${digitsOnly}`;
  }

  isConfigured(): boolean {
    return !!this.client;
  }
}
