import express from 'express';

// Speaks just enough of the OpenAI chat-completions response shape for
// @ai-sdk/openai's parser to accept it. This is what "add a third
// provider" actually means in practice: any backend that returns this
// shape at /v1/chat/completions works with the OpenAI adapter, real or not.
const app = express();
app.use(express.json());

app.post('/v1/chat/completions', (req, res) => {
  res.json({
    id: 'fake-completion-1',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: req.body.model,
    choices: [{
      index: 0,
      message: { role: 'assistant', content: 'FAKE_PROVIDER_RESPONSE: hello from the fake provider' },
      finish_reason: 'stop',
    }],
    usage: { prompt_tokens: 5, completion_tokens: 8, total_tokens: 13 },
  });
});

const port = process.env.FAKE_PORT || 4000;
app.listen(port, () => console.log(`Fake provider on :${port}`));