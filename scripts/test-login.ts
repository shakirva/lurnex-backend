import { UserModel } from '../src/models/User';
import database from '../src/config/database';

async function testLogin() {
  await database.connect();
  const username = 'employer@demo.com';
  const password = 'Demo@123';

  console.log('Testing login for:', username);
  const user = await UserModel.findByUsernameWithPassword(username);
  if (!user) {
    console.log('User not found!');
  } else {
    console.log('User found:', user.username, 'is_active:', user.is_active);
    const isValid = await UserModel.validatePassword(user, password);
    console.log('Password valid?', isValid);
  }
  
  process.exit(0);
}

testLogin().catch(console.error);
