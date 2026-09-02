const SUPPORTED = ["en", "es", "fr"];

export function getLocale() {
  if (typeof window === "undefined") return "en";
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (SUPPORTED.includes(requested)) {
    localStorage.setItem("fatura_locale", requested);
    return requested;
  }
  const saved = localStorage.getItem("fatura_locale");
  return SUPPORTED.includes(saved) ? saved : "en";
}

export function setLocale(locale) {
  const next = SUPPORTED.includes(locale) ? locale : "en";
  localStorage.setItem("fatura_locale", next);
  document.documentElement.setAttribute("lang", next);
  return next;
}

export function localeHome(locale = getLocale()) {
  return locale === "en" ? "/" : `/${locale}`;
}

const COPY = {
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
    first_payment:"Tu primer cobro empieza aquí", create_paid_invoice:"Crea la factura que hará que te paguen.", guided_invoice_intro:"Añade los datos esenciales, revisa el documento terminado y envíalo a tu cliente. Puedes guardar los datos de tu negocio y cliente durante el mismo proceso.",
    create_first_invoice:"Crear mi primera factura →", add_business_details:"Añadir datos del negocio", ready_to_invoice:"Todo listo para facturar", any_order_steps:"Tres pasos útiles. Complétalos en cualquier orden.",
    business_details:"Datos del negocio", saved_reuse:"Guardados y listos para reutilizar", add_vat_details:"Añade nombre, dirección y datos de IVA", first_client:"Primer cliente", client_saved:"Cliente guardado para futuras facturas", save_reuse_invoice:"Guárdalo una vez y úsalo en cada factura", create_preview:"Crear y previsualizar", review_total:"Revisa el total antes de enviar o descargar",
    welcome_user:"Te damos la bienvenida", keep_moving:"Mantén tus facturas en marcha y tus cobros visibles.", all_current:"Todo está al día. Crea la próxima factura mientras el trabajo está reciente.", view_invoices:"Ver facturas", collected:"Cobrado", awaiting_payment:"Pendiente de cobro", overdue:"Vencido", needs_attention:"Necesita atención", documents:"Documentos", recent_invoices:"Facturas recientes", view_all:"Ver todas →",
    invoice:"Factura", client:"Cliente", amount:"Importe", due_date:"Vencimiento", status:"Estado", actions:"Acciones", preview:"Vista previa", payment:"Pago", remind:"Recordar", none_month:"Ninguna añadida este mes", this_month:"este mes", paid_invoices:"facturas pagadas", open_invoices:"facturas abiertas",
    from:"Emisor", to:"Cliente", items:"Conceptos", notes:"Notas", edit_invoice:"Editar factura", invoice_number:"Número de factura", seller_logo:"Logo de la empresa / emisor", from_business:"Empresa emisora", select_profile:"Selecciona un perfil de empresa…", seller_name:"Nombre del emisor / empresa", phone:"Teléfono", vat_number:"Número de IVA", select_client:"Seleccionar cliente existente", enter_manually:"— Introducir manualmente —", client_name:"Nombre del cliente / empresa *", invoice_date:"Fecha de factura *",
    quantity:"Cant.", price:"Precio", total:"Total", item_note:"Añade una nota para este concepto (opcional)…", add_line:"+ Añadir concepto", discount:"Descuento (%)", deposit:"Anticipo (%)", tax:"Impuesto / IVA (%)", subtotal:"Subtotal", invoice_total:"Total de la factura", deposit_due:"Anticipo a pagar ahora", remaining:"Restante tras el anticipo", invoice_notes:"Notas de la factura", payment_info:"Datos bancarios / de pago", summary:"Resumen", seller:"Emisor", close:"Cerrar", back:"← Atrás", save_draft:"Guardar borrador", step:"Paso", update_invoice:"Actualizar factura", save_invoice:"Guardar factura", next:"Siguiente →", new_client:"Nuevo cliente", client_business_name:"Nombre del cliente / empresa *", email_optional:"Correo electrónico (opcional)", phone_optional:"Teléfono (opcional)", choose_country:"— Elegir país —", add_client_action:"Guardar cliente", buyer_logo:"Logo del cliente (opcional)", client_due_required:"Completa el cliente y la fecha de vencimiento (paso 2)", client_name_required:"Introduce el nombre del cliente o empresa",
    all:"Todas", paid:"Pagadas", partial:"Parciales", pending:"Pendientes", cancelled:"Canceladas", draft:"Borradores", credit_notes:"Notas de crédito", search_invoices:"Buscar facturas…", no_invoices:"¡Te damos la bienvenida a Fatūra! Crea tu primera factura para empezar.", view:"Ver",
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
    first_payment:"Votre premier paiement commence ici", create_paid_invoice:"Créez la facture qui vous fera payer.", guided_invoice_intro:"Ajoutez l’essentiel, vérifiez le document final puis envoyez-le à votre client. Les coordonnées de votre entreprise et du client peuvent être enregistrées dans le même parcours.",
    create_first_invoice:"Créer ma première facture →", add_business_details:"Ajouter les coordonnées", ready_to_invoice:"Prêt à facturer", any_order_steps:"Trois étapes utiles, à compléter dans l’ordre de votre choix.",
    business_details:"Coordonnées de l’entreprise", saved_reuse:"Enregistrées et prêtes à réutiliser", add_vat_details:"Ajoutez votre nom, adresse et numéro de TVA", first_client:"Premier client", client_saved:"Client enregistré pour vos prochaines factures", save_reuse_invoice:"Enregistrez-le une fois, réutilisez-le partout", create_preview:"Créer et prévisualiser", review_total:"Vérifiez le total avant l’envoi ou le téléchargement",
    welcome_user:"Bon retour", keep_moving:"Gardez vos factures actives et vos paiements visibles.", all_current:"Tout est à jour. Créez la prochaine facture pendant que le travail est encore frais.", view_invoices:"Voir les factures", collected:"Encaissé", awaiting_payment:"En attente de paiement", overdue:"En retard", needs_attention:"À traiter", documents:"Documents", recent_invoices:"Factures récentes", view_all:"Tout voir →",
    invoice:"Facture", client:"Client", amount:"Montant", due_date:"Échéance", status:"Statut", actions:"Actions", preview:"Aperçu", payment:"Paiement", remind:"Relancer", none_month:"Aucune ajoutée ce mois-ci", this_month:"ce mois-ci", paid_invoices:"factures payées", open_invoices:"factures ouvertes",
    from:"Émetteur", to:"Client", items:"Articles", notes:"Notes", edit_invoice:"Modifier la facture", invoice_number:"Numéro de facture", seller_logo:"Logo de l’entreprise / émetteur", from_business:"Entreprise émettrice", select_profile:"Sélectionnez un profil d’entreprise…", seller_name:"Nom de l’entreprise / émetteur", phone:"Téléphone", vat_number:"Numéro de TVA", select_client:"Sélectionner un client existant", enter_manually:"— Saisir manuellement —", client_name:"Nom du client / entreprise *", invoice_date:"Date de facture *",
    quantity:"Qté", price:"Prix", total:"Total", item_note:"Ajouter une note pour cet article (facultatif)…", add_line:"+ Ajouter une ligne", discount:"Remise (%)", deposit:"Acompte (%)", tax:"Taxe / TVA (%)", subtotal:"Sous-total", invoice_total:"Total de la facture", deposit_due:"Acompte dû maintenant", remaining:"Solde après acompte", invoice_notes:"Notes de la facture", payment_info:"Coordonnées bancaires / de paiement", summary:"Récapitulatif", seller:"Émetteur", close:"Fermer", back:"← Retour", save_draft:"Enregistrer le brouillon", step:"Étape", update_invoice:"Mettre à jour", save_invoice:"Enregistrer la facture", next:"Suivant →", new_client:"Nouveau client", client_business_name:"Nom du client / entreprise *", email_optional:"Adresse e-mail (facultatif)", phone_optional:"Téléphone (facultatif)", choose_country:"— Choisir un pays —", add_client_action:"Enregistrer le client", buyer_logo:"Logo du client (facultatif)", client_due_required:"Renseignez le client et la date d’échéance (étape 2)", client_name_required:"Saisissez le nom du client ou de l’entreprise",
    all:"Toutes", paid:"Payées", partial:"Partielles", pending:"En attente", cancelled:"Annulées", draft:"Brouillons", credit_notes:"Avoirs", search_invoices:"Rechercher des factures…", no_invoices:"Bienvenue sur Fatūra ! Créez votre première facture pour commencer.", view:"Voir",
  },
};

export function tr(key, fallback, locale = getLocale()) {
  return COPY[locale]?.[key] || fallback;
}
