import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store/todoStore';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const Sidebar = ({ setActiveTab, setSelectedCategory }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const todos = useStore(state => state.todos);
  const categories = useStore(state => state.categories); // Get categories from store
  const deleteCategory = useStore(state => state.deleteCategory);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Handle both Google Sign-in and regular registration data
      setUserData({
        name: user.name || (user.credential ? decodeJWT(user.credential).name : 'User'),
        email: user.email || (user.credential ? decodeJWT(user.credential).email : 'user@example.com'),
      });
    }
  }, []);

  // Function to decode JWT token from Google Sign-in
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return { name: 'User', email: 'user@example.com' };
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter todos for current user
  const userTodos = todos.filter(todo => {
    if (todo.id <= 150) {
      // API tasks (using dummy user ID 1)
      return todo.userId === 1;
    } else {
      // Local tasks (using Firebase auth)
      return todo.userId === auth.currentUser?.uid;
    }
  });
  
  // Calculate counts for current user's tasks only
  const todaysTasksCount = userTodos.filter(todo => todo.date === today).length;
  const importantTasksCount = userTodos.filter(todo => todo.isImportant).length;
  const upcomingTasksCount = userTodos.filter(todo => todo.date > today).length;
  const allTasksCount = userTodos.length;

  const handleSignOut = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      // Only remove user data from localStorage, keep todos
      localStorage.removeItem('user');
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tasks = [
    { name: 'All Tasks', onClick: () => setActiveTab('all'), icon: '📋', count: allTasksCount },
    { name: 'Today', onClick: () => setActiveTab('today'), icon: '📅', count: todaysTasksCount },
    { name: 'Important', onClick: () => setActiveTab('important'), icon: '⭐', count: importantTasksCount },
    { name: 'Upcoming', onClick: () => setActiveTab('upcoming'), icon: '📆', count: upcomingTasksCount },
    { 
      name: 'Sign Out', 
      onClick: handleSignOut,
      icon: '👋',
      isSignOut: true
    }
  ];

  // Calculate task count for each category
  const categoryTaskCounts = categories.map(category => ({
    ...category,
    count: userTodos.filter(todo => todo.category?.id === category.id).length
  }));

  const handleDeleteCategory = (categoryId, e) => {
    e.stopPropagation(); // Prevent triggering the category selection
    deleteCategory(categoryId);
    // If the deleted category was selected, reset to all tasks
    setActiveTab('all');
    setSelectedCategory(null);
  };

  return (
    <div className="w-full sm:w-72 min-h-screen bg-[#FAF9F6] flex flex-col border-r border-gray-200">
      {/* User Profile Section */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-base sm:text-lg">
              {userData?.name ? userData.name[0].toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              {userData?.name || 'User'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {userData?.email || 'user@example.com'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div
          className={`mt-4 sm:mt-6 relative transition-all duration-200 ${
            isSearchFocused ? 'scale-105' : ''
          }`}
        >
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-3 sm:px-4 py-2 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all duration-200"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-3 sm:px-4 py-2">
        <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase ml-2 mb-2">Tasks</h3>
        <nav className="space-y-1">
          {tasks.map((task) => (
            <button
              key={task.name}
              onClick={() => {
                task.onClick();
                setSelectedCategory(null); // Reset category filter when clicking main tasks
              }}
              className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 
                ${task.isSignOut 
                  ? 'text-red-600 hover:bg-red-50 mt-4' 
                  : location.pathname === '/dashboard' && task.name === 'All Tasks'
                    ? 'text-amber-900 bg-amber-50 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg sm:text-xl">{task.icon}</span>
                <span className="text-sm">{task.name}</span>
              </div>
              {!task.isSignOut && task.count > 0 && (
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  location.pathname === '/dashboard' && task.name === 'All Tasks'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {task.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Lists Section */}
      <div className="px-3 sm:px-4 py-2 flex-1">
        <div className="flex items-center justify-between ml-2 mb-2">
          <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Lists</h3>
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedCategory(null);
            }}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
          >
            + Add New
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-1">
          {categoryTaskCounts.map((category) => (
            <div
              key={category.id}
              className={`group flex items-center justify-between w-full px-3 sm:px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer
                ${setSelectedCategory?.id === category.id
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'}`}
              onClick={() => {
                setActiveTab('category');
                setSelectedCategory(category);
              }}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-2 h-2 rounded-full ${category.color}`}></span>
                <span className="text-gray-700">{category.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{category.count}</span>
                <button
                  onClick={(e) => handleDeleteCategory(category.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity duration-200"
                  title="Delete list"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
