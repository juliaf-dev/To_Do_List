const admin = require('firebase-admin');
const serviceAccount = require('./firebase-keys.json');

// Inicialize o Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://SEU-PROJETO.firebaseio.com" // Substitua pela URL do seu projeto (encontre nas Configurações do Firebase)
});

// Conexão com o Firestore
const db = admin.firestore();

module.exports = db;