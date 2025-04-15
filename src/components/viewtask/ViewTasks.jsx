import { useState, useEffect } from 'react'
import useStore from '../../store/todoStore'
import { auth } from '../../firebase/config'

const ViewTasks = () => {
  const [filter, setFilter] = useState('all') // all, pending, completed
  const [editingTask, setEditingTask] = useState(null)
  const todos = useStore(state => state.todos)
  const categories = useStore(state => state.categories)
  const toggleTodo = useStore(state => state.toggleTodo)
  const updateTodo = useStore(state => state.updateTodo)
  const deleteTodo = useStore(state => state.deleteTodo)
  const error = useStore(state => state.error)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  // Filter tasks for current user (handle both API and local tasks)
  const userTasks = todos.filter(task => {
    // Get the numeric user ID for API tasks
    const getDummyUserId = (firebaseUid) => {
      const hash = firebaseUid.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      return Math.abs(hash % 100) + 1;
    };

    if (!auth.currentUser) return false;

    if (task.id <= 150) {
      // API tasks - compare with mapped numeric ID
      return task.userId === getDummyUserId(auth.currentUser.uid);
    } else {
      // Local tasks - compare with Firebase UID
      return task.userId === auth.currentUser.uid;
    }
  });

  // Filter tasks for today
  const todaysTasks = userTasks.filter(todo => todo.date === today)

  // Apply status filter
  const filteredTasks = todaysTasks.filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  // Sort tasks: Important first, then by time
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.isImportant !== b.isImportant) return b.isImportant ? 1 : -1
    return a.time?.localeCompare(b.time || '') || 0
  })

  const handleComplete = async (taskId) => {
    await toggleTodo(taskId)
  }

  const handleEdit = (task) => {
    setEditingTask({
      ...task,
      date: task.date || today,
      time: task.time || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingTask) return
    await updateTodo(editingTask)
    setEditingTask(null)
  }

  const handleDelete = async (taskId) => {
    await deleteTodo(taskId)
  }

  return (
    <div className="mt-8">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
            ${filter === 'all' 
              ? 'bg-[#1a1a1a] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
            ${filter === 'pending' 
              ? 'bg-[#1a1a1a] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
            ${filter === 'completed' 
              ? 'bg-[#1a1a1a] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          Completed
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks found
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`bg-white rounded-lg border p-3 sm:p-4 transition-all duration-200 hover:shadow-md
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
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="Task title"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="w-full sm:w-auto">
                      <input
                        type="date"
                        value={editingTask.date}
                        onChange={(e) => setEditingTask({...editingTask, date: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="w-full sm:w-auto">
                      <input
                        type="time"
                        value={editingTask.time}
                        onChange={(e) => setEditingTask({...editingTask, time: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
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
                          className={`flex-1 sm:flex-none px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 
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

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingTask(null)}
                      className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Task View
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Task Content */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-start gap-2">
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
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500">
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
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    {!task.completed && (
                      <button
                        onClick={() => handleEdit(task)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleComplete(task.id)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                        ${task.completed 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'}`}
                    >
                      {task.completed ? 'Completed' : 'Complete'}
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 flex items-center justify-center gap-2"
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

export default ViewTasks 