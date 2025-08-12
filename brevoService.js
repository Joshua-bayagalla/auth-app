// brevoService.js
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const transEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export async function sendOtpEmail(toEmail, otp) {
  const emailData = {
    to: [{ email: toEmail }],
    sender: { name: 'Car Rental App', email: process.env.EMAIL_USER },
    subject: 'Your OTP Code',
    htmlContent: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
  };

  try {
    const result = await transEmailApi.sendTransacEmail(emailData);
    console.log('OTP email sent:', result);
    return true;
  } catch (error) {
    console.error('Brevo send error:', error);
    return false;
  }
}