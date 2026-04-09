"use client";

import { Container } from "react-bootstrap";
import "@/app/(private)/settings/settings.scss";
import SettingsTabs from "./components/SettingsTabs";
import ProfileTab from "./components/ProfileTab";
import SecurityTab from "./components/SecurityTab";
import ReferralTab from "./components/ReferralTab";
import SettingsModals from "./components/SettingsModals";
import { useSettingsPage } from "./hooks/useSettingsPage";

export default function SettingsPage() {
  const state = useSettingsPage();

  return (
    <>
      <Container className="investor-settings">
        <div className="investor-settings__card">
          <SettingsTabs activeTab={state.activeTab} onChange={state.setActiveTab} />
          {state.activeTab === "profile" && <ProfileTab isLoadingProfile={state.isLoadingProfile} formik={state.formik} />}
          {state.activeTab === "security" && (
            <SecurityTab
              is2FAEnabled={state.is2FAEnabled}
              onToggle2FA={state.handleToggle2FA}
              onChangePassword={() => state.setShowChangePasswordModal(true)}
            />
          )}
          {state.activeTab === "referral" && <ReferralTab userProfile={state.userProfile} />}
        </div>
      </Container>
      <SettingsModals
        show2FAModal={state.show2FAModal}
        setShow2FAModal={state.setShow2FAModal}
        showVerifyAuthModal={state.showVerifyAuthModal}
        setShowVerifyAuthModal={state.setShowVerifyAuthModal}
        show2FAOffModal={state.show2FAOffModal}
        setShow2FAOffModal={state.setShow2FAOffModal}
        showChangePasswordModal={state.showChangePasswordModal}
        setShowChangePasswordModal={state.setShowChangePasswordModal}
        showVerifyCodeModal={state.showVerifyCodeModal}
        setShowVerifyCodeModal={state.setShowVerifyCodeModal}
        on2FAContinue={state.handle2FAContinue}
        on2FAVerifySubmit={state.handle2FAVerifySubmit}
        on2FATurnOff={state.handle2FATurnOff}
        onChangePasswordSubmit={state.handleChangePasswordSubmit}
      />
    </>
  );
}
