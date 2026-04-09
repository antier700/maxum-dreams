
import React from 'react'
import CommonModal from '../CommonModal'
import './ApplicationSuccessfullyModal.scss'
import { CopyIcon } from '@/assets/icons/svgIcon'

export const ApplicationSuccessfullyModal = ({ show, handleClose }: any) => {
  return (
    <CommonModal
      show={show}
      handleClose={handleClose}
      backdropClassName="transaction_modal_bckdrop"
      backdrop="static"
      className="common_applicationSuccessfullyModal"
      heading={''}
    >
      <div className="commonContentModal">
        <p className='text-center'>Application submitted successfully!</p>
        <ul className="applications-details">
          <li>
            <p>API Key</p>
            <div className="d-flex align-items-center gap-2">
              <span>71d4ihLek26LjB0XO...qbc8</span>
              <button className="copy-icon"><CopyIcon /></button>
            </div>
          </li>
          <li>
            <p>Secret Key</p>
            <div className="d-flex align-items-center gap-2">
              <span>71d4ihLek26LjB0XO...qbc8</span>
              <button className="copy-icon"><CopyIcon /></button>
            </div>
          </li>
        </ul>
      </div>
    </CommonModal>
  )
}
