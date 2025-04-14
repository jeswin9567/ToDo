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
      <div className="flex justify-between items-center mb-6">
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
              ${filter === 'all' 
                ? 'bg-[#1a1a1a] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            All Tasks
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

        {/* Bulk Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
          >
            {selectedTasks.size === sortedTasks.length ? 'Unselect All' : 'Select All'}
          </button>
          {selectedTasks.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 flex items-center gap-2"
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
      <div className="space-y-8">
        {Object.entries(groupedTasks).map(([date, tasks]) => (
          <div key={date} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDate(date)}
            </h2>

            <div className="space-y-3">
              {tasks.map(task => (
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
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task.id)}
                          onChange={() => handleSelectTask(task.id)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                      </div>

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
                        
                        {/* Task Details */}
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
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
                          <span className="text-xs text-gray-400">
                            ID: {task.id}
                          </span>
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
                          onClick={() => deleteTodo(task.id)}
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