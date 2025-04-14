import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AddNewTask from '../components/buttons/addnewtask'
import ViewTasks from '../components/viewtask/ViewTasks'
import AllTasks from '../components/viewtask/AllTasks'
import ImportantTasks from '../components/viewtask/ImportantTasks'
import UpcomingTasks from '../components/viewtask/UpcomingTasks'
import CategoryTasks from '../components/viewtask/CategoryTasks'
import useStore from '../store/todoStore'

const Dashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [activeTab, setActiveTab] = useState('today')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const todos = useStore(state => state.todos)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Filter tasks by category
  const getCategoryTasks = () => {
    if (!selectedCategory) return []
    return todos.filter(todo => todo.category?.id === selectedCategory.id)
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-72 bg-[#FAF9F6] border-r border-gray-200 shadow-lg">
        <Sidebar setActiveTab={setActiveTab} setSelectedCategory={setSelectedCategory} />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        <div className="p-8">
          {/* Welcome Message */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-4 mt-6 bg-white p-4 rounded-t-2xl border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('today')
                setSelectedCategory(null)
              }}
              className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative
                ${activeTab === 'today' 
                  ? 'text-[#1a1a1a]' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              Today's Tasks
              {activeTab === 'today' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a1a]"></span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('all')
                setSelectedCategory(null)
              }}
              className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative
                ${activeTab === 'all' 
                  ? 'text-[#1a1a1a]' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Tasks
              {activeTab === 'all' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a1a]"></span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('important')
                setSelectedCategory(null)
              }}
              className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative
                ${activeTab === 'important' 
                  ? 'text-[#1a1a1a]' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              Important Tasks
              {activeTab === 'important' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a1a]"></span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('upcoming')
                setSelectedCategory(null)
              }}
              className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative
                ${activeTab === 'upcoming' 
                  ? 'text-[#1a1a1a]' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              Upcoming Tasks
              {activeTab === 'upcoming' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a1a]"></span>
              )}
            </button>
            {selectedCategory && (
              <button
                className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative text-[#1a1a1a]`}
              >
                {selectedCategory.name}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a1a]"></span>
              </button>
            )}
          </div>
          
          {/* Content Area */}
          <div className="bg-white p-6 rounded-b-2xl shadow-sm">
            {/* Add Task Button */}
            <AddNewTask />

            {/* Task Lists */}
            {activeTab === 'category' ? (
              <CategoryTasks selectedCategory={selectedCategory} />
            ) : activeTab === 'today' ? (
              <ViewTasks />
            ) : activeTab === 'all' ? (
              <AllTasks />
            ) : activeTab === 'important' ? (
              <ImportantTasks />
            ) : (
              <UpcomingTasks />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard