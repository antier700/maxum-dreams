import { memo } from "react";
import { SettingsTabKey } from "../hooks/useSettingsPage";

type Props = {
  activeTab: SettingsTabKey;
  onChange: (tab: SettingsTabKey) => void;
};

function SettingsTabs({ activeTab, onChange }: Props) {
  return (
    <div className="investor-settings__tabs">
      <button type="button" className={activeTab === "profile" ? "active" : ""} onClick={() => onChange("profile")}>
        Profile
      </button>
      <button type="button" className={activeTab === "security" ? "active" : ""} onClick={() => onChange("security")}>
        Security Settings
      </button>
      <button type="button" className={activeTab === "referral" ? "active" : ""} onClick={() => onChange("referral")}>
        Referral
      </button>
    </div>
  );
}

export default memo(SettingsTabs);
