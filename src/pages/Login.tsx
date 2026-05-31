import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi'
import './Login.css'
import { useAuthStore } from '../store/useAuthStore'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Full name is required')
        setLoading(false)
        return
      }
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters')
        setLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match')
        setLoading(false)
        return
      }

      const { error, requiresEmailConfirmation } = await signUp(email, password, fullName)
      if (error) {
        setErrorMsg(error)
        setLoading(false)
      } else if (requiresEmailConfirmation) {
        setSuccessMsg('Account created successfully! Please check your email to confirm your account.')
        setLoading(false)
        // Delay switching to login so user can read message
        setTimeout(() => switchMode('login'), 3500)
      } else {
        setSuccessMsg('Account created successfully! Logging you in...')
        setTimeout(() => navigate('/'), 1500)
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setErrorMsg(error === 'Invalid login credentials' ? 'Invalid email or password' : error)
        setLoading(false)
      } else {
        navigate('/')
      }
    }
  }

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode)
    setErrorMsg('')
    setSuccessMsg('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-placeholder">G</div>
          <h1>Garaad</h1>
          <p>
            {mode === 'login'
              ? 'Sign in to your productivity workspace'
              : 'Create your personal workspace'}
          </p>
        </div>

        {errorMsg && (
          <div className="login-alert login-alert-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="login-alert login-alert-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="login-form">
          {mode === 'signup' && (
            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading} id="auth-submit-btn">
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="login-footer">
          {mode === 'login' ? (
            <p>Don't have an account?{' '}
              <a href="#" id="switch-to-signup" onClick={(e) => { e.preventDefault(); switchMode('signup') }}>
                Create an account
              </a>
            </p>
          ) : (
            <p>Already have an account?{' '}
              <a href="#" id="switch-to-login" onClick={(e) => { e.preventDefault(); switchMode('login') }}>
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
