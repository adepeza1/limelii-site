// api/waitlist.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Create token with email data
    const tokenData = {
      email: normalizedEmail,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };
    
    // Encode token
    const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64url');
    const verificationLink = `${process.env.BASE_URL || 'https://limelii.com'}/api/verify?token=${encodedToken}`;
    
    console.log('📧 Sending verification email to:', normalizedEmail);
    
    // Send verification email
    await resend.emails.send({
      from: 'hello@limelii.com',
      to: normalizedEmail,
      subject: 'Confirm your limelii waitlist signup 🌟',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial; text-align: center; padding: 40px; background: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px;">
            <h1 style="color: #FF9A56; margin-bottom: 20px;">Confirm Your Email</h1>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              Thanks for signing up for the limelii waitlist! Click the button below to confirm:
            </p>
            <a href="${verificationLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #FF9A56, #ff6877); color: white; 
                      padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 20px 0;">
              Confirm My Email
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This link expires in 24 hours
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('✅ Verification email sent successfully');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Please check your email to confirm your signup!' 
    });
    
  } catch (error) {
    console.error('❌ Waitlist error:', error);
    return res.status(500).json({ 
      error: 'Failed to send verification email. Please try again.' 
    });
  }
}
