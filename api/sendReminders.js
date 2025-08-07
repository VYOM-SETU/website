import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

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
    const now = new Date();
    
    // Get overdue tasks that haven't been reminded today
    const tasksQuery = await db.collection('tasks')
      .where('status', 'in', ['pending', 'in-progress'])
      .where('dueDate', '<', now)
      .where('reminded', '==', false)
      .get();

    const tasks = [];
    tasksQuery.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    let sentCount = 0;
    const errors = [];

    for (const task of tasks) {
      try {
        // Get assignee details
        const assigneeDoc = await db.collection('users').doc(task.assignedTo).get();
        const assigneeData = assigneeDoc.data();

        if (assigneeData && assigneeData.email) {
          // Send reminder email
          const mailOptions = {
            from: process.env.GMAIL_USER,
            to: assigneeData.email,
            subject: `Reminder: ${task.title} is overdue`,
            html: `
              <h2>Task Reminder</h2>
              <p><strong>Task:</strong> ${task.title}</p>
              <p><strong>Description:</strong> ${task.description}</p>
              <p><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
              <p><strong>Status:</strong> ${task.status}</p>
              <p><strong>Domain:</strong> ${task.domain}</p>
              <p>This task is overdue. Please complete it as soon as possible.</p>
              <p>Log in to your dashboard to update the task status.</p>
            `
          };

          await transporter.sendMail(mailOptions);
          sentCount++;

          // Mark task as reminded
          await db.collection('tasks').doc(task.id).update({
            reminded: true,
            lastReminderSent: now
          });
        }
      } catch (error) {
        console.error(`Error sending reminder for task ${task.id}:`, error);
        errors.push({ taskId: task.id, error: error.message });
      }
    }

    res.status(200).json({ 
      message: `Reminders sent successfully`,
      sentCount,
      totalTasks: tasks.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
