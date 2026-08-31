'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import CmsShell from './CmsShell'
import { createUser, deleteUser, fetchCurrentAdmin, fetchUsers, updateUser } from '../services/cmsApi'

const emptyForm = {
  id: null,
  name: '',
  email: '',
  role: 'author',
  password: '',
}

function roleLabel(role) {
  return role === 'super_admin' ? 'Super admin' : role?.replace('_', ' ') || 'Author'
}

function roleClasses(role) {
  if (role === 'super_admin') return 'bg-omni-blue text-white'
  if (role === 'manager') return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-700'
}

export default function CmsUsersManager() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isEditing = Boolean(form.id)
  const canDelete = admin?.role === 'super_admin'

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const me = await fetchCurrentAdmin()
        if (!['super_admin', 'manager'].includes(me.role)) {
          router.push('/admin/blogs')
          return
        }
        const data = await fetchUsers()
        if (!mounted) return
        setAdmin(me)
        setUsers(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.status === 401) {
          router.push('/admin/login')
          return
        }
        if (mounted) setError(err.message || 'Unable to load users.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  const stats = useMemo(() => {
    return {
      total: users.length,
      superAdmins: users.filter((user) => user.role === 'super_admin').length,
      managers: users.filter((user) => user.role === 'manager').length,
      authors: users.filter((user) => user.role === 'author').length,
    }
  }, [users])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function editUser(user) {
    setNotice('')
    setError('')
    setForm({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'author',
      password: '',
    })
  }

  function resetForm() {
    setForm(emptyForm)
    setError('')
  }

  async function refresh() {
    const data = await fetchUsers()
    setUsers(Array.isArray(data) ? data : [])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        ...(form.password ? { password: form.password } : {}),
      }

      if (isEditing) {
        await updateUser(form.id, payload)
        setNotice('User updated.')
      } else {
        await createUser(payload)
        setNotice('User created.')
      }

      resetForm()
      await refresh()
    } catch (err) {
      setError(err.message || 'Unable to save user.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.email}?`)) return

    setError('')
    setNotice('')
    try {
      await deleteUser(user.id)
      setNotice('User deleted.')
      await refresh()
    } catch (err) {
      setError(err.message || 'Unable to delete user.')
    }
  }

  if (loading) {
    return (
      <CmsShell title="Users" subtitle="Loading users...">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-600 shadow-sm">
          Loading users...
        </div>
      </CmsShell>
    )
  }

  return (
    <CmsShell
      admin={admin}
      title="Users"
      subtitle="Create admins, assign roles, and keep publishing access tidy."
      actions={
        <button type="button" onClick={resetForm} className="rounded-xl bg-omni-yellow px-5 py-3 text-sm font-black text-omni-ink">
          New user
        </button>
      }
    >
      <section className="mb-5 grid gap-4 md:grid-cols-4">
        {[
          ['Total users', stats.total],
          ['Super admins', stats.superAdmins],
          ['Managers', stats.managers],
          ['Authors', stats.authors],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="m-0 text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
            <p className="m-0 mt-2 text-3xl font-black text-omni-ink">{value}</p>
          </div>
        ))}
      </section>

      {(error || notice) && (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm font-bold ${
            error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="m-0 text-lg font-black text-omni-ink">Team access</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td className="px-5 py-4">
                      <p className="m-0 font-black text-slate-900">{user.name || 'Unnamed user'}</p>
                      <p className="m-0 mt-1 text-xs font-bold text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${roleClasses(user.role)}`}>
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editUser(user)}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-omni-blue"
                        >
                          Edit
                        </button>
                        {canDelete && user.id !== admin?.id && (
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="m-0 text-lg font-black text-omni-ink">{isEditing ? 'Edit user' : 'Create user'}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Managers can create authors. Super admins can assign any role.
          </p>

          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-black text-slate-700">
              Name
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 px-3 font-semibold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
                className="min-h-11 rounded-xl border border-slate-300 px-3 font-semibold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Role
              <select
                value={form.role}
                onChange={(event) => updateField('role', event.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 px-3 font-semibold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
              >
                <option value="author">Author</option>
                <option value="manager">Manager</option>
                {admin?.role === 'super_admin' && <option value="super_admin">Super admin</option>}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              {isEditing ? 'New password' : 'Password'}
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                required={!isEditing}
                placeholder={isEditing ? 'Leave blank to keep current' : ''}
                className="min-h-11 rounded-xl border border-slate-300 px-3 font-semibold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
              />
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 flex-1 rounded-xl bg-omni-yellow px-4 font-black text-omni-ink disabled:opacity-60"
              >
                {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create user'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="rounded-xl bg-slate-100 px-4 font-black text-slate-700">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>
      </div>
    </CmsShell>
  )
}
