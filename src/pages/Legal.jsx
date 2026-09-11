import { useEffect } from "react";
import { applyPageSeo, suspendBaseSiteSchema } from "../lib/pageSeo";

const PAGE_DATA = {
  privacy: {
    heading: "Privacy Policy",
    title: "Privacy Policy | FaturaPro",
    description: "How FaturaPro handles account, invoice, payment, referral and support data, including GDPR rights and EU data hosting information.",
    path: "/privacy",
    sections: [
      ["1. Who We Are and How to Contact Us", "FaturaPro is the data controller for the online invoicing service available at faturapro.app. The service is operated from the Netherlands. This policy explains what we collect, why we use it and what you can ask us to do with it. Privacy requests can be sent to support@faturapro.app."],
      ["2. Data We Collect", "Account data includes your email address and any business details you add, such as a name, address, tax number and logo. Content data includes invoices, credit notes, quotes, clients, expenses, amounts and descriptions you enter. Ambassador data includes application details, tracking codes, aggregate activity, attributed accounts, eligible subscription payments, commission and payout records. We also record a small set of account-activation events, such as starting or creating an invoice, creating a client, quote or expense, and returning to the app on a later day. These events contain a timestamp and limited context such as the source screen or currency; they do not copy invoice text, client contact details or document contents. We also process support messages and limited technical data needed to operate, secure and improve the service. We do not ask for or store bank-login details, and we do not sell personal data."],
      ["3. Purposes and Legal Bases", "We process account and document data to provide the service you request and perform our contract with you. We process limited security, support and product-activation data for our legitimate interests in protecting accounts, preventing abuse, diagnosing errors, understanding whether customers can reach the core invoicing workflow and improving reliability. We keep records where required by tax, accounting or other law. Optional analytics that require consent run only after you choose to allow them, and you may withdraw that choice."],
      ["4. Data Location and Security", "Account, invoice and customer data handled by Supabase is stored in its European Union region in Ireland. Connections to the service are encrypted in transit. No internet service can promise absolute security, so keep your password private and retain any records your business is required to keep."],
      ["5. Payments", "Stripe processes subscription payments, client card payments and ambassador payout onboarding where those features are used. FaturaPro does not store full card numbers or bank-login details. Client invoice payments settle through the business owner's connected Stripe account. We retain the identifiers and status data needed to connect those transactions to the correct account."],
      ["6. Support Assistant", "Messages sent to the in-app support assistant are processed to answer the question and may be stored for support, security and service improvement. The assistant uses Anthropic as an AI-processing provider. Do not paste passwords, card numbers, private API keys or other sensitive credentials into chat. You can ask us to remove support-chat history associated with your account."],
      ["7. Cookies, Referral Attribution and Analytics", "Strictly necessary storage keeps sessions and preferences working. A first-party referral code and anonymous click identifier may be kept for up to thirty days after someone follows a member or ambassador link. Ambassadors see aggregate counts rather than referred customers' names or email addresses. Minimal authenticated activation events are stored with the account in Supabase so we can measure whether onboarding works without storing document contents in analytics. Vercel Analytics measures product and page use. Microsoft Clarity is optional and loads only after analytics consent. We do not sell personal data or use advertising cookies."],
      ["8. Service Providers and International Transfers", "Supabase provides authentication and database hosting; Vercel provides website hosting, serverless functions and analytics; Stripe processes subscription payments, connected client payments and ambassador payout onboarding; Resend delivers transactional email; Anthropic processes support-assistant messages; and Microsoft Clarity provides optional session analytics after consent. These providers receive only the data needed for their role. Some may process data outside the European Economic Area under their published terms and applicable transfer safeguards. We may also disclose limited information when law requires it."],
      ["9. Retention", "Account data and documents are kept while the account is active. Referral records are kept for attribution, fraud prevention and commission administration. Payment, security or dispute records may be retained for the period required by law or needed to establish or defend claims. Other personal data is removed or de-identified when it is no longer needed for the purposes described here. You may request account deletion, subject to those limited retention duties."],
      ["10. Your GDPR Rights", "Where the GDPR applies, you can request access, correction, deletion, portability or restriction, object to processing based on legitimate interests, and withdraw consent where processing relies on consent. Requests are free unless the law permits otherwise, and we may need to verify your identity. You may complain to your national data-protection authority; in the Netherlands this is the Autoriteit Persoonsgegevens."],
      ["11. Automated Decisions", "FaturaPro does not use personal data to make solely automated decisions that produce legal or similarly significant effects. Automated checks may be used to limit abuse, protect forms and attribute referrals, but material account or ambassador decisions can be reviewed by a person."],
      ["12. Children", "The service is intended for businesses and professionals and is not directed at children under sixteen. We do not knowingly collect their personal data."],
      ["13. Changes", "If this policy changes, we will update the date on this page. We will use email or an in-app notice when a change materially affects how account data is handled."],
      ["14. Contact", "For privacy questions, rights requests or concerns, email support@faturapro.app."],
    ],
  },
  terms: {
    heading: "Terms of Service",
    title: "Terms of Service | FaturaPro",
    description: "Terms for using FaturaPro invoicing software, including plans, subscriptions, account responsibilities and service availability.",
    path: "/terms",
    sections: [
      ["1. Acceptance", "By using FaturaPro, you agree to these Terms of Service. If you do not agree, do not use the service."],
      ["2. Service Description", "FaturaPro provides online invoicing software for freelancers, small businesses and agencies. Features and limits are shown on the pricing page and may require Free, Pro or Business. Business quotes can be saved, previewed, printed or saved as PDF, and converted to invoices. Opening an email for a quote does not attach or send the PDF automatically; the user must review and attach it in their own mail app. Payment reminders are prepared for you to review and send. Recurring schedules create pending invoices for review; they do not send invoices unattended."],
      ["3. Account Responsibility", "You are responsible for your account credentials, the accuracy and legality of the content you enter, and all activity performed through your account. Keep your sign-in details private and tell us promptly if you suspect unauthorised access."],
      ["4. Payments and Subscriptions", "Pro is billed monthly at €9 and Business at €19 through Stripe. Stripe checkout shows the amount before purchase. You can manage or cancel a subscription from the billing portal, and cancellation normally stops renewal at the end of the current paid period. Contact support@faturapro.app if you believe a charge is incorrect."],
      ["5. Free Plan and Trial", "The Free plan is subject to the limits shown on the pricing page. New accounts receive a seven-day trial of Pro features and do not need a card for that trial. When it ends, the account uses the Free plan unless a paid subscription is active."],
      ["6. Your Content and Data", "You keep ownership of the business and document content you enter. You give FaturaPro the limited permission needed to host, process, back up and display that content to provide the service. Personal data is handled as described in the Privacy Policy."],
      ["7. Invoice and Tax Responsibility", "You are responsible for reviewing every document and determining the invoice, tax, accounting and retention rules that apply to your business and customers. UBL/XML export is intended for EN 16931 workflows, but receiving systems can require additional profiles and validation. FaturaPro does not provide Peppol delivery or submit tax returns."],
      ["8. Prohibited Use", "Do not use FaturaPro for unlawful activity, spam, fraud, malware, infringement, unauthorised access or content that violates another person's rights. Do not interfere with the service or attempt to bypass plan, access or security controls."],
      ["9. Service Availability", "We work to keep the service available and reliable but cannot promise uninterrupted or error-free operation. Keep copies of records that your business or local law requires you to retain, and verify exported documents before relying on them."],
      ["10. Intellectual Property", "FaturaPro, its interface, branding and original software remain protected by applicable intellectual-property law. These terms do not transfer ownership of the service or its branding to you. You may use documents created from your own content for your business."],
      ["11. Suspension and Termination", "We may suspend or end access where an account violates these terms, creates a security or legal risk, or remains unpaid. You may cancel a paid subscription through the billing portal and request account deletion through support."],
      ["12. Changes", "We may update the service or these terms. When a change materially affects existing users, we will provide an appropriate notice. Continued use after the effective date means the updated terms apply, except where law requires a different form of agreement."],
      ["13. Governing Rules", "These terms are governed by the laws of the Netherlands, without taking away any mandatory rights that applicable law gives you. Courts with jurisdiction under applicable law may hear disputes that cannot be resolved directly."],
      ["14. Contact", "For questions about these terms or a billing concern, email support@faturapro.app."],
    ],
  },
  "ambassador-terms": {
    heading: "Ambassador Program Terms",
    title: "Ambassador Program Terms | FaturaPro",
    description: "Terms for the FaturaPro ambassador program, including qualification, commission, payout, disclosure and tracking rules.",
    path: "/ambassador-terms",
    sections: [
      ["1. Approval and Agreement", "Participation begins only after FaturaPro approves an application. Applying does not guarantee approval. Approved ambassadors receive a private dashboard, tracked link and payout-setup instructions by email."],
      ["2. Qualified Customers", "A qualified customer must be new to FaturaPro, follow the ambassador's tracked link within the attribution window, create an account and pay an eligible subscription. Clicks, free accounts, self-referrals, duplicate accounts, fraudulent activity and reversed or disputed payments do not earn commission."],
      ["3. Commission Period", "The standard commission period is the first twelve paid months of each qualified customer, starting with that customer's first successful subscription payment. A written acceptance may specify a different term. The recorded customer-specific end time determines when commission stops."],
      ["4. Commission Calculation", "The standard rates are 25% of eligible Pro subscription revenue and 35% of eligible Business subscription revenue, excluding tax. If a written approval specifies custom rates, the acceptance email and private dashboard show them. The customer's paid plan selects the matching approved rate automatically. Reversed, disputed or credited payments are not eligible and may reverse commission."],
      ["5. Holding Period and Payouts", "Commission remains pending during the holding period shown in the dashboard. Once available commission reaches the displayed threshold and the ambassador's Stripe payout account is ready, an automatic payout can be initiated. Stripe and the receiving bank determine verification and settlement timing."],
      ["6. Corrections", "Commission linked to a payment reversal, credit, chargeback, duplicate event or tracking error may be reversed before payout. A correction required after payout may be offset against later commission with a record of the adjustment."],
      ["7. Honest Promotion", "Ambassadors must make truthful, current statements, disclose that they may earn commission and follow the advertising and consumer-protection rules that apply to their audience. Spam, fake reviews, misleading discounts, trademark bidding and pretending to be FaturaPro are prohibited."],
      ["8. Taxes and Independent Status", "Ambassadors participate independently and are responsible for their own tax registration, invoicing and reporting. FaturaPro may request information needed to meet legal, accounting or payment obligations."],
      ["9. Pause or End", "FaturaPro may pause or end a partnership for fraud, policy violations, legal risk or material brand harm. Either side may request an end. Ending prevents new commission at the recorded end time; eligible commission earned earlier remains subject to holding, reversal and payout rules."],
      ["10. Privacy and Contact", "Tracking and payout information is handled under the FaturaPro Privacy Policy. Ambassadors see aggregate customer counts and not referred customers' names or email addresses. Questions can be sent to support@faturapro.app."],
    ],
  },
};

