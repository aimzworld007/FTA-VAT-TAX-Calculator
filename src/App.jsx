import React from 'react';
import { TaxDashboard } from './features/tax/TaxDashboard';
import { StaticPage } from './features/static/StaticPage';
import { AppFooter } from './features/layout/AppFooter';
import { usePathname } from './components/Router';
import './styles.css';
import './styles/print.css';

const importantLinks = [
  'FTA Login: https://eservices.tax.gov.ae/#/Logon',
  'VAT Guidelines: https://tax.gov.ae/en/taxes/Vat/vat.topics.aspx',
  'Corporate Tax Guidelines: https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx',
  'FTA YouTube: https://www.youtube.com/@uaetax',
];

const pages = {
  '/privacy-policy': {
    title: 'Privacy Policy',
    intro: 'This Privacy Policy explains how information is handled within this UAE Tax Calculator.',
    sections: [
      { heading: 'Information Collection and Use', paragraphs: ['The application is designed to collect only the information needed for tax calculation workflows, return preparation support, and locally saved records. We do not require FTA login credentials for calculator operation.'] },
      { heading: 'Data Accuracy and Responsibility', paragraphs: ['Users are responsible for the completeness, legality, and accuracy of all data entered into the system. Calculation outputs depend entirely on user-provided information.'] },
      { heading: 'Confidential Data and Credentials', items: ['Do not enter, upload, or share UAE FTA account usernames, passwords, or other portal credentials inside this application.', 'Users should avoid storing sensitive authentication details in notes or free-text fields.'] },
      { heading: 'Security and Handling', paragraphs: ['Data should be protected and handled securely by users and administrators. Appropriate device, browser, and access controls should be maintained to protect confidential tax records.'] },
      { heading: 'Assistant Scope', paragraphs: ['This system is a calculation assistant and record-preparation tool only. It is not an official Federal Tax Authority portal or filing gateway.'] },
    ],
  },
  '/terms': {
    title: 'Terms & Conditions',
    intro: 'By using this system, you agree to the terms set out below.',
    sections: [
      { heading: 'Nature of the Service', paragraphs: ['This system is a UAE VAT and Corporate Tax calculation assistant. It is designed to help users organize and estimate VAT return and corporate tax figures.'] },
      { heading: 'No Official Filing Replacement', paragraphs: ['This system is not a replacement for the official UAE Federal Tax Authority portal. Users must verify all figures and final declarations before any submission.'] },
      { heading: 'User Responsibility and Compliance', paragraphs: ['Users are fully responsible for tax filing actions, penalties, late fees, incorrect submissions, and all compliance decisions. Users must ensure that filings meet all applicable UAE legal and regulatory requirements.'] },
      { heading: 'Limitation of Liability', paragraphs: ['The app owner and developer are not responsible for any penalties, fines, losses, damages, or legal consequences caused by incorrect data entry, wrong filing, missed deadlines, or misuse of the system.'] },
      { heading: 'Regulatory Reference', paragraphs: ['The system aims to follow UAE FTA rules and regulations; however, users must always refer to the latest official FTA guidance and make independent professional judgments before filing.'] },
    ],
  },
  '/documentation': {
    title: 'Documentation',
    intro: 'Use this guide to complete VAT and Corporate Tax workflows accurately and consistently.',
    sections: [
      { heading: 'Overview', paragraphs: ['The UAE Tax Calculator provides guided workflows for VAT return preparation and Corporate Tax estimates, with draft saving and printable summaries.'] },
      { heading: 'How to use VAT Return Wizard', items: ['Enter business and filing period details.', 'Provide sales and purchase values by month or period as requested.', 'Review computed output VAT, input VAT, and net VAT position before export.'] },
      { heading: 'VAT Inclusive vs VAT Exclusive', paragraphs: ['VAT Exclusive mode assumes entered amounts do not include VAT. VAT Inclusive mode treats entered values as VAT-inclusive and extracts taxable base and VAT automatically. Select the correct mode in Workspace Settings before data entry.'] },
      { heading: 'Corporate Tax Estimate', paragraphs: ['Enter revenue, income adjustments, deductible and non-deductible expense values. The assistant estimates taxable income and tax payable according to configured rules.'] },
      { heading: 'Printing / PDF Export', paragraphs: ['Use the built-in export and print controls to generate a clean record for review. Always confirm figures against source accounting records before filing.'] },
      { heading: 'Important FTA Links', items: importantLinks },
      { heading: 'Disclaimer', paragraphs: ['This tool supports calculation and record preparation only and does not submit returns to the FTA. It should be used with professional review and official guidance.'] },
      { heading: 'Frequently Asked Questions', items: ['Q: Does this app file VAT or Corporate Tax returns automatically? A: No, filing must be done through official channels.', 'Q: Can I rely on the estimate without review? A: No, all values should be reviewed and validated before submission.', 'Q: Where should I confirm rule changes? A: Always check the latest publications on the official UAE FTA website.'] },
    ],
  },
};

export default function App() {
  const { pathname } = usePathname();
  const page = pages[pathname];

  return (
    <>
      {page ? <StaticPage {...page} /> : <TaxDashboard />}
      <AppFooter />
    </>
  );
}
