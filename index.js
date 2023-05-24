const express = require('express');

const { google } = require('googleapis');
const language = require('@google-cloud/language');

require('dotenv').config();

const app = express();

// token de autenticação do google docs
const authClient = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  scopes: ['https://www.googleapis.com/auth/documents'],
});

// token de autenticação do google language
const languageClient = new language.LanguageServiceClient({
  credentials: {
    client_email: process.env.GOOGLE_LANGUAGE_EMAIL,
    private_key: process.env.GOOGLE_LANGUAGE_KEY.replace(/\\n/gm, '\n'),
  },
});


app.get('/document/:id/', async (req, res) => {
  try {
    const docs = google.docs({
      version: 'v1',
      auth: authClient,
    });

    // passa o id do documento para o método da biblioteca
    const result = await docs.documents.get({
      documentId: req.params.id,
    });

    // trata o retorno do googleapi para isolar o conteúdo do texto
    const document = result.data;
    const content = (document.body.content ?? []).map((c) => (c.paragraph?.elements ?? []).map((e) => e.textRun?.content ?? '').join('')).join('');

    // passa o conteúdo do texto para o método de análise de sentimento do google language
    const analysisResult = await languageClient.analyzeSentiment({
      document: {
        content,
        type: 'PLAIN_TEXT',
        language: 'pt',
      },
      encodingType: 'UTF8',
      enableEntitySentiment: true,
      enableEmotion: true
    });

    res.send(analysisResult);

  } catch (err) {
    console.log(`Ocorreu um erro: ${err}`);
    res.status(500).send(err);
  }
});

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});
