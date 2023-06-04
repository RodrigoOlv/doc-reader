const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');

require('dotenv').config();

const app = express();

// Configuração do cliente de autenticação do Google Docs
const authClient = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  scopes: ['https://www.googleapis.com/auth/documents'],
});

async function sendMessageToChatGPT(message) {
  try {
    const apiUrl = 'https://api.openai.com/v1/completions';
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await axios.post(apiUrl, {
      model: 'text-davinci-003',
      prompt: `Faça um resumo deste texto: ${message}`,
      temperature: 0.5,
      max_tokens: 40000,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return response.data.choices[0].text;
  } catch (error) {
    console.log('Erro ao enviar a mensagem para o ChatGPT:', error);
    throw error;
  }
}

app.get('/document/:id/', async (req, res) => {
  try {
    const docs = google.docs({
      version: 'v1',
      auth: authClient,
    });

    // Passa o ID do documento para o método da biblioteca
    const result = await docs.documents.get({
      documentId: req.params.id,
    });

    // Trata o retorno do Google API para isolar o conteúdo do texto
    const document = result.data;
    const content = (document.body.content ?? []).map((c) => (c.paragraph?.elements ?? []).map((e) => e.textRun?.content ?? '').join('')).join('');

    // Envia o conteúdo para o ChatGPT usando a API do OpenAI
    const reply = await sendMessageToChatGPT(content);

    // Inclui o resultado no objeto de resposta
    const responseObj = {
      generatedText: reply,
    };

    res.send(responseObj);
  } catch (err) {
    console.log(`Ocorreu um erro: ${err}`);
    res.status(500).send(err);
  }
});

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});
