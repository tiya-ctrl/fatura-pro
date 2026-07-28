import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";

const POSTS = [
  {
    slug: "invoicing-plans-free-vs-pro-vs-business",
    lang: "en",
    title: "Free vs Pro vs Business: How to Choose and Use Your Invoicing Plan (2026 Guide)",
    description: "A complete guide to invoicing software plans: what free invoicing gets you, when to upgrade, who each plan suits, and step-by-step instructions for every feature from your first invoice to VAT reports and team access.",
    date: "2026-07-26",
    readTime: "11 min",
    keywords: "invoicing software plans, free invoicing software, invoicing software for freelancers, how to use invoicing software, invoicing plan comparison, best invoicing software small business 2026, invoicing software for agencies",
    sections: [
      { h: "Do You Actually Need Paid Invoicing Software?", p: "Most people start invoicing with a Word template, move to a free tool when the templates get messy, and only pay once something specific starts costing them money — usually late payments, repeated data entry, or tax season. That is the honest way to think about invoicing plans: not as tiers to climb, but as problems to solve. This guide walks through three plan levels, who each one genuinely suits, and exactly how to use every feature step by step, so you can pick the smallest plan that solves your actual problem." },
      { h: "The Three Plans at a Glance", p: "Fatūra Pro has three levels. Free covers up to 20 invoices and 5 clients, with no card required and no time limit. Pro at 9 euros a month removes those limits and adds automatic payment reminders by email and WhatsApp. Business at 19 euros a month adds everything a small team or agency needs: quotes, recurring invoices, expenses with VAT reports, team access for five people with no per-user fees, online card payments for clients, multiple business profiles, analytics, accountant export, API access, and removal of all Fatūra branding from your invoices. Both paid plans include a 7-day free trial." },
      { h: "The Free Plan: Who It Is For", p: "The free plan fits three situations well. First, you are just starting out and invoice a handful of clients a month. Second, you run a side business alongside a job and your invoicing volume is genuinely low. Third, you are evaluating tools and want to send real invoices to real clients before paying anything. With 20 invoices and 5 clients, this is not a crippled demo: a freelancer with two or three regular clients can run for months on it without paying." },
      { h: "Step by Step: Sending Your First Invoice", p: "One, create your account at faturapro.app with your email or Google account. Two, open Settings and then Invoice Defaults, and fill in your business name, logo, bank or payment details and default payment terms. Everything you save here fills in automatically on every future invoice, so this five-minute setup pays for itself immediately. Three, click New Invoice, enter your client details, and add your services as line items with quantity and price. Four, pick the currency and adjust the tax rate if needed. Five, save, then open the preview and export a PDF or copy the link to send to your client. Your first invoice takes about two minutes; the next ones take seconds because your clients are saved." },
      { h: "What You Get on Free (And What You Do Not)", p: "The free plan includes the full invoice editor, your logo and branding on the document, PDF export, all 17 currencies, client management, and the dashboard showing revenue, pending and overdue totals. What it does not include: automatic payment reminders, unlimited volume, and the Business features listed later. Free invoices also carry a small Fatūra Invoicing credit in the footer, which is removed on the Business plan. Nothing expires and no card is ever requested." },
      { h: "Four Signs You Have Outgrown Free", p: "One, you are deleting old invoices to make room for new ones. Two, you are chasing late payments manually and it is costing you real hours and awkward conversations. Three, you are copying the same invoice every month for the same client. Four, someone else in your business needs to issue invoices while you are busy. The first two point to Pro; the last two point to Business. If none of these apply yet, stay free with a clear conscience." },
      { h: "The Pro Plan: Who It Is For", p: "Pro at 9 euros a month suits the established solo professional: consultants, designers, developers, photographers, tradespeople and small service businesses that invoice regularly and want to get paid without chasing. The core value is not the higher limits, it is the reminders. If even one invoice a month gets paid two weeks earlier because of an automatic nudge, the plan has paid for itself several times over." },
      { h: "Step by Step: Automatic Payment Reminders", p: "One, open your invoices list and find an unpaid or overdue invoice. Two, click the reminder icon next to it. Three, choose your channel: email or WhatsApp. Four, choose the language and the tone, from polite to firm to final notice, depending on how late the payment is. Five, review the message, which is written for you with the invoice number, amount and due date already filled in, then send. WhatsApp reminders matter more than people expect: emails often sit unread for days, while a polite WhatsApp message usually gets a same-day reply." },
      { h: "Step by Step: Branding, Currencies and Defaults", p: "To put your identity on every invoice, open Settings and then Invoice Defaults and upload your logo, add your business name and address, your bank or payment information, your invoice number prefix, your default tax rate and your standard payment terms. To invoice an international client, simply choose their currency from the dropdown when creating the invoice; amounts and symbols adapt automatically while your dashboard keeps the overall picture. These details are what make an invoice look like a business rather than a favour." },
      { h: "The Business Plan: Who It Is For", p: "Business at 19 euros a month is built for small agencies, studios and teams, and for anyone running more than one venture. The test is simple: if more than one person touches your invoicing, if you send quotes before work starts, if you bill retainer clients on a schedule, or if you file VAT returns, you are the Business customer. It also matters for pricing reasons: most competitors charge roughly 10 to 15 dollars per additional user, so a five-person team elsewhere can cost 50 dollars or more per month for the same work. Here five seats are included in the flat price." },
      { h: "Step by Step: Quotes, Recurring Invoices and VAT Reports", p: "For quotes, open Quotes from the sidebar, click New Quote, add your client and line items, and save. When the client approves, open the quote and click Convert to Invoice: every item and amount carries across with no re-typing. For recurring billing, open any existing invoice, click the recurring icon, and choose weekly, every two weeks, monthly or yearly. The system then creates the invoice automatically on schedule, and you can pause or resume any schedule from Settings and then Recurring invoices. For tax, open Expenses and click Add expense, entering the amount, the VAT rate and a description. The report at the top of the page calculates your quarterly position automatically: VAT collected on your invoices minus VAT paid on expenses equals what you owe." },
      { h: "Step by Step: Team Access, Online Payments and API", p: "To add a colleague, open Settings and then Team members, enter their email address and click Invite. They receive an email, sign up with that same address, and immediately see the shared invoices, clients, quotes and expenses, while settings and billing stay owner-only and every action is tracked by name. To let clients pay by card, open Settings and then Online payments and click Connect Stripe once. After that, every invoice carries a payment link: send it, the client pays, and the invoice marks itself as paid automatically, with the money going straight to your own account. For automation, open Settings and then API access and generate a key, which lets your online store or internal system create invoices programmatically, either through your developer or a no-code tool such as Make or Zapier." },
      { h: "How to Upgrade, Switch Plans or Cancel", p: "To upgrade, open Settings and click Upgrade, or use the pricing section on the homepage, then choose your plan and complete checkout; your account is upgraded automatically the moment payment succeeds, and both paid plans start with 7 days free. To move between Pro and Business later, or to update your card, download receipts or cancel, open Settings and then Subscription and click Manage subscription. Switching is handled properly so you are never billed twice, and cancelling keeps your access until the end of the period you already paid for." },
      { h: "Frequently Asked Questions", p: "Is the free plan really free? Yes, indefinitely, with no card required. Do I lose my data if I cancel a paid plan? No, your invoices and clients remain in your account. Can I invoice in more than one currency? Yes, on every plan, with 17 currencies available per invoice. Does it work in my country? Yes, it is used internationally and supports English, Arabic and Dutch interfaces along with configurable tax rates. Can I add team members on Pro? No, team access is a Business feature, and five members are included with no extra fee per person." },
      { h: "Start Free and Upgrade Only When It Pays", p: "The right invoicing plan is the smallest one that removes your current bottleneck. Start on the free plan today at faturapro.app, send real invoices to real clients, and upgrade only when volume, late payments, retainers or teamwork actually make it worth it. Creating an account takes under a minute, both paid plans include a 7-day free trial, and you can cancel anytime." },
    ],
  },
  {
    slug: "best-invoicing-software-small-agencies",
    lang: "en",
    title: "Best Invoicing Software for Small Agencies (2026): One Tool, Your Whole Team",
    description: "What small agencies actually need from invoicing software: team access without per-user fees, quotes that convert, recurring billing, VAT reports, and online payments — compared and explained.",
    date: "2026-07-24",
    readTime: "8 min",
    keywords: "invoicing software for agencies, agency invoicing tool, team invoicing software, invoicing no per-user fees, quotes to invoice software, recurring invoicing agency",
    sections: [
      { h: "Why Agencies Outgrow Freelancer Invoicing Tools", p: "Running a small agency changes everything about invoicing. Suddenly it is not just you: a colleague needs to issue an invoice while you are in a meeting, a client asks for a formal quote before approving, retainer clients need billing every month without fail, and your accountant wants clean quarterly numbers. Most invoicing tools were built for solo freelancers — and it shows the moment you add a second person. This guide covers what actually matters when choosing invoicing software for a small agency in 2026, and where the popular tools quietly get expensive." },
      { h: "The Per-User Fee Trap", p: "Here is the pricing trick most agencies discover too late: the advertised price is for ONE user. QuickBooks, FreshBooks and similar tools charge roughly 10 to 15 dollars per additional team member, every month. A five-person agency can end up paying 50 to 80 dollars monthly before using a single advanced feature. When comparing tools, always calculate the price at YOUR team size, not the headline price. Fatūra Pro takes the opposite approach: the Business plan includes up to 5 team members in one flat 19 euros per month — the price does not grow with your team." },
      { h: "Team Access Done Right", p: "Shared invoicing is about more than logins. Your team should see the same clients, invoices, quotes and expenses — while sensitive areas like billing, integrations and company settings stay owner-only. Accountability matters too: every invoice should show who created it, so a five-person workspace never becomes a mystery. This is exactly how team access works in Fatūra Pro: members work on shared data, owners keep control, and every action is tracked by name." },
      { h: "Quotes That Convert to Invoices", p: "Agencies live on proposals. The workflow you want: send a professional quote, get approval, and convert it to an invoice in one click — same line items, same amounts, no re-typing, no copy-paste errors. If a tool makes you rebuild the invoice manually after every approved quote, it is costing you an hour per deal and introducing mistakes at the worst possible moment: right before you ask for money." },
      { h: "Recurring Invoices for Retainer Clients", p: "Retainers are the backbone of agency cash flow, and they should bill themselves. Set the schedule once — weekly, biweekly, monthly or yearly — and the invoice is created automatically on time, every time. Beyond the saved hours, there is a psychological shift: clients start treating your invoice like a utility bill that simply gets paid. Fatūra Pro generates recurring invoices automatically and lets you pause or resume any schedule in one click." },
      { h: "Getting Paid: Online Payments Built In", p: "The fewer steps between invoice and payment, the faster the money arrives. Look for software where every invoice carries a secure payment link — the client clicks, pays by card, and the invoice marks itself as paid automatically. Fatūra Pro does this through Stripe, with the money going directly to your own account. Combine it with automatic payment reminders (email and WhatsApp — where clients actually respond) and chasing payments stops being part of your job description." },
      { h: "VAT and Tax Reports Without Spreadsheets", p: "Every quarter, someone at the agency loses a day to tax preparation — unless the invoicing tool does it automatically. The right software tracks the VAT you collected on invoices, the VAT you paid on expenses, and calculates exactly what you owe, ready to file. Fatūra Pro includes expense tracking and quarterly VAT/BTW reports in the Business plan, which is especially valuable for agencies operating in Europe." },
      { h: "Multi-Business and White-Label", p: "Many agency owners run more than one brand — the agency itself, a side product, a partner venture. Managing them from one account with separate business profiles keeps invoicing clean without juggling logins. And white-label matters more than people admit: your invoices should carry only YOUR name and logo, with no software branding attached. Both are included in Fatūra Pro Business." },
      { h: "Automation and API for Growing Agencies", p: "If your agency runs an online store or internal systems, an API lets invoices create themselves — a new order in your store becomes an invoice in your books, automatically, through your developer or no-code tools like Make and Zapier. It is the kind of feature you may not need on day one, but you will be glad it exists the month your volume doubles." },
      { h: "What It Should Cost in 2026", p: "Putting it together, a fair benchmark for a complete agency invoicing stack — team access for five, quotes, recurring billing, VAT reports, online payments, analytics, API — is around 19 to 25 euros per month, flat. If a tool quotes you a low price per user, multiply by your team and compare again. If it quotes you 50 or more for the same features, you are paying for a brand name, not functionality." },
      { h: "Try the Complete Stack Free for 7 Days", p: "Fatūra Pro Business brings all of the above into one tool: 5 team seats with no per-user fees, quotes that convert to invoices, automatic recurring billing, expenses with VAT/BTW reports, online payments via Stripe, multi-business profiles, analytics, accountant export, API access, white-label invoices and priority support — for 19 euros a month, in English, Arabic and Dutch, with 17 currencies. Create your free account in under a minute and start a 7-day free trial of the Business plan — no commitment, cancel anytime." },
    ],
  },
  {
    slug: "fatura-pro-plan-guide-how-to-use",
    lang: "en",
    title: "Fatura Pro Plan: Every Feature and How to Use It (2026 Guide)",
    description: "A step-by-step guide to the Fatura Pro plan: unlimited invoices, WhatsApp reminders, multi-currency, custom branding, and how to use each feature to get paid faster.",
    date: "2026-07-21",
    readTime: "6 min",
    keywords: "Fatura Pro plan, how to use invoicing app, WhatsApp invoice reminder, unlimited invoices, professional invoice software",
    sections: [
      { h: "What You Get With the Pro Plan", p: "The Fatura Pro plan (9 euros a month) is built for freelancers and solo business owners who have outgrown free tools and want a complete, professional invoicing system. This guide walks through every feature and exactly how to use it, so you can send your first professional invoice within minutes of signing up. And yes, there's a free 7-day trial, no card needed." },
      { h: "Unlimited Invoices and Clients", p: "The free plan caps how many invoices and clients you can have. Pro removes those limits entirely. To create one: from your dashboard, click New Invoice, add your client, list your services as line items, and save. Your clients are stored automatically, so the next invoice to the same client takes seconds." },
      { h: "WhatsApp and Email Payment Reminders", p: "This is Pro's standout feature, and it's rare among invoicing tools. To use it: open the invoices list, click the reminder icon next to any unpaid invoice, choose WhatsApp or email, pick the language and tone (polite or firm), and send. The message is written for you. Automated reminders are proven to reduce late payments significantly." },
      { h: "17 Currencies for International Clients", p: "If you work with clients in different countries, you can issue each invoice in its own currency. When creating an invoice, just pick the currency from the dropdown, and the symbols and formatting adjust automatically. Your dashboard still shows your overall picture clearly." },
      { h: "Custom Branding", p: "Make every invoice look unmistakably yours. Go to Settings, then Invoice Defaults, and add your business name, logo, bank details, and default notes. These appear automatically on every invoice you create, giving clients a polished, trustworthy document every time." },
      { h: "Your Dashboard", p: "The dashboard gives you an at-a-glance view of your revenue, pending payments, and overdue invoices, so you always know where your money stands and which clients need a follow-up, without opening a single spreadsheet." },
      { h: "Start Your Free Trial", p: "Try the Pro plan free for 7 days, no card required. It's 9 euros a month after that, with everything above included. And if you run a team or agency, the Business plan adds quotes, recurring invoices, VAT reports, and team access at 19 euros a month, also with 7 days free. Start free at faturapro.app" },
    ],
  },
  {
    slug: "fatura-business-plan-guide-how-to-use",
    lang: "en",
    title: "Fatura Business Plan: All 11 Features and How to Use Them",
    description: "A complete walkthrough of the Fatura Pro Business plan: quotes, recurring invoices, VAT reports, team access, online payments, API, and how each feature works.",
    date: "2026-07-22",
    readTime: "8 min",
    keywords: "invoicing software for agencies, recurring invoices, VAT report freelancer, invoice team members, online invoice payment, quote to invoice",
    sections: [
      { h: "Built for Agencies and Teams", p: "The Fatura Business plan is the most complete tier, designed for agencies, teams, and owners of multiple businesses. It includes everything in Pro and adds powerful tools on top, all for 19 euros a month with no per-user fees. This guide covers all 11 features and how to use each. The Business plan is live now, with a 7-day free trial." },
      { h: "1. Quotes That Convert to Invoices", p: "Send a professional quote, and when the client approves, turn it into a full invoice in one click. How: go to Quotes, click New Quote, add your line items, and save. On approval, click Convert to Invoice, and everything carries over. No re-typing." },
      { h: "2. Automatic Recurring Invoices", p: "For clients you bill regularly, set it once and let it run. How: open any invoice, click the recurring icon, and choose weekly, biweekly, monthly, or yearly. Invoices generate automatically on schedule, and you manage them all from Settings, Recurring invoices." },
      { h: "3. Expenses and VAT/BTW Reports", p: "Track expenses and get a ready quarterly tax report. How: go to Expenses, click Add expense, enter the amount and VAT rate. The report at the top calculates automatically: VAT collected from invoices minus VAT paid on expenses equals what you owe. Perfect for freelancers who dread tax season." },
      { h: "4. Team Members (Up to 5)", p: "Work with your team on one account. How: Settings, Team members, enter a colleague's email, and Invite. They get an email; once they sign up they see the team's invoices and clients, and every action is tracked by name. Settings and billing stay owner-only. No extra fee per member." },
      { h: "5. Online Payments for Clients", p: "Let clients pay by card directly. How: Settings, Online payments, Connect Stripe (one-time setup). After that every invoice has a payment link, send it, the client pays, and the invoice marks itself paid automatically." },
      { h: "6. Manage Multiple Businesses", p: "Run more than one business from a single account. How: Settings, My Businesses, Add business. When creating an invoice, choose the business from the selector and its details fill in automatically." },
      { h: "7. Advanced Analytics", p: "See monthly revenue, your top clients, and average payment times. How: open Analytics from the menu. Spot trends early and understand your business at a glance." },
      { h: "8. Accountant Export", p: "Export all your invoices as a CSV/Excel file, ready for your accountant, with one click from the invoices page. No manual copying at tax time." },
      { h: "9. API Access", p: "For store owners and developers: create invoices automatically from your own systems. How: Settings, API access, Generate key. Connect your online store so a new order creates an invoice automatically, real automation for growing businesses." },
      { h: "10. Remove Branding", p: "Your invoices appear under your name only, with no reference to Fatura Pro, a clean, white-label look for your clients." },
      { h: "11. Priority Support and Live Chat", p: "Get instant help through in-app live chat. The Business plan grows with your agency or team, for 19 euros a month with no per-user fees. Start your 7-day free trial now at faturapro.app." },
    ],
  },
{
    slug: "best-invoicing-app-arabic-support",
    lang: "en",
    title: "The Best Invoicing App with Arabic Support (2026)",
    description: "Looking for invoicing software that truly supports Arabic? Compare your options and learn what to look for in a bilingual Arabic-English invoicing app.",
    date: "2026-07-19",
    readTime: "6 min",
    keywords: "invoicing app Arabic, Arabic invoice software, bilingual invoice, Arabic English invoicing, create invoice in Arabic",
    sections: [
      { h: "Why Arabic Support in Invoicing Software Is So Hard to Find", p: "If you've searched for invoicing software that handles Arabic, you already know the frustration. Most international tools are built for the Western market. They either don't support Arabic at all, or they support it cosmetically: the text appears, but the layout breaks, numbers misalign, and the invoice looks unprofessional. For the 420+ million Arabic speakers running businesses worldwide, this is a real gap." },
      { h: "What Real Arabic Support Actually Means", p: "True Arabic support isn't just translated menu labels. It means full right-to-left layout, correct Arabic script rendering on the invoice itself, the ability to enter client names, company names, and notes in Arabic, and a document that prints cleanly without floating text or broken characters. When you evaluate a tool, create a test invoice in Arabic and export it. If it looks polished, that's real support." },
      { h: "Bilingual Is Even Better", p: "Many Arabic-speaking business owners work with international clients too. That's why bilingual Arabic-English invoicing matters: you send Arabic invoices to local clients and English ones to international clients, from the same account, without switching tools. This flexibility is rare, and it's exactly what freelancers serving mixed markets need." },
      { h: "What Else to Look For", p: "Beyond language, the essentials for any modern invoicing app: multiple currencies for international clients, automatic payment reminders so you're not chasing manually, PDF export, a clean dashboard, and fair pricing. Bonus features that save real time include WhatsApp reminders, common in Arabic-speaking markets but rare in Western tools." },
      { h: "Where Fatura Pro Fits", p: "Fatura Pro was built from the ground up with Arabic in mind, not as an afterthought. You get full Arabic and English support, 17 currencies, WhatsApp and email payment reminders, PDF export, and your own branding, all in a fast, modern interface. It's designed for freelancers and businesses who were underserved by the big international tools." },
      { h: "Try It Free for 7 Days", p: "You can start using Fatura Pro free and create your first invoices right away, no card needed. If it fits your workflow, the Pro plan is just 9 euros a month with unlimited invoices, reminders, and full customization. And for agencies and teams, the Business plan is live too — quotes, recurring invoices, VAT reports, team access, and more, with 7 days free. Start free at faturapro.app" },
    ],
  },
  {
    slug: "zzp-invoice-app-english-netherlands",
    lang: "en",
    title: "ZZP Invoicing in English: The Complete Guide for Freelancers in the Netherlands",
    description: "A guide to invoicing as a ZZP'er in the Netherlands with an English interface: BTW rates, KvK numbers, VAT reports, and how to get paid faster.",
    date: "2026-07-20",
    readTime: "7 min",
    keywords: "ZZP invoice, invoicing Netherlands English, BTW report freelancer, Dutch VAT invoice, ZZP freelancer invoicing",
    sections: [
      { h: "Invoicing as a ZZP'er Doesn't Have to Be Confusing", p: "With over 1.78 million ZZP'ers registered in the Netherlands, freelancing is huge here, but Dutch invoicing rules can overwhelm newcomers, especially expats. Your invoices need specific fields, the right VAT (BTW) rate, and you must file quarterly VAT returns. The good news: with the right tool and this guide, it becomes simple." },
      { h: "What a Dutch ZZP Invoice Must Include", p: "Every compliant ZZP invoice needs: your business name and address, your KvK number, your BTW identification number, the client's details, a sequential invoice number, the invoice and delivery dates, a clear description of services with quantities and rates, a VAT breakdown, and the total amount due. Missing any of these can cause problems with the Belastingdienst." },
      { h: "Understanding BTW (Dutch VAT) Rates", p: "The Netherlands uses three VAT rates: 21% standard, 9% reduced for certain goods and services, and 0% exempt or reverse-charge for EU B2B. Applying the right rate matters, and at the end of each quarter you need to report how much VAT you collected versus paid. Doing this by spreadsheet is error-prone and slow." },
      { h: "The Quarterly VAT/BTW Report", p: "Four times a year, you file a VAT return with the Belastingdienst showing the VAT you charged clients minus the VAT you paid on business expenses. The difference is what you owe or reclaim. Software that generates this report automatically, collected minus paid, ready to file, saves ZZP'ers hours of stress every quarter." },
      { h: "Getting Paid Faster", p: "Dutch clients expect professional invoices, and late payments hurt cash flow. Automatic payment reminders, clear due dates, and online payment options all help you get paid sooner. Multi-currency support also matters if you invoice international clients in USD or GBP while keeping your books in EUR." },
      { h: "How Fatura Pro Helps ZZP'ers", p: "Fatura Pro gives you a clean English interface, plus Arabic and Dutch, fields for your business details, VAT/BTW handling with all three Dutch rates, and automatic reminders, so you send compliant invoices and get paid faster. Quarterly VAT reports and expense tracking are part of the Business plan, built exactly for this." },
      { h: "Start Free Today", p: "Try Fatura Pro free, no card required, and send your first ZZP-ready invoice in minutes. The Pro plan is 9 euros a month for unlimited invoices, reminders, and branding. And the Business plan — automatic VAT/BTW reports, recurring invoices, and team access — is live with a 7-day free trial. Start free at faturapro.app" },
    ],
  },
  {
    slug: "how-to-create-professional-invoice",
    lang: "en",
    title: "How to Create a Professional Invoice in 2026 (Step-by-Step Guide)",
    description: "Learn how to create a professional invoice that gets you paid faster. Free template tips, required fields, and common mistakes to avoid.",
    date: "2026-07-08",
    readTime: "6 min",
    keywords: "how to create an invoice, professional invoice, invoice template, freelance invoice",
    sections: [
      { h: "What Makes an Invoice Professional?", p: "A professional invoice is more than a payment request — it reflects your brand and builds client trust. It should include your business details, a clear breakdown of services, payment terms, and a unique invoice number. Studies show that clear, well-structured invoices get paid up to 30% faster than informal payment requests." },
      { h: "Essential Elements Every Invoice Needs", p: "1. Your business name and contact information. 2. Client name and details. 3. Unique invoice number (e.g. INV-001). 4. Issue date and due date. 5. Itemized list of services or products with quantities and prices. 6. Subtotal, taxes, and total amount. 7. Payment terms and accepted methods. 8. Optional: your logo and a thank-you note." },
      { h: "Step 1: Set Up Your Business Profile", p: "Before creating your first invoice, prepare your business information: legal name, address, email, phone, and tax details if applicable. Using invoicing software like Fatūra Pro, you enter this once and it auto-fills on every invoice — saving time and avoiding typos." },
      { h: "Step 2: Add Your Client Details", p: "Include the client's full name or company name, email, and address. Keeping a client database means you never re-type this information. Professional invoicing tools store your clients securely so creating repeat invoices takes seconds." },
      { h: "Step 3: Itemize Your Services", p: "Break down your work into clear line items. Instead of 'Design work — €500', write 'Logo design (3 concepts + revisions) — €300' and 'Brand color palette — €200'. Clients pay faster when they understand exactly what they're paying for." },
      { h: "Step 4: Set Clear Payment Terms", p: "Specify the due date clearly. 'Net 14' or 'Net 30' are standard, but shorter terms often work for freelancers. Include your bank details or payment link. Adding a small late-fee clause can motivate on-time payments." },
      { h: "Step 5: Send and Track", p: "Send your invoice as a PDF via email. Then track its status: paid, pending, or overdue. Modern invoicing apps show you at a glance which invoices need follow-up, and can send automatic payment reminders so you never chase clients manually." },
      { h: "Common Invoicing Mistakes to Avoid", p: "Missing invoice numbers (required for taxes in most countries), unclear descriptions, no due date, wrong currency for international clients, and forgetting to follow up on overdue payments. An invoicing app prevents all of these automatically." },
    ],
  },
  {
    slug: "أفضل-طريقة-لإنشاء-فاتورة-احترافية",
    lang: "ar",
    title: "كيف تنشئ فاتورة احترافية في 2026 — دليل خطوة بخطوة",
    description: "تعلم كيف تنشئ فاتورة احترافية تساعدك على استلام مستحقاتك بسرعة. العناصر الأساسية، النصائح، والأخطاء الشائعة.",
    date: "2026-07-08",
    readTime: "6 دقائق",
    keywords: "كيف اعمل فاتورة, فاتورة احترافية, نموذج فاتورة, فواتير للمستقلين",
    sections: [
      { h: "ما الذي يجعل الفاتورة احترافية؟", p: "الفاتورة الاحترافية أكثر من مجرد طلب دفع — إنها تعكس علامتك التجارية وتبني ثقة العميل. يجب أن تتضمن بيانات نشاطك، تفصيلاً واضحاً للخدمات، شروط الدفع، ورقم فاتورة فريد. الفواتير الواضحة والمنظمة تُدفع أسرع بنسبة تصل إلى 30% من طلبات الدفع غير الرسمية." },
      { h: "العناصر الأساسية لكل فاتورة", p: "1. اسم نشاطك وبيانات التواصل. 2. اسم العميل وبياناته. 3. رقم فاتورة فريد (مثل INV-001). 4. تاريخ الإصدار وتاريخ الاستحقاق. 5. قائمة مفصلة بالخدمات أو المنتجات مع الكميات والأسعار. 6. المجموع الفرعي والضرائب والمجموع الكلي. 7. شروط الدفع وطرق الدفع المقبولة. 8. اختياري: شعارك ورسالة شكر." },
      { h: "الخطوة 1: جهّز ملف نشاطك التجاري", p: "قبل إنشاء أول فاتورة، جهّزي معلومات نشاطك: الاسم، العنوان، الإيميل، الهاتف، والبيانات الضريبية إن وجدت. مع تطبيق مثل Fatūra Pro تدخل هذه البيانات مرة واحدة وتظهر تلقائياً في كل فاتورة — توفير للوقت وتجنب للأخطاء." },
      { h: "الخطوة 2: أضف بيانات عميلك", p: "أدخل اسم العميل أو شركته، الإيميل، والعنوان. الاحتفاظ بقاعدة بيانات للعملاء يعني أنك لن تعيد كتابة هذه المعلومات أبداً. أدوات الفوترة الاحترافية تحفظ عملاءك بأمان فيصبح إنشاء فاتورة متكررة مسألة ثوانٍ." },
      { h: "الخطوة 3: فصّل خدماتك", p: "قسّم عملك لبنود واضحة. بدلاً من 'أعمال تصميم — 500€' اكتب 'تصميم شعار (3 نماذج + تعديلات) — 300€' و'لوحة ألوان العلامة — 200€'. العملاء يدفعون أسرع عندما يفهمون بالضبط مقابل ماذا يدفعون." },
      { h: "الخطوة 4: حدد شروط دفع واضحة", p: "حدد تاريخ الاستحقاق بوضوح. 14 يوم أو 30 يوم هي المدد الشائعة، لكن المدد الأقصر تناسب المستقلين غالباً. أضف بياناتك البنكية أو رابط الدفع. إضافة بند بسيط عن رسوم التأخير يحفّز الدفع في الوقت." },
      { h: "الخطوة 5: أرسل وتابع", p: "أرسل فاتورتك كملف PDF عبر الإيميل، ثم تابع حالتها: مدفوعة، معلقة، أو متأخرة. تطبيقات الفوترة الحديثة تعرض لك بنظرة واحدة أي الفواتير تحتاج متابعة، وترسل تذكيرات دفع تلقائية فلا تطارد العملاء يدوياً." },
      { h: "أخطاء شائعة تجنبها", p: "نسيان رقم الفاتورة (مطلوب ضريبياً في أغلب الدول)، وصف غير واضح، عدم تحديد تاريخ استحقاق، عملة خاطئة للعملاء الدوليين، ونسيان متابعة الفواتير المتأخرة. تطبيق الفوترة يمنع كل هذه الأخطاء تلقائياً." },
    ],
  },
];

