export default function Legal({ page }) {
  const isPrivacy = page === "privacy";
  return (
    <div style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"60px 24px" }}>
        <a href="/" style={{ color:"#c9a84c", fontSize:13, textDecoration:"none", display:"inline-block", marginBottom:32 }}>← Back to Fatūra Pro</a>
        {isPrivacy ? (
          <>
            <h1 style={{ fontFamily:"Playfair Display, serif", fontSize:36, marginBottom:8, color:"#e8e4dc" }}>Privacy Policy</h1>
            <p style={{ color:"#9a9690", marginBottom:40 }}>Last updated: June 2026</p>
            {[
              ["1. Who We Are", "Fatūra Pro is a professional invoicing platform operated from the Netherlands. We are committed to protecting your personal data in accordance with GDPR."],
              ["2. Data We Collect", "We collect only the minimum information necessary to provide the service. Your data belongs to you — we store it securely and never share or sell it to third parties."],
              ["3. How We Use Your Data", "Your data is used solely to provide the Fatūra Pro service — creating invoices, managing clients, and sending payment reminders. We may send you transactional emails about your account."],
              ["4. Data Storage", "Your data is stored securely in EU-based servers via Supabase. All connections are encrypted via TLS."],
              ["5. Payment Data", "Payments are processed by Stripe. We do not store your credit card details. Please review Stripe's privacy policy at stripe.com/privacy."],
              ["6. Your Rights", "Under GDPR, you have the right to access, correct, or delete your personal data at any time. Contact us at support@faturapro.app to exercise these rights."],
              ["7. Cookies", "We use minimal cookies necessary for authentication. We do not use advertising or tracking cookies."],
              ["8. Contact", "For privacy inquiries, contact us at support@faturapro.app"],
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
