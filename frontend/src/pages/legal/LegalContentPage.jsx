// Shared legal/static page renderer for privacy and terms content objects.
import {
  StaticPageHeader,
  StaticPageShell,
  StaticSection,
  StaticTable,
} from '../static/StaticPagePrimitives';

export default function LegalContentPage({ page }) {
  const titleId = `${page.className}-title`;

  return (
    <StaticPageShell className={`legal-page ${page.className}`} titleId={titleId}>
      <StaticPageHeader
        eyebrow={page.eyebrow}
        lead={page.description}
        meta={page.effectiveDate}
        title={page.title}
        titleId={titleId}
      />

      <div className="legal-page__sections">
        {page.sections.map((section) => (
          <LegalSection key={section.title} section={section} />
        ))}
      </div>
    </StaticPageShell>
  );
}

function LegalSection({ section }) {
  return (
    <StaticSection className="legal-page__section" idPrefix="legal-section" title={section.title}>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.items?.length ? (
        <ul>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {section.table ? <StaticTable table={section.table} /> : null}
    </StaticSection>
  );
}
