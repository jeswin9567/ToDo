import { useState } from 'react'
import useStore from '../../store/todoStore'
import { auth } from '../../firebase/config'

const ImportantTasks = () => {
  const [filter, setFilter] = useState('all') // all, pending, completed
  const [editingTask, setEditingTask] = useState(null)
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

  // Filter important tasks
  const importantTasks = userTasks.filter(todo => todo.isImportant)

  // Apply status filter
  const filteredTasks = importantTasks.filter(task => {
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
    await toggleTodo(taskId)
  }

  const handleEdit = (task) => {
    setEditingTask({
      ...task,
      date: task.date || new Date().toISOString().split('T')[0],
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
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No important tasks
          </div>
        ) : (
          sortedTasks.map(task => (
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
                        min={new Date().toISOString().split('T')[0]}
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
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                        Important
                      </span>
                    </div>
                    
                    {/* Task Details */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500">
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
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200"
                    >
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

export default ImportantTasks 