function ShareButtons({ title }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent;
  return (
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", margin:"32px 0" }}>
      <a href={"https://wa.me/?text=" + enc(title + " " + url)} target="_blank" rel="noreferrer" style={{ padding:"8px 18px", borderRadius:8, background:"rgba(37,211,102,0.12)", border:"1px solid rgba(37,211,102,0.3)", color:"#25d366", fontSize:13, textDecoration:"none", fontWeight:600 }}>WhatsApp</a>
      <a href={"https://twitter.com/intent/tweet?text=" + enc(title) + "&url=" + enc(url)} target="_blank" rel="noreferrer" style={{ padding:"8px 18px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"#e8e4dc", fontSize:13, textDecoration:"none", fontWeight:600 }}>X / Twitter</a>
      <a href={"https://www.linkedin.com/sharing/share-offsite/?url=" + enc(url)} target="_blank" rel="noreferrer" style={{ padding:"8px 18px", borderRadius:8, background:"rgba(10,102,194,0.12)", border:"1px solid rgba(10,102,194,0.35)", color:"#4a9eda", fontSize:13, textDecoration:"none", fontWeight:600 }}>LinkedIn</a>
      <button onClick={() => { navigator.clipboard.writeText(url); alert("Link copied!"); }} style={{ padding:"8px 18px", borderRadius:8, background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)", color:"#c9a84c", fontSize:13, cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>Copy Link</button>
    </div>
  );
}

function CTABox({ ar }) {
  return (
    <div style={{ background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:14, padding:"28px 26px", margin:"36px 0", textAlign:"center" }}>
      <div style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:22, color:"#e8e4dc", marginBottom:8 }}>{ar ? "جاهز تنشئ فاتورتك الأولى؟" : "Ready to create your first invoice?"}</div>
      <div style={{ fontSize:14, color:"#9a9690", marginBottom:18, lineHeight:1.7 }}>{ar ? "أنشئ فاتورة احترافية في أقل من 3 دقائق — مجاناً وبدون بطاقة" : "Create a professional invoice in under 3 minutes — free, no credit card needed"}</div>
      <a href="/login" style={{ display:"inline-block", padding:"12px 32px", borderRadius:10, background:"linear-gradient(135deg,#f0d878,#c9a84c)", color:"#0a0a0f", fontWeight:700, fontSize:15, textDecoration:"none" }}>{ar ? "ابدأ مجاناً ←" : "Start Free →"}</a>
    </div>
  );
}

export function BlogIndex() {
  useEffect(() => { document.title = "Blog — Invoicing Tips & Guides | Fatūra Pro"; }, []);
  return (
    <div style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"60px 24px" }}>
        <a href="/" style={{ color:"#c9a84c", fontSize:13, textDecoration:"none", display:"inline-block", marginBottom:32 }}>← Fatūra Pro</a>
        <h1 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:38, marginBottom:8 }}>Blog</h1>
        <p style={{ color:"#9a9690", marginBottom:44, fontSize:15 }}>Invoicing tips, guides and best practices — in English and Arabic.</p>
        {POSTS.map(p => (
          <Link key={p.slug} to={"/blog/" + p.slug} style={{ display:"block", background:"#111118", border:"1px solid rgba(201,168,76,0.15)", borderRadius:14, padding:"26px 28px", marginBottom:18, textDecoration:"none", direction: p.lang === "ar" ? "rtl" : "ltr" }}>
            <div style={{ fontSize:12, color:"#c9a84c", marginBottom:8, letterSpacing:1 }}>{p.date} · {p.readTime}</div>
            <div style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:22, color:"#e8e4dc", marginBottom:8, lineHeight:1.4 }}>{p.title}</div>
            <div style={{ fontSize:14, color:"#9a9690", lineHeight:1.7 }}>{p.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const post = POSTS.find(p => p.slug === decodeURIComponent(slug));
  useEffect(() => {
    if (post) {
      document.title = post.title + " | Fatūra Pro Blog";
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", post.description);
      const purl = "https://faturapro.app/blog/" + post.slug;
      let canon = document.querySelector("link[rel=canonical]");
      if (!canon) { canon = document.createElement("link"); canon.setAttribute("rel", "canonical"); document.head.appendChild(canon); }
      canon.setAttribute("href", purl);
      const oldSchema = document.getElementById("post-schema");
      if (oldSchema) oldSchema.remove();
      const sc = document.createElement("script");
      sc.type = "application/ld+json";
      sc.id = "post-schema";
      sc.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.description, datePublished: post.date, dateModified: post.date, inLanguage: post.lang === "ar" ? "ar" : "en", keywords: post.keywords, mainEntityOfPage: purl, author: { "@type": "Organization", name: "Fatura Pro", url: "https://faturapro.app" }, publisher: { "@type": "Organization", name: "Fatura Pro", url: "https://faturapro.app" } });
      document.head.appendChild(sc);
    }
  }, [post]);
  if (!post) return <div style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", display:"flex", alignItems:"center", justifyContent:"center" }}>Post not found. <a href="/blog" style={{ color:"#c9a84c", marginLeft:8 }}>← Blog</a></div>;
  const ar = post.lang === "ar";
  return (
    <div style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"60px 24px", direction: ar ? "rtl" : "ltr" }}>
        <a href="/blog" style={{ color:"#c9a84c", fontSize:13, textDecoration:"none", display:"inline-block", marginBottom:32 }}>{ar ? "→ المدونة" : "← Blog"}</a>
        <div style={{ fontSize:12, color:"#c9a84c", marginBottom:12, letterSpacing:1 }}>{post.date} · {post.readTime}</div>
        <h1 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:34, lineHeight:1.35, marginBottom:16 }}>{post.title}</h1>
        <p style={{ fontSize:16, color:"#9a9690", lineHeight:1.8, marginBottom:12 }}>{post.description}</p>
        <ShareButtons title={post.title} />
        {post.sections.map((s, i) => (
          <div key={i}>
            <h2 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:23, color:"#c9a84c", margin:"36px 0 14px" }}>{s.h}</h2>
            <p style={{ fontSize:15.5, lineHeight:1.9, color:"rgba(232,228,220,0.85)" }}>{s.p}</p>
            {i === 3 && <CTABox ar={ar} />}
          </div>
        ))}
        <CTABox ar={ar} />
        <ShareButtons title={post.title} />
      </div>
    </div>
  );
}
