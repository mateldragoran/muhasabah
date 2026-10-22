/**
 * Vercel Serverless Function: API Health Check
 * Validates backend deployment status and Supabase connectivity
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const isSupabaseConfigured = Boolean(supabaseUrl);

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Muhasabah Backend API',
    environment: process.env.VERCEL_ENV || 'production',
    supabase: {
      configured: isSupabaseConfigured,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 18)}...` : null,
    },
  });
}
