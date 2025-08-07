# VyomSetu - Task Management System

A comprehensive task management system built with React, Firebase, and Tailwind CSS, designed for organizations with role-based access control.

## Features

### 🔐 Authentication & Authorization
- Firebase Authentication integration
- Role-based access control (Super Admin, Admin, Domain Lead, Member)
- Secure user management with domain-specific access

### 📋 Task Management
- Create, assign, and track tasks
- Real-time task status updates
- Priority levels (Low, Medium, High)
- Due date management
- Task filtering and search

### 👥 User Roles & Permissions

#### Super Admin
- Manage all users in the system
- Assign roles and domains
- View system-wide analytics
- Full administrative access

#### Admin
- Manage users within their scope
- View and manage tasks across domains
- System monitoring capabilities

#### Domain Lead
- Create and assign tasks to team members
- Review task submissions
- Manage tasks within their domain
- Monitor team performance

#### Member
- View assigned tasks
- Update task status
- Submit completed tasks with descriptions and attachments
- Track personal task progress

### 📊 Real-time Features
- Live task updates using Firebase Firestore
- Real-time notifications
- Instant status changes
- Collaborative task management

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Clean and intuitive interface
- Mobile-friendly layout
- Loading states and error handling

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Deployment**: Vercel
- **State Management**: React Context API
- **Routing**: React Router DOM

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_CONFIG={"apiKey":"your-api-key","authDomain":"your-domain","projectId":"your-project-id","storageBucket":"your-bucket","messagingSenderId":"your-sender-id","appId":"your-app-id"}
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Firebase Setup

1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up security rules for Firestore
5. Add your Firebase configuration to environment variables

### Firestore Collections

The application uses the following Firestore collections:

- **users**: User profiles and role information
- **tasks**: Task data and assignments
- **submissions**: Task submissions and reviews

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard component
│   ├── Login.jsx        # Authentication component
│   ├── Navbar.jsx       # Navigation component
│   ├── Spinner.jsx      # Loading spinner
│   ├── TaskCard.jsx     # Individual task display
│   ├── CreateTaskForm.jsx # Task creation form
│   ├── MemberTasks.jsx  # Member task view
│   ├── UserManagement.jsx # User management (Super Admin)
│   ├── SubmissionsView.jsx # Task submissions view
│   └── TaskSubmission.jsx # Task submission modal
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication context
├── lib/                 # Utility libraries
│   └── firebase.js      # Firebase configuration
├── hooks/               # Custom React hooks
└── assets/              # Static assets
```

## API Endpoints

The application uses Firebase Firestore for data management. Key operations include:

### Authentication
- User registration and login
- Role-based access control
- Session management

### Tasks
- Create new tasks
- Update task status
- Assign tasks to team members
- Delete tasks (Domain Leads only)

### Submissions
- Submit completed tasks
- Review submissions
- Approve/reject submissions

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Environment Variables

Required environment variables:
- `VITE_FIREBASE_CONFIG`: Firebase configuration object (JSON string)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Roadmap

- [ ] Email notifications
- [ ] File upload to cloud storage
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with external tools
- [ ] Advanced reporting features
