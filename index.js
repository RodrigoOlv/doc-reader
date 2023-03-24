require('dotenv').config();
require('./config');

// Autentique sua aplicação com as credenciais de API do Google Docs
// Obtenha as credenciais no console do desenvolvedor do Google Cloud
// e insira-as como variáveis ​​de ambiente em seu ambiente de desenvolvimento

// Crie uma instância do cliente da API do Google Docs
const { google } = require('googleapis');

const authClient = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  scopes: ['https://www.googleapis.com/auth/documents'],
});

// Autorize o objeto authClient para obter um token de acesso
authClient.authorize((err, tokens) => {
  if (err) {
    console.log(`Ocorreu um erro: ${err}`);
    return;
  }
  
  const docs = google.docs({
    version: 'v1', 
    auth: authClient,
  });
  
  // Use o método 'documents.get' para acessar um documento existente
  docs.documents.get({
    documentId: '1p2GlhdxW6nmrihpyxWj0XCwgM1d4RVpBCr8rL_adEss', // Insira o ID do documento aqui
  }, (err, res) => {
    if (err) {
      console.log(`Ocorreu um erro: ${err}`);
      return;
    }
    console.log(`O conteúdo do documento é: ${res.data.body.content}`);
  });

  // Use o método 'documents.create' para criar um novo documento
  docs.documents.create({
    title: 'Meu novo documento', // Insira o título do documento aqui
  }, (err, res) => {
    if (err) {
      console.log(`Ocorreu um erro: ${err}`);
      return;
    }
    console.log(`O ID do novo documento é: ${res.data.documentId}`);
  });

  // Use o método 'documents.batchUpdate' para atualizar o conteúdo de um documento existente
  docs.documents.batchUpdate({
    documentId: '1p2GlhdxW6nmrihpyxWj0XCwgM1d4RVpBCr8rL_adEss', // Insira o ID do documento aqui
    resource: {
      requests: [
        {
          insertText: {
            text: 'Este é um novo parágrafo.',
            endOfSegmentLocation: {},
          },
        },
      ],
    },
  }, (err, res) => {
    if (err) {
      console.log(`Ocorreu um erro: ${err}`);
      return;
    }
    console.log(`O conteúdo do documento foi atualizado.`);
  });
});
