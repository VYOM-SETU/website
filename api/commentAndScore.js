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
    const { submissionId, comment, qualityScore } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user details
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'domain-lead') {
      return res.status(403).json({ error: 'Only domain leads can comment and score submissions' });
    }

    // Get submission details
    const submissionDoc = await db.collection('submissions').doc(submissionId).get();
    if (!submissionDoc.exists) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submissionData = submissionDoc.data();
    
    // Check if user is from the same domain
    if (submissionData.domain !== userData.domain) {
      return res.status(403).json({ error: 'Not authorized to review this submission' });
    }

    // Add comment to submission
    const newComment = {
      leadId: decodedToken.uid,
      leadName: userData.name,
      text: comment,
      timestamp: new Date()
    };

    const comments = submissionData.comments || [];
    comments.push(newComment);

    // Update submission with comment and score
    const updateData = {
      comments,
      updatedAt: new Date()
    };

    if (qualityScore !== undefined) {
      updateData.qualityScore = qualityScore;
      updateData.scoredBy = decodedToken.uid;
      updateData.scoredByName = userData.name;
      updateData.scoredAt = new Date();
    }

    await db.collection('submissions').doc(submissionId).update(updateData);

    // Create credits entry if score is provided
    if (qualityScore !== undefined) {
      const creditsEntry = {
        submissionId,
        memberId: submissionData.submittedBy,
        taskId: submissionData.taskId,
        qualityScore,
        totalCredits: Math.round(qualityScore * 10), // Simple scoring system
        awardedBy: decodedToken.uid,
        awardedByName: userData.name,
        awardedAt: new Date()
      };

      await db.collection('credits').add(creditsEntry);
    }

    res.status(200).json({ 
      message: 'Comment and score added successfully',
      submissionId
    });

  } catch (error) {
    console.error('Error adding comment and score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
