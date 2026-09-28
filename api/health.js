export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    database: 'Supabase',
    timestamp: new Date().toISOString(),
  });
}
