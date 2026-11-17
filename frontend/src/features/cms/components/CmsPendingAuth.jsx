export default function CmsPendingAuth({ label = 'Checking access…' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#eef3f8]">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <span
          className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-omni-blue"
          aria-hidden="true"
        />
        <p className="text-sm font-bold">{label}</p>
      </div>
    </div>
  )
}
