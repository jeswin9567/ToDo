import { useState, useEffect } from 'react'
import useStore from '../../store/todoStore'
import Toast from '../Toast'

const AddNewTask = () => {
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [taskTime, setTaskTime] = useState('')
  const [isImportant, setIsImportant] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showToast, setShowToast] = useState(false)
  
  // Separate store selectors to prevent unnecessary re-renders
  const categories = useStore(state => state.categories)
  const addCategory = useStore(state => state.addCategory)
  const addTodo = useStore(state => state.addTodo)

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (newCategory.trim()) {
      const colors = ['bg-pink-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      const newCategoryObj = {
        id: Date.now(),
        name: newCategory.trim(),
        color: randomColor
      }
      
      addCategory(newCategoryObj)
      setSelectedCategory(newCategoryObj)
      setNewCategory('')
      setShowCategoryInput(false)
    }
  }

  const handleAddTaskClick = () => {
    setShowTaskForm(true)
  }

  const handleSubmitTask = async (e) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    const newTask = {
      id: Date.now(),
      title: taskTitle.trim(),
      date: taskDate,
      time: taskTime,
      isImportant,
      category: selectedCategory,
      completed: false,
      createdAt: new Date().toISOString()
    }

    try {
      await addTodo(newTask)
      
      // Reset form
      setTaskTitle('')
      setTaskDate('')
      setTaskTime('')
      setIsImportant(false)
      setSelectedCategory(null)
      setShowTaskForm(false)
      
      // Show success toast
      setShowToast(true)
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <div className="mt-6 space-y-4">
        {/* Add Task Button */}
        <button
          onClick={handleAddTaskClick}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>Add New Task</span>
        </button>

        {/* Task Form */}
        {showTaskForm && (
          <form onSubmit={handleSubmitTask} className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
            {/* Task Title Input */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="taskTitle" className="text-sm font-medium text-gray-700">Task Title</label>
              <input
                type="text"
                id="taskTitle"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-4 items-start">
              {/* Date Input */}
              <div className="flex flex-col space-y-1">
                <label htmlFor="taskDate" className="text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  id="taskDate"
                  min={today}
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Time Input */}
              <div className="flex flex-col space-y-1">
                <label htmlFor="taskTime" className="text-sm font-medium text-gray-700">Due Time</label>
                <input
                  type="time"
                  id="taskTime"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Important Toggle */}
              <div className="flex items-center space-x-3 pt-6">
                <label htmlFor="isImportant" className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Important</span>
                </label>
              </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <div className="flex flex-wrap gap-2 items-center">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-200 flex items-center space-x-2 
                      ${selectedCategory?.id === category.id 
                        ? 'bg-gray-100 border-gray-400' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${category.color}`}></span>
                    <span>{category.name}</span>
                  </button>
                ))}
                
                {/* Add Category Button */}
                <button
                  type="button"
                  onClick={() => setShowCategoryInput(true)}
                  className="px-3 py-1 rounded-full bg-white border border-gray-200 text-sm font-medium text-amber-600 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {/* Add Category Input */}
            {showCategoryInput && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-1 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors duration-200"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryInput(false)
                    setNewCategory('')
                  }}
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors duration-200"
              >
                Add Task
              </button>
            </div>
          </form>
        )}
      </div>
      {showToast && (
        <Toast 
          message="Task added successfully!" 
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}

export default AddNewTask
