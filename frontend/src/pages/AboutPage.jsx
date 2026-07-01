// About route renderer for structured project and documentation content.
import { Fragment } from 'react';
import {
  ABOUT_HERO,
  ABOUT_SECTION_GROUPS,
  DOCUMENTATION_LINKS,
  buildDocumentationUrl,
} from './about/aboutContent';
import {
  StaticCallout,
  StaticCardGrid,
  StaticInfoCard,
  StaticPageHeader,
  StaticPageShell,
  StaticSection,
} from './static/StaticPagePrimitives';

const ABOUT_PAGE_TITLE_ID = 'about-page-title';

export default function AboutPage() {
  return (
    <StaticPageShell className="about-page" titleId={ABOUT_PAGE_TITLE_ID}>
      <StaticPageHeader
        eyebrow={ABOUT_HERO.eyebrow}
        lead={ABOUT_HERO.lead}
        title={ABOUT_HERO.title}
        titleId={ABOUT_PAGE_TITLE_ID}
      />

      {ABOUT_SECTION_GROUPS.map((group) => (
        <AboutSectionGroup group={group} key={group.title} />
      ))}

      <DocumentationLinks />
    </StaticPageShell>
  );
}

function AboutSectionGroup({ group }) {
  return (
    <StaticSection className="about-section-group" idPrefix="about-section" title={group.title}>
      <StaticCardGrid>
        {group.sections.map((section) => (
          <InfoCard section={section} key={section.title} />
        ))}
      </StaticCardGrid>

      {group.callouts?.map((callout) => (
        <StaticCallout
          body={callout.body}
          idPrefix="about-callout"
          items={callout.items}
          key={callout.title}
          renderContent={renderRichText}
          title={callout.title}
        />
      ))}
    </StaticSection>
  );
}

function InfoCard({ section }) {
  return (
    <StaticInfoCard
      body={section.body}
      items={section.items}
      renderContent={renderRichText}
      title={section.title}
    />
  );
}

function DocumentationLinks() {
  return (
    <StaticSection className="about-docs-group" idPrefix="about-section" title="Documentation">
      <div className="static-doc-grid">
        {DOCUMENTATION_LINKS.map((link) => (
          <a
            className="static-doc-link"
            href={buildDocumentationUrl(link.path)}
            key={link.path}
            target="_blank"
            rel="noreferrer noopener"
          >
            <span>{link.label}</span>
            <code>{link.path}</code>
            <small>{link.summary}</small>
          </a>
        ))}
      </div>
    </StaticSection>
  );
}

function renderRichText(content) {
  const parts = Array.isArray(content) ? content : [content];

  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return <Fragment key={`text-${index}`}>{part}</Fragment>;
    }

    if (part.code) {
      return (
        <code className="static-inline-code" key={`code-${part.code}-${index}`}>
          {part.code}
        </code>
      );
    }

    if (part.href) {
      const isExternal = part.href.startsWith('http');

      return (
        <a
          className="static-inline-link"
          href={part.href}
          key={`${part.href}-${index}`}
          rel={isExternal ? 'noreferrer noopener' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {part.label}
        </a>
      );
    }

    return null;
  });
}
