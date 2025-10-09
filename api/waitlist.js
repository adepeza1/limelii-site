// api/waitlist.js - Complete email functionality
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body.email;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    // Send notification to you (the owner)
    await resend.emails.send({
      from: 'waitlist@limelii.com', // We'll upgrade this to your domain later
      //to: process.env.OWNER_EMAIL,
      to: 'itslehcim@gmail.com',
      subject: '🎉 New limelii Waitlist Signup!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E85A7B;">New Waitlist Signup! 🎉</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
          <p style="color: #666;">This email was sent from your limelii waitlist form.</p>
        </div>
      `
    });

    // Send welcome email to the user
    await resend.emails.send({
      from: 'hello@limelii.com',
      to: email,
      subject: 'Welcome to limelii! 🌟',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #E85A7B; font-size: 2.5rem; margin-bottom: 10px;">limelii</h1>
            <h2 style="color: #333; font-weight: 300;">Thanks for joining our waitlist!</h2>
            
            <div style="background: linear-gradient(135deg, #E85A7B, #f0859e); padding: 30px; border-radius: 12px; margin: 30px 0; color: white;">
              <h3 style="margin: 0 0 15px 0;">You're in! 🎉</h3>
              <p style="margin: 0; opacity: 0.9;">You'll be among the first to experience where every adventure begins.</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              We're working hard to create something amazing. You'll get exclusive early access and updates as we get closer to launch.
            </p>
            
            <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">
              <p style="margin: 0; color: #888; font-size: 14px;">
                Follow us for updates and behind-the-scenes content!
              </p>
            </div>
            
            <p style="color: #E85A7B; font-weight: 500;">
              Best,<br>The limelii Team
            </p>
          </div>
        </div>
      `
    });

    console.log(`New waitlist signup: ${email}`);
    res.status(200).json({ 
      success: true, 
      message: 'Successfully joined waitlist!' 
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ 
      error: 'Failed to join waitlist. Please try again.' 
    });
  }
}
