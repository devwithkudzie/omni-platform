'use client'

export default function AssessmentModalButton({
  children,
  className,
  goal = '',
  context = null,
  step = '',
  ...rest
}) {
  function openModal() {
    if (step === 'meeting') {
      window.dispatchEvent(new CustomEvent('omni:open-discovery', {
        detail: { contact: {} },
      }))
      return
    }

    window.dispatchEvent(new CustomEvent('omni:open-assessment', {
      detail: { goal, context, step },
    }))
  }

  return (
    <button className={className} type="button" onClick={openModal} {...rest}>
      {children}
    </button>
  )
}
