const ModalBackdrop = ({ onBackdropClick, children }) => (
  <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onBackdropClick}>
    {children}
  </div>
)

export default ModalBackdrop
