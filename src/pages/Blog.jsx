import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";

const POSTS = [
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
