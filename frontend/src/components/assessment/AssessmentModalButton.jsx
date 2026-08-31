'use client'

export default function AssessmentModalButton({
  children,
  className,
  goal = '',
  context = null,
  step = '',
}) {
  function openModal() {
    window.dispatchEvent(new CustomEvent('omni:open-assessment', {
      detail: { goal, context, step },
    }))
  }

  return (
    <button className={className} type="button" onClick={openModal}>
      {children}
    </button>
  )
}
