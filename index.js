const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();

const authClient = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  scopes: ['https://www.googleapis.com/auth/documents'],
});

app.get('/document/:id', (req, res) => {
  const docs = google.docs({
    version: 'v1',
    auth: authClient,
  });

  docs.documents.get(
    {
      documentId: req.params.id,
    },
    (err, result) => {
      if (err) {
        console.log(`Ocorreu um erro: ${err}`);
        res.status(500).send(err);
        return;
      }
      
      const document = result.data;
      const content = (document.body.content ?? []).map((c) => (c.paragraph?.elements ?? []).map((e) => e.textRun?.content ?? '').join('')).join('');

      res.send(content);
    }
  );
});

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});
