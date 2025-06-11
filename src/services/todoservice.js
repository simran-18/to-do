import axios from 'axios';

const API_BASE_URL = 'https://dummyjson.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoService = {
  // Get all todos
  getTodos: async ({page = 0, limit = 30}) => {
    try {
      let skipped=(page-1)*limit;
      const response = await api.get(`/todos?skip=${skipped}&limit=${limit}`);
      return response.data.todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },

  // Get single todo
  getTodo: async (id) => {
    try {
      const response = await api.get(`/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw error;
    }
  },

  // Create new todo
  createTodo: async (todo) => {
    try {
      const response = await api.post('/todos/add', todo);
      return response.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  // Update todo
  updateTodo: async (id, updates) => {
    try {
      const response = await api.put(`/todos/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  // Delete todo
  deleteTodo: async (id) => {
    try {
      const response = await api.delete(`/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  // Get todos by user
  getTodosByUser: async (userId) => {
    try {
      const response = await api.get(`/todos/user/${userId}`);
      return response.data.todos;
    } catch (error) {
      console.error('Error fetching user todos:', error);
      throw error;
    }
  },
};