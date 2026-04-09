import "../terms-and-conditions/terms.scss";
import PrivacySectionsPrimary from "./components/PrivacySectionsPrimary";
import PrivacySectionsSecondary from "./components/PrivacySectionsSecondary";

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <div className="legal-page__header">
          <h1 className="legal-page__title">Privacy Policy</h1>
          <p className="legal-page__updated">Last Updated: February 11, 2026</p>
        </div>

        <div className="legal-page__content">
          <PrivacySectionsPrimary />
          <PrivacySectionsSecondary />
        </div>
      </div>
    </div>
  );
}
