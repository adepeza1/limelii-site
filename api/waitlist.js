// Fresh API file for debugging
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

  // Test endpoint - return simple response first
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Waitlist API is working!' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    // Simple test - just log and return success
    console.log(`New waitlist signup: ${email}`);
    
    // TODO: Add email sending back after we confirm API works
    res.status(200).json({ 
      success: true, 
      message: 'API is working! Email functionality will be added back shortly.' 
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ 
      error: 'Failed to join waitlist. Please try again.' 
    });
  }
}
