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
      res.send(result.data);
    }
  );
});

app.get('/documents/:documentId/history', async (req, res) => {
  const { documentId } = req.params;

  try {
    const authClient = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
      scopes: ['https://www.googleapis.com/auth/documents'],
    });

    const docs = google.docs({
      version: 'v1',
      auth: authClient,
    });

    const response = await docs.documents.get({
      documentId,
      fields: 'documentId,revisions',
    });

    const { revisions } = response.data;
    res.send(revisions);
  } catch (err) {
    console.log(`Ocorreu um erro: ${err}`);
    res.status(500).send({ error: 'Não foi possível obter o histórico do documento.' });
  }
});

app.post('/document', (req, res) => {
  const docs = google.docs({
    version: 'v1',
    auth: authClient,
  });

  docs.documents.create(
    {
      title: req.body.title,
    },
    (err, result) => {
      if (err) {
        console.log(`Ocorreu um erro: ${err}`);
        res.status(500).send(err);
        return;
      }
      res.send(result.data);
    }
  );
});

app.put('/document/:id', (req, res) => {
  const docs = google.docs({
    version: 'v1',
    auth: authClient,
  });

  docs.documents.batchUpdate(
    {
      documentId: req.params.id,
      resource: {
        requests: [
          {
            insertText: {
              text: req.body.text,
              endOfSegmentLocation: {},
            },
          },
        ],
      },
    },
    (err, result) => {
      if (err) {
        console.log(`Ocorreu um erro: ${err}`);
        res.status(500).send(err);
        return;
      }
      res.send(result.data);
    }
  );
});

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});
