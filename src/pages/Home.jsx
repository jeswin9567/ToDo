import { Link } from 'react-router-dom'
import LeftPanel from '../components/LeftPanel'

const Home = () => {
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      <LeftPanel />

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center flex-grow md:flex-grow-0">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Productive Mind
          </h2>
          <p className="text-base md:text-lg text-slate-600 mb-6 md:mb-8 leading-relaxed">
            With only the features you need, Organic Mind is customized for individuals seeking a stress-free way to stay focused on their goals, projects, and tasks.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/signup"
              className="block w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium px-4 md:px-6 py-3 rounded-lg text-center transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base"
            >
              Get Started
            </Link>
            
            <div className="text-center">
              <Link 
                to="/login" 
                className="text-slate-600 hover:text-slate-900 text-xs md:text-sm inline-flex items-center gap-2 transition-colors duration-200"
              >
                Already have an account? 
                <span className="font-medium">Sign in</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home