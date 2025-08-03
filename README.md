# MediCare-2 🏥

MediCare-2 is a comprehensive healthcare platform designed to seamlessly connect doctors and patients through advanced appointment scheduling, real-time consultations, secure payments, and AI-powered health assistance. Built with modern web technologies, it provides a robust foundation for healthcare accessibility and communication.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Real-time Features](#real-time-features)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

### 🔐 Authentication & Authorization
- **Role-based access control** with Clerk authentication (Patient, Doctor, Admin)
- **Secure user management** with email verification and profile management
- **Doctor verification system** with credential upload and approval workflow

### 👨‍⚕️ Doctor Features
- **Professional profiles** with specialty, experience, and credentials
- **Availability management** for appointment scheduling
- **Patient consultation** through video calls and chat
- **Earnings tracking** and payout management

### 👤 Patient Features
- **Doctor discovery** by specialty and availability
- **Credit-based appointment booking** with flexible subscription plans
- **Real-time consultations** via video calls and messaging
- **Health assistant chatbot** powered by AI

### 💬 Real-time Communication
- **WebRTC video calling** with camera, microphone, and screen sharing
- **Socket.IO chat system** supporting text messages and file sharing
- **Appointment-based communication** with secure room management

### 🤖 AI Integration
- **Health Assistant Chatbot** using MedAlpaca-7B model via Hugging Face API
- **Medical conversation context** with appropriate safety disclaimers
- **Quick health questions** and symptom guidance

### 💳 Payment & Credits
- **Credit-based system** for appointment bookings
- **Subscription plans** with automatic credit allocation
- **Secure payment processing** integration ready

### 📧 Communication
- **Email notifications** for appointments and system updates
- **Real-time notifications** for chat messages and calls

## Tech Stack

### Frontend
- **Next.js 15.3.3** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Robust relational database
- **Next.js API Routes** - Serverless API endpoints

### Authentication & Security
- **Clerk** - Complete authentication solution
- **JWT tokens** - Secure session management
- **Role-based permissions** - Fine-grained access control

### Real-time Communication
- **Socket.IO** - Real-time bidirectional communication
- **WebRTC** - Peer-to-peer video calling
- **Custom signaling server** - WebRTC connection management

### AI & External Services
- **Hugging Face API** - AI model integration
- **MedAlpaca-7B** - Medical conversation AI
- **Nodemailer** - Email service integration

### Development Tools
- **ESLint** - Code linting and formatting
- **Locomotive Scroll** - Smooth scrolling animations
- **React Hook Form** - Form state management
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Clerk** account for authentication
- **Hugging Face** account for AI chatbot

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/medicare2"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/onboarding"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# AI Chatbot
HUGGINGFACE_API_KEY="your_huggingface_api_key"

# Email Service
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_specific_password"

# Real-time Servers
NEXT_PUBLIC_CHAT_SERVER_URL="http://localhost:3002"
NEXT_PUBLIC_SIGNALING_SERVER_URL="http://localhost:3001"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MediCare-2/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development servers**
   ```bash
   # Main Next.js application
   npm run dev
   
   # In separate terminals:
   # Chat server
   npm run chat
   
   # Signaling server for video calls
   npm run signaling
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Patients
1. **Sign up** and complete the onboarding process
2. **Browse doctors** by specialty and availability
3. **Purchase credits** or subscribe to a plan
4. **Book appointments** with available doctors
5. **Join video calls** and chat with doctors
6. **Use the AI health assistant** for quick health questions

### For Doctors
1. **Sign up** and complete professional verification
2. **Set up your profile** with credentials and specialties
3. **Manage availability** and appointment slots
4. **Conduct consultations** via video calls and chat
5. **Track earnings** and manage payouts

### For Administrators
1. **Access admin dashboard** for user management
2. **Verify doctor credentials** and approve registrations
3. **Monitor platform activity** and resolve issues
4. **Manage system settings** and configurations

## Folder Structure

```
my-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── doctor/        # Doctor dashboard
│   │   ├── appointments/  # Appointment management
│   │   └── onboarding/    # User onboarding
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── chatbot-modal.tsx # AI chatbot interface
│   ├── video-call-modal.tsx # Video calling interface
│   └── header.tsx        # Navigation header
├── actions/              # Server actions
├── lib/                  # Utility functions
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── chat-server.js       # Socket.IO chat server
├── signaling-server.js  # WebRTC signaling server
└── package.json         # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify user credentials
- `GET /api/auth/user` - Get current user information

### Appointments
- `GET /api/appointments` - List user appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Doctors
- `GET /api/doctors` - List available doctors
- `GET /api/doctors/:id` - Get doctor details
- `POST /api/doctors/verify` - Submit verification documents

### Credits & Payments
- `GET /api/credits` - Get user credit balance
- `POST /api/credits/purchase` - Purchase credits
- `GET /api/subscriptions` - Get subscription plans

### Chat & Communication
- `GET /api/chat/:appointmentId` - Get chat history
- `POST /api/chat/send` - Send chat message

## Real-time Features

### Chat System (Socket.IO)
- **Room-based messaging** tied to appointments
- **File sharing** and media support
- **Real-time notifications** for new messages
- **Connection status** tracking

### Video Calling (WebRTC)
- **Peer-to-peer connections** for high-quality calls
- **Camera and microphone controls**
- **Screen sharing capabilities**
- **Call state management** and reconnection

## Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow **TypeScript** best practices
- Use **Prettier** for code formatting
- Write **meaningful commit messages**
- Add **tests** for new features
- Update **documentation** as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Next.js Team** for the amazing React framework
- **Clerk** for seamless authentication
- **Prisma** for type-safe database access
- **Hugging Face** for AI model hosting
- **Radix UI** for accessible components
- **Socket.IO** for real-time communication
- **WebRTC** for peer-to-peer video calling

---

**Built with ❤️ for better healthcare accessibility**

For support or questions, please open an issue in the repository or contact the development team.
