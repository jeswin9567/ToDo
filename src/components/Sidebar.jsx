import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ setActiveTab }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();

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

  const tasks = [
    { name: 'All Tasks', onClick: () => setActiveTab('all'), icon: '📋' },
    { name: 'Today', count: 5, href: '/today', icon: '📅' },
    { name: 'Important', count: 3, href: '/important', icon: '⭐' },
    { name: 'Upcoming', count: 8, href: '/upcoming', icon: '📆' },
  ];

  const lists = [
    { name: 'Personal', count: 4, color: 'bg-pink-500' },
    { name: 'Work', count: 6, color: 'bg-blue-500' },
    { name: 'Shopping', count: 2, color: 'bg-amber-500' },
    { name: 'Ideas', count: 3, color: 'bg-purple-500' },
  ];

  return (
    <div className="w-72 h-screen bg-[#FAF9F6] flex flex-col overflow-hidden">
      {/* User Profile Section */}
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-lg">
              {userData?.name ? userData.name[0].toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-300">
              {userData?.name || 'User'}
            </h2>
            <p className="text-sm text-gray-400">
              {userData?.email || 'user@example.com'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div
          className={`mt-6 relative transition-all duration-200 ${
            isSearchFocused ? 'scale-105' : ''
          }`}
        >
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all duration-200"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase ml-2 mb-2">Tasks</h3>
        <nav className="space-y-1">
          {tasks.map((task) => (
            task.onClick ? (
              <button
                key={task.name}
                onClick={task.onClick}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === '/dashboard' && task.name === 'All Tasks'
                    ? 'text-amber-900 bg-amber-50 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{task.icon}</span>
                  <span>{task.name}</span>
                </div>
                {task.count > 0 && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    location.pathname === '/dashboard' && task.name === 'All Tasks'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {task.count}
                  </span>
                )}
              </button>
            ) : (
              <Link
                key={task.name}
                to={task.href}
                className={`flex items-center justify-between px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === task.href
                    ? 'text-amber-900 bg-amber-50 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{task.icon}</span>
                  <span>{task.name}</span>
                </div>
                {task.count > 0 && (
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      location.pathname === task.href
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {task.count}
                  </span>
                )}
              </Link>
            )
          ))}
        </nav>
      </div>

      {/* Lists Section */}
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase ml-2 mb-2">Lists</h3>
        <div className="space-y-1">
          {lists.map((list) => (
            <button
              key={list.name}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 border"
            >
              <div className="flex items-center space-x-3">
                <span className={`w-2 h-2 rounded-full ${list.color}`}></span>
                <span>{list.name}</span>
              </div>
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                {list.count}
              </span>
            </button>
          ))}

          {/* Add New List */}
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-500 w-full bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 border">
            <span className="text-xl">+</span>
            <span>Add New List</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500 w-full bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 border"
          >
            <span className="text-xl">👋</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
