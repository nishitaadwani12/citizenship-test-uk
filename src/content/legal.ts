/**
 * In-app legal copy. Also mirrored in PRIVACY.md / TERMS.md at the repo root so
 * you can host the Privacy Policy at a public URL (required by both stores).
 *
 * TODO (you): replace CONTACT_EMAIL and COMPANY, set EFFECTIVE_DATE, and host
 * the privacy policy so you can paste its URL into App Store Connect / Play
 * Console. Have a lawyer review before launch.
 */
export const COMPANY = 'the app publisher';
export const CONTACT_EMAIL = 'support@example.com';
export const EFFECTIVE_DATE = '2026-09-22';

export interface LegalDocument {
  title: string;
  updated: string;
  paragraphs: string[];
}

export const DISCLAIMER: LegalDocument = {
  title: 'About & Disclaimer',
  updated: EFFECTIVE_DATE,
  paragraphs: [
    'This is an unofficial study aid to help you prepare for the Life in the UK Test.',
    'It is not affiliated with, endorsed by, or connected to the UK Home Office, UK Visas and Immigration, or His Majesty’s Government.',
    'Questions are practice material based on publicly available handbook topics and are not the actual exam questions. Always refer to official government guidance for authoritative information.',
    `For support, contact ${CONTACT_EMAIL}.`,
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  updated: EFFECTIVE_DATE,
  paragraphs: [
    `This Privacy Policy explains how ${COMPANY} ("we") handles your information in this app. Effective ${EFFECTIVE_DATE}.`,
    'Information we collect: your account identifier (email address or phone number) when you sign up, and your study progress (practice and mock-exam results). If you sign in with Google or Apple, we receive the basic profile information you approve.',
    'How we use it: to create and secure your account, save your progress across sessions, provide the study features, and process subscriptions.',
    'Third-party services: authentication is handled by Google Firebase; sign-in may use Google or Apple; subscriptions are processed by the Apple App Store or Google Play. These providers process data under their own privacy policies. We do not sell your personal data.',
    'Data retention and deletion: your data is kept while your account exists. You can delete your account at any time from Settings → Delete account, which removes your account and associated data.',
    'Children: this app is not directed at children under 13 and we do not knowingly collect their data.',
    'Changes: we may update this policy and will revise the date above. Continued use means you accept the changes.',
    `Contact: ${CONTACT_EMAIL}.`,
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  updated: EFFECTIVE_DATE,
  paragraphs: [
    `By using this app you agree to these Terms. Effective ${EFFECTIVE_DATE}.`,
    'Licence: we grant you a personal, non-transferable licence to use the app for your own study.',
    'Subscriptions: premium features are offered as auto-renewing subscriptions (weekly or 3-monthly). Payment is charged to your App Store or Google Play account at confirmation. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your store account settings.',
    'Refunds are handled by the Apple App Store or Google Play under their policies.',
    'Acceptable use: do not misuse, copy, or attempt to disrupt the app.',
    'No warranty: the app is provided "as is" as a study aid and does not guarantee any exam outcome. It is not official government material.',
    'Changes: we may update these Terms and will revise the date above.',
    `Contact: ${CONTACT_EMAIL}.`,
  ],
};
