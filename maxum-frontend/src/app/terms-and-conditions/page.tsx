import "./terms.scss";
import TermsSectionsPrimary from "./components/TermsSectionsPrimary";
import TermsSectionsSecondary from "./components/TermsSectionsSecondary";

export default function TermsAndConditionsPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <div className="legal-page__header">
          <h1 className="legal-page__title">Terms & Conditions</h1>
          <p className="legal-page__updated">Last Updated: February 11, 2026</p>
        </div>

        <div className="legal-page__content">
          <TermsSectionsPrimary />
          <TermsSectionsSecondary />
        </div>
      </div>
    </div>
  );
}
