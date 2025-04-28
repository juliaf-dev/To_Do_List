// Variáveis globais
let currentToken = null;
const API_BASE_URL = window.location.origin; // Usa a origem atual do site

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
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro no login');
        }

        const data = await response.json();
        currentToken = data.token;
        localStorage.setItem('taskManagerToken', currentToken);
        toggleAuthSections();
        loadTasks();
    } catch (error) {
        console.error('Erro no login:', error);
        alert(error.message || 'Erro ao fazer login');
    }
}

async function handleLogout() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao fazer logout');
        }

        currentToken = null;
        localStorage.removeItem('taskManagerToken');
        toggleAuthSections();
    } catch (error) {
        console.error('Erro no logout:', error);
        alert('Erro ao fazer logout');
    }
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar tarefas');
        }

        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        alert(error.message || 'Erro ao carregar tarefas');
    }
}

function renderTasks(tasks) {
    tasksList.innerHTML = '';
    
    if (!tasks || tasks.length === 0) {
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
        const response = await fetch(`${API_BASE_URL}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ title, description })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar tarefa');
        }

        document.getElementById('task-form').reset();
        loadTasks();
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        alert(error.message || 'Erro ao criar tarefa');
    }
}

async function handleEditTask(e) {
    const taskId = e.target.getAttribute('data-id');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar tarefa');
        }

        const task = await response.json();
        
        document.getElementById('edit-task-id').value = task.id;
        document.getElementById('edit-task-title').value = task.title;
        document.getElementById('edit-task-description').value = task.description || '';
        document.getElementById('edit-task-completed').checked = task.completed;
        
        editTaskModal.show();
    } catch (error) {
        console.error('Erro ao editar tarefa:', error);
        alert(error.message || 'Erro ao carregar tarefa');
    }
}

async function handleSaveTask() {
    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value;
    const description = document.getElementById('edit-task-description').value;
    const completed = document.getElementById('edit-task-completed').checked;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ title, description, completed })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar tarefa');
        }

        editTaskModal.hide();
        loadTasks();
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        alert(error.message || 'Erro ao atualizar tarefa');
    }
}

async function handleDeleteTask(e) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    const taskId = e.target.getAttribute('data-id');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao excluir tarefa');
        }

        loadTasks();
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        alert(error.message || 'Erro ao excluir tarefa');
    }
}

async function handleToggleTask(e) {
    const taskId = e.target.getAttribute('data-id');
    
    try {
        // Primeiro obtém a tarefa atual
        const getResponse = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('Falha ao carregar tarefa');
        }
        
        const task = await getResponse.json();
        
        // Atualiza o status
        const putResponse = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                title: task.title,
                description: task.description,
                completed: !task.completed
            })
        });
        
        if (!putResponse.ok) {
            throw new Error('Falha ao atualizar tarefa');
        }
        
        loadTasks();
    } catch (error) {
        console.error('Erro ao alternar tarefa:', error);
        alert(error.message || 'Erro ao atualizar tarefa');
    }
}