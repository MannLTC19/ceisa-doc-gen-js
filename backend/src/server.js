import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local backend env file first, then fallback to default .env.
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const anthropicBaseUrl = 'https://api.anthropic.com';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/anthropic/v1/messages', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: {
        message: 'ANTHROPIC_API_KEY is not set on backend environment.',
      },
    });
  }

  try {
    const upstreamResponse = await fetch(`${anthropicBaseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const responseText = await upstreamResponse.text();
    res.status(upstreamResponse.status);

    try {
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch {
      return res.send(responseText);
    }
  } catch (error) {
    return res.status(502).json({
      error: {
        message: 'Failed to reach Anthropic API from backend.',
        detail: error instanceof Error ? error.message : String(error),
      },
    });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
