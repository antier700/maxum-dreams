import { ReactNode } from 'react'
import { Modal } from 'react-bootstrap'
import "./CommonModal.scss"
import { CrossIcon } from '@/assets/icons/svgIcon'
interface CommonModals {
  show?: boolean
  handleClose?: () => void
  heading?: ReactNode
  className?: string
  variant?: 'small' | 'large'
  children?: ReactNode
  backdropClassName?: string
  backdrop?: any
  msg?: string
}
const CommonModal = (props: CommonModals) => {
  return (
    <>
      <Modal
        show={props.show}
        onHide={props.handleClose}
        centered
        backdropClassName={props.backdropClassName}
        backdrop={props?.backdrop}
        className={`${props.className} ${props.variant} commonModal`}
      >
        {props.heading && (
          <Modal.Header>
            <Modal.Title>
              <h4>{props.heading}</h4>
              {props?.msg && <h6 className='text-danger'>{props?.msg}</h6>}
            </Modal.Title>
          </Modal.Header>
        )}
        <button onClick={props.handleClose} className="modal_close_btn">
          <CrossIcon />
        </button> 
        <Modal.Body>{props?.children}</Modal.Body>
      </Modal>
    </>
  )
}

export default CommonModal
