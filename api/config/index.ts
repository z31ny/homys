export function getConfig() {
  return {
    port: 5000,
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    },
    frontendUrl: process.env.FRONTEND_URL,
  };
}

export const config = getConfig();
