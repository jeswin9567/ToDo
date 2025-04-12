import { useState } from 'react'
import useStore from '../../store/todoStore'

const AllTasks = () => {
  const [filter, setFilter] = useState('all') // all, pending, completed
  const [editingTask, setEditingTask] = useState(null)
  const todos = useStore(state => state.todos)
  const categories = useStore(state => state.categories)
  const toggleTodo = useStore(state => state.toggleTodo)
  const updateTodo = useStore(state => state.updateTodo)

  // Apply status filter
  const filteredTasks = todos.filter(task => {
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

  return (
    <div className="mt-8">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
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

      {/* Tasks List Grouped by Date */}
      <div className="space-y-8">
        {Object.entries(groupedTasks).map(([date, tasks]) => (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDate(date)}
            </h2>

            {/* Tasks for this date */}
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
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
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