import { db } from './server/db.js';
import { users } from './shared/schema.js';

try {
  const userList = await db.select().from(users).limit(3);
  console.log('Existing users:');
  userList.forEach(user => {
    console.log(`- ${user.email} (${user.authProvider})`);
  });
  console.log(`Total users: ${userList.length}`);
} catch (error) {
  console.error('Error checking users:', error);
}
