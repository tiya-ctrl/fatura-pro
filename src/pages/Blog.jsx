import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { applyPageSeo, suspendBaseSiteSchema } from "../lib/pageSeo";
import { trackEvent } from "../lib/tracking";
import NotFound from "./NotFound";

const POSTS = [
  {
    slug: "how-to-create-ubl-invoice-en16931",
    lang: "en",
    title: "How to Create a UBL Invoice (EN 16931): Step-by-Step Guide",
    seoTitle: "How to Create a UBL Invoice (EN 16931) | FaturaPro",
    description: "Create a UBL XML invoice step by step, check the required EN 16931 data, avoid validation errors, and learn when Peppol delivery is required.",
    date: "2026-08-15",
    dateModified: "2026-09-08",
    readTime: "11 min",
    keywords: "UBL invoice, create UBL invoice, EN 16931, UBL XML, electronic invoice XML, Peppol, e-invoicing, UBL export",
    alternates: {
      en: "https://faturapro.app/blog/how-to-create-ubl-invoice-en16931",
      nl: "https://faturapro.app/ubl-factuur-maken",
      "x-default": "https://faturapro.app/blog/how-to-create-ubl-invoice-en16931",
    },
    quickAnswer: "A UBL invoice is a structured XML file that accounting software can read. To create one, complete the seller, buyer, invoice, line, VAT and payment data; export it in the UBL profile your customer accepts; validate the XML; then deliver it through the channel your customer requested. A PDF is useful for people, but it is not a substitute for the structured file.",
    checklist: [
      "Confirm which UBL or country profile the customer accepts",
      "Add complete seller and buyer legal details",
      "Use a unique invoice number, issue date and due date",
      "Enter currency, line quantities, unit prices and VAT per rate",
      "Export the XML and validate it before sending",
      "Ask whether email, a portal or Peppol delivery is required",
    ],
    sections: [
      { h: "What a UBL Invoice Is", p: "UBL stands for Universal Business Language. A UBL invoice is an XML document whose fields identify the supplier, customer, line items, tax treatment and totals in a predictable structure. That lets the customer's accounting system import the data instead of asking someone to retype a PDF. A PDF can still accompany the invoice for human review, but it is a digital document rather than structured invoice data." },
      { h: "Step 1: Confirm the Required Profile and Delivery Method", p: "Before exporting anything, ask the customer which profile and delivery route they accept. EN 16931 defines the common semantic model, while national or industry profiles can add rules. The customer may accept an XML attachment, require an upload to a supplier portal, or require delivery through Peppol. Those are different requirements, and a valid XML file is not automatically a Peppol submission." },
      { h: "Step 2: Complete the Seller and Buyer Details", p: "Enter the legal names and addresses of both parties, the supplier tax or VAT identifier where applicable, and the customer's identifier when the transaction requires it. Use the country codes and identifiers requested by the receiving system. Missing party information is one of the easiest ways for an otherwise correct invoice to be rejected." },
      { h: "Step 3: Add the Invoice Header and Payment Terms", p: "Use a unique sequential invoice number, an issue date, the currency and a clear due date or payment terms. If the customer gave you a purchase-order or buyer reference, include it in the field they specified. The invoice number and dates should match the human-readable PDF you send with the XML." },
      { h: "Step 4: Enter Lines, VAT and Totals Carefully", p: "Each line needs a useful description, quantity, unit price and tax category. Totals must reconcile: line net amounts, allowances or charges, VAT by rate, total excluding VAT, total VAT and amount due. Do not use a displayed currency symbol where the XML expects a three-letter currency code, and do not change the tax treatment simply to make a validator pass." },
      { h: "Step 5: Export the UBL XML", p: "Use invoicing or accounting software that can export the requested UBL profile. In Fatūra Pro, create the invoice, open its preview and choose UBL/XML export. Fatūra Pro generates the downloadable structured file; it does not transmit that file through the Peppol network. Send or upload it using the route your customer requested." },
      { h: "Step 6: Validate Before Delivery", p: "Validation checks whether the XML follows the required syntax and business rules. Use a validator that matches the customer's stated EN 16931, national or Peppol profile. Treat the first invoice for a new receiving system as a test: correct every error, keep the accepted file, and confirm that the customer's system imported it successfully." },
      { h: "UBL and Peppol Are Not the Same Thing", p: "UBL is an XML syntax used to represent structured invoice data. Peppol is a network and set of interoperability specifications used to exchange documents between registered participants. A tool can export UBL without being connected to Peppol. If the customer requires Peppol, you also need an approved access point or another service that provides delivery." },
      { h: "What About Credit Notes?", p: "A structured credit note is its own document type and should refer to the original invoice. It is not simply an invoice whose grand total was changed to a negative number. Check that your export uses the credit-note structure required by the receiving profile, and validate it separately from a normal invoice." },
      { h: "Common UBL Validation Errors", p: "Typical problems include missing VAT identifiers, an unsupported country or tax code, dates in the wrong format, totals that do not reconcile, a missing buyer reference, or a profile mismatch. A file can be well-formed XML and still fail the business rules of the customer's receiving system, which is why profile-specific validation matters." },
      { h: "Create the Invoice Once, Then Export It", p: "Fatūra Pro lets you create the readable invoice first and export its data as UBL/XML from the same record. You can also download the PDF for the person reviewing it. Start with a free account to build the invoice; UBL/XML export is available on the Pro plan. Always confirm and validate the format your customer expects." },
    ],
    faqs: [
      { q: "Is a PDF invoice the same as a UBL invoice?", a: "No. A PDF is designed for a person to read. UBL is structured XML designed for software to import and process. A customer may ask you to provide both." },
      { q: "Does Fatūra Pro send invoices through Peppol?", a: "No. Fatūra Pro exports a downloadable UBL/XML file. It does not provide Peppol network delivery, so use an access-point service if the customer specifically requires Peppol." },
      { q: "How do I know which UBL profile to use?", a: "Ask the receiving customer or portal for its accepted profile and validation rules. EN 16931 is the common European semantic standard, but country and network profiles can add constraints." },
      { q: "Should I validate every UBL invoice?", a: "Validate at least the first invoice and credit note for each receiving system, and validate again when customer requirements or your export software changes." },
    ],
    sources: [
      { label: "European Commission: EN 16931 eInvoicing services", href: "https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/467108660/Services" },
      { label: "European Commission: UBL 2.1 as a supported syntax", href: "https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/467108934/Required+syntaxes" },
    ],
    relatedLinks: [
      { label: "UBL factuur maken (Nederlands)", href: "/ubl-factuur-maken" },
      { label: "Create a free invoice", href: "/invoice-generator" },
      { label: "Late-payment reminder templates", href: "/late-payment-scripts" },
      { label: "Invoicing for freelancers", href: "/for-freelancers" },
    ],
  },
  {
    slug: "fatura-pro-plan-guide-how-to-use",
    lang: "en",
    title: "Fatura Pro Plan: Every Feature and How to Use It (2026 Guide)",
    description: "A step-by-step guide to the Pro plan: unlimited invoices, payment reminders, deposits, UBL export, multi-currency support, and custom branding.",
    date: "2026-08-15",
    dateModified: "2026-09-08",
    readTime: "7 min",
    keywords: "Fatura Pro plan, invoicing app guide, WhatsApp invoice reminder, UBL export, deposit invoice, unlimited invoices",
    sections: [
      { h: "What the Free Plan Already Gives You", p: "Before looking at Pro, it helps to know where the line sits. The free plan covers twenty invoices and five clients, with your own logo and branding, PDF export, every supported currency, and credit notes. Credit notes are free on purpose: correcting a wrong invoice is a legal necessity, not a premium feature. Free accounts also start with a seven-day trial of Pro, so you can test everything below before deciding." },
      { h: "Who the Pro Plan Is For", p: "Pro at nine euros a month fits the established solo professional: consultants, designers, developers, photographers and small service businesses that invoice regularly. The question is not whether you want more features; it is whether late payments, invoice volume, deposits or e-invoicing requests are costing you money right now. If none of them are, stay free with a clear conscience." },
      { h: "Unlimited Invoices and Clients", p: "Pro removes the counters. Create invoices and clients without watching a limit, and keep issuing to the same clients month after month. To create one: open the dashboard, click New Invoice, add the client, list your services as line items, pick the currency and the VAT rate, and save. Your clients are stored, so the next invoice to the same client takes seconds." },
      { h: "Payment Reminders by Email and WhatsApp", p: "From the invoices list, click the reminder icon next to an unpaid invoice, choose email or WhatsApp, then pick the language and tone. Fatura Pro prepares editable text with the invoice number, amount and due date. Review it, open it in your chosen app and send it yourself; the product does not send unattended reminders." },
      { h: "Deposits and Partial Payments", p: "Most freelance and agency work starts with money upfront, and invoicing tools usually pretend it does not. On Pro you can record a deposit or a partial payment against an invoice, so the document shows what has been received and what is still outstanding, and reminders chase the remaining balance rather than the full amount. No more parallel spreadsheet to track who paid half." },
      { h: "UBL/XML Export", p: "Pro exports an invoice as downloadable UBL/XML intended for EN 16931 workflows. Receiving systems can apply country, network or customer-specific profile rules, so confirm the format your client accepts and validate the file before delivery. Fatura Pro does not send it through Peppol." },
      { h: "Multi-Currency Without Conversion", p: "Invoice in whichever currency your client pays in. Nothing is converted behind your back: the amount you type is the amount on the document, and your totals stay separated per currency instead of being merged into one misleading number. An automatic exchange rate would always differ from what actually lands in your bank account, which is why it is deliberately absent." },
      { h: "Branding and Invoice Defaults", p: "Go to Settings and then Invoice Defaults to add your business name, logo, address, bank or payment details, invoice number prefix, default VAT rate and standard payment terms. Everything saved there appears automatically on every new invoice, which is a five-minute setup that pays for itself immediately." },
      { h: "Your Dashboard", p: "The dashboard shows revenue, pending and overdue amounts at a glance, per currency, so you always know where your money stands and which client needs a follow-up without opening a spreadsheet." },
      { h: "Start With the Free Trial", p: "Every new account begins with a seven-day Pro trial, no credit card required. If it fits your workflow, Pro is nine euros a month. If you run a team or agency and need quotes, recurring invoices, VAT reports or shared access, look at the Business plan instead." },
    ],
  },
  {
    slug: "fatura-business-plan-guide-how-to-use",
    lang: "en",
    title: "Fatura Business Plan: Every Feature and How to Use It",
    description: "Explore the Business plan: quotes, recurring invoices, VAT expense reports, five team members, online payments, multiple businesses, and API access.",
    date: "2026-08-15",
    dateModified: "2026-09-08",
    readTime: "8 min",
    keywords: "invoicing software for agencies, recurring invoices, VAT report freelancer, invoice team members, online invoice payment, quote to invoice",
    sections: [
      { h: "Built for Agencies and Teams", p: "Business at nineteen euros a month is the most complete tier, designed for agencies, studios, teams and owners of more than one business. It includes everything in Pro, which already covers unlimited invoicing, editable payment reminders, deposits and UBL/XML export, and adds the tools that appear once more than one person is involved. Five team members are included at the flat Business price. New accounts start with a seven-day Pro trial; Business features require the Business plan." },
      { h: "Quotes That Convert to Invoices", p: "Send a professional quote, and when the client approves it, turn it into a full invoice in one click with every line item carried across. Open Quotes from the menu, click New Quote, add the client and the items, and save. On approval, convert it. Nothing is retyped, which is exactly where errors and delays used to creep in." },
      { h: "Automatic Recurring Invoices", p: "For retainer clients, set the schedule once and let it run: weekly, every two weeks, monthly or yearly. Open any invoice, choose the recurring option and pick the frequency. Invoices are then created automatically on schedule, and you can pause or resume any of them from settings." },
      { h: "Expenses and Quarterly VAT Summaries", p: "Log business costs under Expenses with the amount and VAT rate. The page shows a quarterly summary per currency: VAT recorded on invoices, VAT recorded on expenses and the difference. You can export the records for an accountant, but Fatura Pro does not file a tax return or determine whether each entry is legally deductible." },
      { h: "Team Access for Up to Five People", p: "Go to Settings, then Team members, enter a colleague's email and invite them. After they sign up with that same address, they can join the shared workspace. Billing, settings and business-profile controls remain owner-only. Test the access with one colleague before moving active client records." },
      { h: "Online Payments for Your Clients", p: "Connect Stripe once from Settings, and every invoice gains a payment link. Send it, the client pays by card, and the invoice marks itself as paid automatically. The money goes directly to your own Stripe account, not through us." },
      { h: "Multiple Business Profiles", p: "Run more than one venture from a single login. Add each business under Settings with its own name, address and tax details, then pick which one an invoice comes from and the details fill in automatically." },
      { h: "Advanced Analytics", p: "See monthly revenue, your best clients and how long invoices actually take to get paid. It is the difference between feeling busy and knowing which clients are worth keeping." },
      { h: "Accountant Export", p: "Export all invoices as a CSV file ready for your accountant, in one click from the invoices page. No manual copying at tax time." },
      { h: "API Access", p: "For store owners and developers: generate an API key in Settings and let your own systems create invoices automatically, so a new order becomes an invoice without anyone retyping it. It works through your developer or a no-code tool that can send HTTP requests." },
      { h: "White-Label Invoices and Priority Support", p: "On Business your invoices carry only your own name and logo, with no reference to the software, and you get the in-app assistant for priority support inside the app rather than waiting on email." },
      { h: "Start with the Plan You Need", p: "A new account starts with a seven-day Pro trial and does not require a card. Business features such as quotes, recurring schedules, expense summaries and team access require the Business plan, which can be cancelled through the billing portal." },
    ],
  },
  {
    slug: "invoicing-plans-free-vs-pro-vs-business",
    lang: "en",
    title: "Free vs Pro vs Business: How to Choose and Use Your Invoicing Plan (2026 Guide)",
    description: "Compare invoicing plans, see what the free plan includes, learn when to upgrade, and choose the right features for freelancers and small businesses.",
    date: "2026-07-26",
    dateModified: "2026-09-08",
    readTime: "11 min",
    keywords: "invoicing software plans, free invoicing software, invoicing software for freelancers, how to use invoicing software, invoicing plan comparison, best invoicing software small business 2026, invoicing software for agencies",
    sections: [
      { h: "Do You Actually Need Paid Invoicing Software?", p: "Most people start invoicing with a Word template, move to a free tool when the templates get messy, and only pay once something specific starts costing them money — usually late payments, repeated data entry, or tax season. That is the honest way to think about invoicing plans: not as tiers to climb, but as problems to solve. This guide walks through three plan levels, who each one genuinely suits, and exactly how to use every feature step by step, so you can pick the smallest plan that solves your actual problem." },
      { h: "The Three Plans at a Glance", p: "Fatūra Pro has three levels. Free covers up to 20 invoices and 5 clients, with no card required and no time limit. Pro at 9 euros a month removes those limits and adds editable payment reminders, deposits and UBL/XML export. Business at 19 euros a month adds quotes, recurring invoice creation, expenses with VAT summaries, up to five team members, connected Stripe client payments, multiple business profiles, analytics, accountant export, API access and removal of Fatūra branding. New accounts receive a seven-day Pro trial; Business features require the Business plan." },
      { h: "The Free Plan: Who It Is For", p: "The free plan fits three situations well. First, you are just starting out and invoice a handful of clients a month. Second, you run a side business alongside a job and your invoicing volume is genuinely low. Third, you are evaluating tools and want to send real invoices to real clients before paying anything. With 20 invoices and 5 clients, this is not a crippled demo: a freelancer with two or three regular clients can run for months on it without paying." },
      { h: "Step by Step: Creating Your First Invoice", p: "Create an account with email or Google, open Settings and add reusable business details, then choose New Invoice. Enter the client, line items, currency, dates and tax treatment, save the invoice and review the preview. Use Print/PDF to save a copy and deliver it through the channel your client accepts. The app stores client and business details to reduce retyping on later invoices." },
      { h: "What You Get on Free (And What You Do Not)", p: "The free plan includes the full invoice editor, your logo and branding on the document, PDF export, all 17 currencies, client management, and the dashboard showing revenue, pending and overdue totals. What it does not include: payment-reminder templates, unlimited volume, and the Business features listed later. Free invoices also carry a small Fatūra Invoicing credit in the footer, which is removed on the Business plan. Nothing expires and no card is ever requested." },
      { h: "Four Signs You Have Outgrown Free", p: "One, you are deleting old invoices to make room for new ones. Two, you are chasing late payments manually and it is costing you real hours and awkward conversations. Three, you are copying the same invoice every month for the same client. Four, someone else in your business needs to issue invoices while you are busy. The first two point to Pro; the last two point to Business. If none of these apply yet, stay free with a clear conscience." },
      { h: "The Pro Plan: Who It Is For", p: "Pro at 9 euros a month suits the established solo professional: consultants, designers, developers, photographers, tradespeople and small service businesses that invoice regularly. The core value is not only the higher limits; it is having the payment status and reminder text in the same workflow instead of rewriting every follow-up." },
      { h: "Step by Step: Payment Reminders", p: "One, open your invoices list and find an unpaid or overdue invoice. Two, click the reminder icon next to it. Three, choose email or WhatsApp. Four, choose the language and the tone, from polite to firm to final notice. Five, review the message, which includes the invoice number, amount and due date, then open it in your chosen app and send it yourself." },
      { h: "Step by Step: Branding, Currencies and Defaults", p: "To put your identity on every invoice, open Settings and then Invoice Defaults and upload your logo, add your business name and address, your bank or payment information, your invoice number prefix, your default tax rate and your standard payment terms. To invoice an international client, simply choose their currency from the dropdown when creating the invoice; amounts and symbols adapt automatically while your dashboard keeps the overall picture. These details are what make an invoice look like a business rather than a favour." },
      { h: "The Business Plan: Who It Is For", p: "Business at 19 euros a month is built for small agencies, studios, teams and people running more than one venture. It is the relevant tier when several people need shared operational records, when quotes precede invoices, when scheduled invoice creation helps with retainers, or when expenses and VAT summaries support the bookkeeping workflow. Up to five team members are included in the flat Business price." },
      { h: "Step by Step: Quotes, Recurring Invoices and VAT Summaries", p: "For quotes, open Quotes, create the document and convert an accepted quote to an invoice after review. For recurring work, open an invoice, choose the recurring option and select weekly, biweekly, monthly or yearly; the schedule creates new pending invoices for review and sending, and can be paused in Settings. Under Expenses, record the amount, currency, VAT rate and description. The quarterly summary shows VAT recorded on invoices, VAT recorded on expenses and the difference per currency; it does not file a return or decide the correct tax treatment." },
      { h: "Step by Step: Team Access, Online Payments and API", p: "To add a colleague, open Settings and then Team members, enter their email and send the invite. They sign up with that same address to join the shared workspace; billing and owner settings stay restricted. For client card payments, connect the business owner's Stripe account, copy the invoice payment link and send it to the client. Successful payment updates the invoice through Stripe. API access lets a server or integration list invoices and create new pending invoices programmatically; keep API keys on the server." },
      { h: "How to Upgrade, Switch Plans or Cancel", p: "To upgrade, open Settings and click Upgrade, or use the pricing section on the homepage, choose a plan and complete Stripe checkout. New accounts receive a seven-day Pro trial. To manage a paid subscription, update the payment method, view receipts or cancel, open Settings and then Subscription. The Stripe billing portal shows the effective dates and billing details before you confirm changes." },
      { h: "Frequently Asked Questions", p: "The Free plan has no time limit and requires no card. All plans support 17 invoice currencies, kept as separate totals. App navigation is available in English, Spanish and French; invoice fields can contain Arabic text, and reminder templates are available in English, Dutch, French and Arabic. Team access is a Business feature with up to five members." },
      { h: "Start Free and Upgrade Only When It Pays", p: "The right invoicing plan is the smallest one that removes the current bottleneck. Start with the Free plan, test the core invoice workflow and use the seven-day Pro trial to evaluate Pro features. Upgrade when invoice volume, payment follow-up, deposits or UBL/XML export justify Pro, or when the Business workflow is needed." },
    ],
  },
  {
    slug: "best-invoicing-software-small-agencies",
    lang: "en",
    title: "Best Invoicing Software for Small Agencies: What to Compare",
    seoTitle: "Best Invoicing Software for Small Agencies | FaturaPro",
    description: "Compare invoicing software for small agencies by team access, quotes, recurring billing, payment follow-up, VAT reporting and total team cost.",
    date: "2026-07-24",
    dateModified: "2026-09-08",
    readTime: "9 min",
    keywords: "best invoicing software for small agencies, agency invoicing software, team invoicing software, quotes to invoice, recurring invoices for agencies, invoice software team pricing",
    quickAnswer: "The best invoicing software for a small agency should keep quotes, invoices, recurring retainers, expenses and payment status in one shared workflow. Compare the price for your full team—not just the advertised entry price—and verify what members can access before migrating client data.",
    checklist: [
      "Shared access with clear owner-only settings",
      "Quotes that convert to invoices without retyping",
      "Recurring invoices for retainers",
      "Deposits, partial payments and outstanding balances",
      "Payment reminders your team can review before sending",
      "Expense and VAT reporting that matches your workflow",
      "A predictable total cost at your actual team size",
    ],
    sections: [
      { h: "Why Small Agencies Outgrow Solo Invoicing Tools", p: "Agency billing has more hand-offs than freelance billing. One person prepares a quote, another delivers the work, an owner approves the invoice, and someone later follows up on payment. Retainers add recurring schedules, while the accountant needs consistent client, VAT and expense records. A tool that works for one person can become a bottleneck when every change has to pass through the account owner." },
      { h: "Calculate the Price for the Whole Team", p: "Start with the number of people who actually need access, then calculate the monthly and annual cost at that team size. Some products include several members; others charge per seat or restrict collaboration to higher tiers. Also check whether a bookkeeper or temporary contractor consumes a paid seat. The useful comparison is the final cost for your workflow, not the smallest number on a pricing page." },
      { h: "Check Roles and Shared Access", p: "Team access should let members work with the same clients, invoices, quotes and expenses without exposing subscription or company-level controls unnecessarily. Test who can edit, delete and view records, and whether the owner retains control of billing and integrations. In Fatūra Pro Business, invited members share operational records while owner-level areas remain restricted." },
      { h: "Turn Approved Quotes into Invoices", p: "A quote-to-invoice workflow removes retyping at the exact point where accuracy matters most. The accepted client, scope, quantities and prices should carry into the invoice, while you still review tax, dates and payment terms before sending. Fatūra Pro Business includes quotes that can be converted into invoices from the same workspace." },
      { h: "Handle Retainers with Recurring Invoices", p: "For a fixed weekly, biweekly, monthly or yearly retainer, recurring invoices reduce missed billing dates. Check whether the software creates a draft or a final invoice, how you pause a schedule, and what happens when a fee changes. Fatūra Pro can generate recurring invoices on a schedule and lets the owner pause or resume the recurrence." },
      { h: "Track Deposits and Partial Payments", p: "Project work often starts with a deposit and ends with a remaining balance. The invoice should show what has been received and what is still due, so reminders do not ask for the original total after a partial payment. Fatūra Pro records deposits and partial payments and uses the outstanding balance in its reminder text." },
      { h: "Make Payment Follow-Up Consistent", p: "Good follow-up is a repeatable process, not an aggressive email. Look for clear overdue status and editable reminder templates with the invoice number, amount and due date already filled in. Fatūra Pro prepares polite, firm and final messages and opens them in email or WhatsApp for your review and sending; it does not silently send a scheduled chase on your behalf." },
      { h: "Review Expenses and VAT Without Overpromising", p: "Expense and VAT summaries can reduce spreadsheet work, but they do not replace an accountant or the tax authority's filing process. Check whether different currencies stay separate and whether the export contains the fields your accountant expects. Fatūra Pro Business tracks expenses, shows VAT summaries and provides a CSV accountant export." },
      { h: "Confirm Payment, Export and Integration Needs", p: "If card payment matters, check which processor is supported and where the money settles. If a customer requests e-invoicing, distinguish UBL/XML export from Peppol delivery. Fatūra Pro can connect an agency's own Stripe account for invoice payment links and can export UBL/XML, but it does not deliver invoices through Peppol." },
      { h: "Run a Real Workflow Test Before Migrating", p: "Before moving active billing, use representative data to test the workflow your agency needs: a client, quote conversion, deposit, recurring schedule, teammate invitation and accountant export. Fatūra Pro has a Free plan and a seven-day Pro trial. Quotes, recurring schedules, expenses and team access require Business." },
    ],
    faqs: [
      { q: "What invoicing features does a small agency need first?", a: "Most small agencies should prioritise shared client and invoice access, quote-to-invoice conversion, recurring retainers, deposits, payment status and a predictable team price before advanced integrations." },
      { q: "Should agency invoicing software charge per user?", a: "Either model can work. Compare the total at your real team size, including temporary or finance users, and check whether roles and features change at higher tiers." },
      { q: "Can Fatūra Pro send automatic payment reminders?", a: "Fatūra Pro prepares editable reminder text and opens it in email or WhatsApp for a user to review and send. It does not schedule unattended payment-reminder delivery." },
      { q: "Does Fatūra Pro provide Peppol delivery?", a: "No. Fatūra Pro exports UBL/XML files but does not send them through the Peppol network." },
    ],
    relatedLinks: [
      { label: "Invoicing workflows for agencies", href: "/for-agencies" },
      { label: "Compare Free, Pro and Business", href: "/blog/invoicing-plans-free-vs-pro-vs-business" },
      { label: "Late-payment reminder templates", href: "/late-payment-scripts" },
      { label: "UBL/XML invoice guide", href: "/blog/how-to-create-ubl-invoice-en16931" },
    ],
  },
{
    slug: "best-invoicing-app-arabic-support",
    lang: "en",
    title: "Invoice App for Arabic Invoice Content (2026 Guide)",
    description: "Need Arabic names and line items on an invoice? Learn what Arabic document support means, what to compare, and where app-language support differs.",
    date: "2026-07-19",
    dateModified: "2026-09-08",
    readTime: "6 min",
    keywords: "invoicing app Arabic, Arabic invoice software, bilingual invoice, Arabic English invoicing, create invoice in Arabic",
    sections: [
      { h: "Why Arabic Support in Invoicing Software Is So Hard to Find", p: "If you've searched for invoicing software that handles Arabic, you already know the frustration. Most international tools are built for the Western market. They either don't support Arabic at all, or they support it cosmetically: the text appears, but the layout breaks, numbers misalign, and the invoice looks unprofessional. For the 420+ million Arabic speakers running businesses worldwide, this is a real gap." },
      { h: "What Real Arabic Support Actually Means", p: "True Arabic support isn't just translated menu labels. It means full right-to-left layout, correct Arabic script rendering on the invoice itself, the ability to enter client names, company names, and notes in Arabic, and a document that prints cleanly without floating text or broken characters. When you evaluate a tool, create a test invoice in Arabic and export it. If it looks polished, that's real support." },
      { h: "Bilingual Is Even Better", p: "Many Arabic-speaking business owners work with international clients too. That's why bilingual Arabic-English invoicing matters: you send Arabic invoices to local clients and English ones to international clients, from the same account, without switching tools. This flexibility is rare, and it's exactly what freelancers serving mixed markets need." },
      { h: "What Else to Look For", p: "Beyond language, useful invoicing features include multiple currencies for international clients, clear overdue status, editable payment-reminder templates, PDF export, a clean dashboard and fair pricing. WhatsApp-ready reminder text can be especially useful in markets where client communication already happens there." },
      { h: "Where Fatura Pro Fits", p: "Fatura Pro lets you enter Arabic client names, company names, line items and notes, and its printable invoice layout supports right-to-left text. Payment-reminder templates are available in Arabic, English, French and Dutch. App navigation is currently available in English, Spanish and French, so this is Arabic document-content support rather than a fully Arabic application interface." },
      { h: "Try the Invoice Workflow", p: "You can create a free account with no card. The Free plan includes up to 20 invoices and 5 clients. New accounts receive seven days of Pro features, including unlimited invoices, editable reminders, deposits and UBL/XML export. Business features require the Business plan." },
    ],
  },
  {
    slug: "zzp-invoice-app-english-netherlands",
    lang: "en",
    title: "English Invoicing Software for ZZP'ers in the Netherlands",
    seoTitle: "English Invoicing Software for ZZP'ers | FaturaPro",
    description: "A practical English guide to Dutch ZZP invoicing: required invoice fields, BTW rates, international clients, UBL/XML and software features to compare.",
    date: "2026-07-20",
    dateModified: "2026-09-08",
    readTime: "9 min",
    keywords: "English invoicing software ZZP, ZZP invoice Netherlands, Dutch invoice requirements English, BTW invoice freelancer, invoice app Netherlands English, UBL invoice ZZP",
    quickAnswer: "A Dutch ZZP invoice normally needs both parties' legal names and addresses, your VAT ID and KVK number when applicable, a unique sequential number, issue and supply dates, a clear description and quantity, amounts excluding VAT, the VAT rate and the VAT amount. Extra rules can apply to cross-border work, exemptions and simplified invoices.",
    checklist: [
      "Your legal name, business address, VAT ID and KVK number when applicable",
      "The customer's legal name and full address",
      "A unique sequential invoice number and issue date",
      "The supply date and a clear description and quantity",
      "Unit price and totals excluding VAT, VAT rate and VAT amount",
      "Payment terms and the details the customer needs to pay",
    ],
    sections: [
      { h: "What ZZP Means for Your Invoicing", p: "ZZP is commonly used for an independent professional working without employees, but it is not a separate legal form or a single tax status. Your invoice obligations depend on the transaction, your VAT position and whether the customer is in the Netherlands, elsewhere in the EU or outside the EU. English-language software can make the workflow easier for expats, but it does not decide the tax treatment for you." },
      { h: "What a Standard Dutch Business Invoice Must Include", p: "For a standard invoice, include the supplier's and customer's full legal names and addresses, the supplier's VAT identification number, the KVK number when registered, a unique sequential invoice number, the invoice date, the supply or service date, a clear description and quantity, the price excluding VAT, the VAT rate and the VAT amount. Simplified invoices and specific sectors can follow adjusted rules." },
      { h: "BTW Rates: 21%, 9% and 0% Are Different Treatments", p: "The Netherlands has a standard 21% VAT rate plus 9% and 0% rates for qualifying supplies. Exemption, the small-business scheme (KOR) and reverse charge are not interchangeable labels for 0% VAT. Choose the treatment that applies to the actual supply, and include required wording or customer VAT details when the rules call for it." },
      { h: "Invoices for Clients in Other Countries", p: "Cross-border invoices can require additional information. For many services supplied to a VAT-registered business in another EU country, VAT is reverse-charged and both VAT IDs plus reverse-charge wording are required, but exceptions exist. Ask an accountant or check the Belastingdienst guidance for the specific customer, service and country instead of applying a generic international template." },
      { h: "English Invoice, PDF or UBL/XML?", p: "An invoice can be written in English as long as it contains the required information and remains understandable for the parties and administration. A PDF is a digital invoice for human reading. UBL/XML is structured data that a customer's accounting system can import. Peppol is a delivery network, not another name for the XML file. Fatūra Pro exports UBL/XML but does not provide Peppol delivery." },
      { h: "What to Look for in English ZZP Invoice Software", p: "Prioritise an English interface, reusable business and client details, sequential numbering, adjustable VAT, clear due dates, credit notes, multiple currencies and exports your customers actually accept. If you work internationally, check that currency totals stay separate. If you submit VAT returns, confirm what the expense and VAT report includes before relying on it." },
      { h: "How Fatūra Pro Supports the Workflow", p: "Fatūra Pro provides an English interface, client records, invoice and credit-note creation, PDF output, 17 invoice currencies, deposits and partial payments. It marks overdue invoices and prepares editable reminder text that opens in email or WhatsApp for you to review and send. The Business plan adds expenses and VAT summaries; those summaries support bookkeeping but do not file a return with the Belastingdienst." },
      { h: "Create a Test Invoice Before You Commit", p: "Start by entering your real business details and creating one invoice for a typical customer. Check the legal names, addresses, dates, invoice sequence, VAT treatment and payment details, then export the format the customer requested. Fatūra Pro has a free plan with no card required, so you can test the core invoice flow before deciding whether paid features fit your work." },
    ],
    faqs: [
      { q: "Can a Dutch ZZP invoice be written in English?", a: "Yes, businesses commonly invoice international customers in English. The invoice still needs the information required for the transaction, and the records must remain clear to the parties and tax administration." },
      { q: "Does every ZZP'er charge 21% BTW?", a: "No. The applicable rate or treatment depends on the goods or services, the customer, location and the entrepreneur's VAT position. The Netherlands also uses 9% and 0% rates, exemptions, KOR and reverse-charge rules in qualifying cases." },
      { q: "Does Fatūra Pro file my Dutch VAT return?", a: "No. The Business plan provides expense and VAT summaries to support bookkeeping, but it does not submit a VAT return to the Belastingdienst." },
      { q: "Does Fatūra Pro send UBL invoices through Peppol?", a: "No. It exports a UBL/XML file that you download and deliver through the method your customer requires. Peppol delivery needs a separate access-point service." },
    ],
    sources: [
      { label: "Business.gov.nl: invoice requirements in the Netherlands", href: "https://business.gov.nl/regulations/invoice-requirements/" },
      { label: "Belastingdienst: official invoice requirements", href: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontenten/belastingdienst/business/vat/vat_in_the_netherlands/vat_administration/invoice_requirements" },
      { label: "Business.gov.nl: VAT rates and schemes", href: "https://business.gov.nl/regulations/vat/" },
    ],
    relatedLinks: [
      { label: "Create a free invoice", href: "/invoice-generator" },
      { label: "UBL factuur maken (Nederlands)", href: "/ubl-factuur-maken" },
      { label: "UBL/XML guide in English", href: "/blog/how-to-create-ubl-invoice-en16931" },
      { label: "Payment reminder templates", href: "/late-payment-scripts" },
    ],
  },
  {
    slug: "how-to-create-professional-invoice",
    lang: "en",
    title: "How to Create a Professional Invoice in 2026 (Step-by-Step Guide)",
    description: "Learn how to create a clear professional invoice: required fields, practical formatting tips, payment terms, and common mistakes to avoid.",
    date: "2026-07-08",
    dateModified: "2026-09-08",
    readTime: "6 min",
    keywords: "how to create an invoice, professional invoice, invoice template, freelance invoice",
    sections: [
      { h: "What Makes an Invoice Professional?", p: "A professional invoice is more than a payment request: it should identify both parties, explain what was supplied, show the calculation clearly, provide a unique invoice number and state when and how payment is due. Exact legal requirements vary by country and transaction, so check the rules that apply to your business." },
      { h: "Essential Elements Every Invoice Needs", p: "1. Your business name and contact information. 2. Client name and details. 3. Unique invoice number (e.g. INV-001). 4. Issue date and due date. 5. Itemized list of services or products with quantities and prices. 6. Subtotal, taxes, and total amount. 7. Payment terms and accepted methods. 8. Optional: your logo and a thank-you note." },
      { h: "Step 1: Set Up Your Business Profile", p: "Before creating your first invoice, prepare your business information: legal name, address, email, phone, and tax details if applicable. Using invoicing software like Fatūra Pro, you enter this once and it auto-fills on every invoice — saving time and avoiding typos." },
      { h: "Step 2: Add Your Client Details", p: "Include the client's full name or company name, email, and address. Keeping a client record means you can reuse the details on a later invoice instead of typing them again." },
      { h: "Step 3: Itemize Your Services", p: "Break down your work into clear line items. Instead of 'Design work — €500', write 'Logo design (3 concepts + revisions) — €300' and 'Brand color palette — €200'. Clear descriptions help the client understand exactly what the invoice covers." },
      { h: "Step 4: Set Clear Payment Terms", p: "Specify the due date clearly. 'Net 14' or 'Net 30' are standard, but shorter terms often work for freelancers. Include your bank details or payment link. Adding a small late-fee clause can motivate on-time payments." },
      { h: "Step 5: Send and Track", p: "Send your invoice as a PDF via email. Then track its status: paid, pending or overdue. A useful invoicing app shows which invoices need follow-up and prepares accurate reminder text without pretending that a message was sent before you review it." },
      { h: "Common Invoicing Mistakes to Avoid", p: "Common problems include missing or duplicated invoice numbers, unclear descriptions, omitted dates, incorrect tax treatment, the wrong currency and inconsistent payment follow-up. Software can reduce retyping and calculation errors, but you still need to review the document and apply the rules for the transaction." },
    ],
  },
  {
    slug: "how-to-create-professional-invoice-arabic",
    lang: "ar",
    title: "كيف تنشئ فاتورة احترافية في 2026 — دليل خطوة بخطوة",
    description: "تعلم كيف تنشئ فاتورة احترافية تساعدك على استلام مستحقاتك بسرعة. العناصر الأساسية، النصائح، والأخطاء الشائعة.",
    date: "2026-07-08",
    dateModified: "2026-09-08",
    readTime: "6 دقائق",
    keywords: "كيف اعمل فاتورة, فاتورة احترافية, نموذج فاتورة, فواتير للمستقلين",
    sections: [
      { h: "ما الذي يجعل الفاتورة احترافية؟", p: "الفاتورة الاحترافية توضح هوية الطرفين، والخدمة أو المنتج، وطريقة حساب المبلغ، ورقم الفاتورة، وموعد وطريقة الدفع. المتطلبات القانونية والضريبية تختلف حسب البلد ونوع المعاملة، لذلك راجع القواعد التي تنطبق على نشاطك." },
      { h: "العناصر الأساسية لكل فاتورة", p: "1. اسم نشاطك وبيانات التواصل. 2. اسم العميل وبياناته. 3. رقم فاتورة فريد (مثل INV-001). 4. تاريخ الإصدار وتاريخ الاستحقاق. 5. قائمة مفصلة بالخدمات أو المنتجات مع الكميات والأسعار. 6. المجموع الفرعي والضرائب والمجموع الكلي. 7. شروط الدفع وطرق الدفع المقبولة. 8. اختياري: شعارك ورسالة شكر." },
      { h: "الخطوة 1: جهّز ملف نشاطك التجاري", p: "قبل إنشاء أول فاتورة، جهّزي معلومات نشاطك: الاسم، العنوان، الإيميل، الهاتف، والبيانات الضريبية إن وجدت. مع تطبيق مثل Fatūra Pro تدخل هذه البيانات مرة واحدة وتظهر تلقائياً في كل فاتورة — توفير للوقت وتجنب للأخطاء." },
      { h: "الخطوة 2: أضف بيانات عميلك", p: "أدخل اسم العميل أو شركته، الإيميل، والعنوان. الاحتفاظ بقاعدة بيانات للعملاء يعني أنك لن تعيد كتابة هذه المعلومات أبداً. أدوات الفوترة الاحترافية تحفظ عملاءك بأمان فيصبح إنشاء فاتورة متكررة مسألة ثوانٍ." },
      { h: "الخطوة 3: فصّل خدماتك", p: "قسّم عملك لبنود واضحة. بدلاً من 'أعمال تصميم — 500€' اكتب 'تصميم شعار (3 نماذج + تعديلات) — 300€' و'لوحة ألوان العلامة — 200€'. العملاء يدفعون أسرع عندما يفهمون بالضبط مقابل ماذا يدفعون." },
      { h: "الخطوة 4: حدد شروط دفع واضحة", p: "حدد تاريخ الاستحقاق بوضوح. 14 يوم أو 30 يوم هي المدد الشائعة، لكن المدد الأقصر تناسب المستقلين غالباً. أضف بياناتك البنكية أو رابط الدفع. إضافة بند بسيط عن رسوم التأخير يحفّز الدفع في الوقت." },
      { h: "الخطوة 5: أرسل وتابع", p: "نزّل الفاتورة كملف PDF وأرسلها بالطريقة التي تناسب عميلك، ثم تابع حالتها: مدفوعة أو معلقة أو متأخرة. Fatūra Pro يجهّز نص تذكير قابلًا للتعديل، ثم تراجعه وتفتحه في البريد أو واتساب لترسله بنفسك؛ ولا يرسل التذكيرات تلقائياً دون مراجعتك." },
      { h: "أخطاء شائعة تجنبها", p: "من الأخطاء الشائعة تكرار رقم الفاتورة، والوصف غير الواضح، وغياب التاريخ، والمعالجة الضريبية غير الصحيحة، واختيار عملة خاطئة، وعدم مراجعة المستند قبل إرساله. التطبيق يقلل إعادة الكتابة وأخطاء الحساب لكنه لا يلغي مسؤولية المراجعة." },
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

function CTABox({ ar, source, placement }) {
  return (
    <div style={{ background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:14, padding:"28px 26px", margin:"36px 0", textAlign:"center" }}>
      <div style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:22, color:"#e8e4dc", marginBottom:8 }}>{ar ? "جاهز تنشئ فاتورتك الأولى؟" : "Ready to create your first invoice?"}</div>
      <div style={{ fontSize:14, color:"#9a9690", marginBottom:18, lineHeight:1.7 }}>{ar ? "أنشئ فاتورتك الأولى مجاناً وبدون بطاقة ائتمانية" : "Create your first invoice free — no credit card required"}</div>
      <a href={"/login?signup=1&source=seo_" + encodeURIComponent(source || "blog")} onClick={() => trackEvent("seo_cta_clicked", { page:source || "blog", placement:placement || "article", destination:"signup" })} style={{ display:"inline-block", padding:"12px 32px", borderRadius:10, background:"linear-gradient(135deg,#f0d878,#c9a84c)", color:"#0a0a0f", fontWeight:700, fontSize:15, textDecoration:"none" }}>{ar ? "ابدأ مجاناً ←" : "Start Free →"}</a>
    </div>
  );
}

function RelatedLinks({ links }) {
  if (!links?.length) return null;
  return (
    <nav aria-label="Related invoicing guides" style={{ margin:"42px 0", padding:"24px", background:"#111118", border:"1px solid rgba(201,168,76,0.18)", borderRadius:14 }}>
      <h2 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:22, color:"#e8e4dc", margin:"0 0 14px" }}>Useful next steps</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:10 }}>
        {links.map((link) => (
          <a key={link.href} href={link.href} style={{ color:"#e8c97a", fontSize:14, lineHeight:1.5, textDecoration:"none", borderBottom:"1px solid rgba(201,168,76,0.25)", padding:"7px 0" }}>{link.label} →</a>
        ))}
      </div>
    </nav>
  );
}

