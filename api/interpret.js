module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const KEY = process.env.ANTHROPIC_API_KEY;
    const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

    if (!KEY) {
      return res.status(500).json({ error: 'Anthropic API key is missing' });
    }

    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const { prompt } = body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'x-api-key': KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Anthropic API error'
      });
    }

    return res.status(200).json({
      text: data.content?.[0]?.text || ''
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};