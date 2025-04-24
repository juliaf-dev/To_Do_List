// Simulando um "banco de dados" em memória
let tasks = [
    { id: '1', title: 'Estudar Node.js', description: 'Aprender sobre middlewares', completed: false },
    { id: '2', title: 'Fazer compras', description: 'Comprar leite e ovos', completed: true }
  ];
  
    // Operações com tarefas

  const taskService = {
    // Retorna todas as tarefas
    getAllTasks: () => {
      return tasks;
    },
  
   // Cria uma nova tarefa
  createTask: (title, description) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    
    return newTask;
  },
  
    // Busca uma tarefa pelo ID
    getTaskById: (id) => {
      return tasks.find(task => task.id === id);
    },
  
    // Atualiza uma tarefa existente
    updateTask: (id, updates) => {
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) return null;
      
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      return tasks[taskIndex];
    },
  
    // Remove uma tarefa
    deleteTask: (id) => {
      const initialLength = tasks.length;
      tasks = tasks.filter(task => task.id !== id);
      return initialLength !== tasks.length;
    }
  };
  
  module.exports = taskService;