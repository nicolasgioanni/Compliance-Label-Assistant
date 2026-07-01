// Privacy route wrapper using the shared legal content renderer.
import LegalContentPage from './legal/LegalContentPage';
import { PRIVACY_POLICY_PAGE } from './legal/legalPageContent';

export default function PrivacyPolicyPage() {
  return <LegalContentPage page={PRIVACY_POLICY_PAGE} />;
}
