// License route wrapper around static Apache 2.0 summary content.
import {
  LICENSE_ACTIONS,
  LICENSE_DISCLAIMER,
  LICENSE_DISCLAIMER_LABEL,
  LICENSE_INTRO,
  LICENSE_SUMMARY_SECTIONS,
} from './license/licenseContent';
import { StaticCardGrid, StaticInfoCard, StaticPageHeader, StaticPageShell } from './static/StaticPagePrimitives';

const LICENSE_PAGE_TITLE_ID = 'license-page-title';

export default function LicensePage() {
  return (
    <StaticPageShell
      actions={LICENSE_ACTIONS}
      actionsLabel="License page actions"
      className="license-page"
      titleId={LICENSE_PAGE_TITLE_ID}
    >
      <StaticPageHeader
        eyebrow="OPEN SOURCE LICENSE"
        lead={LICENSE_INTRO}
        title="License"
        titleId={LICENSE_PAGE_TITLE_ID}
      />

      <StaticCardGrid>
        {LICENSE_SUMMARY_SECTIONS.map((section) => (
          <StaticInfoCard body={section.body} items={section.items} key={section.title} title={section.title} />
        ))}
      </StaticCardGrid>

      <p className="static-page__disclaimer">
        <strong className="static-page__disclaimer-label">{LICENSE_DISCLAIMER_LABEL}</strong> {LICENSE_DISCLAIMER}
      </p>
    </StaticPageShell>
  );
}
