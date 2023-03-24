const fs = require('fs');

// Carrega o arquivo JSON da chave privada
const content = fs.readFileSync('./auth/private-key.json');
const privateKey = JSON.parse(content);

// Define as variáveis de ambiente necessárias para autenticar sua aplicação com o Google
process.env.GOOGLE_CLIENT_EMAIL = privateKey.client_email;
process.env.GOOGLE_PRIVATE_KEY = privateKey.private_key;