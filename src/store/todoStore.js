import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const todoStore = create(
  persist(
    (set, get) => ({
      todos: [],
      categories: [
        { id: 1, name: 'Personal', color: 'bg-pink-500' },
        { id: 2, name: 'Work', color: 'bg-blue-500' },
        { id: 3, name: 'Shopping', color: 'bg-amber-500' },
        { id: 4, name: 'Ideas', color: 'bg-purple-500' }
      ],
      
      addTodo: async (todo) => {
        try {
          // API call to add todo
          const response = await fetch('https://dummyjson.com/todos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(todo)
          })
          const data = await response.json()
          
          // Update local state regardless of API response
          set((state) => ({
            todos: [...state.todos, { ...todo, id: data.id || Date.now() }]
          }))
        } catch (error) {
          console.error('Failed to add todo:', error)
          // Still update local state even if API fails
          set((state) => ({
            todos: [...state.todos, todo]
          }))
        }
      },

      updateTodo: async (updatedTodo) => {
        try {
          // API call to update todo
          await fetch(`https://dummyjson.com/todos/${updatedTodo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTodo)
          })

          // Update local state
          set((state) => ({
            todos: state.todos.map(todo =>
              todo.id === updatedTodo.id ? updatedTodo : todo
            )
          }))
        } catch (error) {
          console.error('Failed to update todo:', error)
          // Still update local state even if API fails
          set((state) => ({
            todos: state.todos.map(todo =>
              todo.id === updatedTodo.id ? updatedTodo : todo
            )
          }))
        }
      },

      toggleTodo: async (id) => {
        try {
          const state = get()
          const todo = state.todos.find(t => t.id === id)
          if (!todo) return

          // API call to update todo
          await fetch(`https://dummyjson.com/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !todo.completed })
          })

          // Update local state
          set((state) => ({
            todos: state.todos.map(t =>
              t.id === id ? { ...t, completed: !t.completed } : t
            )
          }))
        } catch (error) {
          console.error('Failed to toggle todo:', error)
          // Still update local state even if API fails
          set((state) => ({
            todos: state.todos.map(t =>
              t.id === id ? { ...t, completed: !t.completed } : t
            )
          }))
        }
      },

      deleteTodo: async (id) => {
        try {
          // API call to delete todo
          await fetch(`https://dummyjson.com/todos/${id}`, {
            method: 'DELETE'
          })

          // Update local state
          set((state) => ({
            todos: state.todos.filter(todo => todo.id !== id)
          }))
        } catch (error) {
          console.error('Failed to delete todo:', error)
          // Still update local state even if API fails
          set((state) => ({
            todos: state.todos.filter(todo => todo.id !== id)
          }))
        }
      },

      addCategory: (category) => {
        set((state) => ({
          categories: [...state.categories, category]
        }))
      },

      getCategories: () => get().categories,
    }),
    {
      name: 'todo-storage', // localStorage key
    }
  )
)

export default todoStore 