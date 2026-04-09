
import React from 'react'
import CommonModal from '../CommonModal'
import './DeleteModal.scss'
import CommonButton from '../../ui/commonButton/CommonButton'
import { DeleteIcon } from '@/assets/icons/svgIcon'

export const DeleteModal = ({ show, handleClose }: any) => {
  return (
    <CommonModal
      show={show}
      handleClose={handleClose}
      backdropClassName="transaction_modal_bckdrop"
      backdrop="static"
      className="common_deleteModal"
      heading={''}
    >
      <div className="common_deleteModal_content text-center">
        <div className='circle-border'>
          <DeleteIcon />
        </div>
        <h3 className='black-gradient-text'>Delete Application</h3>
        <p>Do you really want to delete this application.</p>
        <div className='d-flex justify-content-center gap-3'>
          <CommonButton
            title="Delete"
            onClick={handleClose}
            className='border-btn'
          />
          <CommonButton
            title="Cancel"
            onClick={handleClose}
          />
        </div>
      </div>
    </CommonModal>
  )
}
