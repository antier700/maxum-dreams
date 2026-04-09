"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { CopyIcon, InstagramIcon, LinkedinIcon, TelegramIcon, TwitterIcon, WhatsappIcon } from "@/assets/icons/svgIcon";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import toast from "react-hot-toast";
import { emailFieldSchema } from "@/constants/validation";

type Props = {
  userProfile: any;
};

function buildSignupPath(referralCode: string) {
  const q = referralCode ? `?referral=${encodeURIComponent(referralCode)}` : "";
  return `/signup${q}`;
}

function ReferralTabInner({ userProfile }: Props) {
  const [inviteEmail, setInviteEmail] = useState("");

  const referralCode = useMemo(() => {
    const fromApi = userProfile?.referralCode;
    if (typeof fromApi === "string" && fromApi.length > 0) return fromApi;
    const id = userProfile?.id != null ? String(userProfile.id) : "";
    return id ? `MAX${id.slice(-8).toUpperCase()}` : "";
  }, [userProfile?.referralCode, userProfile?.id]);

  const origin = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "") || "";
  }, []);

  const referralLink = useMemo(() => {
    if (!origin) return "";
    return `${origin}${buildSignupPath(referralCode)}`;
  }, [origin, referralCode]);

  const shareText = useMemo(
    () => encodeURIComponent(`Join me on Maxum — use my referral link: ${referralLink}`),
    [referralLink]
  );
  const shareUrl = useMemo(() => encodeURIComponent(referralLink), [referralLink]);

  const openShare = useCallback((url: string) => {
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const copyText = useCallback(async (label: string, text: string) => {
    if (!text) {
      toast.error("Nothing to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }, []);

  const sendEmailInvite = useCallback(() => {
    const trimmed = inviteEmail.trim();
    try {
      emailFieldSchema().validateSync(trimmed);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "errors" in e && Array.isArray((e as { errors: string[] }).errors)
          ? (e as { errors: string[] }).errors[0]
          : e instanceof Error
            ? e.message
            : "Invalid email";
      toast.error(msg);
      return;
    }
    const subject = encodeURIComponent("You're invited to join");
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to invite you to sign up using my referral link:\n${referralLink || "(link unavailable)"}\n\nReferral code: ${referralCode || "—"}\n`
    );
    window.location.href = `mailto:${encodeURIComponent(trimmed)}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app…");
  }, [inviteEmail, referralCode, referralLink]);

  return (
    <div className="investor-settings__content">
      <div className="referral-grid">
        <div className="referral-banner">
          <div className="referral-banner__content">
            <h3 className="referral-banner__title">Share with Friends and Family</h3>
            <p className="referral-banner__desc">
              Spread the word and share the benefits! Invite your friends and family to join, and enjoy exclusive rewards
              together. Let&apos;s grow this community and unlock amazing opportunities!
            </p>
          </div>
          <div className="referral-banner__img">
            <img src="/images/referral_img.png" alt="Referral illustration" />
          </div>
        </div>

        <div className="referral-share">
          <h4 className="referral-share__title">Share this on</h4>
          <div className="referral-share__buttons">
            <button
              type="button"
              className="share-btn"
              onClick={() => openShare(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`)}
            >
              <TelegramIcon /> Telegram
            </button>
            <button
              type="button"
              className="share-btn"
              onClick={() => openShare(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`)}
            >
              <TwitterIcon /> Twitter
            </button>
            <button
              type="button"
              className="share-btn"
              onClick={() => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`)}
            >
              <LinkedinIcon /> Linkedin
            </button>
            <button
              type="button"
              className="share-btn"
              onClick={() => openShare(`https://wa.me/?text=${shareText}`)}
            >
              <WhatsappIcon /> Whatsapp
            </button>
            <button type="button" className="share-btn" onClick={() => openShare("https://www.instagram.com/")}>
              <InstagramIcon /> Instagram
            </button>
          </div>
        </div>
      </div>

      <div className="referral-fields mt-4">
        <div className="referral-field referral-field-right">
          <InputField
            label="Email"
            name="referralEmail"
            type="email"
            placeholder="Enter Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            righttext={
              <CommonButton title="Send Invite" type="button" className="send-invite-btn" onClick={sendEmailInvite} />
            }
          />
        </div>
        <div className="referral-field referral-field-right">
          <InputField
            label="Referral Code"
            name="referralCodeDisplay"
            value={referralCode || "—"}
            disabled
            readOnly
            righttext={<CopyIcon />}
            righttextOnclick={() => copyText("Referral code", referralCode)}
          />
        </div>
        <div className="referral-field referral-field-right">
          <InputField
            label="Referral Link"
            name="referralLinkDisplay"
            value={referralLink || "—"}
            disabled
            readOnly
            righttext={<CopyIcon />}
            righttextOnclick={() => copyText("Referral link", referralLink)}
          />
        </div>
      </div>
    </div>
  );
}

const ReferralTab = memo(ReferralTabInner);
export default ReferralTab;
