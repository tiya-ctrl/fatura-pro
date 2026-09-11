export const SUPPORTED_LOCALES = ["en", "nl", "fr", "ar"];
const LEGACY_LOCALES = ["es"];
const SUPPORTED = [...SUPPORTED_LOCALES, ...LEGACY_LOCALES];

export function syncDocumentLocale(locale) {
  if (typeof document === "undefined") return;
  const next = SUPPORTED.includes(locale) ? locale : "en";
  document.documentElement.setAttribute("lang", next);
  document.documentElement.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
}

export function getLocale() {
  if (typeof window === "undefined") return "en";
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (SUPPORTED.includes(requested)) {
    localStorage.setItem("fatura_locale", requested);
    syncDocumentLocale(requested);
    return requested;
  }
  const saved = localStorage.getItem("fatura_locale");
  const next = SUPPORTED.includes(saved) ? saved : "en";
  syncDocumentLocale(next);
  return next;
}

export function setLocale(locale) {
  const next = SUPPORTED.includes(locale) ? locale : "en";
  localStorage.setItem("fatura_locale", next);
  syncDocumentLocale(next);
  return next;
}

export function isRTL(locale = getLocale()) {
  return locale === "ar";
}

export function localeHome(locale = getLocale()) {
  return locale === "en" ? "/" : `/${locale}`;
}

