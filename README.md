<div align="center">
  <h1>YourShop - Agentic AI E-Commerce Platform</h1>
  <h3>🌐 <a href="https://yourshop-topaz.vercel.app/">Live Demo</a></h3>
  <p>A next-generation, production-ready Full Stack AI application featuring an advanced Agentic Chat Assistant, Smart Recommendations, and a robust e-commerce architecture.</p>
</div>

---

## 🌟 Overview

**YourShop** is a modern e-commerce platform built to demonstrate the powerful integration of Large Language Models (LLMs) into traditional web applications. This is not just a standard store—it features fully autonomous Agentic AI that can guide users, answer complex product queries, and provide intelligent, context-aware recommendations.

Built with performance, security, and exceptional user experience in mind, YourShop bridges the gap between traditional shopping and the AI-driven future.

---

## ✨ Core Features

### 🤖 Agentic AI Integration (Highlight)
- **AI Chat Assistant (Streaming):** Powered by Google's Gemini 3.5 Flash model, our intelligent chat assistant provides real-time, streaming responses. It understands product contexts, answers technical specifications, and guides users through their shopping journey autonomously.
- **Smart Recommendation Engine:** Analyzes user context and product metadata to suggest highly relevant items directly on the product details page, mimicking a personalized shopping concierge.

### 🛒 Complete E-Commerce Architecture
- **Dynamic Explore & Filtering:** A highly responsive Shop page with a 4-column desktop grid, featuring category and price filters, real-time search, and sorting capabilities.
- **Polished UI/UX:** Built with a strict maximum 3-color palette, consistent layouts, micro-animations, and glassmorphism elements to provide a premium, modern feel.
- **Skeleton Loaders:** Smooth, asynchronous data fetching utilizing Suspense boundaries and skeleton loaders to eliminate jarring visual jumps.
- **Robust Administration:** A fully functional Admin Dashboard built with Tailwind and Recharts to manage products, view orders, and track customers seamlessly.

### 🔐 Security & Authentication
- **Multi-Provider Authentication:** Secure user management utilizing Better Auth, supporting both robust Email/Password workflows and Google OAuth integration.
- **Protected Routes:** Strong server-side session validation protecting administrative tools, user profiles, and checkout functionality.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Modern, Dark Theme)
- **Animations:** Framer Motion
- **Icons & Visuals:** Lucide React, Recharts (Admin Visualizations)

**Backend (Server)**
- **Runtime & Framework:** Node.js, Express.js
- **Database:** MongoDB (via native driver & Better Auth adapters)
- **Authentication:** Better Auth (Email/Pass & Google OAuth)
- **AI Integration:** Google Generative AI SDK (Gemini)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (Atlas recommended)
- Google AI Studio API Key (for Gemini)
- Google Cloud Console OAuth Credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/yourshop.git
   cd yourshop
   ```

2. **Set up the Backend Server:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI="your_mongodb_connection_string"
   MONGODB_DB="yourshop"
   GEMINI_API_KEY="your_gemini_api_key"
   BETTER_AUTH_URL="http://localhost:3000"
   BETTER_AUTH_SECRET="a_very_strong_random_secret"
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Set up the Frontend Client:**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env.local` file in the `client` directory:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   MONGODB_URI="your_mongodb_connection_string"
   MONGODB_DB="yourshop"
   BETTER_AUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your_google_oauth_client_id"
   GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
   ```
   Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. **Experience the AI:**
   Navigate to `http://localhost:3000` and click on the chat bubble in the bottom right to interact with the Agentic AI Assistant!

---

## 🔮 Future Improvements (V2 Roadmap)
- **Dynamic Multiple Images:** Implementing a multi-image upload pipeline for products via the Admin dashboard to replace static UI fallbacks.
- **AI Semantic Search:** Upgrading the standard keyword search to a vector-embedding natural language search.
- **Payment Gateway Integration:** Connecting Stripe for real-world transaction processing.
- **Order Tracking:** Real-time webhooks for delivery tracking and logistics.

---

