export function getConfig() {
  return {
    port: 5000,
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    },
    frontendUrl: process.env.FRONTEND_URL || 'https://homys-eta.vercel.app',
    resend: {
      apiKey: process.env.RESEND_API_KEY || '',
      fromEmail: process.env.RESEND_FROM_EMAIL || 'Homys <onboarding@resend.dev>',
    },
  };
}

export const config = getConfig();
