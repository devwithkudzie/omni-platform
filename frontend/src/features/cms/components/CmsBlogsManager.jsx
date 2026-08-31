'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import CmsShell from './CmsShell'
import { approveBlog, deleteAdminBlog, fetchAdminBlogs, fetchCurrentAdmin } from '../services/cmsApi'

const statusFilters = ['all', 'draft', 'published', 'archived']
const approvalFilters = ['all', 'pending', 'approved', 'rejected']

function Badge({ children, tone = 'slate' }) {
  const tones = {
    draft: 'bg-slate-100 text-slate-700',
    published: 'bg-emerald-100 text-emerald-800',
    archived: 'bg-zinc-100 text-zinc-700',
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black capitalize ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  )
}

export default function CmsBlogsManager() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [approvalFilter, setApprovalFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isManager = admin?.role === 'manager' || admin?.role === 'super_admin'

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const me = await fetchCurrentAdmin()
        const data = await fetchAdminBlogs()
        if (!mounted) return
        setAdmin(me)
        setBlogs(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.status === 401) {
          router.push('/admin/login')
          return
        }
        if (mounted) setError(err.message || 'Unable to load CMS posts.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const statusMatches = statusFilter === 'all' || blog.status === statusFilter
      const approvalMatches = approvalFilter === 'all' || (blog.approval_status || 'pending') === approvalFilter
      return statusMatches && approvalMatches
    })
  }, [approvalFilter, blogs, statusFilter])

  const stats = useMemo(() => ({
    total: blogs.length,
    published: blogs.filter((blog) => blog.status === 'published').length,
    drafts: blogs.filter((blog) => blog.status === 'draft').length,
    pending: blogs.filter((blog) => (blog.approval_status || 'pending') === 'pending').length,
  }), [blogs])

  async function refresh() {
    const data = await fetchAdminBlogs()
    setBlogs(Array.isArray(data) ? data : [])
  }

  async function handleDelete(blog) {
    if (!window.confirm(`Delete "${blog.title}"?`)) return

    try {
      await deleteAdminBlog(blog.id)
      setBlogs((current) => current.filter((item) => item.id !== blog.id))
    } catch (err) {
      alert(err.message || 'Unable to delete this post.')
    }
  }

  async function handleApproval(blog, action) {
    try {
      await approveBlog(blog.id, action)
      await refresh()
    } catch (err) {
      alert(err.message || 'Unable to update approval status.')
    }
  }

  if (loading) {
    return (
      <CmsShell title="Insights" subtitle="Loading CMS posts...">
        <div className="border border-slate-200 bg-white p-8 text-sm font-bold text-slate-600 shadow-sm">
          Loading posts...
        </div>
      </CmsShell>
    )
  }

  return (
    <CmsShell
      admin={admin}
      title="Insights"
      subtitle="Create, review, publish, and archive the posts that feed the public Insights pages."
      actions={
        <Link href="/admin/blogs/new" className="rounded-xl bg-omni-yellow px-5 py-3 text-sm font-black text-omni-ink shadow-sm">
          New post
        </Link>
      }
    >
      <section className="mb-5 grid gap-4 md:grid-cols-4">
        {[
          ['Total posts', stats.total],
          ['Published', stats.published],
          ['Drafts', stats.drafts],
          ['Pending review', stats.pending],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="m-0 text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
            <p className="m-0 mt-2 text-3xl font-black text-omni-ink">{value}</p>
          </div>
        ))}
      </section>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="mb-4 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-md px-3 py-2 text-sm font-black capitalize ${
                statusFilter === filter ? 'bg-omni-blue text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        {isManager && (
          <div className="flex flex-wrap gap-2 border-l border-slate-300 pl-3">
            {approvalFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setApprovalFilter(filter)}
                className={`rounded-md px-3 py-2 text-sm font-black capitalize ${
                  approvalFilter === filter ? 'bg-omni-blue text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                {isManager && <th className="px-4 py-3">Approval</th>}
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center font-bold text-slate-500" colSpan={isManager ? 7 : 6}>
                    No posts found.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="align-top">
                    <td className="max-w-[280px] px-4 py-4">
                      <p className="font-black text-slate-900">{blog.title}</p>
                      {blog.scheduled_publish_at && (
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          Scheduled: {new Date(blog.scheduled_publish_at).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-600">
                      {blog.author_name || blog.author_email || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-600">{blog.slug}</td>
                    <td className="px-4 py-4">
                      <Badge tone={blog.status}>{blog.status}</Badge>
                    </td>
                    {isManager && (
                      <td className="px-4 py-4">
                        <Badge tone={blog.approval_status || 'pending'}>{blog.approval_status || 'pending'}</Badge>
                        {(blog.approval_status || 'pending') === 'pending' && (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleApproval(blog, 'approve')}
                              className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-black text-white"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproval(blog, 'reject')}
                              className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-black text-white"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-4 font-semibold text-slate-600">
                      {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/blogs/${blog.id}/edit`}
                          className="rounded-md bg-slate-100 px-3 py-2 text-xs font-black text-omni-blue hover:bg-slate-200"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(blog)}
                          className="rounded-md bg-red-50 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </CmsShell>
  )
}
