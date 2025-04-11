import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LeftPanel from '../components/LeftPanel'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(storedUser))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      <LeftPanel />

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-white p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Welcome, {user?.name || 'User'}
              </h1>
              <p className="text-slate-600 mt-1">Here are your tasks for today</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Quick Add Todo */}
          <div className="mb-8">
            <form className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new task..."
                className="flex-1 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-[#0A0F1E] text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
              >
                Add Task
              </button>
            </form>
          </div>

          {/* Todo Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-amber-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-amber-900 mb-4">Today's Tasks</h2>
              <div className="space-y-2">
                <p className="text-amber-800/60">No tasks for today</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Upcoming</h2>
              <div className="space-y-2">
                <p className="text-slate-600">Plan your future tasks</p>
              </div>
            </div>
          </div>

          {/* Todo List */}
          <div className="bg-white rounded-lg border border-slate-200 divide-y">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                <span className="text-slate-900">Example task to get you started</span>
              </div>
              <span className="text-sm text-slate-500">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard