const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const db = require('./firebaseConfig');
const app = express();

// Middlewares
app.use(express.json());

// Rotas
app.post('/routes/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "O título é obrigatório" });
    }

    const taskRef = await db.collection('tasks').add({
      title,
      description: description || "", // Descrição opcional
      completed: false,
      createdAt: new Date()
    });

    res.status(201).json({ 
      id: taskRef.id,
      message: "Tarefa criada com sucesso" 
    });
  } catch (err) {
    console.error("Erro ao criar tarefa:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.get('/routes/tasks', async (req, res) => {
  try {
    const tasksSnapshot = await db.collection('tasks').get();
    const tasks = [];
    
    tasksSnapshot.forEach(doc => {
      tasks.push({ 
        id: doc.id, 
        ...doc.data() 
      });
    });

    res.json(tasks);
  } catch (err) {
    console.error("Erro ao buscar tarefas:", err);
    res.status(500).json({ error: "Erro ao carregar tarefas" });
  }
});

// Rota DELETE com tratamento de erro
app.delete('/routes/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const taskRef = db.collection('tasks').doc(taskId);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    await taskRef.delete();
    res.status(200).json({ message: "Tarefa deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar tarefa:", err);
    res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}//routes/tasks`);
  console.log(`Documentação disponível em http://localhost:${PORT}/api-docs`);
});