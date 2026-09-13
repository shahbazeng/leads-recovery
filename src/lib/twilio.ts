import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const client = twilio(accountSid, authToken);

export async function sendTwilioSMS(to: string, body: string, from?: string) {
  try {
    const message = await client.messages.create({
      body,
      to,
      from: from || process.env.TWILIO_PHONE_NUMBER || '',
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('Error sending Twilio SMS:', error);
    return { success: false, error: error.message };
  }
}
