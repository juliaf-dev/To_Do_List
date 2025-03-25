const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); // Você criará depois

const app = express();
app.use(express.json());

// Rota de exemplo (substitua pelas suas rotas de tarefas)
app.get('/routes/tasks', (req, res) => {
  res.json([{ id: 1, title: "Primeira tarefa", completed: false }]);
});

// Configuração do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));