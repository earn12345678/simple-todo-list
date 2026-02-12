// API endpoints
const API_BASE = '/api/todos';

// DOM elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');

// State
let todos = [];
let editingId = null;

// Fetch all todos
async function fetchTodos() {
    try {
        const response = await fetch(API_BASE);
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
        alert('Failed to load todos');
    }
}

// Add a new todo
async function addTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        alert('Please enter a todo');
        return;
    }
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        
        if (response.ok) {
            const newTodo = await response.json();
            todos.push(newTodo);
            todoInput.value = '';
            renderTodos();
        } else {
            alert('Failed to add todo');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Failed to add todo');
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
                renderTodos();
            }
        } else {
            alert('Failed to update todo');
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
        alert('Failed to update todo');
    }
}

// Delete a todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        } else {
            alert('Failed to delete todo');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo');
    }
}

// Start editing a todo
function startEdit(id) {
    editingId = id;
    renderTodos();
    const input = document.getElementById(`edit-input-${id}`);
    if (input) {
        input.focus();
    }
}

// Save edited todo
async function saveEdit(id) {
    const input = document.getElementById(`edit-input-${id}`);
    const newText = input.value.trim();
    
    if (!newText) {
        alert('Todo text cannot be empty');
        input.focus();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: newText }),
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
                editingId = null;
                renderTodos();
            }
        } else {
            alert('Failed to update todo');
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo');
    }
}

// Cancel editing
function cancelEdit() {
    editingId = null;
    renderTodos();
}

// Render todos to the DOM
function renderTodos() {
    if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No todos yet. Add one above!</div>';
    } else {
        todoList.innerHTML = todos.map(todo => {
            if (editingId === todo.id) {
                return `
                    <div class="todo-item editing">
                        <input 
                            type="checkbox" 
                            class="todo-checkbox" 
                            ${todo.completed ? 'checked' : ''} 
                            disabled
                        />
                        <input 
                            type="text" 
                            id="edit-input-${todo.id}" 
                            class="edit-input" 
                            value="${escapeHtml(todo.text)}"
                        />
                        <button class="save-btn" onclick="saveEdit(${todo.id})">Save</button>
                        <button class="cancel-btn" onclick="cancelEdit()">Cancel</button>
                    </div>
                `;
            } else {
                return `
                    <div class="todo-item ${todo.completed ? 'completed' : ''}">
                        <input 
                            type="checkbox" 
                            class="todo-checkbox" 
                            ${todo.completed ? 'checked' : ''} 
                            onchange="toggleTodo(${todo.id})"
                        />
                        <span class="todo-text">${escapeHtml(todo.text)}</span>
                        <button class="edit-btn" onclick="startEdit(${todo.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
                    </div>
                `;
            }
        }).join('');
    }
    
    updateStats();
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    totalCount.textContent = `Total: ${total}`;
    completedCount.textContent = `Completed: ${completed}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initialize
fetchTodos();
