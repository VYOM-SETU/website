import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const auth = getAuth(app);

// Email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description, dueDate, assignedTo, domain, priority } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user is domain-lead or admin
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData || (userData.role !== 'domain-lead' && userData.role !== 'admin')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Create task
    const taskData = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo,
      domain,
      priority: priority || 'medium',
      status: 'pending',
      createdBy: decodedToken.uid,
      createdByName: userData.name,
      createdAt: new Date()
    };

    const taskRef = await db.collection('tasks').add(taskData);

    // Get assignee details
    const assigneeDoc = await db.collection('users').doc(assignedTo).get();
    const assigneeData = assigneeDoc.data();

    if (assigneeData && assigneeData.email) {
      // Send email notification
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: assigneeData.email,
        subject: `New Task: ${title}`,
        html: `
          <h2>New Task Assigned</h2>
          <p><strong>Task:</strong> ${title}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Due Date:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}</p>
          <p><strong>Domain:</strong> ${domain}</p>
          <p>Please log in to your dashboard to view and work on this task.</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({ 
      message: 'Task created successfully', 
      taskId: taskRef.id 
    });

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}