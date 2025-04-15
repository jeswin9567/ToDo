import { useState, useEffect } from 'react'
import useStore from '../../store/todoStore'
import { auth } from '../../firebase/config'

const AllTasks = () => {
  const [filter, setFilter] = useState('all') // all, pending, completed
  const [editingTask, setEditingTask] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const todos = useStore(state => state.todos)
  const categories = useStore(state => state.categories)
  const toggleTodo = useStore(state => state.toggleTodo)
  const updateTodo = useStore(state => state.updateTodo)
  const deleteTodo = useStore(state => state.deleteTodo)

  // Filter tasks for current user
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

  // Apply status filter
  const filteredTasks = userTasks.filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  // Sort tasks by date, then important, then time
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Sort by date (newest first)
    const dateComparison = new Date(b.date) - new Date(a.date)
    if (dateComparison !== 0) return dateComparison
    // Then by importance
    if (a.isImportant !== b.isImportant) return b.isImportant ? 1 : -1
    // Then by time
    return a.time?.localeCompare(b.time || '') || 0
  })

  // Group tasks by date
  const groupedTasks = sortedTasks.reduce((groups, task) => {
    const date = task.date || 'No Date'
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(task)
    return groups
  }, {})

  const formatDate = (dateString) => {
    if (dateString === 'No Date') return dateString
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleComplete = async (taskId) => {
    await toggleTodo(taskId)
  }

  const handleEdit = (task) => {
    setEditingTask({
      ...task,
      date: task.date || '',
      time: task.time || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingTask) return
    await updateTodo(editingTask)
    setEditingTask(null)
  }

  const handleSelectAll = () => {
    if (selectedTasks.size === sortedTasks.length) {
      // If all tasks are selected, unselect all
      setSelectedTasks(new Set())
    } else {
      // Select all tasks
      setSelectedTasks(new Set(sortedTasks.map(task => task.id)))
    }
  }

  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.size} tasks?`)) {
      for (const taskId of selectedTasks) {
        await deleteTodo(taskId)
      }
      setSelectedTasks(new Set())
    }
  }

  return (
    <div className="mt-8">
      {/* Top Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
              ${filter === 'all' 
                ? 'bg-[#1a1a1a] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            All Tasks
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

        {/* Bulk Actions */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleSelectAll}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
          >
            {selectedTasks.size === sortedTasks.length ? 'Unselect All' : 'Select All'}
          </button>
          {selectedTasks.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected ({selectedTasks.size})
            </button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4 sm:space-y-8">
        {Object.entries(groupedTasks).map(([date, tasks]) => (
          <div key={date} className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 px-2 sm:px-0">
              {formatDate(date)}
            </h2>

            <div className="space-y-3">
              {tasks.map(task => (
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
                            value={editingTask.time || ''}
                            onChange={(e) => setEditingTask({...editingTask, time: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
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
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Checkbox */}
                      <div className="hidden sm:block pt-1">
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task.id)}
                          onChange={() => handleSelectTask(task.id)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                      </div>

                      {/* Task Content */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="checkbox"
                              checked={selectedTasks.has(task.id)}
                              onChange={() => handleSelectTask(task.id)}
                              className="sm:hidden w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                            />
                            <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {task.isImportant && (
                              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                                Important
                              </span>
                            )}
                            {/* Source Indicator */}
                            <span 
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                task.id <= 150 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                              title={task.id <= 150 ? 'From DummyJSON API' : 'From Local Storage'}
                            >
                              {task.id <= 150 ? 'API' : 'Local'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Task Details */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
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
                          onClick={() => deleteTodo(task.id)}
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
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedTasks).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found
          </div>
        )}
      </div>
    </div>
  )
}

export default AllTasks 