const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// ─── Load credentials from downloaded JSON ───
const credentials = require('./gmail_credentials.json');
const { client_secret, client_id } = credentials.installed;
const redirect_uris = credentials.installed.redirect_uris;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]  // usually http://localhost:8080 or similar
);

// ─── Scopes: only need to send emails ───
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// ─── Generate auth URL ───
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',   // REQUIRED for refresh token
  scope: SCOPES,
});

console.log('🔑 Authorize this app by visiting this URL:');
console.log(authUrl);

// ─── Get code from user ───
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('❌ Error retrieving access token:', err);
      return;
    }
    console.log('✅ Refresh token obtained!');
    console.log('📝 Copy this refresh_token and save it as an environment variable:');
    console.log(token.refresh_token);
    fs.writeFileSync('token.json', JSON.stringify(token));
  });
});