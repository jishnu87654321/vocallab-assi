/**
 * @typedef {Object} ProspectContact
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} jobTitle
 * @property {string} companyDomain
 */

/**
 * Identifies the seniority tier based on job title.
 * @param {string} title
 * @returns {'c-suite' | 'vp' | 'head-of' | 'general'}
 */
function getSeniorityTier(title) {
  const cleanTitle = String(title || '').toLowerCase();
  if (
    cleanTitle.includes('ceo') ||
    cleanTitle.includes('cto') ||
    cleanTitle.includes('cfo') ||
    cleanTitle.includes('coo') ||
    cleanTitle.includes('cmo') ||
    cleanTitle.includes('founder') ||
    cleanTitle.includes('co-founder') ||
    cleanTitle.includes('owner') ||
    cleanTitle.includes('president') ||
    cleanTitle.includes('managing director')
  ) {
    return 'c-suite';
  }
  if (cleanTitle.includes('vp') || cleanTitle.includes('vice president')) {
    return 'vp';
  }
  if (cleanTitle.includes('head') || cleanTitle.includes('director')) {
    return 'head-of';
  }
  return 'general';
}

/**
 * Generates personalized cold outreach emails branded for ReachFlow.
 * Pure function: does not mutate inputs, returns a fresh object.
 * @param {ProspectContact} contact
 * @returns {{ subject: string, htmlBody: string, textBody: string }}
 */
export function generateEmail(contact) {
  const { firstName, jobTitle, companyDomain } = contact;
  const senderName = process.env.SENDER_NAME || 'Jishnu';
  const senderEmail = process.env.SENDER_EMAIL || 'hello@reachflow.fit';
  const tier = getSeniorityTier(jobTitle);

  // Deterministic subject selection via hash
  const hash = (String(firstName || '').charCodeAt(0) || 0) + (String(companyDomain || '').charCodeAt(0) || 0);

  const subjects = {
    'c-suite': [
      `Helping ${companyDomain} accelerate outbound pipeline`,
      `A quick question about growth at ${companyDomain}`,
      `Strategic collaboration — ${companyDomain}`,
      `Reaching out re: ${companyDomain}'s expansion`
    ],
    'vp': [
      `Scaling pipeline velocity at ${companyDomain}`,
      `Unlocking outbound ROI for ${companyDomain}`,
      `A smarter outreach channel for ${companyDomain}`,
      `Growing ${companyDomain}'s top-of-funnel, automatically`
    ],
    'head-of': [
      `Outbound ideas for ${firstName}'s team at ${companyDomain}`,
      `Boosting lead quality at ${companyDomain}`,
      `Quick question about ${companyDomain}'s outreach`,
      `Automating qualified pipeline for ${companyDomain}`
    ],
    'general': [
      `Connecting with ${companyDomain} about outbound automation`,
      `Intro: Smarter outreach for ${companyDomain}`,
      `Quick question for ${firstName}`,
      `Outbound optimization at ${companyDomain}`
    ]
  };

  const subject = subjects[tier][hash % subjects[tier].length];

  // Email body parts
  const intros = [
    `Hi ${firstName}, I noticed you're ${jobTitle} at ${companyDomain} and wanted to reach out directly.`,
    `Hi ${firstName}, I came across your profile as ${jobTitle} at ${companyDomain} and was impressed by what your team is building.`,
    `Hi ${firstName}, reaching out because I believe what we're working on could be genuinely useful for your role as ${jobTitle} at ${companyDomain}.`
  ];

  const valueProps = [
    `We've built ReachFlow — a fully automated outbound engine that identifies, qualifies, and reaches decision-makers at companies similar to yours. It handles everything from lookalike discovery to email dispatch, with zero manual effort.`,
    `ReachFlow eliminates the manual work in outbound sales: we automatically find lookalike companies, identify the right contacts, validate their emails, and send personalized outreach — all in one pipeline.`,
    `Our platform, ReachFlow, automates the entire prospecting cycle: from finding companies similar to ${companyDomain} to reaching their decision-makers with personalised, verified outreach at scale.`
  ];

  const ctas = [
    `Would you have 10 minutes this week for a quick call?`,
    `Would you be open to a short demo to see if it's a fit?`,
    `Happy to share a live example of what we've run — would that be useful?`
  ];

  const intro = intros[hash % intros.length];
  const valueProp = valueProps[hash % valueProps.length];
  const cta = ctas[hash % ctas.length];

  const textBody = [
    intro,
    '',
    valueProp,
    '',
    cta,
    '',
    `Best,`,
    senderName,
    `ReachFlow | ${senderEmail}`,
    `https://www.reachflow.fit`
  ].join('\n');

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6d28d9 0%,#4f46e5 100%);padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">⚡ ReachFlow</span>
                  </td>
                  <td align="right">
                    <span style="color:rgba(255,255,255,0.7);font-size:13px;">reachflow.fit</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;color:#111827;font-size:16px;line-height:1.7;">${intro}</p>
              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.7;">${valueProp}</p>
              <p style="margin:0 0 32px;color:#374151;font-size:16px;line-height:1.7;">${cta}</p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:linear-gradient(135deg,#6d28d9,#4f46e5);">
                    <a href="https://www.reachflow.fit" target="_blank" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      See ReachFlow in action →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Signature -->
          <tr>
            <td style="padding:0 40px 32px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:24px;">
              <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">
                Best,<br>
                <strong style="color:#111827;">${senderName}</strong><br>
                <span style="color:#6b7280;font-size:14px;">ReachFlow &nbsp;·&nbsp; <a href="mailto:${senderEmail}" style="color:#6d28d9;text-decoration:none;">${senderEmail}</a></span>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                You received this email because your profile matched our outreach criteria.<br>
                <a href="mailto:${senderEmail}?subject=Unsubscribe" style="color:#9ca3af;">Unsubscribe</a> &nbsp;·&nbsp;
                <a href="https://www.reachflow.fit" style="color:#9ca3af;">ReachFlow</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject,
    htmlBody,
    textBody
  };
}

export default generateEmail;
