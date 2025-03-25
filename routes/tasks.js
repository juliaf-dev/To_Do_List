const express = require('express');
const router = express.Router();

let tasks = []; // Simulando um "banco de dados"

// Criar tarefa
router.post('/', (req, res) => {
  const task = req.body;
  tasks.push(task);
  res.status(201).send(task);
});

module.exports = router;