import { useState, useEffect } from 'react'
import useStore from '../../store/todoStore'

const UpcomingTasks = () => {
  const [filter, setFilter] = useState('all') // all, pending, completed
  const [editingTask, setEditingTask] = useState(null)
  const [error, setError] = useState(null)
  const todos = useStore(state => state.todos)
  const categories = useStore(state => state.categories)
  const toggleTodo = useStore(state => state.toggleTodo)
  const updateTodo = useStore(state => state.updateTodo)
  const deleteTodo = useStore(state => state.deleteTodo)

  // Get today's date and next 3 days
  const today = new Date()
  const nextThreeDays = new Date(today)
  nextThreeDays.setDate(today.getDate() + 3)
  
  const todayStr = today.toISOString().split('T')[0]
  const nextThreeDaysStr = nextThreeDays.toISOString().split('T')[0]

  // Filter upcoming tasks (next 3 days)
  const upcomingTasks = todos.filter(todo => {
    const taskDate = new Date(todo.date)
    return taskDate >= today && taskDate <= nextThreeDays
  })

  // Apply status filter
  const filteredTasks = upcomingTasks.filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  // Sort tasks by date and time
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.time?.localeCompare(b.time || '') || 0
  })

  const handleComplete = async (taskId) => {
    try {
      await toggleTodo(taskId)
      setError(null)
    } catch (error) {
      setError('Failed to update task status')
    }
  }

  const handleEdit = (task) => {
    const taskDate = new Date(task.date)
    if (taskDate >= today && taskDate <= nextThreeDays) {
      setEditingTask({
        ...task,
        date: task.date || todayStr,
        time: task.time || ''
      })
      setError(null)
    } else {
      setError('Cannot edit tasks outside the 3-day window')
    }
  }

  const handleSaveEdit = async () => {
    if (!editingTask) return

    const taskDate = new Date(editingTask.date)
    if (taskDate >= today && taskDate <= nextThreeDays) {
      try {
        await updateTodo(editingTask)
        setEditingTask(null)
        setError(null)
      } catch (error) {
        setError('Failed to update task')
      }
    } else {
      setError('Task date must be within the next 3 days')
    }
  }

  const handleDelete = async (taskId) => {
    try {
      await deleteTodo(taskId)
      setError(null)
    } catch (error) {
      setError('Failed to delete task')
    }
  }

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="mt-8">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
            ${filter === 'all' 
              ? 'bg-[#1a1a1a] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
            ${filter === 'pending' 
              ? 'bg-[#1a1a1a] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
            ${filter === 'completed' 
              ? 'bg-[#1a1a1a] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          Completed
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No upcoming tasks in the next 3 days
          </div>
        ) : (
          sortedTasks.map(task => (
            <div
              key={task.id}
              className={`bg-white rounded-lg border p-4 transition-all duration-200 hover:shadow-md
                ${task.completed ? 'border-gray-200' : 'border-gray-300'}`}
            >
              {editingTask?.id === task.id ? (
                // Edit Form
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="Task title"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col space-y-1">
                      <input
                        type="date"
                        value={editingTask.date}
                        onChange={(e) => setEditingTask({...editingTask, date: e.target.value})}
                        min={todayStr}
                        max={nextThreeDaysStr}
                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <input
                        type="time"
                        value={editingTask.time}
                        onChange={(e) => setEditingTask({...editingTask, time: e.target.value})}
                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingTask.isImportant}
                        onChange={(e) => setEditingTask({...editingTask, isImportant: e.target.checked})}
                        className="rounded text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">Important</span>
                    </label>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setEditingTask({...editingTask, category})}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-200 flex items-center space-x-2 
                            ${editingTask.category?.id === category.id 
                              ? 'bg-gray-100 border-gray-400' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${category.color}`}></span>
                          <span>{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // Task View
                <div className="flex items-start gap-4">
                  {/* Task Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      {task.isImportant && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                          Important
                        </span>
                      )}
                    </div>
                    
                    {/* Task Details */}
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(task.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {task.time && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {task.time}
                        </span>
                      )}
                      {task.category && (
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${task.category.color}`}></span>
                          {task.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {!task.completed && (
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleComplete(task.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                        ${task.completed 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'}`}
                    >
                      {task.completed ? 'Completed' : 'Complete'}
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default UpcomingTasks 