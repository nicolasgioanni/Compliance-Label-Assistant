// Structured privacy and terms content that avoids overclaiming prototype compliance.
export const PRIVACY_POLICY_PAGE = {
  className: 'privacy-page',
  eyebrow: 'Prototype Transparency',
  title: 'Privacy Policy',
  effectiveDate: 'Effective date: June 28, 2026',
  description:
    'This page explains how Compliance Label Assistant processes information in the current prototype. It is provided for transparency and does not replace legal advice.',
  sections: [
    {
      title: 'Prototype Overview',
      paragraphs: [
        'Compliance Label Assistant is an independent prototype that helps compare alcohol label artwork with expected application fields. It is not an official TTB, Treasury, government, or COLA system, and it does not provide legal or regulatory advice.',
        'The prototype is intended for demonstration and evaluation. Human review is required before relying on any verification result.',
      ],
    },
    {
      title: 'AI Use Disclosure',
      paragraphs: [
        'This prototype uses AI to extract information from uploaded label images. AI-generated extraction results may be incomplete or inaccurate and should be reviewed by a human before any compliance decision.',
        'The app uses deterministic backend comparison rules after extraction. The AI provider is not the source of final pass or fail decisions.',
      ],
    },
    {
      title: 'Information Processed',
      paragraphs: ['The current application code processes these categories only when they are part of the user workflow:'],
      items: [
        'Uploaded label image files selected by the user.',
        'User-entered expected label or application field values.',
        'AI extraction results returned from the backend provider workflow.',
        'Verification results, status values, timing fields, and export rows shown in the browser.',
        'Technical request data needed to serve frontend files and backend API responses.',
      ],
    },
    {
      title: 'Data Practices Summary',
      paragraphs: [
        'This table summarizes current prototype behavior. It is not an official platform privacy label.',
      ],
      table: {
        headers: ['Data Category', 'Processed?', 'Purpose', 'Stored by this app?', 'Shared with third parties?'],
        rows: [
          [
            'Uploaded label images',
            'Yes, when selected and submitted',
            'Browser queue, preview, backend validation, preprocessing, and extraction',
            'Not intentionally persisted by application code after request processing',
            'May be sent to OpenAI for extraction when verification runs',
          ],
          [
            'User-entered expected fields',
            'Yes',
            'Compare expected values with extracted label fields',
            'Held in browser state and sent with verification requests; no application database is implemented',
            'Processed by the backend; not sent to the AI provider by the current extraction request',
          ],
          [
            'AI extraction results',
            'Yes',
            'Display extracted values and support deterministic comparison',
            'Held in browser state with queue results; no persistent result store is implemented',
            'Returned by OpenAI through the backend provider workflow',
          ],
          [
            'Verification results',
            'Yes',
            'Show field statuses, reasons, timing, and exportable summaries',
            'Held in browser state; exports are generated locally by the browser',
            'No third-party sharing is implemented by application code',
          ],
          [
            'Browser or device technical data',
            'Limited',
            'Serve static frontend files and backend API responses',
            'Application code does not create a user profile or analytics store',
            'May be handled by the hosting platforms that serve the app and API',
          ],
          [
            'Cookies, local storage, and session storage',
            'No current app use found',
            'Not used by current application code',
            'Not applicable',
            'Not applicable',
          ],
          [
            'Analytics or tracking data',
            'No current app use found',
            'No analytics or tracking library is included in current application code',
            'Not applicable',
            'Not applicable',
          ],
        ],
      },
    },
    {
      title: 'How Information Is Used',
      paragraphs: [
        'Uploaded files and expected fields are used to provide the selected verification result. The backend validates and preprocesses images, extracts visible label fields, compares extracted fields with expected fields, and returns structured results to the browser.',
        'Current exports are generated in the browser from queue results. They include status and timing fields, not uploaded images or raw provider payloads.',
      ],
    },
    {
      title: 'Third-Party Provider Processing',
      paragraphs: [
        'The backend uses OpenAI provider code to extract visible label fields from preprocessed label images. Provider credentials are configured only on the backend and are not exposed to frontend code.',
        'The current OpenAI extraction request sends the preprocessed image and extraction instructions to the provider, uses store=false in application code, and parses the structured response for downstream verification.',
      ],
    },
    {
      title: 'Retention',
      paragraphs: [
        'The application code does not intentionally persist uploaded label images or extracted verification results after request processing. The browser keeps queued files, expected fields, and results in local React state while the page session is active.',
        'The backend uses minimal unexpected-error logging by exception class name. Current application logging does not intentionally log image bytes, base64 image payloads, full uploaded payloads, provider keys, or full environment dumps.',
        'Production retention requirements for platform logs, operations, and legal obligations need review before production use.',
      ],
    },
    {
      title: 'Cookies, Local Storage, and Analytics',
      paragraphs: [
        'Current frontend source does not use cookies, localStorage, sessionStorage, service workers, or analytics/tracking libraries. No cookie banner is included because the current app code does not use non-essential cookies or tracking.',
      ],
    },
    {
      title: 'Security',
      paragraphs: [
        'Provider secrets are read from backend environment variables and should not be placed in frontend code or frontend deployment settings. Users should not upload sensitive, confidential, personal, unlawful, infringing, or regulated information unless they are authorized to do so.',
        'This prototype is not production-hardened for government, restricted-network, or sensitive-data use. A production system would need further review for access control, audit logging, retention, monitoring, approved provider usage, and operational controls.',
      ],
    },
    {
      title: 'Privacy Rights Note',
      paragraphs: [
        'Some privacy laws may provide rights depending on where you live and how a service is operated. This prototype is not intended as a production consumer service. Before production use, privacy obligations should be reviewed against applicable law.',
      ],
    },
    {
      title: 'Children',
      paragraphs: [
        'This prototype is not directed to children.',
      ],
    },
    {
      title: 'Contact',
      paragraphs: [
        'For privacy questions, contact ngioanni@uw.edu.',
      ],
    },
    {
      title: 'Changes',
      paragraphs: [
        'This policy may be updated as the prototype changes, especially if data storage, providers, deployment, analytics, accounts, or production operations are added later.',
      ],
    },
  ],
};

