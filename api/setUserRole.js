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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { targetEmail, newRole, domain } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user details
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'super-admin') {
      return res.status(403).json({ error: 'Only super admins can set user roles' });
    }

    // Find user by email
    const usersQuery = await db.collection('users')
      .where('email', '==', targetEmail)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUserDoc = usersQuery.docs[0];
    const targetUserData = targetUserDoc.data();

    // Update user role and domain
    const updateData = {
      role: newRole,
      updatedAt: new Date(),
      updatedBy: decodedToken.uid,
      updatedByName: userData.name
    };

    if (domain) {
      updateData.domain = domain;
    }

    await db.collection('users').doc(targetUserDoc.id).update(updateData);

    res.status(200).json({ 
      message: `Role updated successfully for ${targetEmail}`,
      userId: targetUserDoc.id,
      newRole,
      domain: domain || targetUserData.domain
    });

  } catch (error) {
    console.error('Error setting user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}