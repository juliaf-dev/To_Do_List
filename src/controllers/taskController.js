const taskService = require('../services/taskService');

// Controle de tarefas
const taskController = {
  // GET /api/tasks - Retorna todas as tarefas
  getAllTasks: (req, res) => {
    try {
      const tasks = taskService.getAllTasks();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // POST /api/tasks - Cria uma nova tarefa
  createTask: (req, res) => {
    try {
      const { title, description } = req.body;
      console.log(title, description);
      if (!title) {
        return res.status(400).json({ message: 'Título é obrigatório' });
      }
      
      const newTask = taskService.createTask(title, description);
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
      


  // GET /api/tasks/:id - Retorna uma tarefa pelo ID
  getTaskById: (req, res) => {
    try {
      const task = taskService.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // PUT /api/tasks/:id - Atualiza uma tarefa
  updateTask: (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, completed } = req.body;
      
      const updatedTask = taskService.updateTask(id, { title, description, completed });
      if (!updatedTask) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
      
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // DELETE /api/tasks/:id - Remove uma tarefa
  deleteTask: (req, res) => {
    try {
      const deleted = taskService.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
      res.status(200).json({ message: 'Tarefa removida com sucesso' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = taskController;