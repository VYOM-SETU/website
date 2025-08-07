import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

export const sendMail = async ({ to, subject, html, attachments }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Task Platform" <${process.env.GMAIL_USER}>`,
      to: to, // Can be a single email or a comma-separated string
      subject: subject,
      html: html,
      attachments: attachments, // Array of attachment objects
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email.");
  }
};