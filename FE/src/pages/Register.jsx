import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TaskGenieLogo } from '../components/TaskGenieLogo'
import { FloatingField } from '../components/auth/FloatingField'
import { AuthPromoPanel } from '../components/auth/AuthPromoPanel'
import { GoogleConnectButton } from '../components/auth/GoogleConnectButton'
import { registerApi } from '../api/auth'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password) {
      setError('Vui lòng điền đủ thông tin.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setLoading(true)
    try {
      await registerApi(name.trim(), email.trim(), password)
      navigate('/login?registered=1', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-indigo-100">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-violet-300/35 blur-3xl" />

      <div className="relative mx-auto flex min-h-svh max-w-5xl items-center justify-center p-4 py-10 sm:p-6">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-indigo-900/10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-8 py-10 sm:px-10 sm:py-12">
            <TaskGenieLogo className="mb-8" />

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Create account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Join TaskGenie — enter your details below
            </p>

            {error ? (
              <p
                className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <FloatingField
                id="register-name"
                label="Name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FloatingField
                id="register-email"
                label="Email"
                type="email"
                placeholder="Enter the email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FloatingField
                id="register-password"
                label="Password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FloatingField
                id="register-confirm"
                label="Confirm Password"
                type="password"
                placeholder="Confirm the Password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Đang tạo tài khoản…' : 'Sign up'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wide text-gray-400">
                <span className="bg-white px-3">Or continue</span>
              </div>
            </div>

            <GoogleConnectButton text="signup_with" setError={setError} />

            <p className="mt-10 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-6 text-center text-xs text-gray-400">
              <Link to="/" className="hover:text-indigo-600">
                Vào bảng công việc (demo)
              </Link>
            </p>
          </div>

          <div className="hidden bg-indigo-50/50 p-4 lg:block">
            <AuthPromoPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