export default function Legal({ page }) {
  const content = PAGE_DATA[page] || PAGE_DATA.terms;

  useEffect(() => {
    const canonical = "https://faturapro.app" + content.path;
    const cleanupSeo = applyPageSeo({
      title:content.title,
      description:content.description,
      canonical,
      language:"en",
      locale:"en_US",
      alternates:{ en:canonical, "x-default":canonical },
    });
    const restoreSiteSchema = suspendBaseSiteSchema();
    const schema = document.createElement("script");
    schema.id = "legal-page-schema";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context":"https://schema.org",
      "@type":"WebPage",
      "@id":canonical + "#webpage",
      url:canonical,
      name:content.heading,
      description:content.description,
      inLanguage:"en",
      isPartOf:{ "@id":"https://faturapro.app/#website" },
    });
    document.head.appendChild(schema);
    return () => { schema.remove(); restoreSiteSchema(); cleanupSeo(); };
  }, [content]);

  return (
    <main style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif" }}>
      <article style={{ maxWidth:760, margin:"0 auto", padding:"60px 24px 90px" }}>
        <a href="/" style={{ color:"#6366F1", fontSize:13, textDecoration:"none", display:"inline-block", marginBottom:32 }}>← Back to FaturaPro</a>
        <h1 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:36, margin:"0 0 8px" }}>{content.heading}</h1>
        <p style={{ color:"#9a9690", margin:"0 0 40px" }}>Last updated: September 2026</p>
        {content.sections.map(([title, text]) => (
          <section key={title} style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:18, color:"#6366F1", margin:"0 0 10px" }}>{title}</h2>
            <p style={{ lineHeight:1.8, color:"#9a9690", margin:0 }}>{text}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
