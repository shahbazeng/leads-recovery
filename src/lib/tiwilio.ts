import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendTwilioSMS(toPhone: string, fromPhone: string, messageBody: string) {
  try {
    const message = await client.messages.create({
      body: messageBody,
      from: fromPhone || process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('Twilio SMS Error:', error.message);
    return { success: false, error: error.message };
  }
}