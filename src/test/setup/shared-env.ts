Object.assign(process.env, {
  NODE_ENV: "test",
});

process.env.AUTH_SECRET ??= "12345678901234567890123456789012";
process.env.AUTH_URL ??= "http://localhost:3000";
process.env.AUTH_TRUST_HOST ??= "true";
process.env.AUTH_GOOGLE_ID ??= "test-google-client-id";
process.env.AUTH_GOOGLE_SECRET ??= "test-google-client-secret";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
process.env.LOG_LEVEL ??= "error";
