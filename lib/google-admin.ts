import { google } from 'googleapis';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  ?.replace(/^["']|["']$/g, '') // Remove wrapping quotes if any
  ?.replace(/\\n/g, '\n');

const GOOGLE_WORKSPACE_ADMIN_EMAIL = process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL;

if (GOOGLE_PRIVATE_KEY && !GOOGLE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----')) {
  console.error('GOOGLE_PRIVATE_KEY does not appear to be a valid PEM key. It should start with "-----BEGIN PRIVATE KEY-----"');
}

const auth = new google.auth.JWT({
  email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/admin.directory.group.readonly'],
  subject: GOOGLE_WORKSPACE_ADMIN_EMAIL,
});

const admin = google.admin({ version: 'directory_v1', auth });

export interface GoogleGroup {
  email?: string | null;
  name?: string | null;
}

/**
 * Retrieves the list of Google Workspace groups for a given user email.
 * Requires Domain-Wide Delegation and the Admin SDK Directory API enabled.
 */
export async function getUserGroups(userKey: string): Promise<GoogleGroup[]> {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_WORKSPACE_ADMIN_EMAIL) {
    console.warn('Google Admin SDK credentials not fully configured. Skipping group fetch.');
    return [];
  }

  try {
    const response = await admin.groups.list({ userKey });
    return response.data.groups || [];
  } catch (error) {
    console.error(`Error fetching groups for ${userKey}:`, error);
    return [];
  }
}
