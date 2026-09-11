export const DOCUMENT_LANGUAGES = [
  { value:"nl", label:"Nederlands" },
  { value:"en", label:"English" },
  { value:"fr", label:"Français" },
  { value:"ar", label:"العربية" },
];

export function normalizeDocumentLanguage(value, fallback = "en") {
  return DOCUMENT_LANGUAGES.some(item => item.value === value) ? value : fallback;
}

export function documentDirection(language) {
  return language === "ar" ? "rtl" : "ltr";
}

const INVOICE_COPY = {
  en: { invoice:"Invoice", creditNote:"Credit note", date:"Date", due:"Due", creditFor:"Credit for", from:"From", seller:"Seller", to:"To", client:"Client", vat:"VAT", description:"Description", qty:"Qty", unitPrice:"Unit price", amount:"Amount", service:"Service", professionalServices:"Professional services", subtotal:"Subtotal", discount:"Discount", tax:"Tax", invoiceTotal:"Invoice total", totalDue:"Total due", depositDue:"Deposit due now", remaining:"Remaining after deposit", paid:"Paid", balanceDue:"Balance due", notes:"Notes", paymentInformation:"Payment information", thankYou:"Thank you for your business", madeWith:"Made with Fatūra Pro", printPdf:"Print / PDF", close:"Close", copyPayment:"Copy payment link", paymentCopied:"Payment link copied", status:{ paid:"Paid", overdue:"Overdue", pending:"Pending", draft:"Draft", partial:"Partially paid", cancelled:"Cancelled" } },
  nl: { invoice:"Factuur", creditNote:"Creditnota", date:"Datum", due:"Vervaldatum", creditFor:"Credit voor", from:"Van", seller:"Verkoper", to:"Aan", client:"Klant", vat:"Btw", description:"Omschrijving", qty:"Aantal", unitPrice:"Prijs", amount:"Bedrag", service:"Dienst", professionalServices:"Professionele diensten", subtotal:"Subtotaal", discount:"Korting", tax:"Btw", invoiceTotal:"Factuurtotaal", totalDue:"Te betalen", depositDue:"Nu te betalen aanbetaling", remaining:"Resterend na aanbetaling", paid:"Betaald", balanceDue:"Openstaand bedrag", notes:"Notities", paymentInformation:"Betaalinformatie", thankYou:"Bedankt voor je vertrouwen", madeWith:"Gemaakt met Fatūra Pro", printPdf:"Afdrukken / PDF", close:"Sluiten", copyPayment:"Betaallink kopiëren", paymentCopied:"Betaallink gekopieerd", status:{ paid:"Betaald", overdue:"Achterstallig", pending:"Openstaand", draft:"Concept", partial:"Gedeeltelijk betaald", cancelled:"Geannuleerd" } },
  fr: { invoice:"Facture", creditNote:"Avoir", date:"Date", due:"Échéance", creditFor:"Avoir pour", from:"Émetteur", seller:"Vendeur", to:"Destinataire", client:"Client", vat:"TVA", description:"Description", qty:"Qté", unitPrice:"Prix unitaire", amount:"Montant", service:"Service", professionalServices:"Services professionnels", subtotal:"Sous-total", discount:"Remise", tax:"TVA", invoiceTotal:"Total de la facture", totalDue:"Total dû", depositDue:"Acompte dû maintenant", remaining:"Solde après acompte", paid:"Payé", balanceDue:"Solde dû", notes:"Notes", paymentInformation:"Informations de paiement", thankYou:"Merci pour votre confiance", madeWith:"Créé avec Fatūra Pro", printPdf:"Imprimer / PDF", close:"Fermer", copyPayment:"Copier le lien de paiement", paymentCopied:"Lien de paiement copié", status:{ paid:"Payée", overdue:"En retard", pending:"En attente", draft:"Brouillon", partial:"Partiellement payée", cancelled:"Annulée" } },
  ar: { invoice:"فاتورة", creditNote:"إشعار دائن", date:"التاريخ", due:"تاريخ الاستحقاق", creditFor:"إشعار دائن للفاتورة", from:"من", seller:"البائع", to:"إلى", client:"العميل", vat:"ضريبة القيمة المضافة", description:"الوصف", qty:"الكمية", unitPrice:"سعر الوحدة", amount:"المبلغ", service:"خدمة", professionalServices:"خدمات مهنية", subtotal:"المجموع الفرعي", discount:"الخصم", tax:"الضريبة", invoiceTotal:"إجمالي الفاتورة", totalDue:"المبلغ المستحق", depositDue:"الدفعة المطلوبة الآن", remaining:"المتبقي بعد الدفعة المقدمة", paid:"المدفوع", balanceDue:"الرصيد المستحق", notes:"ملاحظات", paymentInformation:"معلومات الدفع", thankYou:"شكرًا لتعاملك معنا", madeWith:"أُنشئت باستخدام Fatūra Pro", printPdf:"طباعة / PDF", close:"إغلاق", copyPayment:"نسخ رابط الدفع", paymentCopied:"تم نسخ رابط الدفع", status:{ paid:"مدفوعة", overdue:"متأخرة", pending:"قيد الانتظار", draft:"مسودة", partial:"مدفوعة جزئيًا", cancelled:"ملغاة" } },
};

export function invoiceCopy(language) {
  return INVOICE_COPY[normalizeDocumentLanguage(language)] || INVOICE_COPY.en;
}
