import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AddNewTask from '../components/buttons/addnewtask'
import ViewTasks from '../components/viewtask/ViewTasks'
import AllTasks from '../components/viewtask/AllTasks'
import ImportantTasks from '../components/viewtask/ImportantTasks'
import UpcomingTasks from '../components/viewtask/UpcomingTasks'

const Dashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [activeTab, setActiveTab] = useState('today') // 'today', 'all', 'important', or 'upcoming'

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.name || 'User'}!</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('today')}
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
              onClick={() => setActiveTab('all')}
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
              onClick={() => setActiveTab('important')}
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
              onClick={() => setActiveTab('upcoming')}
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
          </div>
          
          {/* Add Task Button */}
          <AddNewTask />

          {/* Task Lists */}
          {activeTab === 'today' ? (
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
  )
}

export default Dashboard