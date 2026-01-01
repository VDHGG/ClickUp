import { Issuer, Client } from 'openid-client';
import dotenv from 'dotenv';

dotenv.config();

// OpenID Configuration from MindX ID
const ISSUER_URL = 'https://id-dev.mindx.edu.vn';
const CLIENT_ID = process.env.OPENID_CLIENT_ID || '';
const CLIENT_SECRET = process.env.OPENID_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.OPENID_REDIRECT_URI || 'https://clickup.48-218-233-16.nip.io/api/auth/callback';

let issuer: Issuer | null = null;
let client: Client | null = null;

export async function getOpenIDClient(): Promise<Client> {
  if (client) {
    return client;
  }

  try {
    // Discover OpenID configuration
    issuer = await Issuer.discover(ISSUER_URL);
    
    // Create client
    client = new issuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: [REDIRECT_URI],
      response_types: ['code'],
    });

    return client;
  } catch (error) {
    console.error('Failed to initialize OpenID client:', error);
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

