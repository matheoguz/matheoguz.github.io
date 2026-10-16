// Porte-monnaie vendeur : crée le compte Stripe Connect (Express) et renvoie vers la page Stripe
// où le vendeur donne son identité et son IBAN. Rebond ne voit jamais ces données bancaires.
import { admin, body, currentUser, isPayoutReady, payPending, serve, SITE_URL, stripe } from "../_shared/common.ts";

serve(async (req) => {
  const user = await currentUser(req);
  const { action } = await body<{ action: "start" | "status" | "dashboard" }>(req);

  let { data: acct } = await admin.from("seller_accounts").select("stripe_account_id").eq("user_id", user.id).maybeSingle();
  if (!acct && action !== "start") return { ready: false, exists: false };
  if (!acct) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: user.email,
      business_type: "individual",
      capabilities: { transfers: { requested: true } },
      business_profile: { product_description: "Revente de sneakers d’occasion entre particuliers sur Rebond" },
      metadata: { user_id: user.id },
    });
    await admin.from("seller_accounts").insert({ user_id: user.id, stripe_account_id: account.id });
    acct = { stripe_account_id: account.id };
  }

  if (action === "start") {
    const link = await stripe.accountLinks.create({
      account: acct.stripe_account_id,
      type: "account_onboarding",
      refresh_url: `${SITE_URL}?wallet=refresh`,
      return_url: `${SITE_URL}?wallet=return`,
    });
    return { url: link.url };
  }
  if (action === "dashboard") {
    const login = await stripe.accounts.createLoginLink(acct.stripe_account_id);
    return { url: login.url };
  }
  const ready = await isPayoutReady(acct.stripe_account_id);
  await admin.from("profiles").update({ payouts_ready: ready }).eq("id", user.id);
  if (ready) await payPending(user.id);
  return { ready, exists: true };
});
