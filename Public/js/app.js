// Variáveis globais
let currentToken = null;

// Elementos do DOM
const loginSection = document.getElementById('login-section');
const tasksSection = document.getElementById('tasks-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks-list');
const editTaskModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
const saveTaskBtn = document.getElementById('save-task-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Verifica se já está logado (token no localStorage)
  const token = localStorage.getItem('taskManagerToken');
  if (token) {
    currentToken = token;
    toggleAuthSections();
    loadTasks();
  }
});

loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
taskForm.addEventListener('submit', handleAddTask);
saveTaskBtn.addEventListener('click', handleSaveTask);

// Funções
function toggleAuthSections() {
  loginSection.classList.toggle('d-none', currentToken !== null);
  tasksSection.classList.toggle('d-none', currentToken === null);
}

async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      currentToken = data.token;
      localStorage.setItem('taskManagerToken', currentToken);
      toggleAuthSections();
      loadTasks();
    } else {
      alert(data.message || 'Erro no login');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao fazer login');
  }
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': currentToken
      }
    });
    
    currentToken = null;
    localStorage.removeItem('taskManagerToken');
    toggleAuthSections();
  } catch (error) {
    console.error('Erro:', error);
  }
}

async function loadTasks() {
  try {
    const response = await fetch('/api/tasks', {
      headers: {
        'Authorization': currentToken
      }
    });
    
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error);
  }
}

function renderTasks(tasks) {
  tasksList.innerHTML = '';
  
  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="list-group-item text-muted">Nenhuma tarefa encontrada</div>';
    return;
  }
  
  tasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = `list-group-item list-group-item-action ${task.completed ? 'completed-task' : ''}`;
    taskElement.innerHTML = `
      <div class="d-flex w-100 justify-content-between align-items-center">
        <div class="form-check form-check-inline flex-grow-1">
          <input class="form-check-input toggle-btn" type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
          <div class="ms-2 task-content">
            <h5 class="mb-1 task-title">${task.title}</h5>
           
            <div class="task-description">${task.description || ''}</div>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-link text-primary edit-btn" data-id="${task.id}" title="Editar">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="btn btn-link text-danger delete-btn" data-id="${task.id}" title="Excluir">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;
    
    tasksList.appendChild(taskElement);
  });
  
  // Adiciona event listeners aos botões dinâmicos
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', handleEditTask);
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteTask);
  });
  
  document.querySelectorAll('.toggle-btn').forEach(checkbox => {
    checkbox.addEventListener('change', handleToggleTask);
  });
}

async function handleAddTask(e) {
  e.preventDefault();
  
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': currentToken
      },
      body: JSON.stringify({ title, description })
    });
    
    if (response.ok) {
      document.getElementById('task-form').reset();
      loadTasks();
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao criar tarefa');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao criar tarefa');
  }
}

async function handleEditTask(e) {
  const taskId = e.target.getAttribute('data-id');
  
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      headers: {
        'Authorization': currentToken
      }
    });
    
    if (response.ok) {
      const task = await response.json();
      
      // Preenche o modal com os dados da tarefa
      document.getElementById('edit-task-id').value = task.id;
      document.getElementById('edit-task-title').value = task.title;
      document.getElementById('edit-task-description').value = task.description || '';
      document.getElementById('edit-task-completed').checked = task.completed;
      
      editTaskModal.show();
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao carregar tarefa');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao carregar tarefa');
  }
}

async function handleSaveTask() {
  const taskId = document.getElementById('edit-task-id').value;
  const title = document.getElementById('edit-task-title').value;
  const description = document.getElementById('edit-task-description').value;
  const completed = document.getElementById('edit-task-completed').checked;
  
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': currentToken
      },
      body: JSON.stringify({ title, description, completed })
    });
    
    if (response.ok) {
      editTaskModal.hide();
      loadTasks();
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao atualizar tarefa');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao atualizar tarefa');
  }
}

async function handleDeleteTask(e) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
  
  const taskId = e.target.getAttribute('data-id');
  
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': currentToken
      }
    });
    
    if (response.ok) {
      loadTasks();
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao excluir tarefa');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao excluir tarefa');
  }
}
async function handleToggleTask(e) {
    const taskId = e.target.getAttribute('data-id');
    
    try {
      // Primeiro obtemos a tarefa atual de forma mais segura
      const getResponse = await fetch(`/api/tasks/${taskId}`, {
        headers: {
          'Authorization': currentToken
        }
      });
      
      if (!getResponse.ok) {
        throw new Error('Erro ao carregar tarefa');
      }
      
      const task = await getResponse.json();
      
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }
  
      // Depois atualizamos apenas o status de completed
      const putResponse = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentToken
        },
        body: JSON.stringify({ 
          title: task.title,
          description: task.description,
          completed: !task.completed 
        })
      });
      
      if (!putResponse.ok) {
        throw new Error('Erro ao atualizar tarefa');
      }
  
      // Recarrega a lista de tarefas
      loadTasks();
      
    } catch (error) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao atualizar tarefa');
    }
  }