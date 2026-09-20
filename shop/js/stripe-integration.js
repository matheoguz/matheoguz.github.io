// =============================================================================
// HomeVibe - Integration Stripe
// =============================================================================
//
// Instructions de configuration:
// 1. Creez un compte sur https://stripe.com
// 2. Allez dans Developers > API Keys
// 3. Copiez votre "Publishable key" (commence par pk_)
// 4. Remplacez STRIPE_PUBLISHABLE_KEY ci-dessous
// 5. Dans le Dashboard Stripe > Parametres > Paiements
//    ajoutez votre compte bancaire pour recevoir les virements
// 6. Les paiements arrivent sur votre compte en 2-7 jours ouvres
//
// Pour activer les paiements:
// 1. Creez un compte Stripe
// 2. Remplacez la cle ci-dessous
// 3. Creez les produits dans le Dashboard Stripe
// 4. Utilisez les Price IDs
//
// IMPORTANT: Cette cle est la cle PUBLIQUE (publishable).
// Ne mettez JAMAIS votre cle secrete (sk_) dans le code frontend.
// La cle secrete doit rester sur votre serveur backend uniquement.
// =============================================================================

const STRIPE_PUBLISHABLE_KEY = 'pk_test_VOTRE_CLE_ICI';

// Cle de stockage du panier dans localStorage
const CART_STORAGE_KEY = 'hv_cart';

// Variable globale pour l'instance Stripe
let stripeInstance = null;

// =============================================================================
// Verification du mode (demo ou production)
// =============================================================================

/**
 * Verifie si Stripe est configure avec une vraie cle
 * @returns {boolean} true si une vraie cle est configuree
 */
function isStripeConfigured() {
    return STRIPE_PUBLISHABLE_KEY &&
           STRIPE_PUBLISHABLE_KEY !== 'pk_test_VOTRE_CLE_ICI' &&
           STRIPE_PUBLISHABLE_KEY.startsWith('pk_');
}

/**
 * Verifie si on est en mode demo
 * @returns {boolean} true si on est en mode demo
 */
function isDemoMode() {
    return !isStripeConfigured();
}

// =============================================================================
// Initialisation de Stripe
// =============================================================================

/**
 * Initialise l'instance Stripe avec la cle publique
 * @returns {Object|null} L'instance Stripe ou null en mode demo
 */
function initStripe() {
    if (isDemoMode()) {
        console.log('[HomeVibe] Mode Demo actif - Stripe non configure');
        console.log('[HomeVibe] Pour activer les paiements, remplacez STRIPE_PUBLISHABLE_KEY');
        return null;
    }

    try {
        if (typeof Stripe === 'undefined') {
            console.error('[HomeVibe] Stripe.js non charge. Verifiez que le script est inclus.');
            return null;
        }
        stripeInstance = Stripe(STRIPE_PUBLISHABLE_KEY);
        console.log('[HomeVibe] Stripe initialise avec succes');
        return stripeInstance;
    } catch (error) {
        console.error('[HomeVibe] Erreur lors de l\'initialisation de Stripe:', error);
        return null;
    }
}

// =============================================================================
// Gestion du panier
// =============================================================================

/**
 * Recupere le panier depuis localStorage
 * @returns {Array} Les articles du panier
 */
function getCart() {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error('[HomeVibe] Erreur lecture panier:', e);
        return [];
    }
}

/**
 * Calcule le sous-total du panier
 * @param {Array} items - Articles du panier
 * @returns {number} Le sous-total en euros
 */
function calculateSubtotal(items) {
    return items.reduce(function(total, item) {
        var price = parseFloat(item.price) || 0;
        var quantity = parseInt(item.qty) || 1;
        return total + (price * quantity);
    }, 0);
}

/**
 * Calcule le total avec les frais de livraison
 * @param {Array} items - Articles du panier
 * @param {string} deliveryMethod - 'standard' ou 'express'
 * @returns {Object} {subtotal, delivery, total}
 */
function calculateTotal(items, deliveryMethod) {
    var subtotal = calculateSubtotal(items);
    var delivery = deliveryMethod === 'express' ? 9.99 : 0;
    return {
        subtotal: subtotal,
        delivery: delivery,
        total: subtotal + delivery
    };
}

// =============================================================================
// Creation de session Checkout Stripe
// =============================================================================

