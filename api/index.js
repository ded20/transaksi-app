// api/index.js - Simple test version

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version,X-User-Id');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.url === '/health' || req.url === '/api/health') {
    res.status(200).json({
      status: 'ok',
      database: 'Supabase',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(404).json({ error: 'Not found' });
}
