const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stytch = require("stytch");

const stytchClient = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
  env: stytch.envs.test,
});

export default async function handler(req, res) {
  const { stytch_session: stytchSession } = req.cookies;
  if (!stytchSession) {
    return res.status(403).json({ error: "NOT AUTHORIZED" });
  }

  try {
    const { user } = await stytchClient.sessions.authenticate({
      session_token: stytchSession,
    });

    if (req.method === "POST") {
      const { code } = JSON.parse(req.body);

      // Verify the OTP
      const result = await stytchClient.otps.authenticate({
        code,
        method_id: user.emails[0].email_id,
      });

      // Redirect to the Customer Portal
      // In production, search for the Stripe customer associated
      // with the user first.
      // Here we use a pre-created customer for demonstration.
      const { url } = await stripe.billingPortal.sessions.create({
        customer: process.env.STRIPE_CUSTOMER,
        return_url: "http://localhost:3000/",
      });

      res.json({ url });
    } else {
      res
        .status(400)
        .json({ error: "Invalid request method. Only POST is allowed." });
    }
  } catch (error) {
    console.error("Error in verify API:", error);

    if (error.response && error.response.status === 400) {
      // Stytch API returned a 400 status code
      res.status(400).json({
        error: { message: error.response.data?.error_message ?? "ERROR" },
      });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
}
