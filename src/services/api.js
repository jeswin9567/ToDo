const API_BASE_URL = 'https://dummyjson.com'

// Helper function to get a consistent numeric ID for DummyJSON API
const getDummyUserId = (firebaseUid) => {
  // Generate a number between 1-100 based on the firebase UID
  // This ensures the same Firebase user always gets the same dummy ID
  const hash = firebaseUid.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return Math.abs(hash % 100) + 1; // Returns 1-100
}

export const todoApi = {
  // Fetch all todos
  getAllTodos: async (userId) => {
    try {
      const dummyUserId = getDummyUserId(userId);
      const response = await fetch(`${API_BASE_URL}/todos`)
      const data = await response.json()
      // Filter todos by mapped userId before returning
      return data.todos.filter(todo => todo.userId === dummyUserId)
    } catch (error) {
      console.error('Error fetching todos:', error)
      throw error
    }
  },

  // Fetch a single todo
  getTodoById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching todo:', error)
      throw error
    }
  },

  // Add a new todo
  addTodo: async (todo) => {
    if (!todo.userId) {
      throw new Error('userId is required to add a todo')
    }

    try {
      const dummyUserId = getDummyUserId(todo.userId);
      const response = await fetch(`${API_BASE_URL}/todos/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todo: todo.title,
          completed: todo.completed,
          userId: dummyUserId, // Use mapped numeric ID
        }),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding todo:', error)
      throw error
    }
  },

  // Update a todo
  updateTodo: async (id, updates) => {
    if (!updates.userId) {
      throw new Error('userId is required to update a todo')
    }

    try {
      const dummyUserId = getDummyUserId(updates.userId);
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          userId: dummyUserId, // Use mapped numeric ID
        }),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  },

  // Delete a todo
  deleteTodo: async (id, userId) => {
    if (!userId) {
      throw new Error('userId is required to delete a todo')
    }

    try {
      const dummyUserId = getDummyUserId(userId);
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: dummyUserId }), // Use mapped numeric ID
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error deleting todo:', error)
      throw error
    }
  },
} 