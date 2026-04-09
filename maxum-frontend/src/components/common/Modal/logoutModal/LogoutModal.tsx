import React from "react";
import CommonModal from "../CommonModal";
import "./LogoutModal.scss";
import CommonButton from "../../ui/commonButton/CommonButton";
import { LogoutIcon } from "@/assets/icons/svgIcon";
import toast from "react-hot-toast";

export const LogoutModal = ({ show, handleClose }: any) => {
  // const router = useRouter();
  const { logout } =({logout: () => {}});
  const handleLogout = () => {
    logout();
    toast.success("Logout Successfully");
    handleClose();
  };
  return (
    <CommonModal
      show={show}
      handleClose={handleClose}
      backdropClassName="transaction_modal_bckdrop"
      backdrop="static"
      className="common_logoutModal"
      heading={""}
    >
      <div className="common_logoutModal_content text-center">
        <div className="circle-border">
          <LogoutIcon />
        </div>
        <h3 className="black-gradient-text">Logout</h3>
        <p>Do you really want to logout the platform.</p>
        <div className="d-flex justify-content-center gap-3">
          <CommonButton
            title="Yes"
            onClick={handleLogout}
            className="border-btn"
          />
          <CommonButton title="No" onClick={handleClose} />
        </div>
      </div>
    </CommonModal>
  );
};
