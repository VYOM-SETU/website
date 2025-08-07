import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const auth = getAuth(app);

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { taskId, description, comments, files } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user details
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get task details
    const taskDoc = await db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskData = taskDoc.data();
    
    // Check if user is assigned to this task
    if (taskData.assignedTo !== decodedToken.uid) {
      return res.status(403).json({ error: 'Not authorized to submit this task' });
    }

    // Upload files to R2 if provided
    const uploadedFiles = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const fileKey = `submissions/${taskId}/${Date.now()}-${file.name}`;
          
          const uploadCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
            Body: Buffer.from(file.data, 'base64'),
            ContentType: file.type,
          });

          await r2Client.send(uploadCommand);
          
          uploadedFiles.push({
            name: file.name,
            key: fileKey,
            size: file.size,
            type: file.type,
            url: `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${fileKey}`
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          return res.status(500).json({ error: 'File upload failed' });
        }
      }
    }

    // Create submission record
    const submissionData = {
      taskId,
      taskTitle: taskData.title,
      description: description || '',
      comments: comments || '',
      submittedBy: decodedToken.uid,
      submittedByName: userData.name,
      domain: userData.domain,
      status: 'pending',
      submittedAt: new Date(),
      attachments: uploadedFiles
    };

    const submissionRef = await db.collection('submissions').add(submissionData);

    // Update task status
    await db.collection('tasks').doc(taskId).update({
      status: 'submitted',
      updatedAt: new Date()
    });

    res.status(200).json({ 
      message: 'Submission uploaded successfully',
      submissionId: submissionRef.id,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Error uploading submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 