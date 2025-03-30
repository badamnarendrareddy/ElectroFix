🔗 Live Demo
🌐 GitHub Pages: https://badamnarendrareddy.github.io/ElectroFix/

📹 Demo Video (Instructions)
Record a short Loom video showing: https://www.flexclip.com/share/10076496565316a1088ca702a117f7c64679735e.html




ElectroFix ⚡🔧
One-stop platform for buying electrical appliances and booking repair services.

📌 Problem Statement
Finding reliable electricians and quality electrical appliances is often time-consuming and frustrating. Customers face:

Difficulty locating trustworthy service providers

Lack of transparency in pricing and service quality

Limited options for purchasing genuine electrical products

ElectroFix solves this by:
✅ Connecting customers with verified electricians
✅ Offering a seamless e-commerce experience for electrical appliances
✅ Providing real-time tracking for service requests

👥 Team Members
Badam Narendra Reddy (Full-stack Developer)

[Add other team members if applicable]

💡 Solution Overview
ElectroFix is a MERN stack (MongoDB, Express, React, Node.js) web application with:

E-commerce store for electrical appliances

Service booking system for repairs & maintenance

Electrician onboarding for service providers

User authentication (Firebase Auth)

Payment integration (Razorpay/Stripe)

🛠️ Tech Stack
Frontend: React.js, React Three Fiber (3D models), Framer Motion (animations)

Backend: Node.js, Express, Firebase (Auth)

Database: MongoDB

Deployment: GitHub Pages (Frontend), Render/Heroku (Backend)

🚀 Setup & Installation
Prerequisites
Node.js (v18+)

MongoDB Atlas (or local DB)

Firebase project (for authentication)

1. Clone the Repository
bash
Copy
git clone https://github.com/badamnarendrareddy/ElectroFix.git
cd ElectroFix
2. Install Dependencies
bash
Copy
npm install
3. Set Up Environment Variables
Create a .env file in the root directory:

env
Copy
REACT_APP_FIREBASE_API_KEY=your_firebase_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_BACKEND_API=http://localhost:5000 (or deployed backend)
4. Run the Development Server
bash
Copy
npm start
Open http://localhost:3000 in your browser.

5. Deploy to GitHub Pages
bash
Copy
npm run deploy
(Ensure homepage in package.json is set to https://yourusername.github.io/ElectroFix/)

📂 Project Structure
Copy
ElectroFix/
├── public/          # Static files (index.html, 404.html)
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Main pages (Home, Shop, Services)
│   ├── firebase/    # Auth configuration
│   ├── App.js       # Main App Router
│   └── index.js     # React entry point
├── package.json
└── README.md


Setup (Cloning, npm install, .env setup)

Running locally (npm start)

Key features:

User signup/login

Browsing products

Booking a repair service

Deployment (npm run deploy)

📜 License
MIT © 2024 Badam Narendra Reddy

🎯 Future Enhancements
Mobile app (React Native)

AI-powered recommendations for products/services

Subscription plans for electricians

This README.md ensures:
✔️ Clear problem statement
✔️ Team member credits
✔️ Step-by-step setup instructions
✔️ Demo video guidance
