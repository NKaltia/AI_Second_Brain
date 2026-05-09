# AI Second Brain

An intelligent knowledge management system built with Node.js and PostgreSQL. It uses RAG (Retrieval-Augmented Generation) and semantic vector search to act as an extension of your own mind. 

## Key Capabilities
- **Semantic Retrieval (RAG):** Powered by `pgvector` and Google Gemini embeddings to find information based on context and meaning rather than keywords.
- **Dynamic Query Expansion:** Implements HyDE (Hypothetical Document Embeddings) logic to bridge the gap between user queries and stored knowledge.
- **Autonomous Note Capture:** An AI agent capable of identifying and saving critical insights from a conversation in real-time using Function Calling.
- **Secure Authentication:** Protected user access with JWT (JSON Web Tokens) and secure password hashing.
- **Modern UI:** Responsive, minimalist glassmorphism interface for focused knowledge work.

---

## Showcase

### Video Walkthrough


https://github.com/user-attachments/assets/51ce94e2-e0f7-4a91-935d-01f7b144f59e

*A demonstration of the AI Agent autonomously creating and retrieving notes during a natural dialogue.*

### Screenshot Gallery
| Main Dashboard | Note Editor |
|---|---|
| ![Main Dashboard](assets/main-dashboard.png) | ![Note Editor](assets/note-editor.png) |

---

## Tech Stack & Architecture

### Technologies
- **Backend:** Node.js, Express, TypeScript
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Glassmorphism)
- **Database:** Serverless PostgreSQL (Neon DB) with `pgvector` extension
- **ORM:** Prisma
- **AI Models:** Google Gemini 3.1 Flash Lite Preview (Generation) & Gemini Embedding 001 (Embeddings) via `@google/genai` SDK
- **Security:** JWT, bcryptjs

### Project Structure (Layered Architecture)
The application follows a standard layered architectural pattern to ensure separation of concerns:
- `Controllers` - Handle incoming HTTP requests and send responses.
- `Services` - Contain the core business logic (e.g., AI inference, Authentication, Note management).
- `Middleware` - Intercept requests for JWT validation and route protection.
- `Database (Prisma)` - Abstracted data access layer managing PostgreSQL interactions.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (with `pgvector` extension enabled) or a Neon DB instance
- Google Gemini API Key

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NegativeOne36/AI_Second_Brain.git
   cd AI_Second_Brain
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create a `.env` file in the root directory. You will need a secret key for JWT authentication and your database/AI credentials:
   ```env
   # Database Configuration (Neon DB or Local PostgreSQL)
   DATABASE_URL="your-postgresql-url"
   
   # AI Configuration
   GEMINI_API_KEY="your-gemini-api-key"
   
   # Security
   JWT_SECRET="your-secure-jwt-secret-key"
   PORT=3000
   ```

4. **Initialize database:**
   Synchronize your Prisma schema with the database:
   ```bash
   npx prisma db push
   ```

5. **Start developing:**
   Run the development server (uses `tsx` for TypeScript execution):
   ```bash
   npm run dev
   ```

---

## Deployment
The application is designed to be cloud-native:
- **Backend API & Static Files:** Deployed on **Render**.
- **Database:** Hosted on **Neon DB**, utilizing its serverless Postgres architecture with native support for `pgvector`.

---

## Contact
Developed by [Nikita Kaltia] – [https://github.com/NegativeOne36]