/**
 * Cree une session de paiement Stripe Checkout
 *
 * NOTE IMPORTANTE: En production, cette fonction doit appeler votre
 * backend (serveur Node.js, API serverless, etc.) qui creera la session
 * avec votre cle secrete Stripe. Le frontend ne peut pas creer de
 * sessions directement.
 *
 * Exemple d'endpoint backend necessaire:
 * POST /api/create-checkout-session
 * Body: { items: [...], delivery: 'standard'|'express', customer: {...} }
 *
 * @param {Array} items - Articles du panier avec price_id Stripe
 * @param {Object} customerInfo - Informations du client
 * @param {string} deliveryMethod - Methode de livraison choisie
 * @returns {Promise} Redirection vers Stripe Checkout
 */
async function createCheckoutSession(items, customerInfo, deliveryMethod) {
    // Stripe n'est pas configure (pas de cle reelle) : on utilise PayPal a la place
    if (isDemoMode()) {
        return processPaypalPayment(items, customerInfo, deliveryMethod);
    }

    // --- MODE PRODUCTION ---
    // Preparer les line_items pour Stripe
    // Chaque produit doit avoir un price_id Stripe (cree dans le Dashboard)
    var lineItems = items.map(function(item) {
        return {
            price: item.stripePriceId, // Price ID du Dashboard Stripe (price_xxx)
            quantity: parseInt(item.qty) || 1
        };
    });

    // Ajouter les frais de livraison si express
    if (deliveryMethod === 'express') {
        lineItems.push({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: 'Livraison Express (3-7 jours)',
                },
                unit_amount: 999 // 9.99 EUR en centimes
            },
            quantity: 1
        });
    }

    try {
        // Appel a votre backend pour creer la session
        // Remplacez l'URL par celle de votre serveur
        var response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                line_items: lineItems,
                customer_email: customerInfo.email,
                metadata: {
                    customer_name: customerInfo.firstName + ' ' + customerInfo.lastName,
                    phone: customerInfo.phone,
                    address: customerInfo.address,
                    city: customerInfo.city,
                    postal_code: customerInfo.postalCode,
                    country: customerInfo.country,
                    delivery_method: deliveryMethod
                },
                success_url: window.location.origin + '/shop/checkout/success.html?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: window.location.origin + '/shop/checkout/cancel.html'
            })
        });

        var session = await response.json();

        if (session.error) {
            throw new Error(session.error);
        }

        // Rediriger vers Stripe Checkout
        return redirectToCheckout(session.id);

    } catch (error) {
        console.error('[HomeVibe] Erreur creation session:', error);
        throw error;
    }
}

// =============================================================================
// Redirection vers Stripe Checkout
// =============================================================================

/**
 * Redirige le client vers la page de paiement Stripe
 * @param {string} sessionId - L'ID de la session Checkout
 * @returns {Promise} Resultat de la redirection
 */
async function redirectToCheckout(sessionId) {
    if (!stripeInstance) {
        stripeInstance = initStripe();
    }

    if (!stripeInstance) {
        throw new Error('Stripe non initialise');
    }

    var result = await stripeInstance.redirectToCheckout({ sessionId: sessionId });

    if (result.error) {
        console.error('[HomeVibe] Erreur redirection Stripe:', result.error.message);
        throw new Error(result.error.message);
    }

    return result;
}

// =============================================================================
// Paiement via PayPal.me (pas de cle Stripe configuree)
// =============================================================================

// Remplacez par votre propre lien PayPal.me si different
var PAYPAL_ME_USERNAME = 'MatheoGuzzi';
// Adresse qui recoit le recapitulatif de commande (nom, adresse, articles)
var ORDER_NOTIFICATION_EMAIL = 'contact@homevibe-shop.com';

/**
 * Traite le paiement via PayPal.me : sauvegarde la commande, envoie le
 * recapitulatif par email au vendeur, ouvre PayPal.me avec le montant exact,
 * puis redirige vers la page de succes.
 *
 * @param {Array} items - Articles du panier
 * @param {Object} customerInfo - Informations client
 * @param {string} deliveryMethod - Methode de livraison
 */
