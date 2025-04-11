import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import LeftPanel from '../components/LeftPanel'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length === 0) {
      // Check if user exists in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'))
      if (storedUser && storedUser.email === formData.email) {
        navigate('/todos')
      } else {
        setErrors({ auth: 'Invalid email or password' })
      }
    } else {
      setErrors(newErrors)
    }
  }

  const handleGoogleSuccess = (credentialResponse) => {
    const userData = {
      id: credentialResponse.clientId,
      credential: credentialResponse.credential,
      isGoogleUser: true,
      createdAt: new Date().toISOString()
    }
    localStorage.setItem('user', JSON.stringify(userData))
    navigate('/todos')
  }

  const handleGoogleError = () => {
    console.log('Google Sign In was unsuccessful.')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      <LeftPanel />

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-6 md:p-12">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome back
          </h2>
          <p className="text-slate-600 mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber-500 hover:text-amber-600 font-medium">
              Sign up
            </Link>
          </p>

          {/* Google Sign In Button */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors.auth && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                {errors.auth}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-slate-200 rounded-lg py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-slate-200 rounded-lg py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-[#0A0F1E] text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login 