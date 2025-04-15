import { create } from 'zustand'
import { todoApi } from '../services/api'
import { auth } from '../firebase/config'

const STORAGE_KEY_PREFIX = 'todos_'

const getStoredTodos = (userId) => {
  try {
    console.log('Loading todos for user:', userId)
    const storedTodos = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`)
    if (!storedTodos) return []
    return JSON.parse(storedTodos)
  } catch (error) {
    console.error('Error loading todos from localStorage:', error)
    return []
  }
}

const saveTodosToStorage = (userId, todos) => {
  try {
    console.log('Saving todos for user:', userId)
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(todos))
  } catch (error) {
    console.error('Error saving todos to localStorage:', error)
  }
}

const getStoredCategories = () => {
  try {
    const storedCategories = localStorage.getItem('categories')
    return storedCategories ? JSON.parse(storedCategories) : [
      { id: 1, name: 'Personal', color: 'bg-blue-500' },
      { id: 2, name: 'Work', color: 'bg-amber-500' },
      { id: 3, name: 'Shopping', color: 'bg-purple-500' },
      { id: 4, name: 'Ideas', color: 'bg-pink-500' }
    ]
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return []
  }
}

const useStore = create((set, get) => ({
  todos: [],
  categories: getStoredCategories(),
  loading: false,
  error: null,

  // Helper function to get current user's todos
  getUserTodos: () => {
    const currentUserId = auth.currentUser?.uid
    if (!currentUserId) return []
    return get().todos.filter(todo => todo.userId === currentUserId)
  },

  initializeTodos: async () => {
    set({ loading: true, error: null })
    try {
      const currentUserId = auth.currentUser?.uid
      if (!currentUserId) {
        console.log('No user logged in')
        set({ todos: [] })
        return
      }

      // Load local todos for current user
      const localTodos = getStoredTodos(currentUserId)
      console.log('Loaded local todos:', localTodos)
      set({ todos: localTodos })

      // Then try to fetch from API
      const response = await fetch('https://dummyjson.com/todos')
      const data = await response.json()
      console.log('Loaded API todos:', data.todos)

      // Only merge API todos that belong to the current user
      const apiTodos = data.todos
        .filter(todo => todo.userId.toString() === currentUserId)
        .map(todo => ({
          ...todo,
          userId: todo.userId.toString()
        }))

      const mergedTodos = [...localTodos]
      apiTodos.forEach(apiTodo => {
        if (!mergedTodos.some(localTodo => localTodo.id === apiTodo.id)) {
          mergedTodos.push(apiTodo)
        }
      })

      console.log('Final merged todos for user:', mergedTodos)
      set({ todos: mergedTodos })
      saveTodosToStorage(currentUserId, mergedTodos)
    } catch (error) {
      console.error('Error initializing todos:', error)
      set({ error: 'Failed to load todos' })
    } finally {
      set({ loading: false })
    }
  },

  addTodo: async (newTodo) => {
    const currentUserId = auth.currentUser?.uid
    if (!currentUserId) {
      set({ error: 'Must be logged in to add todos' })
      return
    }

    try {
      const currentTodos = get().todos
      const todoWithUser = {
        ...newTodo,
        userId: currentUserId
      }

      // Update local state and storage
      const updatedTodos = [...currentTodos, todoWithUser]
      set({ todos: updatedTodos })
      saveTodosToStorage(currentUserId, updatedTodos)

      // Then try to sync with API
      try {
        const response = await fetch('https://dummyjson.com/todos/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            todo: todoWithUser.title,
            completed: false,
            userId: parseInt(currentUserId) || 1
          })
        })
        const data = await response.json()
        console.log('Todo added to API:', data)
      } catch (apiError) {
        console.error('Failed to sync todo with API:', apiError)
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      set({ error: 'Failed to add todo' })
    }
  },

  updateTodo: (id, updates) => {
    const currentUserId = auth.currentUser?.uid
    if (!currentUserId) return

    try {
      const currentTodos = get().todos
      const todoToUpdate = currentTodos.find(todo => todo.id === id)
      
      // Only update if the todo belongs to the current user
      if (todoToUpdate?.userId !== currentUserId) return

      const updatedTodos = currentTodos.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      )
      set({ todos: updatedTodos })
      saveTodosToStorage(currentUserId, updatedTodos)
    } catch (error) {
      console.error('Error updating todo:', error)
      set({ error: 'Failed to update todo' })
    }
  },

  deleteTodo: (id) => {
    const currentUserId = auth.currentUser?.uid
    if (!currentUserId) return

    try {
      const currentTodos = get().todos
      const todoToDelete = currentTodos.find(todo => todo.id === id)
      
      // Only delete if the todo belongs to the current user
      if (todoToDelete?.userId !== currentUserId) return

      const updatedTodos = currentTodos.filter(todo => todo.id !== id)
      set({ todos: updatedTodos })
      saveTodosToStorage(currentUserId, updatedTodos)
    } catch (error) {
      console.error('Error deleting todo:', error)
      set({ error: 'Failed to delete todo' })
    }
  },

  toggleTodo: (id) => {
    const currentUserId = auth.currentUser?.uid
    if (!currentUserId) return

    try {
      const currentTodos = get().todos
      const todoToToggle = currentTodos.find(todo => todo.id === id)
      
      // Only toggle if the todo belongs to the current user
      if (todoToToggle?.userId !== currentUserId) return

      const updatedTodos = currentTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
      set({ todos: updatedTodos })
      saveTodosToStorage(currentUserId, updatedTodos)
    } catch (error) {
      console.error('Error toggling todo:', error)
      set({ error: 'Failed to toggle todo' })
    }
  },

  // Category management
  addCategory: (newCategory) => {
    const updatedCategories = [...get().categories, newCategory]
    set({ categories: updatedCategories })
    localStorage.setItem('categories', JSON.stringify(updatedCategories))
  },

  updateCategory: (updatedCategory) => {
    const updatedCategories = get().categories.map(category =>
      category.id === updatedCategory.id ? updatedCategory : category
    )
    set({ categories: updatedCategories })
    localStorage.setItem('categories', JSON.stringify(updatedCategories))
  },

  deleteCategory: (id) => {
    const updatedCategories = get().categories.filter(category => category.id !== id)
    set({ categories: updatedCategories })
    localStorage.setItem('categories', JSON.stringify(updatedCategories))
  }
}))

export default useStore 