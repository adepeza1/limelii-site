// api/verify.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Track verified emails (in-memory)
const verifiedEmails = new Set();

export default async function handler(req, res) {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: #f4f4f4; margin: 0; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; }
          h1 { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Invalid Link</h1>
          <p>This verification link is invalid.</p>
          <p><a href="https://limelii.com" style="color: #FF9A56;">Return to limelii.com</a></p>
        </div>
      </body>
      </html>
    `);
  }
  
  try {
    // Decode token
    const tokenDataString = Buffer.from(token, 'base64url').toString('utf-8');
    const tokenData = JSON.parse(tokenDataString);
    
    const { email, expiresAt } = tokenData;
    
    // Check if expired
    if (Date.now() > expiresAt) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f4f4f4; margin: 0; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; }
            h1 { color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⏰ Link Expired</h1>
            <p>This verification link has expired. Please sign up again.</p>
            <p><a href="https://limelii.com" style="color: #FF9A56;">Return to limelii.com</a></p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Check if already verified
    if (verifiedEmails.has(email)) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f4f4f4; margin: 0; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; }
            h1 { color: #22c55e; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Already Verified</h1>
            <p>Your email has already been confirmed!</p>
            <p><a href="https://limelii.com" style="color: #FF9A56;">Return to limelii.com</a></p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Mark as verified
    verifiedEmails.add(email);
    
    console.log(`✅ Email verified: ${email}`);
    
    // Send notification to owner
    await resend.emails.send({
      from: 'waitlist@limelii.com',
      to: process.env.OWNER_EMAIL,
      subject: '🎉 New limelii Waitlist Signup! (Verified)',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF9A56;">New Verified Waitlist Signup! 🎉</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Status:</strong> ✅ VERIFIED</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    });
    
    // Send welcome email
    await resend.emails.send({
      from: 'hello@limelii.com',
      to: email,
      subject: 'Welcome to limelii! 🌟',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #FF9A56; font-size: 2.5rem;">limelii</h1>
            <h2 style="color: #333; font-weight: 300;">Thanks for joining our waitlist!</h2>
            
            <div style="background: linear-gradient(135deg, #FF9A56, #ff6877); padding: 30px; border-radius: 12px; margin: 30px 0; color: white;">
              <h3 style="margin: 0 0 15px 0;">You're in! 🎉</h3>
              <p style="margin: 0; opacity: 0.9;">You'll be among the first to experience where every adventure begins.</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              We're working hard to create something amazing. You'll get exclusive early access and updates as we get closer to launch.
            </p>
            
            <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">
              <p style="margin: 0; color: #888; font-size: 14px;">Follow us for updates!</p>
              <p style="margin: 10px 0 0 0;">
                <a href="https://instagram.com/getlimelii" style="color: #FF9A56; margin: 0 10px;">Instagram</a>
                <a href="https://twitter.com/getlimelii" style="color: #FF9A56; margin: 0 10px;">Twitter</a>
                <a href="https://tiktok.com/@getlimelii" style="color: #FF9A56; margin: 0 10px;">TikTok</a>
              </p>
            </div>
            
            <p style="color: #FF9A56; font-weight: 500;">
              Best,<br>The limelii Team
            </p>
          </div>
        </div>
      `
    });
    
    // Show success page
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial; 
            text-align: center; 
            padding: 50px 20px; 
            background: linear-gradient(135deg, #FFE1E7, #F8E8FF); 
            margin: 0;
          }
          .container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white; 
            padding: 50px 30px; 
            border-radius: 20px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          h1 { color: #FF9A56; font-size: 2.5rem; margin: 0 0 20px 0; }
          p { color: #4A5568; line-height: 1.6; }
          .btn { 
            display: inline-block; 
            background: linear-gradient(135deg, #FF9A56, #ff6877); 
            color: white; 
            padding: 15px 40px; 
            text-decoration: none; 
            border-radius: 50px; 
            margin-top: 30px;
            font-weight: 600;
          }
          .emoji { font-size: 3rem; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">🎉</div>
          <h1>You're Verified!</h1>
          <p>Thank you for confirming your email. You're now on the limelii waitlist!</p>
          <p>Check your inbox for a welcome email.</p>
          <a href="https://limelii.com" class="btn">Visit limelii.com</a>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>❌ Invalid Link</h1>
        <p>This verification link is invalid or malformed.</p>
        <p><a href="https://limelii.com" style="color: #FF9A56;">Return to limelii.com</a></p>
      </body>
      </html>
    `);
  }
}
