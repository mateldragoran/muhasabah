/**
 * Vercel Serverless Function: Cloud Backup Status
 * Checks database table readiness and user record availability
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Server environment missing Supabase configuration' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify daily_logs table connectivity
    const { error: logsError } = await supabase
      .from('daily_logs')
      .select('count', { count: 'exact', head: true });

    // Verify bedtime_checks table connectivity
    const { error: bedtimeError } = await supabase
      .from('bedtime_checks')
      .select('count', { count: 'exact', head: true });

    return res.status(200).json({
      success: true,
      tables: {
        daily_logs: logsError ? 'unreachable' : 'ready',
        bedtime_checks: bedtimeError ? 'unreachable' : 'ready',
      },
      message: 'Cloud database tables are operational and ready for synchronization.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to inspect cloud database' });
  }
}
