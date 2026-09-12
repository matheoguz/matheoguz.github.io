// =============================================================================
// HomeVibe - Gestionnaire de Commandes
// =============================================================================
//
// Ce module gere la creation, le stockage et le suivi des commandes.
// Les commandes sont stockees dans localStorage pour un site statique.
//
// En production, vous pouvez:
// - Exporter les commandes en JSON depuis le tableau de bord admin
// - Connecter un webhook Stripe pour creer automatiquement les commandes
// - Utiliser un service comme Airtable ou Google Sheets comme base de donnees
//
// Format du numero de commande: HV-2024-XXXXX
// =============================================================================

var OrderManager = (function() {
    'use strict';

    // Cle de stockage dans localStorage
    var ORDERS_STORAGE_KEY = 'homevibe-orders';
    var CART_STORAGE_KEY = 'hv_cart';

    // Statuts possibles d'une commande
    var ORDER_STATUS = {
        PENDING: 'en_attente',        // Commande creee, paiement en cours
        PAID: 'payee',                // Paiement recu
        PROCESSING: 'en_traitement',  // En cours de preparation
        SHIPPED: 'expediee',          // Expediee
        DELIVERED: 'livree',          // Livree
        CANCELLED: 'annulee',         // Annulee
        REFUNDED: 'remboursee'        // Remboursee
    };

    // ==========================================================================
    // Generation de numero de commande
    // ==========================================================================

    /**
     * Genere un numero de commande unique
     * Format: HV-ANNEE-XXXXX (ex: HV-2026-48A7F)
     * @returns {string} Le numero de commande
     */
    function generateOrderNumber() {
        var year = new Date().getFullYear();
        // Generer 5 caracteres alphanumeriques aleatoires
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var random = '';
        for (var i = 0; i < 5; i++) {
            random += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return 'HV-' + year + '-' + random;
    }

    // ==========================================================================
    // Acces au stockage
    // ==========================================================================

    /**
     * Recupere toutes les commandes depuis localStorage
     * @returns {Array} Liste des commandes
     */
    function getAllOrders() {
        try {
            var data = localStorage.getItem(ORDERS_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[HomeVibe] Erreur lecture commandes:', e);
            return [];
        }
    }

    /**
     * Sauvegarde toutes les commandes dans localStorage
     * @param {Array} orders - Liste des commandes a sauvegarder
     */
    function saveAllOrders(orders) {
        try {
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
        } catch (e) {
            console.error('[HomeVibe] Erreur sauvegarde commandes:', e);
        }
    }

    // ==========================================================================
    // Creation de commande
    // ==========================================================================

    /**
     * Cree une nouvelle commande
     * @param {Object} orderData - Donnees de la commande
     * @param {Array} orderData.items - Articles commandes
     * @param {Object} orderData.customer - Informations client
     * @param {string} orderData.delivery - Methode de livraison
     * @param {number} orderData.subtotal - Sous-total
     * @param {number} orderData.deliveryFee - Frais de livraison
     * @param {number} orderData.total - Total
     * @param {string} orderData.paymentMethod - Methode de paiement
     * @param {string} orderData.paymentStatus - Statut du paiement
     * @returns {Object} La commande creee
     */
    function createOrder(orderData) {
        var order = {
            orderNumber: generateOrderNumber(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: orderData.paymentStatus === 'completed' ? ORDER_STATUS.PAID : ORDER_STATUS.PENDING,
            items: orderData.items || [],
            customer: {
                firstName: orderData.customer.firstName || '',
                lastName: orderData.customer.lastName || '',
                email: orderData.customer.email || '',
                phone: orderData.customer.phone || '',
                address: orderData.customer.address || '',
                postalCode: orderData.customer.postalCode || '',
                city: orderData.customer.city || '',
                country: orderData.customer.country || 'France'
            },
            delivery: {
                method: orderData.delivery || 'standard',
                fee: orderData.deliveryFee || 0,
                estimatedDays: orderData.delivery === 'express' ? '3-7' : '7-14',
                trackingNumber: null,
                shippedAt: null
            },
            payment: {
                method: orderData.paymentMethod || 'stripe',
                status: orderData.paymentStatus || 'pending',
                subtotal: orderData.subtotal || 0,
                deliveryFee: orderData.deliveryFee || 0,
                total: orderData.total || 0,
                currency: 'EUR',
                stripeSessionId: orderData.stripeSessionId || null
            },
            notes: []
        };

        // Sauvegarder dans localStorage
        var orders = getAllOrders();
        orders.unshift(order); // Ajouter en debut de liste (plus recent en premier)
        saveAllOrders(orders);

        // Sauvegarder aussi la derniere commande pour la page de succes
        try {
            localStorage.setItem('homevibe-last-order', JSON.stringify(order));
        } catch (e) {
            console.error('[HomeVibe] Erreur sauvegarde derniere commande:', e);
        }

        console.log('[HomeVibe] Commande creee:', order.orderNumber);
        return order;
    }

    // ==========================================================================
    // Recherche et filtrage
    // ==========================================================================

    /**
     * Recupere une commande par son numero
     * @param {string} orderNumber - Le numero de commande (ex: HV-2026-48A7F)
     * @returns {Object|null} La commande ou null si non trouvee
     */
    function getOrderByNumber(orderNumber) {
        var orders = getAllOrders();
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].orderNumber === orderNumber) {
                return orders[i];
            }
        }
        return null;
    }

    /**
     * Filtre les commandes par statut
     * @param {string} status - Le statut a filtrer (voir ORDER_STATUS)
     * @returns {Array} Les commandes correspondantes
     */
    function getOrdersByStatus(status) {
        var orders = getAllOrders();
        return orders.filter(function(order) {
            return order.status === status;
        });
    }

    /**
     * Filtre les commandes par email client
     * @param {string} email - L'email du client
     * @returns {Array} Les commandes du client
     */
    function getOrdersByEmail(email) {
        var orders = getAllOrders();
        return orders.filter(function(order) {
            return order.customer.email.toLowerCase() === email.toLowerCase();
        });
    }

    /**
     * Recupere les commandes recentes
     * @param {number} limit - Nombre maximum de commandes a retourner
     * @returns {Array} Les commandes les plus recentes
     */
    function getRecentOrders(limit) {
        var orders = getAllOrders();
        return orders.slice(0, limit || 10);
    }

    /**
     * Recupere la derniere commande creee (pour la page de succes)
     * @returns {Object|null} La derniere commande ou null
     */
    function getLastOrder() {
        try {
            var data = localStorage.getItem('homevibe-last-order');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('[HomeVibe] Erreur lecture derniere commande:', e);
            return null;
        }
    }

    // ==========================================================================
    // Mise a jour de commande
    // ==========================================================================

    /**
     * Met a jour le statut d'une commande
     * @param {string} orderNumber - Le numero de commande
     * @param {string} newStatus - Le nouveau statut
     * @param {string} note - Note optionnelle sur le changement
     * @returns {Object|null} La commande mise a jour ou null
     */
    function updateOrderStatus(orderNumber, newStatus, note) {
        var orders = getAllOrders();
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].orderNumber === orderNumber) {
                orders[i].status = newStatus;
                orders[i].updatedAt = new Date().toISOString();

                if (note) {
                    orders[i].notes.push({
                        date: new Date().toISOString(),
                        message: note,
                        status: newStatus
                    });
                }

                // Mettre a jour les dates specifiques
                if (newStatus === ORDER_STATUS.SHIPPED) {
                    orders[i].delivery.shippedAt = new Date().toISOString();
                }

                saveAllOrders(orders);
                console.log('[HomeVibe] Commande', orderNumber, 'mise a jour:', newStatus);
                return orders[i];
            }
        }
        return null;
    }

    /**
     * Ajoute un numero de suivi a une commande
     * @param {string} orderNumber - Le numero de commande
     * @param {string} trackingNumber - Le numero de suivi
     * @returns {Object|null} La commande mise a jour ou null
     */
    function addTrackingNumber(orderNumber, trackingNumber) {
        var orders = getAllOrders();
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].orderNumber === orderNumber) {
                orders[i].delivery.trackingNumber = trackingNumber;
                orders[i].updatedAt = new Date().toISOString();
                orders[i].notes.push({
                    date: new Date().toISOString(),
                    message: 'Numero de suivi ajoute: ' + trackingNumber,
                    status: orders[i].status
                });
                saveAllOrders(orders);
                return orders[i];
            }
        }
        return null;
    }

    // ==========================================================================
    // Statistiques
    // ==========================================================================

    /**
     * Calcule les statistiques de ventes
     * @returns {Object} Statistiques (total commandes, revenus, etc.)
     */
    function getStats() {
        var orders = getAllOrders();
        var totalRevenue = 0;
        var paidOrders = 0;
        var pendingOrders = 0;
        var shippedOrders = 0;

        for (var i = 0; i < orders.length; i++) {
            if (orders[i].status !== ORDER_STATUS.CANCELLED &&
                orders[i].status !== ORDER_STATUS.REFUNDED) {
                totalRevenue += orders[i].payment.total;
            }
            if (orders[i].status === ORDER_STATUS.PAID) paidOrders++;
            if (orders[i].status === ORDER_STATUS.PENDING) pendingOrders++;
            if (orders[i].status === ORDER_STATUS.SHIPPED) shippedOrders++;
        }

        return {
            totalOrders: orders.length,
            totalRevenue: totalRevenue,
            paidOrders: paidOrders,
            pendingOrders: pendingOrders,
            shippedOrders: shippedOrders,
            averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
        };
    }

    // ==========================================================================
    // Export / Import
    // ==========================================================================

    /**
     * Exporte toutes les commandes en JSON
     * Utile pour le tableau de bord admin ou pour un backup
     * @returns {string} Les commandes au format JSON
     */
    function exportOrdersJSON() {
        var orders = getAllOrders();
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            store: 'HomeVibe',
            totalOrders: orders.length,
            orders: orders
        }, null, 2);
    }

    /**
     * Importe des commandes depuis un JSON
     * @param {string} jsonString - Les commandes au format JSON
     * @param {boolean} merge - true pour fusionner, false pour remplacer
     * @returns {number} Nombre de commandes importees
     */
    function importOrdersJSON(jsonString, merge) {
        try {
            var data = JSON.parse(jsonString);
            var importedOrders = data.orders || data;

            if (!Array.isArray(importedOrders)) {
                throw new Error('Format de donnees invalide');
            }

            if (merge) {
                var existingOrders = getAllOrders();
                var existingNumbers = {};
                for (var i = 0; i < existingOrders.length; i++) {
                    existingNumbers[existingOrders[i].orderNumber] = true;
                }
                var newOrders = importedOrders.filter(function(order) {
                    return !existingNumbers[order.orderNumber];
                });
                var merged = existingOrders.concat(newOrders);
                saveAllOrders(merged);
                return newOrders.length;
            } else {
                saveAllOrders(importedOrders);
                return importedOrders.length;
            }
        } catch (e) {
            console.error('[HomeVibe] Erreur import commandes:', e);
            return 0;
        }
    }

    /**
     * Calcule les totaux d'une commande a partir de ses articles
     * @param {Array} items - Articles de la commande
     * @param {string} deliveryMethod - 'standard' ou 'express'
     * @returns {Object} {subtotal, deliveryFee, total}
     */
    function calculateOrderTotals(items, deliveryMethod) {
        var subtotal = 0;
        for (var i = 0; i < items.length; i++) {
            var price = parseFloat(items[i].price) || 0;
            var quantity = parseInt(items[i].quantity) || 1;
            subtotal += price * quantity;
        }
        var deliveryFee = deliveryMethod === 'express' ? 9.99 : 0;
        return {
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            total: subtotal + deliveryFee
        };
    }

    /**
     * Formate un prix en euros pour affichage
     * @param {number} amount - Le montant
     * @returns {string} Prix formate (ex: "34,99 EUR")
     */
    function formatPrice(amount) {
        return amount.toFixed(2).replace('.', ',') + ' €';
    }

    /**
     * Formate une date ISO en date lisible en francais
     * @param {string} isoString - Date au format ISO
     * @returns {string} Date formatee (ex: "11 septembre 2026 a 14h30")
     */
    function formatDate(isoString) {
        var months = [
            'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
        ];
        var d = new Date(isoString);
        var day = d.getDate();
        var month = months[d.getMonth()];
        var year = d.getFullYear();
        var hours = d.getHours().toString().padStart(2, '0');
        var minutes = d.getMinutes().toString().padStart(2, '0');
        return day + ' ' + month + ' ' + year + ' a ' + hours + 'h' + minutes;
    }

    // ==========================================================================
    // API publique
    // ==========================================================================

    return {
        // Constantes
        STATUS: ORDER_STATUS,

        // Creation
        createOrder: createOrder,
        generateOrderNumber: generateOrderNumber,

        // Lecture
        getAllOrders: getAllOrders,
        getOrderByNumber: getOrderByNumber,
        getOrdersByStatus: getOrdersByStatus,
        getOrdersByEmail: getOrdersByEmail,
        getRecentOrders: getRecentOrders,
        getLastOrder: getLastOrder,

        // Mise a jour
        updateOrderStatus: updateOrderStatus,
        addTrackingNumber: addTrackingNumber,

        // Statistiques
        getStats: getStats,

        // Export / Import
        exportOrdersJSON: exportOrdersJSON,
        importOrdersJSON: importOrdersJSON,

        // Utilitaires
        calculateOrderTotals: calculateOrderTotals,
        formatPrice: formatPrice,
        formatDate: formatDate
    };
})();

// Rendre accessible globalement
if (typeof window !== 'undefined') {
    window.OrderManager = OrderManager;
}
