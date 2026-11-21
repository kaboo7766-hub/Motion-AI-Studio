// Optional Vercel Serverless Proxy to avoid browser CORS & protect your API key
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { provider, endpoint, image_url, prompt, duration } = req.body || {};
    const apiKey = process.env.FAL_KEY || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!apiKey) return res.status(401).json({ error: 'Missing API Key' });

    const targetUrl = endpoint || 'https://fal.run/fal-ai/kling-video/v1.6/standard/image-to-video';
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': provider === 'replicate' ? `Bearer ${apiKey}` : `Key ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        image_url,
        duration: String(Number(duration) <= 5 ? 5 : 10)
      })
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server proxy error' });
  }
}
