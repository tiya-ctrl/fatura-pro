export default function Legal({ page }) {
  const isPrivacy = page === "privacy";
  const isAmbassadorTerms = page === "ambassador-terms";
  return (
    <div style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"60px 24px" }}>
        <a href="/" style={{ color:"#c9a84c", fontSize:13, textDecoration:"none", display:"inline-block", marginBottom:32 }}>← Back to Fatūra Pro</a>
        {isPrivacy ? (
          <>
            <h1 style={{ fontFamily:"Playfair Display, serif", fontSize:36, marginBottom:8, color:"#e8e4dc" }}>Privacy Policy</h1>
            <p style={{ color:"#9a9690", marginBottom:40 }}>Last updated: August 2026</p>
            {[
              ["1. Who We Are", "Fatura Pro is an online invoicing service operated from the Netherlands. This policy explains what we collect, why, and what you can ask us to do with it. It applies to faturapro.app and to the application behind it."],
              ["2. Data We Collect", "Account data: your email address and, if you add it, your business details such as name, address, tax number and logo. Content you create: invoices, credit notes, quotes, clients, expenses and the amounts and descriptions you enter. Ambassador data: application details, your tracking code, aggregate clicks, attributed accounts, eligible subscription payments, commission and payout records. Support conversations: messages you send to our in-app assistant or to us by email. Technical data: basic information such as browser type, approximate region and how pages are used, collected in aggregate to keep the service working and to improve it. We do not ask for or store your bank login details, and we never sell data to anyone."],
              ["3. How We Use Your Data", "To provide the service: creating and storing your documents, sending invoices and reminders you trigger, exporting files, and running the features of your plan. To keep it secure and reliable: preventing abuse, diagnosing errors and protecting accounts. To support you: answering your questions and improving the parts of the product people struggle with. To meet legal obligations, such as keeping records of the payments you make to us."],
              ["4. Where Your Data Is Stored", "Your data is stored on servers located in the European Union, in Ireland, through our hosting provider Supabase. Connections are encrypted in transit. Some of the service providers we rely on, such as payment processing and email delivery, may process limited data outside the EU under the safeguards required by European data protection law."],
              ["5. Payments", "Subscription payments are processed by Stripe. We do not see or store your card number. If you enable online payments for your own clients, that money flows directly to your own Stripe account and we do not hold it. Approved ambassadors connect a Stripe payout account directly with Stripe; we store the Stripe account identifier and payout status, but not bank login details or full bank-account data. Stripe handles its payment and verification data under its own privacy terms."],
              ["6. Support Chat", "Messages exchanged with our in-app assistant are stored so that we can see which questions come up, fix what is unclear and improve the product. Please do not paste passwords, card numbers or other sensitive details into the chat. If you would like your chat history removed, email us and we will delete it."],
              ["7. Cookies, Referral Attribution and Analytics", "We use cookies that are strictly necessary to keep you signed in and to keep the service secure. When you follow a member or ambassador link, a first-party referral code and an anonymous click identifier are stored for up to thirty days so a later account can be attributed correctly. Ambassadors see aggregate counts only, not referred customers' identities. We also use analytics and usage measurement to understand how the site is used and where people get stuck. We do not use advertising cookies, build advertising profiles or sell your data. Where consent is required for non-essential measurement, we ask for it before it runs, and you can withdraw it at any time."],
              ["8. Who We Share Data With", "Only the service providers needed to run the service: hosting and database, payment processing, email delivery and analytics. They act on our instructions under data processing agreements and may not use your data for their own purposes. We also share data if the law requires it."],
              ["9. How Long We Keep It", "We keep your account data and documents for as long as your account exists, since invoices are records you may need for years. If you delete your account, we remove your personal data within thirty days, except where we are legally required to keep certain payment records for longer. Support chat records are kept for up to twelve months."],
              ["10. Your Rights", "Under the GDPR you can ask us for a copy of your data, correct it, delete it, export it, restrict or object to certain processing, and withdraw consent where processing is based on it. Email us and we will respond within one month. You also have the right to complain to your national data protection authority, which in the Netherlands is the Autoriteit Persoonsgegevens."],
              ["11. Children", "The service is intended for businesses and professionals and is not directed at children under sixteen. We do not knowingly collect their data."],
              ["12. Changes to This Policy", "If we change this policy we will update the date at the top of this page, and for significant changes we will notify you by email or inside the application."],
              ["13. Contact", "For any privacy question or request, contact support@faturapro.app and we will get back to you."],
            ].map(([title, text]) => (
              <div key={title} style={{ marginBottom:32 }}>
                <h2 style={{ fontSize:18, color:"#c9a84c", marginBottom:10 }}>{title}</h2>
                <p style={{ lineHeight:1.8, color:"#9a9690" }}>{text}</p>
              </div>
            ))}
          </>
        ) : isAmbassadorTerms ? (
          <>
            <h1 style={{ fontFamily:"Playfair Display, serif", fontSize:36, marginBottom:8, color:"#e8e4dc" }}>Ambassador Program Terms</h1>
            <p style={{ color:"#9a9690", marginBottom:40 }}>Last updated: August 2026</p>
            {[
              ["1. Approval and Agreement", "Participation begins only after Fatūra Pro approves an application and confirms the commission percentage, per-customer commission period and partnership end date in the ambassador dashboard. Applying does not guarantee approval."],
              ["2. Qualified Customers", "A qualified customer must be new to Fatūra Pro, follow the ambassador's tracked link within the attribution window, create an account and pay an eligible Fatūra Pro subscription. Clicks, free accounts, self-referrals, duplicate accounts, fraudulent activity and refunded or disputed payments do not earn commission."],
              ["3. Commission Period", "Each qualified customer's commission start and end timestamps are recorded after the first successful subscription payment. Commission stops automatically at the earlier of that customer-specific end timestamp or the ambassador partnership end timestamp. Payments received at or after that time do not create commission."],
              ["4. Commission Calculation", "The agreed percentage is applied to eligible subscription revenue excluding tax. A subscription payment that is later refunded, reversed, disputed or credited becomes ineligible, and its commission is reversed. The dashboard is the record of pending, available, processing, paid and reversed commission."],
              ["5. Holding Period and Payouts", "Commission remains pending during the holding period shown in the dashboard. Once available commission reaches the displayed payout threshold and the ambassador's Stripe payout account is ready, automatic payout is initiated. Banking and settlement times depend on Stripe and the receiving bank."],
              ["6. Refunds, Disputes and Corrections", "Commission linked to a refund, credit note, chargeback, duplicate event or tracking error may be reversed before payout. If a correction is required after payout, Fatūra Pro may offset it against later commission after providing a clear record of the adjustment."],
              ["7. Honest Promotion", "Ambassadors must make truthful, current statements, disclose that they may earn commission, and follow advertising and consumer-protection rules that apply to their audience. Spam, fake reviews, misleading discounts, trademark bidding and pretending to be Fatūra Pro are prohibited."],
              ["8. Taxes and Independent Status", "Ambassadors participate independently and are responsible for their own tax registration, invoices and reporting. Fatūra Pro may request information or documentation needed to meet legal, accounting or payment obligations."],
              ["9. Pause or End", "Fatūra Pro may pause or end a partnership for fraud, policy violations, legal risk or material harm to the brand. Either side may request an end. Ending prevents new commission immediately at the recorded end time; valid commission already earned before that time remains subject to the holding, refund and payout rules."],
              ["10. Privacy and Contact", "Tracking and payout information is handled under the Fatūra Pro Privacy Policy. Ambassadors see aggregate customer counts and never receive referred customers' names or email addresses. Questions can be sent to support@faturapro.app."],
            ].map(([title, text]) => (
              <div key={title} style={{ marginBottom:32 }}>
                <h2 style={{ fontSize:18, color:"#c9a84c", marginBottom:10 }}>{title}</h2>
                <p style={{ lineHeight:1.8, color:"#9a9690" }}>{text}</p>
              </div>
            ))}
          </>
        ) : (
          <>
            <h1 style={{ fontFamily:"Playfair Display, serif", fontSize:36, marginBottom:8, color:"#e8e4dc" }}>Terms of Service</h1>
            <p style={{ color:"#9a9690", marginBottom:40 }}>Last updated: June 2026</p>
            {[
              ["1. Acceptance", "By using Fatūra Pro, you agree to these Terms of Service. If you do not agree, please do not use the service."],
              ["2. Service Description", "Fatūra Pro provides online invoicing software for freelancers and entrepreneurs. We offer Free and Pro subscription plans."],
              ["3. Account Responsibility", "You are responsible for maintaining the security of your account and all activities that occur under your account."],
              ["4. Payments & Subscriptions", "Pro plan subscriptions are billed monthly at €9/month via Stripe. You can cancel at any time. No refunds are provided for partial billing periods."],
              ["5. Free Trial", "New users receive a 7-day free Pro trial. After the trial, the account reverts to the Free plan unless a subscription is purchased."],
              ["6. Data & Privacy", "We handle your data in accordance with our Privacy Policy and GDPR regulations."],
              ["7. Prohibited Use", "You may not use Fatūra Pro for illegal activities, to send spam, or to violate any applicable laws."],
              ["8. Service Availability", "We strive for 99.9% uptime but do not guarantee uninterrupted service. We are not liable for any losses resulting from service interruptions."],
              ["9. Termination", "We reserve the right to terminate accounts that violate these terms. You may delete your account at any time by contacting support@faturapro.app."],
              ["10. Contact", "For any questions regarding these terms, contact us at support@faturapro.app"],
            ].map(([title, text]) => (
              <div key={title} style={{ marginBottom:32 }}>
                <h2 style={{ fontSize:18, color:"#c9a84c", marginBottom:10 }}>{title}</h2>
                <p style={{ lineHeight:1.8, color:"#9a9690" }}>{text}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
