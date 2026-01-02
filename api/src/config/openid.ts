import { Issuer, Client } from 'openid-client';
import dotenv from 'dotenv';

dotenv.config();

// OpenID Configuration from MindX ID
const ISSUER_URL = 'https://id-dev.mindx.edu.vn';
const CLIENT_ID = process.env.OPENID_CLIENT_ID || '';
const CLIENT_SECRET = process.env.OPENID_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.OPENID_REDIRECT_URI || 'https://clickup.48-218-233-16.nip.io/api/auth/callback';

// Log configuration on startup (without sensitive data)
console.log('OpenID Configuration:');
console.log('  ISSUER_URL:', ISSUER_URL);
console.log('  CLIENT_ID:', CLIENT_ID ? CLIENT_ID.substring(0, 8) + '...' : 'NOT SET');
console.log('  REDIRECT_URI:', REDIRECT_URI);
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');

let issuer: Issuer | null = null;
let client: Client | null = null;

export async function getOpenIDClient(): Promise<Client> {
  if (client) {
    return client;
  }

  // Validate required environment variables
  if (!CLIENT_ID || CLIENT_ID.trim() === '') {
    throw new Error('OPENID_CLIENT_ID is required but not set');
  }
  if (!CLIENT_SECRET || CLIENT_SECRET.trim() === '') {
    throw new Error('OPENID_CLIENT_SECRET is required but not set');
  }

  try {
    // 🔥 FIX: Create Issuer manually instead of discover()
    // MindX ID provider may not return 'iss' in id_token or strict OIDC format
    // Using discover() causes "iss missing from the response" error
    // Manual configuration avoids strict issuer validation
    issuer = new Issuer({
      issuer: ISSUER_URL,
      authorization_endpoint: 'https://id-dev.mindx.edu.vn/auth',
      token_endpoint: 'https://id-dev.mindx.edu.vn/token',
      userinfo_endpoint: 'https://id-dev.mindx.edu.vn/me',
      jwks_uri: 'https://id-dev.mindx.edu.vn/jwks',
    });
    
    console.log('[OpenID] Issuer created manually (bypassing strict OIDC validation)');
    
    // Create client
    client = new issuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: [REDIRECT_URI],
      response_types: ['code'],
    });

    console.log('[OpenID] Client initialized successfully');
    return client;
  } catch (error) {
    console.error('[OpenID] Failed to initialize OpenID client:', error);
    throw error;
  }
}

export async function getAuthorizationUrl(state: string): Promise<string> {
  const clientInstance = await getOpenIDClient();
  
  return clientInstance.authorizationUrl({
    scope: 'openid profile email',
    state: state,
  });
}

export { client, issuer };

