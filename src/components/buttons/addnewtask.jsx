import { useState, useEffect } from 'react'
import useStore from '../../store/todoStore'
import Toast from '../Toast'
import { auth } from '../../firebase/config'

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
  const [error, setError] = useState(null)
  
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

  // Auto-hide error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

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

  // Helper function to convert Firebase UID to a number between 1-100
  const getNumericUserId = (firebaseUid) => {
    const hash = firebaseUid.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return Math.abs(hash % 100) + 1; // Returns 1-100
  }

  const addTaskToApi = async (task) => {
    try {
      // Convert Firebase UID to numeric ID for DummyJSON API
      const numericUserId = getNumericUserId(task.userId);
      
      const response = await fetch('https://dummyjson.com/todos/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todo: task.title,
          completed: false,
          userId: numericUserId // Use numeric ID for API
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('API Error Response:', errorData);
        throw new Error(`Failed to add task to API: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  const handleSubmitTask = async (e) => {
    e.preventDefault()
    
    // Check if user is logged in
    if (!auth.currentUser) {
      setError('Please log in to add tasks')
      return
    }

    // Check if task title is provided
    if (!taskTitle.trim()) {
      setError('Task title is required')
      return
    }

    const newTask = {
      id: Date.now(),
      userId: auth.currentUser.uid, // Keep Firebase UID for local storage
      title: taskTitle.trim(),
      date: taskDate,
      time: taskTime,
      isImportant,
      category: selectedCategory,
      completed: false,
      createdAt: new Date().toISOString()
    }

    try {
      // First, save to local storage through store
      await addTodo(newTask)
      console.log('Task saved to local storage:', newTask)

      // Then try to sync with API
      try {
        const apiResponse = await addTaskToApi(newTask)
        console.log('Task synced with API:', apiResponse)
      } catch (apiError) {
        console.error('API sync failed, but task is saved locally:', apiError)
        // Don't show error to user since local save was successful
        console.log('Task saved locally successfully')
      }
      
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
      console.error('Failed to save task:', error)
      setError('Failed to save task. Please try again.')
    }
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <div className="mt-6 space-y-4">
        {error && (
          <div className="p-4 bg-amber-100 text-amber-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Add Task Button */}
        <button
          onClick={handleAddTaskClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors duration-200"
          data-add-task-button
          aria-label="Add New Task (Ctrl/Cmd + N)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Task
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
