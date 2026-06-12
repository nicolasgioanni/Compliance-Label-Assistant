import { Fragment } from 'react';
import {
  ABOUT_DISCLAIMER,
  ABOUT_HERO,
  ABOUT_SECTION_GROUPS,
  DOCUMENTATION_LINKS,
  buildDocumentationUrl,
} from './about/aboutContent';

export default function AboutPage() {
  return (
    <section className="static-page about-page" aria-labelledby="about-page-title">
      <div className="panel about-page__panel">
        <div className="about-page__scroll">
          <AboutHero />

          {ABOUT_SECTION_GROUPS.map((group) => (
            <AboutSectionGroup group={group} key={group.title} />
          ))}

          <AboutDisclaimer />
          <DocumentationLinks />
        </div>
      </div>
    </section>
  );
}

function AboutHero() {
  return (
    <header className="about-page__hero">
      <h1 id="about-page-title">{ABOUT_HERO.title}</h1>
      <p className="static-page__subtitle">{ABOUT_HERO.subtitle}</p>
      <p className="static-page__description">{ABOUT_HERO.description}</p>
      <div className="landing-info-panel__divider about-page__divider" role="separator" aria-hidden="true" />
    </header>
  );
}

function AboutSectionGroup({ group }) {
  const groupId = getSectionId(group.title);

  return (
    <section className="about-section-group" aria-labelledby={groupId}>
      <h2 id={groupId}>{group.title}</h2>
      <div className="about-section-grid">
        {group.sections.map((section) => (
          <InfoCard section={section} key={section.title} />
        ))}
      </div>
    </section>
  );
}

function InfoCard({ section }) {
  const sectionId = getSectionId(section.title);

  return (
    <article className="about-card" aria-labelledby={sectionId}>
      <h3 id={sectionId}>{section.title}</h3>
      <p>{renderRichText(section.body)}</p>
      {section.items?.length ? (
        <ul>
          {section.items.map((item, itemIndex) => (
            <li key={`${section.title}-${itemIndex}`}>{renderRichText(item)}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function AboutDisclaimer() {
  const groupId = getSectionId(ABOUT_DISCLAIMER.sectionTitle);
  const cardId = getSectionId(ABOUT_DISCLAIMER.title);

  return (
    <section className="about-section-group about-disclaimer-group" aria-labelledby={groupId}>
      <h2 id={groupId}>{ABOUT_DISCLAIMER.sectionTitle}</h2>
      <article className="about-disclaimer" aria-labelledby={cardId}>
        <h3 id={cardId}>{ABOUT_DISCLAIMER.title}</h3>
        <p>{ABOUT_DISCLAIMER.body}</p>
        <ul>
          {ABOUT_DISCLAIMER.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function DocumentationLinks() {
  return (
    <section className="about-section-group about-docs-group" aria-labelledby="about-docs-title">
      <h2 id="about-docs-title">Repository Documentation</h2>
      <div className="about-docs__links">
        {DOCUMENTATION_LINKS.map((link) => (
          <a
            className="about-docs__link"
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
    </section>
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
        <code className="about-inline-code" key={`code-${part.code}-${index}`}>
          {part.code}
        </code>
      );
    }

    if (part.href) {
      const isExternal = part.href.startsWith('http');

      return (
        <a
          className="about-inline-link"
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

function getSectionId(title) {
  return `about-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}