function Sources({ sources }) {
  if (!sources?.length) return null;
  return (
    <section style={{ margin:"42px 0" }} aria-labelledby="official-sources-heading">
      <h2 id="official-sources-heading" style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:22, color:"#c9a84c", margin:"0 0 12px" }}>Official sources</h2>
      <p style={{ fontSize:13.5, color:"#9a9690", lineHeight:1.7, margin:"0 0 10px" }}>Use the official guidance for the rules or technical profile that applies to your transaction.</p>
      <ul style={{ margin:0, paddingLeft:20, color:"#9a9690" }}>
        {sources.map((source) => <li key={source.href} style={{ margin:"7px 0" }}><a href={source.href} target="_blank" rel="noreferrer" style={{ color:"#e8c97a" }}>{source.label}</a></li>)}
      </ul>
    </section>
  );
}

export function BlogIndex() {
  useEffect(() => {
    const canonical = "https://faturapro.app/blog";
    const cleanupSeo = applyPageSeo({
      title: "Invoicing Guides for Freelancers & Small Teams | FaturaPro",
      description: "Practical guides to professional invoices, payment follow-up, UBL/XML, Dutch ZZP invoicing and billing workflows for freelancers and small teams.",
      canonical,
      language: "en",
      locale: "en_US",
      alternates: { en:canonical, "x-default":canonical },
    });
    const restoreSiteSchema = suspendBaseSiteSchema();
    const schema = document.createElement("script");
    schema.id = "blog-index-schema";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context":"https://schema.org",
      "@type":"CollectionPage",
      "@id":canonical + "#collection",
      url:canonical,
      name:"FaturaPro invoicing guides",
      description:"Guides to invoicing, payment follow-up, UBL/XML and small-business billing workflows.",
      isPartOf:{ "@id":"https://faturapro.app/#website" },
      mainEntity:{ "@type":"ItemList", itemListElement:POSTS.map((post, index) => ({ "@type":"ListItem", position:index + 1, url:"https://faturapro.app/blog/" + post.slug, name:post.title })) },
    });
    document.head.appendChild(schema);
    return () => { schema.remove(); restoreSiteSchema(); cleanupSeo(); };
  }, []);
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
      const purl = "https://faturapro.app/blog/" + post.slug;
      const language = post.lang === "ar" ? "ar" : "en";
      const cleanupSeo = applyPageSeo({
        title: post.seoTitle || post.title,
        description: post.description,
        canonical: purl,
        language,
        locale: post.lang === "ar" ? "ar_SA" : "en_US",
        type: "article",
        imageAlt: post.title,
        alternates: post.alternates || { [language]: purl, "x-default": purl },
      });
      const restoreSiteSchema = suspendBaseSiteSchema();
      const oldSchema = document.getElementById("post-schema");
      if (oldSchema) oldSchema.remove();
      const sc = document.createElement("script");
      sc.type = "application/ld+json";
      sc.id = "post-schema";
      const graph = [
        { "@type": "BlogPosting", "@id":purl + "#article", headline: post.title, description: post.description, datePublished: post.date, dateModified: post.dateModified || post.date, inLanguage: language, keywords: post.keywords, mainEntityOfPage:{ "@id":purl }, image:"https://faturapro.app/hero-dashboard.png", isPartOf:{ "@id":"https://faturapro.app/#website" }, author: { "@type": "Organization", name: "FaturaPro", url: "https://faturapro.app/" }, publisher: { "@type": "Organization", name: "FaturaPro", url: "https://faturapro.app/", logo:{ "@type":"ImageObject", url:"https://faturapro.app/fatura-mark.svg" } } },
        { "@type":"BreadcrumbList", itemListElement:[{ "@type":"ListItem", position:1, name:"Home", item:"https://faturapro.app/" }, { "@type":"ListItem", position:2, name:"Blog", item:"https://faturapro.app/blog" }, { "@type":"ListItem", position:3, name:post.title, item:purl }] },
      ];
      if (post.faqs?.length) graph.push({ "@type":"FAQPage", mainEntity:post.faqs.map((faq) => ({ "@type":"Question", name:faq.q, acceptedAnswer:{ "@type":"Answer", text:faq.a } })) });
      sc.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph":graph });
      document.head.appendChild(sc);
      trackEvent("seo_page_viewed", { page:post.slug, language });
      return () => {
        sc.remove();
        restoreSiteSchema();
        cleanupSeo();
      };
    }
  }, [post]);
  if (!post) return <NotFound />;
  const ar = post.lang === "ar";
  return (
    <div style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"60px 24px", direction: ar ? "rtl" : "ltr" }}>
        <a href="/blog" style={{ color:"#c9a84c", fontSize:13, textDecoration:"none", display:"inline-block", marginBottom:32 }}>{ar ? "→ المدونة" : "← Blog"}</a>
        <div style={{ fontSize:12, color:"#c9a84c", marginBottom:12, letterSpacing:1 }}>Published {post.date}{post.dateModified ? ` · Updated ${post.dateModified}` : ""} · {post.readTime}</div>
        <h1 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:34, lineHeight:1.35, marginBottom:16 }}>{post.title}</h1>
        <p style={{ fontSize:16, color:"#9a9690", lineHeight:1.8, marginBottom:12 }}>{post.description}</p>
        <ShareButtons title={post.title} />
        {post.quickAnswer && (
          <aside style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.13),rgba(201,168,76,0.03))", border:"1px solid rgba(201,168,76,0.3)", borderRadius:14, padding:"22px 24px", margin:"28px 0 34px" }}>
            <div style={{ fontSize:13, color:"#e8c97a", fontWeight:700, letterSpacing:.4, textTransform:"uppercase", marginBottom:8 }}>Quick answer</div>
            <p style={{ margin:0, fontSize:15, lineHeight:1.85, color:"rgba(232,228,220,0.9)" }}>{post.quickAnswer}</p>
          </aside>
        )}
        {post.checklist?.length > 0 && (
          <section style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"22px 24px", margin:"0 0 38px" }}>
            <h2 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:22, color:"#e8e4dc", margin:"0 0 12px" }}>At a glance</h2>
            <ul style={{ margin:0, paddingLeft:20, color:"rgba(232,228,220,0.82)", fontSize:14.5, lineHeight:1.8 }}>
              {post.checklist.map((item) => <li key={item} style={{ margin:"5px 0" }}>{item}</li>)}
            </ul>
          </section>
        )}
        {post.sections.map((s, i) => (
          <div key={i}>
            <h2 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:23, color:"#c9a84c", margin:"36px 0 14px" }}>{s.h}</h2>
            <p style={{ fontSize:15.5, lineHeight:1.9, color:"rgba(232,228,220,0.85)" }}>{s.p}</p>
            {i === 3 && <CTABox ar={ar} source={post.slug} placement="mid_article" />}
          </div>
        ))}
        {post.faqs?.length > 0 && (
          <section style={{ margin:"50px 0" }}>
            <h2 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:26, color:"#c9a84c", margin:"0 0 18px" }}>Frequently asked questions</h2>
            {post.faqs.map((faq) => (
              <div key={faq.q} style={{ padding:"18px 0", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                <h3 style={{ margin:"0 0 7px", fontSize:16, color:"#e8e4dc" }}>{faq.q}</h3>
                <p style={{ margin:0, fontSize:14.5, lineHeight:1.8, color:"#9a9690" }}>{faq.a}</p>
              </div>
            ))}
          </section>
        )}
        <Sources sources={post.sources} />
        <RelatedLinks links={post.relatedLinks} />
        <CTABox ar={ar} source={post.slug} placement="article_end" />
        <ShareButtons title={post.title} />
      </div>
    </div>
  );
}
