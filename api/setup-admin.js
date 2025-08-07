import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const auth = getAuth(app);

const demoAccounts = [
  {
    email: 'mrsrikart@gmail.com',
    name: 'Srikar Admin',
    role: 'super-admin',
    domain: 'management',
    password: 'password123'
  },
  {
    email: 'admin@vyomsetu.com',
    name: 'System Admin',
    role: 'admin',
    domain: 'general',
    password: 'password123'
  },
  {
    email: 'tech-lead@vyomsetu.com',
    name: 'Tech Lead',
    role: 'domain-lead',
    domain: 'technology',
    password: 'password123'
  },
  {
    email: 'design-lead@vyomsetu.com',
    name: 'Design Lead',
    role: 'domain-lead',
    domain: 'design',
    password: 'password123'
  },
  {
    email: 'member1@vyomsetu.com',
    name: 'John Developer',
    role: 'member',
    domain: 'technology',
    password: 'password123'
  },
  {
    email: 'member2@vyomsetu.com',
    name: 'Sarah Designer',
    role: 'member',
    domain: 'design',
    password: 'password123'
  },
  {
    email: 'member3@vyomsetu.com',
    name: 'Mike Tester',
    role: 'member',
    domain: 'technology',
    password: 'password123'
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { secret } = req.body;
    
    // Simple security check
    if (secret !== process.env.SETUP_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const createdUsers = [];

    for (const account of demoAccounts) {
      try {
        // Check if user already exists
        let userRecord;
        try {
          userRecord = await auth.getUserByEmail(account.email);
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // Create new user
            userRecord = await auth.createUser({
              email: account.email,
              password: account.password,
              displayName: account.name
            });
          } else {
            throw error;
          }
        }

        // Create/update user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          name: account.name,
          email: account.email,
          role: account.role,
          domain: account.domain,
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });

        createdUsers.push({
          uid: userRecord.uid,
          email: account.email,
          name: account.name,
          role: account.role,
          domain: account.domain
        });

      } catch (error) {
        console.error(`Error creating user ${account.email}:`, error);
      }
    }

    // Create some demo tasks
    const demoTasks = [
      {
        title: 'Design Homepage Mockup',
        description: 'Create a modern homepage design for the VyomSetu platform',
        priority: 'high',
        status: 'pending',
        domain: 'design',
        assignedTo: createdUsers.find(u => u.email === 'member2@vyomsetu.com')?.uid,
        assignedToName: 'Sarah Designer',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdBy: createdUsers.find(u => u.email === 'design-lead@vyomsetu.com')?.uid,
        createdByName: 'Design Lead',
        createdAt: new Date()
      },
      {
        title: 'Implement User Authentication',
        description: 'Set up Firebase authentication with Google login',
        priority: 'high',
        status: 'in-progress',
        domain: 'technology',
        assignedTo: createdUsers.find(u => u.email === 'member1@vyomsetu.com')?.uid,
        assignedToName: 'John Developer',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        createdBy: createdUsers.find(u => u.email === 'tech-lead@vyomsetu.com')?.uid,
        createdByName: 'Tech Lead',
        createdAt: new Date()
      },
      {
        title: 'Write API Documentation',
        description: 'Document all API endpoints for the task management system',
        priority: 'medium',
        status: 'pending',
        domain: 'technology',
        assignedTo: createdUsers.find(u => u.email === 'member3@vyomsetu.com')?.uid,
        assignedToName: 'Mike Tester',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        createdBy: createdUsers.find(u => u.email === 'tech-lead@vyomsetu.com')?.uid,
        createdByName: 'Tech Lead',
        createdAt: new Date()
      }
    ];

    for (const task of demoTasks) {
      if (task.assignedTo) {
        await db.collection('tasks').add(task);
      }
    }

    res.status(200).json({ 
      message: 'Demo accounts and tasks created successfully',
      users: createdUsers,
      tasksCreated: demoTasks.length
    });

  } catch (error) {
    console.error('Error setting up demo accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 