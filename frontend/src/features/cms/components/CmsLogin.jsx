'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '../services/cmsApi'

export default function CmsLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await adminLogin(email, password, remember)
      router.push('/admin/blogs')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[#eef3f8] lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden bg-omni-blue px-10 py-12 text-white lg:grid lg:content-between">
        <div>
          <img src="/logo.png" alt="OmniContact" className="h-auto w-[150px]" />
        </div>
        <div className="max-w-xl">
          <p className="mb-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-omni-yellow">Website CMS</p>
          <h1 className="m-0 text-[clamp(1.9rem,2.6vw,2.6rem)] font-semibold leading-[1.18]">Manage content without the old session headaches.</h1>
          <p className="mt-4 max-w-lg text-[0.98rem] font-normal leading-[1.7] text-white/75">
            Token-based access, clean publishing workflows, and room for the admin tools OmniContact needs next.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm font-medium text-white/70">
          <span className="border-t border-white/15 pt-3">Insights</span>
          <span className="border-t border-white/15 pt-3">Users</span>
          <span className="border-t border-white/15 pt-3">Media</span>
        </div>
      </section>

      <section className="grid place-items-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(23,33,60,.08)]">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <span className="grid size-12 place-items-center rounded-xl bg-omni-blue">
              <img src="/logo.png" alt="OmniContact" className="w-9" />
            </span>
            <div>
              <p className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-omni-blue">OmniContact</p>
              <p className="m-0 text-xs font-medium text-slate-500">Website CMS</p>
            </div>
          </div>

          <p className="text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-omni-blue">Secure sign in</p>
          <h1 className="mt-2 text-[1.9rem] font-semibold text-omni-ink">Welcome back</h1>
          <p className="mt-2 text-sm font-normal leading-6 text-slate-600">
            Sign in to manage insights, users, and publishing workflows.
          </p>

        {error && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
              className="min-h-12 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Password
            <span className="flex overflow-hidden rounded-md border border-slate-300 focus-within:border-omni-blue focus-within:ring-2 focus-within:ring-omni-blue/20">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="min-h-12 min-w-0 flex-1 px-3 font-normal outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="px-3 text-sm font-semibold text-omni-blue"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
            <span>Keep me signed in for 30 days</span>
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-4 accent-omni-blue"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 min-h-12 rounded-md bg-omni-blue px-5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        </div>
      </section>
    </main>
  )
}
