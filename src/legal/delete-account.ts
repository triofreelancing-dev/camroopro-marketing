/**
 * Account & data deletion — the public URL required by Play Console
 * (App content -> Data safety -> "Delete account URL") and by App Store Connect.
 *
 * Unlike terms.ts / privacy.ts this is NOT extracted from the app: it describes
 * the request process and the server-side outcome. Its source of truth is
 * `camroopro-user-be/src/modules/me/services/account-deletion.service.ts` — if
 * that cascade changes, the "what is kept" section below must change with it,
 * because Play requires this page to state exactly what survives deletion.
 */
import type { LegalBlock } from './types';

export const DELETE_ACCOUNT_BLOCKS: LegalBlock[] = [
  {
    kind: 'title',
    text: 'Delete your Camaroo account and data',
  },
  {
    kind: 'body',
    text:
      'Camaroo is operated by CAMROO Pro. This page explains how to request deletion of your Camaroo account and the personal data associated with it, what is deleted, and what is kept.',
  },
  {
    kind: 'heading',
    text: '1. Delete your account from inside the app',
  },
  {
    kind: 'body',
    text:
      'Open Camaroo and sign in.\n\nGo to Profile, then Settings, then Delete Account.\n\nType DELETE to confirm, then tap Delete My Account.\n\nYour account is deleted immediately. There is no grace period and no way to restore it.\n\nIf you have an active paid subscription, Camaroo will ask you to cancel it first (Settings, then Subscription). Once it is cancelled, return to Delete Account and confirm again.',
  },
  {
    kind: 'heading',
    text: '2. Request deletion by email',
  },
  {
    kind: 'body',
    text:
      'If you cannot sign in — for example you have lost access to your registered mobile number or email — write to support@camroopro.com from the email address on your Camaroo account, with the subject "Delete my account".\n\nInclude the mobile number or email you registered with so we can identify the account. We may ask you to confirm ownership before deleting, because deletion is permanent. We complete verified requests within 30 days.',
  },
  {
    kind: 'heading',
    text: '3. Data that is deleted permanently',
  },
  {
    kind: 'body',
    text:
      'Your account and login credentials.\n\nYour profile, including your name, mobile number, email address, biography, business details, working locations, profile picture and cover picture. Image and video files are removed from our media storage.\n\nYour portfolio posts and their media, together with the comments and likes on them, and any comments or likes you left on other people\'s posts.\n\nYour applications to opportunities posted by others.\n\nYour availability calendar, course progress, video progress, quiz records, certificates, quotations and generated quotation PDFs, and course enquiries.\n\nYour subscription records, payment history, course purchases and course transaction records.\n\nYour notifications, your follower and following relationships, and the referral records you created.\n\nYour push notification token, so the app can no longer send you notifications.',
  },
  {
    kind: 'heading',
    text: '4. Data that is kept, with your identity removed',
  },
  {
    kind: 'body',
    text:
      'Some records belong to other users as much as to you, so deleting them outright would destroy someone else\'s history. These are kept, but your name and account are detached from them and they can no longer be traced back to you:\n\nOpportunities you posted are closed and anonymised, so that the people who applied to them keep their own application history.\n\nMarketplace and rental listings you created are deactivated and anonymised, as are the transaction records of anyone who bought from or rented through you.\n\nApplications you reviewed as an opportunity poster keep the decision, without your identity as the reviewer.\n\nChat conversations and messages are removed from your side and are no longer accessible to you. The other participant keeps their own copy of the conversation, in the same way that messages you sent them cannot be recalled once received.\n\nWhere you joined through someone else\'s referral link, your link to that referral is removed while the referrer keeps the record that a referral occurred. That record also keeps the identifier of the device you signed up on, no longer linked to you, so that the same handset cannot claim the same reward again through a newly created account. We use it for that check alone.\n\nThese anonymised records are retained for as long as the Platform operates. Apart from the device identifier described above, they contain no data that identifies you.',
  },
  {
    kind: 'heading',
    text: '5. Deleting only part of your data',
  },
  {
    kind: 'body',
    text:
      'You do not have to delete your account to remove individual content. While signed in you can delete portfolio posts and their media, marketplace and rental listings, quotations, chat messages and conversations, and you can clear your profile and business details by editing your profile.\n\nTo have specific data removed that you cannot delete yourself, write to support@camroopro.com describing what you want removed. We respond to verified requests within 30 days.',
  },
  {
    kind: 'heading',
    text: '6. What we may keep for legal reasons',
  },
  {
    kind: 'body',
    text:
      'Where a law applicable to us requires it — for example tax and accounting records for payments we processed, or records we must preserve for an ongoing dispute, fraud investigation or lawful request from an authority — we keep the minimum data needed, for no longer than the law requires, and use it for no other purpose.',
  },
  {
    kind: 'heading',
    text: '7. Contact',
  },
  {
    kind: 'body',
    text:
      'CAMROO Pro\n\nVrundavan Nivas, 3rd Floor, S. No. 46/2, Near Shantai Nagar, Charwad Wasti, Wadgaon, Pune City, Pune, Maharashtra 411041, India\n\nsupport@camroopro.com',
  },
];
