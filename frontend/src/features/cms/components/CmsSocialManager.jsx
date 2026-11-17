'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import CmsShell from './CmsShell'
import CmsPendingAuth from './CmsPendingAuth'
import { checkSocialNames, fetchCurrentAdmin, fetchSocialDashboard } from '../services/cmsApi'

const platforms = [
  ['facebook', 'Facebook'],
  ['x', 'X'],
  ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'],
]

function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="m-0 text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="m-0 mt-2 text-3xl font-black text-omni-ink">{value}</p>
      {detail && <p className="m-0 mt-1 text-sm font-semibold text-slate-500">{detail}</p>}
    </div>
  )
}

function PlatformBadge({ children }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black capitalize text-slate-700">
      {children}
    </span>
  )
}

export default function CmsSocialManager() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [names, setNames] = useState('')
  const [checkResult, setCheckResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [checkError, setCheckError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const me = await fetchCurrentAdmin()
        const data = await fetchSocialDashboard()
        if (!mounted) return
        setAdmin(me)
        setDashboard(data)
      } catch (err) {
        if (err.status === 401) {
          router.push('/admin/login')
          return
        }
        if (mounted) setError(err.message || 'Unable to load social media dashboard.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  const summary = dashboard?.summary || {}
  const platformStats = summary.by_platform || {}
  const topEngagers = dashboard?.top_engagers || []
  const recentActivity = dashboard?.recent_activity || []
  const workbook = dashboard?.workbook

  const pastedCount = useMemo(() => {
    return names
      .split(/[\n,;]+/)
      .map((name) => name.trim())
      .filter(Boolean).length
  }, [names])

  async function handleCheck(event) {
    event.preventDefault()
    setCheckError('')
    setChecking(true)

    try {
      const result = await checkSocialNames(names)
      setCheckResult(result)
    } catch (err) {
      setCheckError(err.message || 'Unable to check those names.')
    } finally {
      setChecking(false)
    }
  }

  if (loading) {
    return <CmsPendingAuth label="Loading social dashboard…" />
  }

  return (
    <CmsShell
      admin={admin}
      title="Social"
      subtitle="Track social media engagement and check pasted names against the engagement database."
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <StatCard label="People tracked" value={summary.total_people || 0} detail="Known social profiles" />
        <StatCard label="Engagement" value={summary.total_engagement || 0} detail="Recorded interactions" />
        <StatCard label="Active days" value={summary.active_days || 0} detail="Dates with activity" />
      </section>

      <section className="mb-5 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <form onSubmit={handleCheck} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="m-0 text-xl font-black text-omni-ink">Name checker</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Paste names from comments, reactions, or a spreadsheet.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
              {pastedCount} queued
            </span>
          </div>

          <textarea
            value={names}
            onChange={(event) => setNames(event.target.value)}
            className="mt-4 min-h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-omni-blue focus:bg-white"
            placeholder={'Jane Doe\n@customer_handle\nClient Name'}
          />

          {checkError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {checkError}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-xs font-bold text-slate-500">
              Exact matches check real names and platform handles. Close text matches are also surfaced.
            </p>
            <button
              type="submit"
              disabled={checking || pastedCount === 0}
              className="rounded-xl bg-omni-blue px-5 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {checking ? 'Checking...' : 'Check names'}
            </button>
          </div>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="m-0 text-xl font-black text-omni-ink">Platform totals</h2>
          <div className="mt-4 grid gap-3">
            {platforms.map(([key, label]) => {
              const item = platformStats[key] || {}
              return (
                <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <PlatformBadge>{label}</PlatformBadge>
                    <span className="text-2xl font-black text-omni-ink">{item.total_engagement || 0}</span>
                  </div>
                  <p className="m-0 mt-2 text-sm font-semibold text-slate-500">
                    {item.unique_people || 0} people engaged
                  </p>
                </div>
              )
            })}
          </div>
          {workbook && (
            <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
              Active workbook: {workbook.original_name || workbook.file || workbook.current_file}
            </div>
          )}
        </section>
      </section>

      {checkResult && (
        <section className="mb-5 grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <h2 className="m-0 text-lg font-black text-omni-ink">Matched names</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {checkResult.matched_count || 0} of {checkResult.checked || 0} found
              </p>
            </div>
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Pasted</th>
                    <th className="px-4 py-3">Matched profile</th>
                    <th className="px-4 py-3">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(checkResult.matches || []).length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center font-bold text-slate-500" colSpan={3}>
                        No matches found.
                      </td>
                    </tr>
                  ) : (
                    checkResult.matches.map((match, index) => (
                      <tr key={`${match.input}-${index}`}>
                        <td className="px-4 py-3 font-semibold text-slate-600">{match.input}</td>
                        <td className="px-4 py-3">
                          <p className="font-black text-slate-900">{match.person.real_name}</p>
                          <p className="text-xs font-bold text-slate-500">{match.person.category || 'other'}</p>
                        </td>
                        <td className="px-4 py-3 font-black text-omni-blue">
                          {match.person.total_engagement || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="m-0 text-lg font-black text-omni-ink">Unmatched</h2>
            <div className="mt-4 flex max-h-[420px] flex-wrap gap-2 overflow-auto">
              {(checkResult.unmatched || []).length === 0 ? (
                <p className="m-0 text-sm font-bold text-slate-500">Every pasted name matched.</p>
              ) : (
                checkResult.unmatched.map((name) => (
                  <span key={name} className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-bold text-red-700">
                    {name}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <h2 className="m-0 text-lg font-black text-omni-ink">Top engagers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Last</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topEngagers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center font-bold text-slate-500" colSpan={5}>
                      No engagement records found.
                    </td>
                  </tr>
                ) : (
                  topEngagers.map((person) => (
                    <tr key={person.id}>
                      <td className="px-4 py-3 font-black text-slate-900">{person.real_name}</td>
                      <td className="px-4 py-3 font-semibold capitalize text-slate-600">{person.category || 'other'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{person.company || '-'}</td>
                      <td className="px-4 py-3 font-black text-omni-blue">{person.total_engagement || 0}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{person.last_engagement || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="m-0 text-lg font-black text-omni-ink">Recent activity</h2>
          <div className="mt-4 grid gap-3">
            {recentActivity.length === 0 ? (
              <p className="m-0 text-sm font-bold text-slate-500">No recent activity found.</p>
            ) : (
              recentActivity.map((item, index) => (
                <div key={`${item.real_name}-${item.created_at}-${index}`} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="m-0 font-black text-slate-900">{item.real_name}</p>
                    <PlatformBadge>{item.platform}</PlatformBadge>
                  </div>
                  <p className="m-0 mt-1 text-sm font-semibold text-slate-500">
                    {item.engagement_count} engagement on {item.engagement_date}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </CmsShell>
  )
}
