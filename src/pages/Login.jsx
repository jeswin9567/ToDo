import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { GoogleOAuthProvider } from '@react-oauth/google'
import LeftPanel from '../components/LeftPanel'
import { auth, db } from '../firebase/config'
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { jwtDecode } from 'jwt-decode'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

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
      // Handle email/password login here
      setErrors({ auth: 'Email/Password login not implemented yet' })
    } else {
      setErrors(newErrors)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true)
      const decoded = jwtDecode(credentialResponse.credential)
      
      // Create a credential for Firebase from the Google ID token
      const credential = GoogleAuthProvider.credential(credentialResponse.credential)
      
      // Sign in to Firebase with the Google credential
      const userCredential = await signInWithCredential(auth, credential)
      
      // Store user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: decoded.name,
        email: decoded.email,
        uid: userCredential.user.uid,
        lastLogin: new Date().toISOString()
      }, { merge: true })

      // Store minimal user info in localStorage for app usage
      localStorage.setItem('user', JSON.stringify({
        uid: userCredential.user.uid,
        name: decoded.name,
        email: decoded.email
      }))

      // Navigate to todos page
      navigate('/todos')
    } catch (error) {
      console.error('Google sign-in error:', error)
      setErrors({
        auth: 'Failed to sign in with Google. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = (error) => {
    console.error('Google Sign In Error:', error)
    setErrors({
      auth: 'Google sign-in failed. Please try again.'
    })
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

          {errors.auth && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.auth}
            </div>
          )}

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
              <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  flow="auth-code"
                  theme="outline"
                  shape="rectangular"
                  type="standard"
                  disabled={isLoading}
                />
              </GoogleOAuthProvider>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
              disabled={isLoading}
              className={`mt-6 w-full bg-[#0A0F1E] text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login 