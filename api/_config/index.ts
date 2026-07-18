export function getConfig() {
  return {
    port: 5000,
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    },
    frontendUrl: process.env.FRONTEND_URL || 'https://homyshospitality.com',
    resend: {
      apiKey: process.env.RESEND_API_KEY || '',
      fromEmail: process.env.RESEND_FROM_EMAIL || 'Homys <noreply@homyshospitality.com>',
    },
    paymob: {
      // New Unified Checkout (Create Intention) credentials
      secretKey: process.env.PAYMOB_SECRET_KEY || '',
      publicKey: process.env.PAYMOB_PUBLIC_KEY || '',
      integrationId: process.env.PAYMOB_INTEGRATION_ID || '',
      hmacSecret: process.env.PAYMOB_HMAC_SECRET || '',
      // Legacy (no longer used by the Unified Checkout flow)
      apiKey: process.env.PAYMOB_API_KEY || '',
      iframeId: process.env.PAYMOB_IFRAME_ID || '',
    },
  };
}

export const config = getConfig();
