// otpRoutes.js
import express from 'express';
import { sendOtpEmail } from './brevoService.js';

const router = express.Router();
const otpStore = {}; // Temporary in-memory store

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

  const sent = await sendOtpEmail(email, otp);
  if (sent) {
    res.json({ message: 'OTP sent successfully' });
  } else {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore[email];
  if (!stored) return res.status(400).json({ error: 'OTP expired or not found' });
  if (stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

  delete otpStore[email]; // OTP used
  res.json({ message: 'OTP verified successfully' });
});

export default router;