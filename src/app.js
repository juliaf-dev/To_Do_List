const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos corretamente para produção
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Documentação da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota para o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;