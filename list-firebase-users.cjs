// List all existing Firebase users
require('dotenv').config();
const admin = require('firebase-admin');

async function listExistingUsers() {
  try {
    // Parse Firebase Admin credentials
    if (!process.env.FIREBASE_ADMIN_KEY) {
      throw new Error('FIREBASE_ADMIN_KEY not found in environment');
    }
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
    console.log('✅ Firebase Admin credentials loaded');

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });

    // List all users
    console.log('\n👥 Existing Firebase users:');
    console.log('=====================================');
    
    const listUsersResult = await admin.auth().listUsers(50); // Get up to 50 users
    
    if (listUsersResult.users.length === 0) {
      console.log('⚠️  No users found in Firebase project');
    } else {
      console.log(`Found ${listUsersResult.users.length} users:\n`);
      
      listUsersResult.users.forEach((userRecord, index) => {
        console.log(`${index + 1}. ${userRecord.email || 'No email'}`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   Created: ${new Date(userRecord.metadata.creationTime).toLocaleString()}`);
        console.log(`   Last Sign-in: ${userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime).toLocaleString() : 'Never'}`);
        console.log(`   Providers: ${userRecord.providerData.map(p => p.providerId).join(', ') || 'None'}`);
        console.log(`   Email Verified: ${userRecord.emailVerified}`);
        console.log('   ---');
      });
      
      console.log('\n💡 To reset a password for any existing user:');
      console.log('1. Go to Firebase Console > Authentication > Users');
      console.log('2. Click the user you want');
      console.log('3. Click "Reset password" or delete the user');
      console.log('\n🔧 Or you can use any of these existing emails with the correct password');
    }
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

listExistingUsers().then(() => {
  console.log('\n✅ User listing completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});