const express = require('express');
const axios = require('axios');

const { google } = require('googleapis');
const language = require('@google-cloud/language');
const natural = require('natural');

require('dotenv').config();

const app = express();

const authClient = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  scopes: ['https://www.googleapis.com/auth/documents'],
});

const languageClient = new language.LanguageServiceClient({
  credentials: {
    client_email: process.env.GOOGLE_LANGUAGE_EMAIL,
    private_key: process.env.GOOGLE_LANGUAGE_KEY.replace(/\\n/gm, '\n'),
  },
});

const stemmer = natural.PorterStemmer;

app.get('/document/:id/:opt', async (req, res) => {
  try {
    const docs = google.docs({
      version: 'v1',
      auth: authClient,
    });

    const result = await docs.documents.get({
      documentId: req.params.id,
    });

    const document = result.data;
    const content = (document.body.content ?? []).map((c) => (c.paragraph?.elements ?? []).map((e) => e.textRun?.content ?? '').join('')).join('');

    let analysisResult;

    switch( req.params.opt ) {
      case '1':
        analysisResult = await languageClient.annotateText({
          document: {
            content: content,
            type: 'PLAIN_TEXT',
          },
          features: {
            extractEntities: true,
            extractDocumentSentiment: true,
          },
          encodingType: 'UTF8',
        });

        break;

      case '2':
        analysisResult = await languageClient.analyzeSentiment({
          document: {
            content,
            type: 'PLAIN_TEXT',
            language: 'pt',
          },
          encodingType: 'UTF8',
          enableEntitySentiment: true,
          enableEmotion: true
        });

        break;

      case '3':
        const tokenizer = natural.WordTokenizer();
        analysisResult = tokenizer.tokenize(document);

        break;

      case '4':
        const classifier = new natural.BayesClassifier();
        classifier.addDocument(content, 'Referências');
        classifier.train();

        analysisResult = classifier.classify(document);

        break;

      case '5':
        const openaiApiKey = process.env.OPENAI_API_KEY;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: content }],
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
        });

        analysisResult = response.data.choices[0].message.content;

        break;

      default: analysisResult = content;
    }

    res.send(analysisResult);
  } catch (err) {
    console.log(`Ocorreu um erro: ${err}`);
    res.status(500).send(err);
  }
});

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});
