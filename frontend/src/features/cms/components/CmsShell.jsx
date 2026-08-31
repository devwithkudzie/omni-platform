'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { adminLogout } from '../services/cmsApi'

const navItems = [
  { label: 'Insights', href: '/admin/blogs', desc: 'Posts and publishing' },
  { label: 'Social', href: '/admin/social', desc: 'Engagement tracking' },
  { label: 'Users', href: '/admin/users', desc: 'Roles and access' },
]

export default function CmsShell({ admin, title, subtitle, actions, children }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await adminLogout().catch(() => {})
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#eef3f8] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-[min(100%-32px,1440px)] flex-wrap items-center justify-between gap-4 py-3">
          <Link href="/admin/blogs" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-omni-blue">
              <img src="/logo.png" alt="" className="w-8" />
            </span>
            <span>
              <span className="block text-sm font-black text-omni-ink">OmniContact CMS</span>
              <span className="block text-xs font-bold text-slate-500">Content operations</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {admin && (
              <span className="hidden rounded-full bg-slate-100 px-3 py-2 font-bold text-slate-600 sm:inline">
                {admin.name || admin.email}
              </span>
            )}
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-omni-blue px-3 py-2 font-black text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-[min(100%-32px,1440px)] gap-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="grid gap-1" aria-label="CMS">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3 text-sm transition ${
                  pathname?.startsWith(item.href)
                    ? 'bg-omni-blue text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-omni-blue'
                }`}
              >
                <span className="block font-black">{item.label}</span>
                <span className={`mt-1 block text-xs font-semibold ${pathname?.startsWith(item.href) ? 'text-white/70' : 'text-slate-500'}`}>
                  {item.desc}
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="m-0 text-xs font-black uppercase tracking-wide text-slate-500">Session</p>
            <p className="mt-1 text-sm font-bold text-slate-700">
              {admin?.role ? admin.role.replace('_', ' ') : 'Checking access'}
            </p>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[clamp(2rem,2vw+1rem,3.25rem)] font-black tracking-tight text-omni-ink">{title}</h1>
              {subtitle && <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-600">{subtitle}</p>}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