function processPaypalPayment(items, customerInfo, deliveryMethod) {
    var totals = calculateTotal(items, deliveryMethod);
    var order = null;

    if (typeof OrderManager !== 'undefined') {
        order = OrderManager.createOrder({
            items: items,
            customer: customerInfo,
            delivery: deliveryMethod,
            subtotal: totals.subtotal,
            deliveryFee: totals.delivery,
            total: totals.total,
            paymentMethod: 'paypal',
            paymentStatus: 'pending'
        });
    }

    var orderRef = order ? order.orderNumber : ('HV-' + Date.now());

    // Email recapitulatif au vendeur (nom, adresse, articles, total, reference)
    var itemsList = items.map(function(item) {
        var qty = parseInt(item.qty) || 1;
        return '- ' + (item.name || 'Produit') + ' x' + qty + ' = ' + formatPrice((parseFloat(item.price) || 0) * qty);
    }).join('\n');

    var body = 'Nouvelle commande HomeVibe (' + orderRef + ')\n\n' +
        'Client : ' + customerInfo.firstName + ' ' + customerInfo.lastName + '\n' +
        'Email : ' + customerInfo.email + '\n' +
        'Telephone : ' + (customerInfo.phone || 'non renseigne') + '\n' +
        'Adresse : ' + customerInfo.address + ', ' + customerInfo.postalCode + ' ' + customerInfo.city + ', ' + customerInfo.country + '\n' +
        'Livraison : ' + (deliveryMethod === 'express' ? 'Express (3-7 jours)' : 'Standard (7-14 jours)') + '\n\n' +
        'Articles :\n' + itemsList + '\n\n' +
        'Sous-total : ' + formatPrice(totals.subtotal) + '\n' +
        'Livraison : ' + formatPrice(totals.delivery) + '\n' +
        'TOTAL : ' + formatPrice(totals.total) + '\n\n' +
        'Paiement attendu via PayPal.me pour ce montant exact — verifiez la reception avant expedition.';

    var mailtoUrl = 'mailto:' + ORDER_NOTIFICATION_EMAIL +
        '?subject=' + encodeURIComponent('Commande HomeVibe ' + orderRef) +
        '&body=' + encodeURIComponent(body);

    // PayPal.me avec le montant exact du panier
    var paypalUrl = 'https://paypal.me/' + PAYPAL_ME_USERNAME + '/' + totals.total.toFixed(2) + 'EUR';

    // Ouvre le recap email (client mail) et PayPal (nouvel onglet) sans bloquer la redirection
    try { window.open(mailtoUrl, '_blank'); } catch (e) { console.error('[HomeVibe] mailto error', e); }
    window.open(paypalUrl, '_blank');

    return new Promise(function(resolve) {
        setTimeout(function() {
            window.location.href = '/shop/checkout/success.html?paypal=true&ref=' + encodeURIComponent(orderRef);
            resolve();
        }, 800);
    });
}

// =============================================================================
// Gestion du succes et de l'annulation
// =============================================================================

/**
 * Gere le retour apres un paiement reussi
 * - Vide le panier
 * - Affiche la confirmation
 */
function handlePaymentSuccess() {
    console.log('[HomeVibe] Paiement reussi !');

    // Vider le panier
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
        console.error('[HomeVibe] Erreur suppression panier:', e);
    }

    // Recuperer les infos de session si disponibles
    var urlParams = new URLSearchParams(window.location.search);
    var sessionId = urlParams.get('session_id');
    var isDemo = urlParams.get('demo') === 'true';

    return {
        sessionId: sessionId,
        isDemo: isDemo,
        success: true
    };
}

/**
 * Gere le retour apres une annulation de paiement
 * - Le panier est conserve
 * - Affiche un message d'information
 */
function handlePaymentCancel() {
    console.log('[HomeVibe] Paiement annule par le client');

    return {
        cancelled: true,
        cartPreserved: true
    };
}

// =============================================================================
// Utilitaires
// =============================================================================

/**
 * Formate un prix en euros
 * @param {number} amount - Montant a formater
 * @returns {string} Prix formate (ex: "34,99 EUR")
 */
function formatPrice(amount) {
    return amount.toFixed(2).replace('.', ',') + ' €';
}

/**
 * Compte le nombre total d'articles dans le panier
 * @param {Array} items - Articles du panier
 * @returns {number} Nombre total d'articles
 */
function getCartItemCount(items) {
    return items.reduce(function(count, item) {
        return count + (parseInt(item.qty) || 1);
    }, 0);
}

// Exporter les fonctions pour utilisation dans d'autres fichiers
if (typeof window !== 'undefined') {
    window.HomeVibeStripe = {
        init: initStripe,
        isConfigured: isStripeConfigured,
        isDemoMode: isDemoMode,
        getCart: getCart,
        calculateSubtotal: calculateSubtotal,
        calculateTotal: calculateTotal,
        createCheckoutSession: createCheckoutSession,
        redirectToCheckout: redirectToCheckout,
        handlePaymentSuccess: handlePaymentSuccess,
        handlePaymentCancel: handlePaymentCancel,
        formatPrice: formatPrice,
        getCartItemCount: getCartItemCount
    };
}
