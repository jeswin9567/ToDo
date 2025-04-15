import { useEffect, useState, useCallback } from 'react'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const todos = useStore(state => state.todos)

  // Keyboard shortcuts handler
  const handleKeyPress = useCallback((e) => {
    // Only handle keyboard shortcuts if user is not typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Ctrl/Cmd + / to toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      setIsSidebarOpen(prev => !prev);
    }

    // Alt + number for quick navigation
    if (e.altKey && !isNaN(e.key)) {
      e.preventDefault();
      switch (e.key) {
        case '1':
          setActiveTab('today');
          setSelectedCategory(null);
          break;
        case '2':
          setActiveTab('all');
          setSelectedCategory(null);
          break;
        case '3':
          setActiveTab('important');
          setSelectedCategory(null);
          break;
        case '4':
          setActiveTab('upcoming');
          setSelectedCategory(null);
          break;
        default:
          break;
      }
    }

    // Ctrl/Cmd + N for new task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      document.querySelector('[data-add-task-button]')?.click();
    }
  }, []);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

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

  // Close sidebar when clicking outside on mobile
  const handleContentClick = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <div className={`fixed z-40 lg:static top-0 left-0 h-full w-72 bg-[#FAF9F6] border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar setActiveTab={setActiveTab} setSelectedCategory={setSelectedCategory} />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50" onClick={handleContentClick}>
        <div className="p-4 sm:p-8">
          {/* Welcome Message */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSidebarOpen(!isSidebarOpen);
                }}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Toggle Sidebar"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isSidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Welcome back, {user?.name || 'User'}!
              </h1>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-4 mt-6 bg-white p-4 rounded-t-2xl border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('today')
                setSelectedCategory(null)
              }}
              className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative whitespace-nowrap
                ${activeTab === 'today' 
                  ? 'text-[#1a1a1a]' 
                  : 'text-gray-500 hover:text-gray-700'}`}
              aria-label="Today's Tasks (Alt + 1)"
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
              className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative whitespace-nowrap
                ${activeTab === 'all' 
                  ? 'text-[#1a1a1a]' 
                  : 'text-gray-500 hover:text-gray-700'}`}
              aria-label="All Tasks (Alt + 2)"
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
              className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative whitespace-nowrap
                ${activeTab === 'important' 
                  ? 'text-[#1a1a1a]' 
                  : 'text-gray-500 hover:text-gray-700'}`}
              aria-label="Important Tasks (Alt + 3)"
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
              className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative whitespace-nowrap
                ${activeTab === 'upcoming' 
                  ? 'text-[#1a1a1a]' 
                  : 'text-gray-500 hover:text-gray-700'}`}
              aria-label="Upcoming Tasks (Alt + 4)"
            >
              Upcoming Tasks
              {activeTab === 'upcoming' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a1a]"></span>
              )}
            </button>
            {selectedCategory && (
              <button
                className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative text-[#1a1a1a] whitespace-nowrap`}
              >
                {selectedCategory.name}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a1a]"></span>
              </button>
            )}
          </div>
          
          {/* Content Area */}
          <div className="bg-white p-4 sm:p-6 rounded-b-2xl shadow-sm">
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