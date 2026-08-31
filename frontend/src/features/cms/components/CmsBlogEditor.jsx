'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import CmsShell from './CmsShell'
import {
  createAdminBlog,
  fetchAdminBlogs,
  fetchCurrentAdmin,
  updateAdminBlog,
  uploadBlogImage,
} from '../services/cmsApi'

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  feature_image: '',
  content: '',
  status: 'draft',
  scheduled_publish_at: '',
}

export default function CmsBlogEditor({ postId }) {
  const router = useRouter()
  const isEditing = Boolean(postId)
  const [admin, setAdmin] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const me = await fetchCurrentAdmin()
        if (!mounted) return
        setAdmin(me)

        if (isEditing) {
          const posts = await fetchAdminBlogs()
          const post = posts.find((item) => String(item.id) === String(postId))

          if (!post) {
            router.push('/admin/blogs')
            return
          }

          setForm({
            title: post.title || '',
            slug: post.slug || '',
            excerpt: post.excerpt || '',
            feature_image: post.feature_image || '',
            content: post.content || '',
            status: post.status || 'draft',
            scheduled_publish_at: post.scheduled_publish_at || '',
          })
          setSlugTouched(true)
        }
      } catch (err) {
        if (err.status === 401) {
          router.push('/admin/login')
          return
        }
        if (mounted) setError(err.message || 'Unable to load the editor.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [isEditing, postId, router])

  const previewHtml = useMemo(() => ({ __html: form.content || '<p>No content yet.</p>' }), [form.content])

  function updateField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'title' && !slugTouched) {
        next.slug = createSlug(value)
      }
      return next
    })

    if (name === 'slug') {
      setSlugTouched(true)
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setSaving(true)
    try {
      const result = await uploadBlogImage(file)
      if (result?.url) {
        updateField('feature_image', result.url)
      }
    } catch (err) {
      setError(err.message || 'Image upload failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.title.trim() || !form.slug.trim()) {
      setError('Title and slug are required.')
      return
    }

    setSaving(true)
    try {
      if (isEditing) {
        await updateAdminBlog(postId, form)
      } else {
        await createAdminBlog(form)
      }
      router.push('/admin/blogs')
    } catch (err) {
      setError(err.message || 'Unable to save this post.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <CmsShell title={isEditing ? 'Edit post' : 'New post'} subtitle="Loading editor...">
        <div className="border border-slate-200 bg-white p-8 text-sm font-bold text-slate-600 shadow-sm">
          Loading editor...
        </div>
      </CmsShell>
    )
  }

  return (
    <CmsShell
      admin={admin}
      title={isEditing ? 'Edit post' : 'New post'}
      subtitle="Write and publish Insights content from the CMS database."
      actions={
        <Link href="/admin/blogs" className="rounded-md bg-white px-4 py-3 text-sm font-black text-omni-blue shadow-sm">
          Back to posts
        </Link>
      }
    >
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]" onSubmit={handleSubmit}>
        <section className="grid gap-5 border border-slate-200 bg-white p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-black text-slate-700">
            Title
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              className="min-h-12 rounded-md border border-slate-300 px-3 text-base font-bold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-slate-700">
              Slug
              <input
                value={form.slug}
                onChange={(event) => updateField('slug', createSlug(event.target.value))}
                className="min-h-12 rounded-md border border-slate-300 px-3 font-semibold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Status
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                className="min-h-12 rounded-md border border-slate-300 px-3 font-semibold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Excerpt
            <textarea
              value={form.excerpt}
              onChange={(event) => updateField('excerpt', event.target.value)}
              rows={4}
              className="rounded-md border border-slate-300 px-3 py-3 font-semibold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-[1fr_auto]">
            <label className="grid gap-2 text-sm font-black text-slate-700">
              Feature image URL
              <input
                value={form.feature_image}
                onChange={(event) => updateField('feature_image', event.target.value)}
                className="min-h-12 rounded-md border border-slate-300 px-3 font-semibold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
              />
            </label>
            <label className="grid content-end gap-2 text-sm font-black text-slate-700">
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="block min-h-12 max-w-[220px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Scheduled publish date
            <input
              type="datetime-local"
              value={form.scheduled_publish_at || ''}
              onChange={(event) => updateField('scheduled_publish_at', event.target.value)}
              className="min-h-12 rounded-md border border-slate-300 px-3 font-semibold outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Content HTML
            <textarea
              value={form.content}
              onChange={(event) => updateField('content', event.target.value)}
              rows={18}
              className="rounded-md border border-slate-300 px-3 py-3 font-mono text-sm outline-none focus:border-omni-blue focus:ring-2 focus:ring-omni-blue/20"
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
            <Link href="/admin/blogs" className="rounded-md bg-slate-100 px-5 py-3 text-sm font-black text-slate-700">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-omni-yellow px-5 py-3 text-sm font-black text-omni-ink disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save post'}
            </button>
          </div>
        </section>

        <aside className="h-fit border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-omni-ink">Preview</h2>
          {form.feature_image && (
            <img src={form.feature_image} alt="" className="mt-4 aspect-video w-full rounded-md object-cover" />
          )}
          <h3 className="mt-4 text-2xl font-black leading-tight text-slate-950">{form.title || 'Untitled post'}</h3>
          {form.excerpt && <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{form.excerpt}</p>}
          <div
            className="prose prose-sm mt-5 max-w-none text-slate-700"
            dangerouslySetInnerHTML={previewHtml}
          />
        </aside>
      </form>
    </CmsShell>
  )
}
