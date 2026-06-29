// Terms route wrapper using the shared legal content renderer.
import LegalContentPage from './legal/LegalContentPage';
import { TERMS_OF_USE_PAGE } from './legal/legalPageContent';

export default function TermsOfUsePage() {
  return <LegalContentPage page={TERMS_OF_USE_PAGE} />;
}
