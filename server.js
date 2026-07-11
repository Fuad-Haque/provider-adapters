import express from 'express';
import { generateText } from 'ai';
import { resolveModel } from './provider.js';

const app = express();
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  let model;
  try {
    model = resolveModel();
  } catch (err) {
    // Provider misconfiguration is a 500, not a crash — the server stays
    // up so you can see the error and fix the env var without restarting.
    return res.status(500).json({ error: err.message });
  }

  try {
    const result = await generateText({ model, prompt });
    res.json({
      provider: process.env.MODEL_PROVIDER,
      text: result.text,
      usage: result.usage,
    });
  } catch (err) {
    res.status(502).json({ error: `Provider call failed: ${err.message}` });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server on :${port}, provider=${process.env.MODEL_PROVIDER || '(unset)'}`);
});