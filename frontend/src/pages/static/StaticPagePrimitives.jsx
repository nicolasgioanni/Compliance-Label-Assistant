export function StaticPageShell({ actions, actionsLabel, children, className = '', titleId }) {
  const pageClassName = ['static-page', className].filter(Boolean).join(' ');

  return (
    <section className={pageClassName} aria-labelledby={titleId}>
      <div className="panel static-page__panel">
        <div className="static-page__scroll">{children}</div>
      </div>

      {actions?.length ? <StaticActions actions={actions} label={actionsLabel} /> : null}
    </section>
  );
}

export function StaticPageHeader({ eyebrow, lead, meta, title, titleId }) {
  return (
    <header className="static-page__header">
      {eyebrow ? <p className="static-page__eyebrow">{eyebrow}</p> : null}
      <h1 id={titleId}>{title}</h1>
      {meta ? <p className="static-page__meta">{meta}</p> : null}
      {lead ? <p className="static-page__lead">{lead}</p> : null}
      <div className="static-page__divider" role="separator" aria-hidden="true" />
    </header>
  );
}

export function StaticSection({ children, className = '', idPrefix = 'static-section', title }) {
  const sectionId = buildStaticId(idPrefix, title);
  const sectionClassName = ['static-section', className].filter(Boolean).join(' ');

  return (
    <section className={sectionClassName} aria-labelledby={sectionId}>
      <h2 id={sectionId}>{title}</h2>
      {children}
    </section>
  );
}

export function StaticCardGrid({ children, className = '' }) {
  const gridClassName = ['static-card-grid', className].filter(Boolean).join(' ');

  return <div className={gridClassName}>{children}</div>;
}

export function StaticInfoCard({
  body,
  className = '',
  idPrefix = 'static-card',
  items,
  renderContent = renderDefaultContent,
  title,
}) {
  const cardId = buildStaticId(idPrefix, title);
  const cardClassName = ['static-info-card', className].filter(Boolean).join(' ');

  return (
    <article className={cardClassName} aria-labelledby={cardId}>
      <h3 id={cardId}>{title}</h3>
      {body ? <p>{renderContent(body)}</p> : null}
      {items?.length ? (
        <ul>
          {items.map((item, itemIndex) => (
            <li key={`${title}-${itemIndex}`}>{renderContent(item)}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function StaticCallout({
  body,
  className = '',
  idPrefix = 'static-callout',
  items,
  renderContent = renderDefaultContent,
  title,
}) {
  const calloutId = buildStaticId(idPrefix, title);
  const calloutClassName = ['static-callout', className].filter(Boolean).join(' ');

  return (
    <aside className={calloutClassName} aria-labelledby={calloutId}>
      <h3 id={calloutId}>{title}</h3>
      {body ? <p>{renderContent(body)}</p> : null}
      {items?.length ? (
        <ul>
          {items.map((item, itemIndex) => (
            <li key={`${title}-${itemIndex}`}>{renderContent(item)}</li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

export function StaticTable({ table }) {
  return (
    <div className="static-table-wrapper">
      <table className="static-table">
        <thead>
          <tr>
            {table.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cell} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={cell}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StaticActions({ actions, label = 'Static page actions' }) {
  return (
    <div className="verification-actions static-page__actions" aria-label={label}>
      {actions.map((action) => {
        const isExternal = action.external ?? action.href.startsWith('http');

        return (
          <a
            className="primary-button static-page__button"
            href={action.href}
            key={action.href}
            rel={isExternal ? 'noreferrer noopener' : undefined}
            target={isExternal ? '_blank' : undefined}
          >
            {action.label}
          </a>
        );
      })}
    </div>
  );
}

export function buildStaticId(prefix, title) {
  return `${prefix}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function renderDefaultContent(content) {
  return content;
}