const COPY = {
  ar: {
    sign_in_account:"سجّل الدخول إلى حسابك", create_free_account:"أنشئ حسابك المجاني",
    sign_in:"تسجيل الدخول", sign_up:"إنشاء حساب", full_name:"الاسم الكامل", email_address:"البريد الإلكتروني",
    password:"كلمة المرور", confirm_password:"تأكيد كلمة المرور", forgot_password:"نسيت كلمة المرور؟",
    min_characters:"6 أحرف على الأقل", your_password:"كلمة المرور", repeat_password:"أعد كتابة كلمة المرور",
    processing:"جارٍ التنفيذ…", create_account:"إنشاء الحساب", continue_with:"أو المتابعة باستخدام",
    no_account:"ليس لديك حساب؟", sign_up_free:"أنشئ حسابًا مجانًا", have_account:"لديك حساب بالفعل؟",
    welcome_back:"مرحبًا بعودتك!", account_created:"تم إنشاء الحساب!", opening_dashboard:"جارٍ فتح لوحة التحكم…",
    back_home:"العودة إلى الرئيسية", name_required:"الاسم مطلوب", valid_email:"أدخل بريدًا إلكترونيًا صحيحًا",
    password_min:"يجب ألا تقل كلمة المرور عن 6 أحرف", password_mismatch:"كلمتا المرور غير متطابقتين",
    enter_email_first:"أدخل بريدك الإلكتروني أولًا", reset_sent:"أرسلنا رسالة إعادة تعيين كلمة المرور.",
    main:"الرئيسية", dashboard:"لوحة التحكم", invoices:"الفواتير", quotes:"عروض الأسعار", expenses:"المصروفات", analytics:"التحليلات", clients:"العملاء", settings:"الإعدادات",
    signed_in_as:"مسجّل الدخول باسم", sign_out:"تسجيل الخروج", business_plan:"خطة BUSINESS", pro_plan:"خطة PRO", team_member:"عضو فريق",
    free_plan:"الخطة المجانية", upgrade_pro:"الترقية إلى Pro", export_csv:"تصدير CSV", new_invoice:"فاتورة جديدة", add_client:"إضافة عميل",
    business_feature:"ميزة ضمن خطة Business", language:"لغة التطبيق", language_help:"اختر لغة تسجيل الدخول والتنقل داخل التطبيق.",
    business_profile:"ملف النشاط التجاري", business_name:"اسم النشاط التجاري", country:"البلد", address:"العنوان", save_changes:"حفظ التغييرات", saving:"جارٍ الحفظ…", saved:"تم الحفظ",
    vat_report:"تقرير ضريبة القيمة المضافة", revenue_excl:"الإيرادات دون الضريبة", vat_collected:"الضريبة المحصّلة", vat_paid:"الضريبة المدفوعة", vat_pay:"الضريبة المستحقة", vat_reclaim:"الضريبة القابلة للاسترداد",
    on_sales:"على المبيعات", expense_count:"مصروفات", add_expense:"إضافة مصروف", export_quarter:"تصدير CSV", no_expenses:"لا توجد مصروفات بعد. سجّل تكاليف نشاطك هنا لتظهر الضريبة المدفوعة تلقائيًا في التقرير.",
    edit:"تعديل", delete:"حذف", new_expense:"مصروف جديد", edit_expense:"تعديل المصروف", description:"الوصف", category:"الفئة", supplier:"المورّد (اختياري)",
    date:"التاريخ", currency:"العملة", amount_excl:"المبلغ دون الضريبة", vat_rate:"نسبة الضريبة", total_incl:"الإجمالي شامل الضريبة", cancel:"إلغاء", add:"إضافة المصروف", save:"حفظ التغييرات",
    first_payment:"أهلًا بك في FaturaPro 👋", create_paid_invoice:"لننشئ فاتورتك الأولى.", guided_invoice_intro:"لن يستغرق الأمر سوى دقائق. أضف البيانات الأساسية، راجع المستند النهائي، واحفظ بيانات نشاطك والعميل ضمن الخطوات نفسها.",
    create_first_invoice:"إنشاء فاتورتي الأولى ←", add_business_details:"إضافة بيانات النشاط", ready_to_invoice:"أنت جاهز للفوترة", any_order_steps:"ثلاث خطوات بسيطة يمكنك إكمالها بأي ترتيب.",
    business_details:"بيانات النشاط التجاري", saved_reuse:"محفوظة وجاهزة لإعادة الاستخدام", add_vat_details:"أضف الاسم والعنوان وبيانات الضريبة", first_client:"العميل الأول", client_saved:"محفوظ لاستخدامه في الفواتير القادمة", save_reuse_invoice:"احفظ بياناته مرة واستخدمها في كل فاتورة", create_preview:"إنشاء ومعاينة", review_total:"راجع الإجمالي قبل الإرسال أو التنزيل",
    welcome_user:"مرحبًا بعودتك", keep_moving:"تابع فواتيرك ومدفوعاتك بوضوح.", all_current:"كل شيء محدّث. أنشئ فاتورتك التالية بينما تفاصيل العمل ما زالت حاضرة.", view_invoices:"عرض الفواتير", collected:"تم تحصيله", awaiting_payment:"بانتظار الدفع", overdue:"متأخر", needs_attention:"يحتاج متابعة", documents:"المستندات", recent_invoices:"أحدث الفواتير", view_all:"عرض الكل ←",
    invoice:"فاتورة", client:"العميل", amount:"المبلغ", due_date:"تاريخ الاستحقاق", status:"الحالة", actions:"الإجراءات", preview:"معاينة", payment:"الدفع", remind:"تذكير", none_month:"لم تتم إضافة شيء هذا الشهر", this_month:"هذا الشهر", paid_invoices:"فواتير مدفوعة", open_invoices:"فواتير مفتوحة",
    from:"من", to:"إلى", items:"البنود", notes:"ملاحظات", edit_invoice:"تعديل الفاتورة", invoice_number:"رقم الفاتورة", seller_logo:"شعار النشاط / البائع", from_business:"النشاط المُصدر", select_profile:"اختر ملف نشاط…", seller_name:"اسم النشاط / البائع", phone:"الهاتف", vat_number:"رقم الضريبة", select_client:"اختر عميلًا محفوظًا", enter_manually:"— إدخال يدوي —", client_name:"اسم العميل / الشركة *", invoice_date:"تاريخ الفاتورة *",
    quantity:"الكمية", price:"السعر", total:"الإجمالي", item_note:"أضف ملاحظة لهذا البند (اختياري)…", add_line:"+ إضافة بند", discount:"الخصم (%)", deposit:"الدفعة المقدّمة (%)", tax:"الضريبة / VAT (%)", subtotal:"المجموع الفرعي", invoice_total:"إجمالي الفاتورة", deposit_due:"الدفعة المطلوبة الآن", remaining:"المتبقي بعد الدفعة المقدّمة", invoice_notes:"ملاحظات الفاتورة", payment_info:"بيانات البنك / الدفع", summary:"الملخص", seller:"البائع", close:"إغلاق", back:"رجوع →", save_draft:"حفظ كمسودة", step:"الخطوة", update_invoice:"تحديث الفاتورة", save_invoice:"حفظ الفاتورة", next:"التالي ←", new_client:"عميل جديد", client_business_name:"اسم العميل / الشركة *", email_optional:"البريد الإلكتروني (اختياري)", phone_optional:"الهاتف (اختياري)", choose_country:"— اختر البلد —", add_client_action:"حفظ العميل", buyer_logo:"شعار العميل (اختياري)", seller_name_required:"أدخل اسم نشاطك أو البائع (الخطوة 1)", client_due_required:"أكمل بيانات العميل وتاريخ الاستحقاق (الخطوة 2)", line_item_required:"أضف وصفًا لبند واحد على الأقل (الخطوة 3)", client_name_required:"أدخل اسم العميل أو الشركة",
    all:"الكل", paid:"مدفوعة", partial:"مدفوعة جزئيًا", pending:"قيد الانتظار", cancelled:"ملغاة", draft:"مسودات", credit_notes:"إشعارات دائنة", search_invoices:"البحث في الفواتير…", no_invoices:"مرحبًا بك في FaturaPro! أنشئ فاتورتك الأولى للبدء.", view:"عرض",
    first_invoice_ready:"فاتورتك الأولى جاهزة 🎉", first_invoice_ready_body:"راجع المستند النهائي واحفظه بصيغة PDF أو واصل من لوحة التحكم.", preview_download:"معاينة / حفظ PDF", create_another_invoice:"إنشاء فاتورة أخرى", back_dashboard:"الانتقال إلى لوحة التحكم",
    invoice_language:"لغة الفاتورة", default_invoice_language:"لغة الفاتورة الافتراضية", invoice_language_help:"تحدد لغة مستند PDF فقط، ويمكن تغييرها داخل كل فاتورة.", invoice_defaults:"إعدادات الفاتورة الافتراضية", default_currency:"العملة الافتراضية", default_tax:"الضريبة الافتراضية (%)", payment_terms:"مهلة الدفع (بالأيام)", invoice_prefix:"بادئة رقم الفاتورة", bank_payment_info:"بيانات البنك / الدفع", save_defaults:"حفظ الإعدادات", your_data:"بياناتك", download_invoices:"تنزيل فواتيري (CSV)",
    online_payments:"الدفع عبر الإنترنت", connect_stripe_help:"اربط حساب Stripe ليتمكن العملاء من دفع الفواتير عبر الإنترنت. تصل الأموال مباشرة إلى حسابك البنكي.", connect_stripe:"ربط Stripe ←", subscription:"الاشتراك", subscription_help:"بدّل بين Pro وBusiness، وحدّث البطاقة، واعرض الفواتير أو ألغِ الاشتراك في أي وقت.", manage_subscription:"إدارة الاشتراك ←", plan:"الخطة", free_plan_help:"أنت على الخطة المجانية. قم بالترقية للحصول على فواتير غير محدودة وتذكيرات ومزايا إضافية.", upgrade:"ترقية ←", stripe_connected:"تم ربط Stripe! يمكن لعملائك الآن دفع فواتيرك عبر الإنترنت.", stripe_incomplete:"لم يكتمل إعداد Stripe بعد — اضغط على ربط Stripe في الإعدادات للمتابعة.", stripe_start_error:"تعذّر بدء إعداد Stripe", save_business_error:"تعذّر حفظ بيانات نشاطك. حاول مرة أخرى.",
    data_export_help:"نزّل جميع الفواتير والإشعارات الدائنة في حسابك كملف CSV يمكنك فتحه في Excel أو تسليمه إلى محاسبك. متاح في كل الخطط، وحتى بعد إلغاء الاشتراك.", documents_included:"مستند سيتم تضمينه.", preview_label:"معاينة", invoice_notes_label:"ملاحظات الفاتورة", invoice_notes_placeholder:"شكرًا لتعاملك معنا. يستحق الدفع خلال 30 يومًا.", bank_info_placeholder:"البنك: اسم البنك\nاسم الحساب: اسم نشاطي\nIBAN: NL00 BANK 0000 0000 00\nBIC/Swift: BANKNL2A\n\nأو الدفع عبر:\nWise: yourname@wise.com", type_country:"اكتب اسم البلد",
    overdue_attention:"فاتورة متأخرة تحتاج إلى متابعتك اليوم.", awaiting_attention:"فاتورة بانتظار الدفع. تابع الفاتورة التالية.", overdue_invoices:"فواتير متأخرة", overdue_total:"الإجمالي", view_overdue:"عرض المتأخرات ←", credited:"مبالغ دائنة", credit_note_count:"إشعار دائن", credit_note:"إشعار دائن", amount_left:"متبقٍ", create_credit:"إنشاء إشعار دائن لهذه الفاتورة", record_payment:"تسجيل دفعة مستلمة", make_recurring:"تحويل إلى فاتورة متكررة", marked_paid:"مدفوعة", unsaved_draft:"تنبيه: مسودة غير محفوظة", draft_auto_saved:"حُفظت فاتورتك تلقائيًا عند إغلاقها.", discard:"تجاهل", continue_draft:"متابعة المسودة", restored_draft:"تمت استعادة المسودة", restored_draft_help:"هل تريد المتابعة من حيث توقفت؟", restored_edits:"تمت استعادة تعديلات غير محفوظة", restored_edits_help:"لديك تعديلات غير محفوظة على هذه الفاتورة. هل تريد المتابعة من حيث توقفت؟", continue_action:"متابعة", by:"بواسطة", reminders_sent:"تذكيرات مُرسلة", due_label:"الاستحقاق", no_clients:"لا يوجد عملاء بعد — أضف عميلك الأول للبدء.", add_first_client:"إضافة أول عميل", invoice_count:"فواتير", total_billed:"إجمالي المفوتر", delete_client_confirm:"هل تريد حذف هذا العميل؟",
    logo:"الشعار", change_logo:"تغيير الشعار", upload_logo:"رفع الشعار", remove:"إزالة", logo_size:"حجم الشعار", small:"صغير", large:"كبير", logo_hint:"PNG أو JPG — يُفضّل استخدام خلفية شفافة", other:"أخرى…", country_code_placeholder:"البلد أو رمز من حرفين (مثل JP)", client_country_placeholder:"بلد العميل أو الرمز (مثل JP)", line_items_count:"بنود", shown_invoice_bottom:"تظهر في أسفل الفاتورة", bank_details_hint:"بيانات البنك أو Wise أو PayPal أو أي تعليمات دفع", total_due:"المبلغ المستحق", payment_reminder:"تذكير بالدفع", send_via:"الإرسال عبر", reminder_language:"اللغة", tone:"النبرة", polite:"ودّية", polite_help:"تذكير أول لطيف", firm:"حازمة", firm_help:"متابعة مهنية", final:"أخيرة", final_help:"إشعار أخير قبل اتخاذ إجراء", subject:"الموضوع", edit_before_send:"يمكنك تعديل الرسالة قبل الإرسال", done:"تم!", copy:"نسخ", open_mail:"فتح البريد", open_whatsapp:"فتح WhatsApp", missing_client_email:"لا يوجد بريد إلكتروني محفوظ لهذا العميل. أضفه إلى الفاتورة أو أرسل التذكير عبر WhatsApp.", days_overdue:"يومًا متأخرة",
    success:"تم بنجاح", welcome_pro:"مرحبًا بك في Pro!", upgraded_help:"تمت ترقية حسابك وأصبحت جميع مزايا Pro متاحة.", start_using_pro:"ابدأ استخدام Pro ←", unlock:"فتح", secure_stripe:"دفع آمن عبر Stripe", tls_encrypted:"اتصال مشفّر عبر TLS", cancel_anytime:"إلغاء في أي وقت", receipt_email:"إيصال إلى البريد الإلكتروني", more_features:"مزايا إضافية", connecting_stripe:"جارٍ الاتصال بـStripe...", upgrade_to:"الترقية إلى", no_commitment:"دون التزام · إلغاء في أي وقت · دفع آمن عبر Stripe", maybe_later:"ربما لاحقًا", per_month:"/شهر",
    invoice_save_error:"تعذّر حفظ هذه الفاتورة.", credit_confirm:"إنشاء إشعار دائن للفاتورة", credit_confirm_help:"سيكون مستندًا مستقلًا بمبلغ سالب يلغي أثر الفاتورة، بينما تبقى الفاتورة نفسها دون تغيير.", credit_exists:"ملاحظة: يوجد لهذه الفاتورة إشعار دائن بالفعل", credit_create_error:"تعذّر إنشاء الإشعار الدائن.", fully_paid:"هذه الفاتورة مدفوعة بالكامل بالفعل.", record_for:"تسجيل دفعة للفاتورة", invoice_total_prompt:"إجمالي الفاتورة", received_so_far:"المستلم حتى الآن", balance:"الرصيد", amount_received_now:"المبلغ المستلم الآن", positive_amount:"أدخل مبلغًا أكبر من صفر.", payment_save_error:"تعذّر حفظ الدفعة.", client_save_error:"تعذّر حفظ هذا العميل.", ubl_missing:"هذا المستند تنقصه البيانات التالية:", ubl_warning:"سيتم تنزيل الملف، لكن قد يرفضه نظام صارم لدى المستلم.", download_anyway:"هل تريد التنزيل على أي حال؟", recurring_prompt:"تكرار هذه الفاتورة:\n\n1 = أسبوعيًا\n2 = كل أسبوعين\n3 = شهريًا\n4 = سنويًا\n\nاكتب رقمًا:", recurring_active:"تم تفعيل التكرار", next_invoice:"الفاتورة التالية", recurring_manage:"يمكنك إدارتها من الإعدادات ← الفواتير المتكررة.", ambassador_requests:"طلبات السفراء", team_quotes_info:"فريق وعروض أسعار وضريبة ومزايا أخرى", team_shared_info:"مساحة عمل مشتركة للفريق", unlimited_info:"فواتير وعملاء غير محدودين",
    how_found:"كيف عرفت FaturaPro؟", how_found_help:"اختياري — يساعدنا على فهم القنوات المفيدة لأصحاب المشاريع.", choose_source:"اختر إجابة…", source_instagram:"Instagram", source_tiktok:"TikTok", source_facebook:"Facebook", source_google:"Google", source_accountant:"محاسب / شريك", source_friend:"صديق أو معرفة", source_qr:"رمز QR / منشور", source_other:"أخرى", thanks_feedback:"شكرًا لمشاركتنا.",
  },
  es: {
    sign_in_account:"Inicia sesión en tu cuenta", create_free_account:"Crea tu cuenta gratis",
    sign_in:"Iniciar sesión", sign_up:"Registrarse", full_name:"Nombre completo", email_address:"Correo electrónico",
    password:"Contraseña", confirm_password:"Confirmar contraseña", forgot_password:"¿Olvidaste la contraseña?",
    min_characters:"Mínimo 6 caracteres", your_password:"Tu contraseña", repeat_password:"Repite tu contraseña",
    processing:"Procesando…", create_account:"Crear cuenta", continue_with:"o continúa con",
    no_account:"¿No tienes una cuenta?", sign_up_free:"Regístrate gratis", have_account:"¿Ya tienes una cuenta?",
    welcome_back:"¡Bienvenido de nuevo!", account_created:"¡Cuenta creada!", opening_dashboard:"Abriendo tu panel…",
    back_home:"Volver al inicio", name_required:"El nombre es obligatorio", valid_email:"Introduce un correo válido",
    password_min:"Mínimo 6 caracteres", password_mismatch:"Las contraseñas no coinciden",
    enter_email_first:"Introduce primero tu correo", reset_sent:"Te enviamos el correo para restablecer tu contraseña.",
    main:"Principal", dashboard:"Panel", invoices:"Facturas", quotes:"Presupuestos", expenses:"Gastos", analytics:"Análisis", clients:"Clientes", settings:"Ajustes",
    signed_in_as:"Sesión iniciada como", sign_out:"Cerrar sesión", business_plan:"PLAN BUSINESS", pro_plan:"PLAN PRO", team_member:"MIEMBRO DEL EQUIPO",
    free_plan:"PLAN GRATUITO", upgrade_pro:"Mejorar a Pro", export_csv:"Exportar CSV", new_invoice:"Nueva factura", add_client:"Añadir cliente",
    business_feature:"Función del plan Business", language:"Idioma de la aplicación", language_help:"Elige el idioma utilizado en el acceso y la navegación principal.",
    business_profile:"Perfil del negocio", business_name:"Nombre del negocio", country:"País", address:"Dirección", save_changes:"Guardar cambios", saving:"Guardando…", saved:"Guardado",
    vat_report:"Informe de IVA", revenue_excl:"Ingresos sin IVA", vat_collected:"IVA cobrado", vat_paid:"IVA pagado", vat_pay:"IVA a pagar", vat_reclaim:"IVA a recuperar",
    on_sales:"sobre ventas", expense_count:"gastos", add_expense:"Añadir gasto", export_quarter:"Exportar CSV", no_expenses:"Todavía no hay gastos. Registra aquí los costes del negocio; el IVA pagado se descuenta automáticamente en el informe.",
    edit:"Editar", delete:"Eliminar", new_expense:"Nuevo gasto", edit_expense:"Editar gasto", description:"Descripción", category:"Categoría", supplier:"Proveedor (opcional)",
    date:"Fecha", currency:"Moneda", amount_excl:"Importe sin IVA", vat_rate:"Tipo de IVA", total_incl:"Total con IVA", cancel:"Cancelar", add:"Añadir gasto", save:"Guardar cambios",
    first_payment:"Te damos la bienvenida a FaturaPro 👋", create_paid_invoice:"Vamos a crear tu primera factura.", guided_invoice_intro:"Solo tarda un par de minutos. Añade lo esencial, revisa el documento terminado y guarda los datos de tu negocio y cliente durante el mismo proceso.",
    create_first_invoice:"Crear mi primera factura →", add_business_details:"Añadir datos del negocio", ready_to_invoice:"Todo listo para facturar", any_order_steps:"Tres pasos útiles. Complétalos en cualquier orden.",
    business_details:"Datos del negocio", saved_reuse:"Guardados y listos para reutilizar", add_vat_details:"Añade nombre, dirección y datos de IVA", first_client:"Primer cliente", client_saved:"Cliente guardado para futuras facturas", save_reuse_invoice:"Guárdalo una vez y úsalo en cada factura", create_preview:"Crear y previsualizar", review_total:"Revisa el total antes de enviar o descargar",
    welcome_user:"Te damos la bienvenida", keep_moving:"Mantén tus facturas en marcha y tus cobros visibles.", all_current:"Todo está al día. Crea la próxima factura mientras el trabajo está reciente.", view_invoices:"Ver facturas", collected:"Cobrado", awaiting_payment:"Pendiente de cobro", overdue:"Vencido", needs_attention:"Necesita atención", documents:"Documentos", recent_invoices:"Facturas recientes", view_all:"Ver todas →",
    invoice:"Factura", client:"Cliente", amount:"Importe", due_date:"Vencimiento", status:"Estado", actions:"Acciones", preview:"Vista previa", payment:"Pago", remind:"Recordar", none_month:"Ninguna añadida este mes", this_month:"este mes", paid_invoices:"facturas pagadas", open_invoices:"facturas abiertas",
    from:"Emisor", to:"Cliente", items:"Conceptos", notes:"Notas", edit_invoice:"Editar factura", invoice_number:"Número de factura", seller_logo:"Logo de la empresa / emisor", from_business:"Empresa emisora", select_profile:"Selecciona un perfil de empresa…", seller_name:"Nombre del emisor / empresa", phone:"Teléfono", vat_number:"Número de IVA", select_client:"Seleccionar cliente existente", enter_manually:"— Introducir manualmente —", client_name:"Nombre del cliente / empresa *", invoice_date:"Fecha de factura *",
    quantity:"Cant.", price:"Precio", total:"Total", item_note:"Añade una nota para este concepto (opcional)…", add_line:"+ Añadir concepto", discount:"Descuento (%)", deposit:"Anticipo (%)", tax:"Impuesto / IVA (%)", subtotal:"Subtotal", invoice_total:"Total de la factura", deposit_due:"Anticipo a pagar ahora", remaining:"Restante tras el anticipo", invoice_notes:"Notas de la factura", payment_info:"Datos bancarios / de pago", summary:"Resumen", seller:"Emisor", close:"Cerrar", back:"← Atrás", save_draft:"Guardar borrador", step:"Paso", update_invoice:"Actualizar factura", save_invoice:"Guardar factura", next:"Siguiente →", new_client:"Nuevo cliente", client_business_name:"Nombre del cliente / empresa *", email_optional:"Correo electrónico (opcional)", phone_optional:"Teléfono (opcional)", choose_country:"— Elegir país —", add_client_action:"Guardar cliente", buyer_logo:"Logo del cliente (opcional)", seller_name_required:"Introduce el nombre de tu negocio o del emisor (paso 1)", client_due_required:"Completa el cliente y la fecha de vencimiento (paso 2)", line_item_required:"Añade al menos una descripción de concepto (paso 3)", client_name_required:"Introduce el nombre del cliente o empresa",
    all:"Todas", paid:"Pagadas", partial:"Parciales", pending:"Pendientes", cancelled:"Canceladas", draft:"Borradores", credit_notes:"Notas de crédito", search_invoices:"Buscar facturas…", no_invoices:"¡Te damos la bienvenida a Fatūra! Crea tu primera factura para empezar.", view:"Ver",
    first_invoice_ready:"Tu primera factura está lista 🎉", first_invoice_ready_body:"Revisa el documento final, guárdalo como PDF o continúa desde tu panel.", preview_download:"Previsualizar / guardar PDF", create_another_invoice:"Crear otra factura", back_dashboard:"Ir al panel",
  },
  fr: {
    sign_in_account:"Connectez-vous à votre compte", create_free_account:"Créez votre compte gratuit",
    sign_in:"Se connecter", sign_up:"S’inscrire", full_name:"Nom complet", email_address:"Adresse e-mail",
    password:"Mot de passe", confirm_password:"Confirmer le mot de passe", forgot_password:"Mot de passe oublié ?",
    min_characters:"6 caractères minimum", your_password:"Votre mot de passe", repeat_password:"Répétez votre mot de passe",
    processing:"Traitement…", create_account:"Créer un compte", continue_with:"ou continuer avec",
    no_account:"Vous n’avez pas de compte ?", sign_up_free:"Inscription gratuite", have_account:"Vous avez déjà un compte ?",
    welcome_back:"Bon retour !", account_created:"Compte créé !", opening_dashboard:"Ouverture de votre tableau de bord…",
    back_home:"Retour à l’accueil", name_required:"Le nom est obligatoire", valid_email:"Saisissez une adresse e-mail valide",
    password_min:"6 caractères minimum", password_mismatch:"Les mots de passe ne correspondent pas",
    enter_email_first:"Saisissez d’abord votre adresse e-mail", reset_sent:"L’e-mail de réinitialisation a été envoyé.",
    main:"Principal", dashboard:"Tableau de bord", invoices:"Factures", quotes:"Devis", expenses:"Dépenses", analytics:"Analyses", clients:"Clients", settings:"Paramètres",
    signed_in_as:"Connecté en tant que", sign_out:"Se déconnecter", business_plan:"OFFRE BUSINESS", pro_plan:"OFFRE PRO", team_member:"MEMBRE DE L’ÉQUIPE",
    free_plan:"OFFRE GRATUITE", upgrade_pro:"Passer à Pro", export_csv:"Exporter en CSV", new_invoice:"Nouvelle facture", add_client:"Ajouter un client",
    business_feature:"Fonctionnalité Business", language:"Langue de l’application", language_help:"Choisissez la langue de la connexion et de la navigation principale.",
    business_profile:"Profil de l’entreprise", business_name:"Nom de l’entreprise", country:"Pays", address:"Adresse", save_changes:"Enregistrer", saving:"Enregistrement…", saved:"Enregistré",
    vat_report:"Rapport TVA", revenue_excl:"Chiffre d’affaires HT", vat_collected:"TVA collectée", vat_paid:"TVA payée", vat_pay:"TVA à payer", vat_reclaim:"TVA à récupérer",
    on_sales:"sur les ventes", expense_count:"dépenses", add_expense:"Ajouter une dépense", export_quarter:"Exporter le CSV", no_expenses:"Aucune dépense pour le moment. Enregistrez ici vos frais professionnels ; la TVA payée est automatiquement déduite dans le rapport.",
    edit:"Modifier", delete:"Supprimer", new_expense:"Nouvelle dépense", edit_expense:"Modifier la dépense", description:"Description", category:"Catégorie", supplier:"Fournisseur (facultatif)",
    date:"Date", currency:"Devise", amount_excl:"Montant HT", vat_rate:"Taux de TVA", total_incl:"Total TTC", cancel:"Annuler", add:"Ajouter la dépense", save:"Enregistrer",
    first_payment:"Bienvenue sur FaturaPro 👋", create_paid_invoice:"Créons votre première facture.", guided_invoice_intro:"Cela ne prend que quelques minutes. Ajoutez l’essentiel, vérifiez le document final et enregistrez les coordonnées de votre entreprise et du client dans le même parcours.",
    create_first_invoice:"Créer ma première facture →", add_business_details:"Ajouter les coordonnées", ready_to_invoice:"Prêt à facturer", any_order_steps:"Trois étapes utiles, à compléter dans l’ordre de votre choix.",
    business_details:"Coordonnées de l’entreprise", saved_reuse:"Enregistrées et prêtes à réutiliser", add_vat_details:"Ajoutez votre nom, adresse et numéro de TVA", first_client:"Premier client", client_saved:"Client enregistré pour vos prochaines factures", save_reuse_invoice:"Enregistrez-le une fois, réutilisez-le partout", create_preview:"Créer et prévisualiser", review_total:"Vérifiez le total avant l’envoi ou le téléchargement",
    welcome_user:"Bon retour", keep_moving:"Gardez vos factures actives et vos paiements visibles.", all_current:"Tout est à jour. Créez la prochaine facture pendant que le travail est encore frais.", view_invoices:"Voir les factures", collected:"Encaissé", awaiting_payment:"En attente de paiement", overdue:"En retard", needs_attention:"À traiter", documents:"Documents", recent_invoices:"Factures récentes", view_all:"Tout voir →",
    invoice:"Facture", client:"Client", amount:"Montant", due_date:"Échéance", status:"Statut", actions:"Actions", preview:"Aperçu", payment:"Paiement", remind:"Relancer", none_month:"Aucune ajoutée ce mois-ci", this_month:"ce mois-ci", paid_invoices:"factures payées", open_invoices:"factures ouvertes",
    from:"Émetteur", to:"Client", items:"Articles", notes:"Notes", edit_invoice:"Modifier la facture", invoice_number:"Numéro de facture", seller_logo:"Logo de l’entreprise / émetteur", from_business:"Entreprise émettrice", select_profile:"Sélectionnez un profil d’entreprise…", seller_name:"Nom de l’entreprise / émetteur", phone:"Téléphone", vat_number:"Numéro de TVA", select_client:"Sélectionner un client existant", enter_manually:"— Saisir manuellement —", client_name:"Nom du client / entreprise *", invoice_date:"Date de facture *",
    quantity:"Qté", price:"Prix", total:"Total", item_note:"Ajouter une note pour cet article (facultatif)…", add_line:"+ Ajouter une ligne", discount:"Remise (%)", deposit:"Acompte (%)", tax:"Taxe / TVA (%)", subtotal:"Sous-total", invoice_total:"Total de la facture", deposit_due:"Acompte dû maintenant", remaining:"Solde après acompte", invoice_notes:"Notes de la facture", payment_info:"Coordonnées bancaires / de paiement", summary:"Récapitulatif", seller:"Émetteur", close:"Fermer", back:"← Retour", save_draft:"Enregistrer le brouillon", step:"Étape", update_invoice:"Mettre à jour", save_invoice:"Enregistrer la facture", next:"Suivant →", new_client:"Nouveau client", client_business_name:"Nom du client / entreprise *", email_optional:"Adresse e-mail (facultatif)", phone_optional:"Téléphone (facultatif)", choose_country:"— Choisir un pays —", add_client_action:"Enregistrer le client", buyer_logo:"Logo du client (facultatif)", seller_name_required:"Saisissez le nom de votre entreprise ou de l’émetteur (étape 1)", client_due_required:"Renseignez le client et la date d’échéance (étape 2)", line_item_required:"Ajoutez au moins une description de ligne (étape 3)", client_name_required:"Saisissez le nom du client ou de l’entreprise",
    all:"Toutes", paid:"Payées", partial:"Partielles", pending:"En attente", cancelled:"Annulées", draft:"Brouillons", credit_notes:"Avoirs", search_invoices:"Rechercher des factures…", no_invoices:"Bienvenue sur Fatūra ! Créez votre première facture pour commencer.", view:"Voir",
    first_invoice_ready:"Votre première facture est prête 🎉", first_invoice_ready_body:"Prévisualisez le document final, enregistrez-le en PDF ou continuez depuis votre tableau de bord.", preview_download:"Prévisualiser / enregistrer le PDF", create_another_invoice:"Créer une autre facture", back_dashboard:"Ouvrir le tableau de bord",
  },
  nl: {
    sign_in_account:"Log in op je account", create_free_account:"Maak je gratis account aan",
    sign_in:"Inloggen", sign_up:"Registreren", full_name:"Volledige naam", email_address:"E-mailadres",
    password:"Wachtwoord", confirm_password:"Wachtwoord bevestigen", forgot_password:"Wachtwoord vergeten?",
    min_characters:"Minimaal 6 tekens", your_password:"Je wachtwoord", repeat_password:"Herhaal je wachtwoord",
    processing:"Bezig…", create_account:"Account aanmaken", continue_with:"of ga verder met",
    no_account:"Nog geen account?", sign_up_free:"Gratis registreren", have_account:"Heb je al een account?",
    welcome_back:"Welkom terug!", account_created:"Account aangemaakt!", opening_dashboard:"Je dashboard wordt geopend…",
    back_home:"Terug naar home", name_required:"Naam is verplicht", valid_email:"Vul een geldig e-mailadres in",
    password_min:"Minimaal 6 tekens", password_mismatch:"De wachtwoorden komen niet overeen",
    enter_email_first:"Vul eerst je e-mailadres in", reset_sent:"De e-mail om je wachtwoord opnieuw in te stellen is verzonden.",
    main:"Hoofdmenu", dashboard:"Dashboard", invoices:"Facturen", quotes:"Offertes", expenses:"Uitgaven", analytics:"Analyses", clients:"Klanten", settings:"Instellingen",
    signed_in_as:"Ingelogd als", sign_out:"Uitloggen", business_plan:"BUSINESS-ABONNEMENT", pro_plan:"PRO-ABONNEMENT", team_member:"TEAMLID",
    free_plan:"GRATIS ABONNEMENT", upgrade_pro:"Upgraden naar Pro", export_csv:"CSV exporteren", new_invoice:"Nieuwe factuur", add_client:"Klant toevoegen",
    business_feature:"Business-functie", language:"Taal van de app", language_help:"Kies de taal voor inloggen en de hoofdnavigatie.",
    business_profile:"Bedrijfsprofiel", business_name:"Bedrijfsnaam", country:"Land", address:"Adres", save_changes:"Wijzigingen opslaan", saving:"Opslaan…", saved:"Opgeslagen",
    vat_report:"Btw-overzicht", revenue_excl:"Omzet excl. btw", vat_collected:"Ontvangen btw", vat_paid:"Betaalde btw", vat_pay:"Te betalen btw", vat_reclaim:"Terug te vragen btw",
    on_sales:"over verkopen", expense_count:"uitgaven", add_expense:"Uitgave toevoegen", export_quarter:"CSV exporteren", no_expenses:"Nog geen uitgaven. Leg hier je zakelijke kosten vast; betaalde btw wordt automatisch meegenomen in het overzicht.",
    edit:"Bewerken", delete:"Verwijderen", new_expense:"Nieuwe uitgave", edit_expense:"Uitgave bewerken", description:"Omschrijving", category:"Categorie", supplier:"Leverancier (optioneel)",
    date:"Datum", currency:"Valuta", amount_excl:"Bedrag excl. btw", vat_rate:"Btw-tarief", total_incl:"Totaal incl. btw", cancel:"Annuleren", add:"Uitgave toevoegen", save:"Wijzigingen opslaan",
    first_payment:"Welkom bij FaturaPro 👋", create_paid_invoice:"Laten we je eerste factuur maken.", guided_invoice_intro:"Dit duurt maar een paar minuten. Voeg de belangrijkste gegevens toe, controleer het einddocument en sla je bedrijfs- en klantgegevens tijdens dezelfde stappen op.",
    create_first_invoice:"Mijn eerste factuur maken →", add_business_details:"Bedrijfsgegevens toevoegen", ready_to_invoice:"Klaar om te factureren", any_order_steps:"Drie handige stappen. Rond ze af in de volgorde die jij wilt.",
    business_details:"Bedrijfsgegevens", saved_reuse:"Opgeslagen en klaar voor hergebruik", add_vat_details:"Voeg je naam, adres en btw-gegevens toe", first_client:"Eerste klant", client_saved:"Klant opgeslagen voor toekomstige facturen", save_reuse_invoice:"Sla de klant één keer op en gebruik die bij elke factuur", create_preview:"Maken en bekijken", review_total:"Controleer het totaal vóór verzenden of downloaden",
    welcome_user:"Welkom terug", keep_moving:"Houd je facturen actief en je betalingen inzichtelijk.", all_current:"Alles is bijgewerkt. Maak je volgende factuur zolang het werk nog vers is.", view_invoices:"Facturen bekijken", collected:"Ontvangen", awaiting_payment:"Te ontvangen", overdue:"Achterstallig", needs_attention:"Aandacht nodig", documents:"Documenten", recent_invoices:"Recente facturen", view_all:"Alles bekijken →",
    invoice:"Factuur", client:"Klant", amount:"Bedrag", due_date:"Vervaldatum", status:"Status", actions:"Acties", preview:"Voorbeeld", payment:"Betaling", remind:"Herinneren", none_month:"Deze maand niets toegevoegd", this_month:"deze maand", paid_invoices:"betaalde facturen", open_invoices:"openstaande facturen",
    from:"Van", to:"Aan", items:"Regels", notes:"Notities", edit_invoice:"Factuur bewerken", invoice_number:"Factuurnummer", seller_logo:"Logo van bedrijf / afzender", from_business:"Bedrijf van afzender", select_profile:"Kies een bedrijfsprofiel…", seller_name:"Naam afzender / bedrijf", phone:"Telefoon", vat_number:"Btw-nummer", select_client:"Bestaande klant kiezen", enter_manually:"— Handmatig invoeren —", client_name:"Naam klant / bedrijf *", invoice_date:"Factuurdatum *",
    quantity:"Aantal", price:"Prijs", total:"Totaal", item_note:"Voeg een notitie toe aan deze regel (optioneel)…", add_line:"+ Regel toevoegen", discount:"Korting (%)", deposit:"Aanbetaling (%)", tax:"Belasting / btw (%)", subtotal:"Subtotaal", invoice_total:"Factuurtotaal", deposit_due:"Nu te betalen aanbetaling", remaining:"Resterend na aanbetaling", invoice_notes:"Factuurnotities", payment_info:"Bank- / betaalgegevens", summary:"Overzicht", seller:"Afzender", close:"Sluiten", back:"← Terug", save_draft:"Concept opslaan", step:"Stap", update_invoice:"Factuur bijwerken", save_invoice:"Factuur opslaan", next:"Volgende →", new_client:"Nieuwe klant", client_business_name:"Naam klant / bedrijf *", email_optional:"E-mailadres (optioneel)", phone_optional:"Telefoon (optioneel)", choose_country:"— Kies een land —", add_client_action:"Klant opslaan", buyer_logo:"Logo van klant (optioneel)", seller_name_required:"Vul de naam van je bedrijf of de afzender in (stap 1)", client_due_required:"Vul de klant en vervaldatum in (stap 2)", line_item_required:"Voeg ten minste één omschrijving toe (stap 3)", client_name_required:"Vul de naam van de klant of het bedrijf in",
    all:"Alle", paid:"Betaald", partial:"Gedeeltelijk", pending:"Openstaand", cancelled:"Geannuleerd", draft:"Concepten", credit_notes:"Creditnota’s", search_invoices:"Facturen zoeken…", no_invoices:"Welkom bij Fatūra! Maak je eerste factuur om te beginnen.", view:"Bekijken",
    first_invoice_ready:"Je eerste factuur is klaar 🎉", first_invoice_ready_body:"Bekijk het einddocument, sla het op als PDF of ga verder in je dashboard.", preview_download:"Bekijken / opslaan als PDF", create_another_invoice:"Nog een factuur maken", back_dashboard:"Naar het dashboard",  },
};

export function tr(key, fallback, locale = getLocale()) {
  return COPY[locale]?.[key] || fallback;
}