export const TERMS_OF_USE_PAGE = {
  className: 'terms-page',
  eyebrow: 'Prototype Terms',
  title: 'Terms of Use',
  effectiveDate: 'Effective date: June 28, 2026',
  description:
    'These terms describe acceptable use of the current Compliance Label Assistant prototype. They are written for transparency and should be reviewed before any production or commercial use.',
  sections: [
    {
      title: 'Acceptance of Terms',
      paragraphs: [
        'By using this prototype, you agree to these Terms of Use. If you do not agree, do not use the prototype.',
      ],
    },
    {
      title: 'Prototype Purpose',
      paragraphs: [
        'Compliance Label Assistant is an independent prototype that assists with alcohol label verification by comparing uploaded label artwork with expected application fields. It is not an official TTB, Treasury, government, or COLA system.',
        'The prototype is not a production compliance decision engine and does not issue final legal, regulatory, or compliance determinations.',
      ],
    },
    {
      title: 'Human Review Required',
      paragraphs: [
        'AI-assisted extraction and automated verification may be incomplete, inaccurate, or unsuitable for a particular label. Results must be reviewed by a qualified human before any compliance decision.',
        'The prototype does not provide legal, regulatory, or compliance advice.',
      ],
    },
    {
      title: 'User Submissions and Uploaded Content',
      paragraphs: [
        'You are responsible for the images, filenames, and expected field values you submit. Only upload content that you have the rights, permission, or authorization to use with this prototype.',
        'Do not upload confidential, sensitive, personal, unlawful, infringing, or regulated content unless you are authorized to do so and the prototype environment is appropriate for that use.',
        'The project does not claim ownership of uploaded content. You grant a limited permission to process uploaded content only as needed to operate the prototype and provide verification results.',
        'Current application code does not publicly display uploaded content and does not intentionally persist uploaded files after request processing.',
      ],
    },
    {
      title: 'Prohibited Uses',
      items: [
        'Do not upload content you do not have rights or authorization to use.',
        'Do not upload sensitive, confidential, personal, unlawful, infringing, or regulated information unless authorized.',
        'Do not attempt to misuse, disrupt, reverse engineer, overload, or bypass limits of the prototype.',
        'Do not rely on the prototype as final legal, regulatory, compliance, approval, certification, or enforcement authority.',
      ],
    },
    {
      title: 'Third-Party Services',
      paragraphs: [
        'The backend uses OpenAI provider code to process preprocessed label images for extraction. Use of the prototype may depend on availability and behavior of that provider and the deployment platforms serving the frontend and backend.',
        'Provider keys, account details, and deployment credentials are not included in frontend code and should not be disclosed in public project materials.',
      ],
    },
    {
      title: 'Intellectual Property',
      paragraphs: [
        'The app source code and repository materials remain governed by the project license and related repository notices. The License page summarizes the current project license, and the repository LICENSE file controls the code license.',
        'Uploaded content remains yours or the respective owner\'s content, subject to the limited processing permission described above.',
      ],
    },
    {
      title: 'No Warranty',
      paragraphs: [
        'The prototype is provided as-is and as available for demonstration and evaluation. It may contain errors, omissions, interruptions, or inaccurate results.',
      ],
    },
    {
      title: 'Limitation of Liability',
      paragraphs: [
        'To the extent permitted by applicable law, the project maintainers are not responsible for losses or damages arising from use of, inability to use, or reliance on the prototype, including reliance on AI extraction or verification results.',
      ],
    },
    {
      title: 'Service Availability',
      paragraphs: [
        'The prototype may change, break, become unavailable, or be discontinued without notice. It does not include production support, monitoring, service-level commitments, account recovery, or official review workflows.',
      ],
    },
    {
      title: 'Dispute Terms / Legal Review Placeholder',
      paragraphs: [
        'No detailed mandatory arbitration or class-action waiver is included for this take-home prototype. Formal dispute-resolution terms, including any arbitration clause, should be reviewed by counsel before production or commercial use.',
      ],
    },
    {
      title: 'Copyright Contact',
      paragraphs: [
        'This prototype does not operate as a public user-content hosting platform. If you believe content made available through this project infringes your rights, contact ngioanni@uw.edu.',
      ],
    },
    {
      title: 'Changes',
      paragraphs: [
        'These terms may be updated as the prototype changes.',
      ],
    },
    {
      title: 'Contact',
      paragraphs: [
        'For questions, contact ngioanni@uw.edu.',
      ],
    },
  ],
};
