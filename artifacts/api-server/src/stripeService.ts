import type Stripe from "stripe";
import { storage } from "./storage";
import { getUncachableStripeClient } from "./stripeClient";

/**
 * StripeService: direct Stripe API write operations.
 * Reads are delegated to storage (the synced stripe.* schema).
 */
export class StripeService {
  async createCustomer(email: string | undefined, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    const stripe = await getUncachableStripeClient();

    // Apply sales tax automatically, but only when Stripe Tax is active on the
    // account. In environments where it isn't set up yet (e.g. test mode),
    // enabling automatic_tax would make checkout fail, so we skip it gracefully.
    let taxActive = false;
    try {
      const taxSettings = await stripe.tax.settings.retrieve();
      taxActive = taxSettings.status === "active";
    } catch {
      taxActive = false;
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    };

    if (taxActive) {
      params.automatic_tax = { enabled: true };
      params.billing_address_collection = "required";
      // Persist the collected address on the customer so tax can be computed.
      params.customer_update = { address: "auto", name: "auto" };
    }

    return await stripe.checkout.sessions.create(params);
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getProduct(productId: string) {
    return await storage.getProduct(productId);
  }

  async getSubscription(subscriptionId: string) {
    return await storage.getSubscription(subscriptionId);
  }
}

export const stripeService = new StripeService();
