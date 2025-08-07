// Demo Accounts Setup Script
// Run this script to create demo accounts for testing

const demoAccounts = [
  {
    email: 'mrsrikart@gmail.com',
    name: 'Srikar Admin',
    role: 'super-admin',
    domain: 'management'
  },
  {
    email: 'admin@vyomsetu.com',
    name: 'System Admin',
    role: 'admin',
    domain: 'general'
  },
  {
    email: 'tech-lead@vyomsetu.com',
    name: 'Tech Lead',
    role: 'domain-lead',
    domain: 'technology'
  },
  {
    email: 'design-lead@vyomsetu.com',
    name: 'Design Lead',
    role: 'domain-lead',
    domain: 'design'
  },
  {
    email: 'member1@vyomsetu.com',
    name: 'John Developer',
    role: 'member',
    domain: 'technology'
  },
  {
    email: 'member2@vyomsetu.com',
    name: 'Sarah Designer',
    role: 'member',
    domain: 'design'
  },
  {
    email: 'member3@vyomsetu.com',
    name: 'Mike Tester',
    role: 'member',
    domain: 'technology'
  }
];

// Instructions for setting up demo accounts:
console.log('=== VyomSetu Demo Accounts Setup ===');
console.log('');
console.log('To set up demo accounts, follow these steps:');
console.log('');
console.log('1. First, create these accounts in Firebase Authentication:');
demoAccounts.forEach(account => {
  console.log(`   - Email: ${account.email}`);
  console.log(`     Password: password123`);
  console.log(`     Role: ${account.role}`);
  console.log(`     Domain: ${account.domain}`);
  console.log('');
});

console.log('2. Then, manually create user documents in Firestore:');
console.log('   Collection: users');
console.log('   Document ID: [Firebase Auth UID]');
console.log('   Fields:');
console.log('     - name: [Full Name]');
console.log('     - email: [Email]');
console.log('     - role: [super-admin|admin|domain-lead|member]');
console.log('     - domain: [domain-name]');
console.log('     - createdAt: [timestamp]');
console.log('');

console.log('3. Demo Tasks to create:');
console.log('   - Create some sample tasks in the "tasks" collection');
console.log('   - Assign them to different members');
console.log('   - Set different statuses (pending, in-progress, completed)');
console.log('');

console.log('4. Test the following workflows:');
console.log('   - Super Admin: Manage users and roles');
console.log('   - Domain Lead: Create tasks, review submissions');
console.log('   - Member: View tasks, update status, submit work');
console.log('');

console.log('=== Quick Setup Commands ===');
console.log('');
console.log('You can also use the Firebase Admin SDK to programmatically create these accounts.');
console.log('See the API endpoints in the /api folder for backend functionality.');
console.log('');

// Export for potential programmatic use
export { demoAccounts }; 