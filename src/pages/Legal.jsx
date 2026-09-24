import { useEffect } from "react";
import { applyPageSeo, suspendBaseSiteSchema } from "../lib/pageSeo";

// Legal identity of the operator. Fill in name, kvk and address (vat optional) to show
// them on the Privacy Policy and Terms. While a required field is empty, the sentence is left out.
const OPERATOR = { name:"", kvk:"", address:"", vat:"" };
const operatorSentence = () => (OPERATOR.name && OPERATOR.kvk && OPERATOR.address
  ? `The operator is ${OPERATOR.name}, registered with the Dutch Chamber of Commerce (KvK) under number ${OPERATOR.kvk}, ${OPERATOR.address}${OPERATOR.vat ? `, VAT number ${OPERATOR.vat}` : ""}.`
  : "");
const withOperator = (text) => text.replace(" {operator}", operatorSentence() ? " " + operatorSentence() : "");

const PAGE_DATA = {
  privacy: {
    heading: "Privacy Policy",
    title: "Privacy Policy | FaturaPro",
    description: "How FaturaPro handles account, invoice, payment and support data, your GDPR rights, and where data is hosted in the EU.",
    path: "/privacy",
    updated: "25 September 2026",
    sections: [
      ["1. Who We Are", "FaturaPro provides online invoicing software at faturapro.app, operated from the Netherlands. For account, billing and website data we act as the data controller. {operator} Privacy questions and requests can be sent to support@faturapro.app."],
      ["2. Two Roles: Controller and Processor", "We decide how account, subscription, support and website data is used, so for that data we are the controller. The details you enter about your own clients, such as names, addresses and invoice lines, belong to your business. We process that data only on your behalf and on your instructions, as a processor under the Data Processing terms in our Terms of Service. You remain responsible for having a lawful basis to store your clients' data."],
      ["3. Data We Collect", "Account data: your email address and the business details you add, such as a business name, address, tax number and logo. Content data: invoices, credit notes, quotes, clients, expenses and related amounts and descriptions. Subscription data: plan, status and payment references received from our payment processor; we never receive or store full card numbers. Support data: messages you send to support or to the support assistant. Usage data: limited technical and product-usage information needed to run, secure and improve the service. Referral data: referral codes and related attribution records when you use or share a referral or ambassador link. We do not sell personal data."],
      ["4. Purposes and Legal Bases", "We use account and content data to provide the service you signed up for (performance of a contract). We use limited usage, security and support data for our legitimate interests in keeping accounts safe, preventing abuse, fixing errors and improving the product. We keep billing records where the law requires it. Optional analytics that need consent run only after you allow them, and you can withdraw that choice at any time."],
      ["5. Where Data Is Stored and How It Is Protected", "Account, invoice and client data is hosted in the European Union (Ireland). Connections are encrypted in transit, access to production systems is restricted, and we use established providers with recognised security practices. No online service can guarantee absolute security, so keep your password private and keep any records your business is legally required to retain."],
      ["6. Service Providers", "We use carefully selected providers for: hosting and database services (EU region), website delivery and privacy-friendly analytics, payment processing (Stripe), transactional email, AI processing for the support assistant, and optional session analytics after consent. Each provider receives only the data needed for its task and is bound by contractual confidentiality and data-protection terms. A current list of these providers is available on request at support@faturapro.app. We may also disclose information when the law requires it."],
      ["7. International Transfers", "Some providers may process limited data outside the European Economic Area. Where that happens, we rely on an adequacy decision of the European Commission (such as the EU-U.S. Data Privacy Framework) or on the European Commission's Standard Contractual Clauses, together with any additional safeguards required."],
      ["8. Payments", "Stripe processes subscription payments and, where you enable it, card payments from your clients. Client payments are made to your own connected Stripe account; FaturaPro is not a party to those transactions. We keep only the references and status information needed to link payments to the right account and invoice."],
      ["9. Support Assistant (AI)", "The chat assistant on our website and in the app is an automated AI system, not a human. Messages are processed by an AI provider to generate a reply and may be kept to handle support, prevent abuse and improve answers. Replies can be incomplete or wrong and are not legal, tax or accounting advice. Do not share passwords, card numbers, API keys or other sensitive information in chat. You can ask us to delete chat history linked to your account."],
      ["10. Cookies and Similar Technologies", "Strictly necessary storage keeps you signed in and remembers settings such as language. When you follow a referral or ambassador link, a referral code may be stored for up to thirty days. Page analytics are privacy-friendly and do not use advertising cookies. Optional session analytics load only after you give consent in the cookie banner, and you can change that choice at any time. We do not use advertising or cross-site tracking cookies."],
      ["11. How Long We Keep Data", "We keep account data and documents while your account is active. After you delete your account, we remove or anonymise your data within a reasonable period, except where we must keep it longer. Our own billing and payment records are kept for seven years to meet Dutch tax record-keeping obligations. Referral and security records are kept only as long as needed for their purpose or to establish, exercise or defend legal claims. Remember that your own business may have legal retention duties for invoices you create; export and keep copies before deleting your account."],
      ["12. Your Rights", "Under the GDPR you can request access, correction, deletion, restriction or a portable copy of your personal data, object to processing based on legitimate interests, and withdraw consent at any time. Send requests to support@faturapro.app; we may need to verify your identity and will respond within the time limits set by law. You also have the right to complain to a data-protection authority; in the Netherlands this is the Autoriteit Persoonsgegevens."],
      ["13. Automated Decisions", "We do not make decisions based solely on automated processing that have legal or similarly significant effects on you. Automated checks may help limit abuse and protect forms, and any important account decision can be reviewed by a person."],
      ["14. Children", "The service is intended for businesses and professionals and is not directed at anyone under sixteen. We do not knowingly collect their personal data."],
      ["15. Changes to This Policy", "We may update this policy. The date at the top shows the latest version. If a change materially affects how we handle your data, we will tell you by email or in the app before it takes effect."],
      ["16. Contact", "For privacy questions, rights requests or concerns, email support@faturapro.app."],
    ],
  },
  terms: {
    heading: "Terms of Service",
    title: "Terms of Service | FaturaPro",
    description: "Terms for using FaturaPro invoicing software: business use, plans and trials, billing, data processing, responsibilities and liability.",
    path: "/terms",
    updated: "25 September 2026",
    sections: [
      ["1. Who We Are and Acceptance", "These terms apply to FaturaPro, the online invoicing software at faturapro.app, operated from the Netherlands. {operator} By creating an account or using the service you accept these terms. If you do not agree, do not use the service."],
      ["2. Business Use Only", "FaturaPro is intended for businesses, freelancers and other professionals acting in the course of their trade or profession. By creating an account you confirm that you use the service for business purposes and not as a consumer. If you use the service on behalf of an organisation, you confirm that you may bind that organisation to these terms."],
      ["3. The Service", "FaturaPro helps you create invoices, credit notes and, on Advanced, quotes, expenses and recurring invoice schedules. Features and limits for Free, Essential and Advanced are shown on the pricing page. Payment reminders are prepared for you to review and send yourself. Recurring schedules create pending invoices for your review; they do not send invoices on their own. Opening an email draft does not attach or send a PDF automatically. We may improve, change or remove features over time; if a change materially reduces a paid feature you rely on, we will give reasonable notice."],
      ["4. Your Account", "You are responsible for keeping your sign-in details private, for the accuracy and legality of the information you enter, and for all activity under your account. Tell us promptly at support@faturapro.app if you suspect unauthorised access."],
      ["5. Plans, Prices and VAT", "Essential costs €9 per month and Advanced costs €19 per month. All prices exclude VAT, which is added where applicable, including under reverse-charge rules for business customers in other EU countries. The amount to be charged is shown in the secure Stripe checkout before you confirm."],
      ["6. Free Trials", "New accounts receive a seven-day trial of Essential features without entering a card. When that trial ends, the account continues on the Free plan unless you subscribe. You can also start a seven-day free trial of Advanced through the Stripe checkout, which requires a payment card. Unless you cancel before the trial ends, the Advanced subscription starts automatically at the end of the trial and €19 per month (excluding VAT) is charged to that card. If you cancel during the trial, you are not charged. Trials are intended for one trial per business; we may refuse or end trials that are misused."],
      ["7. Billing, Renewal and Cancellation", "Paid plans are billed monthly in advance and renew automatically until cancelled. You can cancel at any time in the billing portal; cancellation stops the next renewal and your plan stays active until the end of the period already paid. Fees already paid are not refunded, except where required by law or in case of a billing error on our side. If a payment fails, we may limit paid features until the payment is resolved. Contact support@faturapro.app if you believe a charge is incorrect."],
      ["8. Price Changes", "We may change our prices. We will tell you by email at least thirty days before a price change applies to your subscription. If you do not agree, you can cancel before the new price takes effect."],
      ["9. Your Content and Data", "You keep all rights to the business and document content you enter. You give us a limited permission to host, process, back up and display that content only to provide and support the service. You can export your invoices and documents while your account is active; please keep your own copies, especially before cancelling or deleting your account. If your paid plan ends, your content is kept and features beyond your current plan are simply unavailable until you upgrade again."],
      ["10. Data Processing on Your Behalf", "When you store personal data about your own clients in FaturaPro, you are the controller and we are your processor under Article 28 of the GDPR, and this section forms our data processing agreement. We will: process that data only to provide the service and on your documented instructions (these terms and your use of the service); ensure that people with access are bound by confidentiality; apply appropriate technical and organisational security measures; use sub-processors only under written terms with equivalent data-protection obligations, and inform you of material changes to them so you can object; assist you, where reasonable, with data-subject requests, security obligations and data-protection impact assessments; notify you without undue delay after becoming aware of a personal-data breach affecting your data; delete or return your data at the end of the service, unless the law requires us to keep it; and provide the information reasonably needed to demonstrate compliance. A list of sub-processors is available on request."],
      ["11. Invoices, Tax and E-Invoicing Rules", "You are responsible for checking every document and for the invoice, tax, accounting, record-keeping and e-invoicing rules that apply to your business and your clients. UBL/XML export is intended for EN 16931 workflows, but receiving systems may require extra profiles and validation. FaturaPro does not submit tax returns, does not deliver invoices through Peppol and is not a certified or approved platform under national e-invoicing schemes, such as those in France, Belgium, Spain or Saudi Arabia. Where such a scheme applies to you, use a solution that is approved for it."],
      ["12. Online Payments from Your Clients", "On Advanced you can let clients pay invoices by card through your own Stripe account. Stripe's terms apply to that account. The payment contract is between you and your client; FaturaPro is not a party to it and is not responsible for refunds, disputes or chargebacks between you and your client."],
      ["13. AI Support Assistant", "The chat assistant is an automated AI system. Its answers are provided for general guidance about using FaturaPro, may be incomplete or incorrect, and are not legal, tax or accounting advice."],
      ["14. Acceptable Use", "Do not use FaturaPro for unlawful activity, fraud, spam, malware, infringement or content that violates the rights of others. Do not interfere with the service, test its security without permission, or try to bypass plan limits, access controls or security measures."],
      ["15. Availability", "We work to keep the service available and reliable, but we do not promise uninterrupted or error-free operation. Maintenance, updates or events outside our control may cause interruptions. Verify documents before relying on them and keep copies of records you are legally required to retain."],
      ["16. Limitation of Liability", "To the extent permitted by law, our total liability for any claim relating to the service is limited to the fees you paid us in the twelve months before the event giving rise to the claim, and to €100 if you have not paid any fees. We are not liable for indirect or consequential loss, including lost profit, lost revenue, lost data, business interruption, tax assessments or penalties. These limits do not apply to damage caused by our intent or deliberate recklessness, or where the law does not allow such limits."],
      ["17. Your Responsibility Towards Us", "You will compensate us for claims by third parties that arise from content you enter, from your invoices or from your breach of these terms or of the law, to the extent such claims are caused by you."],
      ["18. Intellectual Property", "FaturaPro, its software, interface, texts and branding remain our property and are protected by intellectual-property law. These terms give you a right to use the service, not ownership of it. Documents you create from your own content are yours to use in your business."],
      ["19. Suspension and Termination", "We may suspend or end access if an account breaches these terms, creates a security or legal risk, or remains unpaid, and we will give notice where reasonable. You can cancel a paid plan in the billing portal and request deletion of your account through support. Sections that by their nature should continue, such as liability, data processing and governing law, continue after termination."],
      ["20. Changes to These Terms", "We may update these terms. If a change materially affects existing users, we will give notice by email or in the app at least thirty days before it takes effect, unless a shorter period is required by law or for security reasons. If you do not agree, you can stop using the service and cancel before the change takes effect."],
      ["21. Governing Law and Disputes", "These terms are governed by the laws of the Netherlands. Disputes will be submitted to the competent court in the Netherlands, unless mandatory law provides otherwise. We encourage you to contact us first so we can try to resolve any issue quickly."],
      ["22. Contact", "For questions about these terms or billing, email support@faturapro.app."],
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
      ["4. Commission Calculation", "The standard rates are 25% of eligible Essential subscription revenue and 35% of eligible Advanced subscription revenue, excluding tax. If a written approval specifies custom rates, the acceptance email and private dashboard show them. The customer's paid plan selects the matching approved rate automatically. Reversed, disputed or credited payments are not eligible and may reverse commission."],
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
        <p style={{ color:"#9a9690", margin:"0 0 40px" }}>Last updated: {content.updated || "September 2026"}</p>
        {content.sections.map(([title, text]) => (
          <section key={title} style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:18, color:"#6366F1", margin:"0 0 10px" }}>{title}</h2>
            <p style={{ lineHeight:1.8, color:"#9a9690", margin:0 }}>{withOperator(text)}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
