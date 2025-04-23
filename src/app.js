const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

// Middlewares
app.use(cors()); // Permite requisições de diferentes origens
app.use(bodyParser.json()); // Parseia o corpo das requisições como JSON

// Servir arquivos estáticos
app.use(express.static('public'));

// Rotas
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Documentação da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota padrão
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});