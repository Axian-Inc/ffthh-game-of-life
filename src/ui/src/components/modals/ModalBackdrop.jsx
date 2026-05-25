import { useEffect, useRef } from 'react'

const ModalBackdrop = ({ onBackdropClick, children }) => {
  const overlayRef = useRef(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) {
      return undefined
    }

    const focusableSelector =
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    const getFocusable = () =>
      Array.from(overlay.querySelectorAll(focusableSelector)).filter(
        (element) => !element.hasAttribute('disabled'),
      )
    const getPreferredFocus = () => overlay.querySelector('[data-autofocus="true"]')

    const preferredFocus = getPreferredFocus()
    if (preferredFocus && !preferredFocus.hasAttribute('disabled')) {
      preferredFocus.focus()
    } else {
      const focusable = getFocusable()
      if (focusable.length) {
        focusable[0].focus()
      }
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') {
        return
      }
      const items = getFocusable()
      if (!items.length) {
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    overlay.addEventListener('keydown', handleKeyDown)
    return () => overlay.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onBackdropClick}
    >
      {children}
    </div>
  )
}

export default ModalBackdrop
