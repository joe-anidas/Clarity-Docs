# 📄 ClarityDocs: AI-Powered Document Simplification & Legal Consultation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Google AI](https://img.shields.io/badge/Google%20AI-Gemini%202.5%20Flash-blue?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Genkit](https://img.shields.io/badge/Genkit-1.14-4285F4?style=flat&logo=google)](https://firebase.google.com/docs/genkit)

> **Transform complex documents into crystal-clear insights with AI-powered analysis, and connect with verified lawyers for professional consultation**

ClarityDocs is an intelligent document analysis and legal consultation platform that uses advanced AI (Google Gemini 2.5 Flash) to break down complex legal documents, contracts, and agreements into simple, actionable insights. Get risk assessments, interactive timelines, negotiation suggestions, plain-language explanations, and connect with verified lawyers for video consultations—all in one platform.

## ✨ Key Features

### 🤖 **AI-Powered Document Analysis** (Gemini 2.5 Flash)
- **Smart Summarization**: Generates structured summaries with key points, Do's, and Don'ts
- **Risk Assessment**: Calculate risk scores (0-100) with detailed positive/negative breakdowns
- **Tone Analysis**: Identifies friendly, neutral, or strict language patterns in clauses
- **Document Type Detection**: Optimized analysis for rentals, loans, employment contracts, terms of service

### 📊 **Interactive Insights**
- **Timeline Extraction**: Automatically identifies and visualizes key dates, deadlines, and milestones  
- **Scenario Analysis**: Interactive "What-if" chat to explore document implications
- **Term Definitions**: Click any highlighted term for instant plain-language explanations
- **Real-world Examples**: "In Simple Terms" explanations with practical scenarios

### 🔍 **Smart Document Processing**
- **Multi-format Support**: Upload PDFs, images (JPG, PNG) with OCR extraction via Google Document AI
- **Text Input**: Paste document content directly for instant analysis
- **🔒 Privacy Protection**: Automatic sensitive data masking before processing and storage
- **Document History**: Access all previously analyzed documents with timestamps

### 💬 **Negotiation Intelligence**
- **Negotiation Suggestions**: AI-generated talking points for unfavorable clauses
- **Real-world Examples**: "In Simple Terms" explanations with practical scenarios
- **Multi-language Support**: Interface and translations in English and Hindi (extensible to Tamil, Telugu, Malayalam)

### ⚖️ **Lawyer Consultation & Marketplace**
- **Verified Lawyer Network**: Browse and connect with verified legal professionals
- **Advanced Search & Filtering**: Find lawyers by specialization, location, rating, and hourly rate
- **Lawyer Profiles**: View qualifications, experience, specializations, ratings, and availability
- **Video Consultations**: Schedule and conduct Google Meet consultations directly in the app
- **Integrated Scheduling**: Book appointments via Google Calendar integration
- **Real-time Chat**: Message lawyers directly about your legal questions with attachment support
- **Consultation Requests**: Submit detailed requests with document attachments
- **Lawyer Dashboard**: Legal professionals can:
  - Manage consultations and client requests
  - Set availability and specializations
  - Update hourly rates and profile information
  - Track consultation history and earnings
  - Respond to client messages in real-time
- **Admin Verification Portal**: Administrators can verify lawyer credentials and manage profiles

### � **Secure & User-Friendly**
- **Firebase Authentication**: Secure user accounts with Email/Password and Google OAuth
- **Role-Based Access Control**: Three user roles (User, Lawyer, Admin) with appropriate permissions
- **Cloud Storage**: Documents securely stored in Firestore with user-level permissions
- **Privacy-First**: Only you can access your documents - full data isolation
- **🛡️ Data Masking**: Automatic detection and masking of sensitive information
  - Personal names, addresses, phone numbers
  - Financial details, ID numbers (Aadhar, PAN, Passport)
  - Land details, email addresses, dates of birth
- **Masked Storage**: All documents stored with masked sensitive data for maximum privacy
- **Responsive Design**: Beautiful, mobile-friendly interface with dark/light theme support
- **Internationalization**: Built-in i18next support for multi-language content

## ⚡ Performance Optimizations

ClarityDocs is built with performance in mind, featuring:

### 🚀 **Frontend Optimizations**
- **React.memo**: Memoized components to prevent unnecessary re-renders
- **useMemo & useCallback**: Optimized expensive computations and callbacks
- **Next.js 15.3 with Turbopack**: Ultra-fast development builds and hot module replacement
- **Next.js Image Optimization**: Automatic image compression, lazy loading, and modern format support (WebP/AVIF)
- **Code Splitting**: Dynamic imports for heavy components and routes
- **Component Memoization**: Feature cards and UI elements are memoized for better performance

### 🗄️ **Data & Caching**
- **In-Memory Caching**: 5-minute cache for document history queries to reduce Firestore reads
- **Smart Cache Invalidation**: Automatic cache updates on data changes
- **Optimized Firebase Queries**: Limited queries with proper indexing via `firestore.indexes.json`
- **Lazy Loading**: Components and data loaded on-demand
- **Firestore Indexes**: Optimized for:
  - Document history queries (userId + uploadedAt)
  - Consultation requests (userId, lawyerId, status + createdAt)
  - Real-time chat messages (sessionId + createdAt)
  - Lawyer profile searches

### 🌐 **Network Optimizations**
- **DNS Prefetching**: Pre-resolve Firebase, Google Cloud, and googleapis.com domains
- **Resource Preloading**: Critical fonts and assets preloaded
- **Compression**: Gzip/Brotli compression enabled for all assets
- **HTTP Headers**: Optimized security and caching headers
- **Firebase App Hosting**: CDN-enabled hosting for global content delivery

### 📊 **Performance Monitoring**
- **Web Vitals Tracking**: Monitors LCP (Largest Contentful Paint), FID (First Input Delay), and CLS (Cumulative Layout Shift) metrics
- **Performance Observer API**: Real-time performance monitoring in production
- **Console Logging**: Development-time performance insights
- **Custom PerformanceMonitor Component**: Automated tracking of Core Web Vitals

### 🎨 **UI/UX Optimizations**
- **Skeleton Loading**: Smooth loading states for better perceived performance
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Optimized Animations**: GPU-accelerated transitions and hover effects
- **Responsive Images**: Multiple size variants for different screen sizes

## 🛡️ Privacy & Data Protection

ClarityDocs implements **automatic sensitive data masking** to protect your privacy:

### How It Works
1. **Upload/Paste Document** → Document text is extracted
2. **AI-Powered Detection** → Gemini AI identifies all sensitive information
3. **Automatic Masking** → Sensitive data is replaced with placeholders (e.g., `[PERSON_NAME_1]`, `[ADDRESS_1]`)
4. **Secure Processing** → All analysis happens on masked content
5. **Privacy-First Storage** → Only masked content is saved to the database

### What Gets Masked
- 👤 **Personal Names**: John Smith → `[PERSON_NAME_1]`
- 🏢 **Organizations**: Acme Corp → `[ORGANIZATION_1]`
- 📍 **Addresses**: 123 Main St → `[ADDRESS_1]`
- 🏞️ **Land Details**: Survey No. 45/2A → `[LAND_DETAIL_1]`
- 📞 **Phone Numbers**: +1-234-567-8900 → `[PHONE_NUMBER_1]`
- 📧 **Emails**: user@example.com → `[EMAIL_1]`
- 🪪 **ID Numbers**: Aadhar, PAN, Passport → `[ID_NUMBER_1]`
- 💳 **Financial Data**: Account numbers, amounts → `[ACCOUNT_NUMBER_1]`
- 🎂 **Dates of Birth**: 01/01/1990 → `[DOB_1]`

### Privacy Guarantees
✅ Original sensitive data is **never stored** in the database  
✅ Masking happens **before** any AI processing  
✅ All document views show **only masked content**  
✅ Document history contains **only masked versions**  
✅ Summary, risk analysis, and all features use **masked data**

## 🎯 Perfect For

### 👥 **For Users:**
- **Renters**: Understanding lease agreements and rental contracts with risk assessment
- **Employees**: Reviewing employment contracts and workplace policies  
- **Small Businesses**: Analyzing supplier agreements, service contracts, and partnerships
- **Consumers**: Decoding terms of service, privacy policies, and user agreements
- **Students**: Learning from legal document structures and language
- **Anyone**: Seeking to understand complex legal documents or needing legal consultation

### ⚖️ **For Lawyers:**
- **Expand Client Base**: Reach users who need legal consultation through the marketplace
- **Virtual Consultations**: Conduct video meetings via integrated Google Meet
- **Efficient Scheduling**: Manage appointments through Google Calendar sync
- **Document Review**: Access client documents for consultation preparation
- **Flexible Practice**: Set your own rates, availability, and specializations
- **Verified Profile**: Build trust with verified credentials and user ratings
- **Lawyer Dashboard**: Comprehensive dashboard to:
  - Manage consultation requests and client communications
  - View and respond to real-time chat messages
  - Track consultation history and manage calendar
  - Update profile, rates, and availability
  - Monitor performance and client satisfaction

### 🛡️ **For Administrators:**
- **Lawyer Verification**: Review and verify lawyer credentials and profiles
- **User Management**: Monitor user activity and manage user roles (User → Lawyer → Admin)
- **System Administration**: Access admin dashboard with full system controls
- **Analytics**: View usage statistics and system health (via Firebase Analytics)
- **Content Moderation**: Ensure platform quality and safety

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Google Cloud Account** with enabled APIs:
  - **Gemini API** (Generative AI - for document analysis and text generation)
  - **Document AI API** (OCR & text extraction from PDFs and images)
  - **Translation API** (Multi-language support via Google Translate)
  - **Google Meet API** (Video consultations)
  - **Google Calendar API** (Appointment scheduling)
- **Firebase Project** with the following services:
  - **Authentication** (Email/Password & Google OAuth providers)
  - **Firestore Database** (NoSQL document storage for user data, documents, consultations)
  - **Cloud Storage** (File uploads for documents and chat attachments)
  - **Hosting/App Hosting** (Optional for production deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joe-anidas/ClarityDocs.git
   cd ClarityDocs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

   ```env
   # ========================================
   # Firebase Configuration (Public - Client-side)
   # ========================================
   # These are safe to expose in the browser
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

   # ========================================
   # Google AI & Cloud Services (Server-side)
   # ========================================
   # Keep these secret! Never commit to Git
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key

   # Google Cloud / Document AI
   GCLOUD_PROJECT=your_project_id
   DOCAI_PROCESSOR_ID=your_document_ai_processor_id
   DOCAI_LOCATION=us

   # Service account credentials (used by server-side code)
   GOOGLE_CLOUD_CLIENT_EMAIL=your_service_account_email@your-project.iam.gserviceaccount.com

   # Private key (preserve newlines with \\n)
   GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"

   # ========================================
   # Google Meet & Calendar Integration
   # ========================================
   # For lawyer consultation scheduling and video calls
   GOOGLE_MEET_CLIENT_ID=your_google_meet_client_id
   GOOGLE_MEET_CLIENT_SECRET=your_google_meet_client_secret
   GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
   ```

4. **Start Development Servers**
   
   **Terminal 1: Next.js Frontend**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:9002` with Turbopack for fast hot reloading.
   
   **Terminal 2: Genkit AI Server** (Required for AI features)
   ```bash
   npm run genkit:dev
   ```
   The Genkit UI will be available at `http://localhost:4000` for testing AI flows.

5. **Access the Application**
   - Frontend: `http://localhost:9002`
   - Genkit UI: `http://localhost:4000` (for testing AI flows)
   
   **Note**: The Genkit server must be running for document analysis features to work. The frontend will make API calls to the Genkit server for AI processing.

## 🔧 Environment Variables Setup

### Required Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| **Firebase Configuration (Public - Client-side)** |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | Firebase Console → Project Settings → Web App |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Firebase Console → Project Settings (format: `project-id.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Firebase Console → Project Settings → Web App |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics Measurement ID (optional) | Firebase Console → Project Settings |
| **Google AI & Cloud Services (Server-side - Keep Secret!)** |
| `GEMINI_API_KEY` | Google Gemini API Key | Google AI Studio → API Keys |
| `GOOGLE_CLOUD_API_KEY` | Google Cloud API Key | Google Cloud Console → APIs & Services → Credentials |
| `GCLOUD_PROJECT` | Google Cloud Project ID | Google Cloud Console → Project Info |
| `DOCAI_PROCESSOR_ID` | Document AI Processor ID | Google Cloud Console → Document AI |
| `DOCAI_LOCATION` | Document AI Location | Usually `us` or `eu` |
| `GOOGLE_CLOUD_CLIENT_EMAIL` | Service Account Email | Google Cloud Console → IAM → Service Accounts |
| `GOOGLE_CLOUD_PRIVATE_KEY` | Service Account Private Key | Service Account JSON file |
| **Google Meet & Calendar APIs (For Lawyer Consultations)** |
| `GOOGLE_MEET_CLIENT_ID` | OAuth Client ID for Meet | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_MEET_CLIENT_SECRET` | OAuth Client Secret | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CALENDAR_API_KEY` | Calendar API Key | Google Cloud Console → APIs & Services → Credentials |

### Setting Up Google Cloud Services

1. **Create Google Cloud Project**
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable documentai.googleapis.com
   gcloud services enable translate.googleapis.com
   gcloud services enable calendar-json.googleapis.com
   gcloud services enable meet.googleapis.com
   ```

3. **Create Service Account**
   ```bash
   gcloud iam service-accounts create clarity-docs \
     --display-name="ClarityDocs Service Account"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:clarity-docs@your-project-id.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:clarity-docs@your-project-id.iam.gserviceaccount.com" \
     --role="roles/documentai.apiUser"
   ```

4. **Create Document AI Processor**
   - Go to Google Cloud Console → Document AI
   - Create a new processor (type: "Document OCR")
   - Note the Processor ID and Location

### Setting Up Firebase

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project or use existing Google Cloud project

2. **Enable Firebase Services**
   
   **Authentication**
   - Enable Email/Password provider
   - Enable **Google OAuth provider** (recommended for seamless login)
   - Configure authorized domains
   
   **Firestore Database**
   - Create Firestore database in production mode
   - Set up security rules for user data isolation
   - Deploy indexes: `firebase deploy --only firestore:indexes`
   - The `firestore.indexes.json` file contains optimized indexes for:
     - Document history queries (userId + uploadedAt)
     - Consultation requests (userId, lawyerId, status + createdAt)
     - Real-time chat messages (sessionId + createdAt)
   
   **Cloud Storage**
   - Enable Firebase Storage for file uploads
   - Configure CORS settings for web access
   - Set up security rules for user-specific storage
   
   **Firebase Hosting** (Optional for deployment)
   - Initialize hosting for production deployment

3. **Configure Google OAuth** (Recommended)
   
   **Step A: Enable Google Provider in Firebase**
   - In Firebase Console → Authentication → Sign-in method
   - Enable "Google" provider (toggle it ON)
   - Add authorized domains (e.g., `localhost`, your production domain)
   - Note: Firebase will auto-create an OAuth client or you can select an existing one

   **Step B: Configure Google Cloud Console OAuth**
   
   ⚠️ **Critical for OAuth to work**: You MUST configure redirect URIs in Google Cloud Console
   
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select your project
   - Navigate to **APIs & Services** → **Credentials**
   - Find the OAuth 2.0 Client ID (type: Web application)
   - Click the edit icon (✏️)
   - Add **Authorized redirect URIs** (EXACT format required):
     ```
     https://your-project-id.firebaseapp.com/__/auth/handler
     http://localhost:9002/__/auth/handler
     ```
   - Add **Authorized JavaScript origins**:
     ```
     https://your-project-id.firebaseapp.com
     http://localhost:9002
     ```
   - Click **SAVE** and wait 5-10 minutes for changes to propagate
   
   **Common Errors:**
   - `redirect_uri_mismatch` → Check that redirect URI matches EXACTLY (including `/__/auth/handler`)
   - `Access blocked: invalid request` → OAuth client not configured or disabled
   - `auth/unauthorized-domain` → Add domain to Firebase authorized domains

4. **Configure Google Meet & Calendar APIs** (For Lawyer Consultations)
   
   - In Google Cloud Console → APIs & Services → Credentials
   - Create or use existing OAuth 2.0 Client ID
   - Add the following scopes to your OAuth consent screen:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/meetings.space.created`
   - Note the Client ID and Client Secret for your `.env` file
   - See `GOOGLE_MEET_SETUP.md` for detailed configuration steps

5. **Get Firebase Config**
   - Project Settings → General → Your apps
   - Add web app and copy the config values
   - All Firebase config values should go into your `.env` file (see Environment Setup above)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15.3.3 (App Router with Turbopack), React 18.3.1, TypeScript 5
- **Styling**: Tailwind CSS 3.4, shadcn/ui components (Radix UI primitives)
- **AI/ML**: 
  - **Google Gemini 2.5 Flash API** (Primary AI model for analysis)
  - **Genkit 1.14** (AI orchestration and flow management)
  - **Google Document AI** (OCR for PDF and image text extraction)
- **Backend Services**: 
  - **Firebase Authentication**: User management with Email/Password & Google OAuth
  - **Cloud Firestore**: NoSQL database for documents, user data, lawyer profiles, consultations
  - **Firebase Storage**: Secure file storage for document uploads and chat attachments
  - **Firebase Hosting**: Production deployment and CDN
  - **Firebase App Hosting**: Serverless backend hosting (apphosting.yaml)
- **Google Cloud APIs**: 
  - **Document AI**: OCR and text extraction from PDFs/images
  - **Translation API**: Multi-language support (i18next integration)
  - **Google Meet API**: Video consultation scheduling
  - **Google Calendar API**: Appointment management
- **State Management**: React Context API + Hooks (AppStateProvider)
- **Form Handling**: React Hook Form 7.54 + Zod 3.24 validation
- **PDF Processing**: pdfjs-dist 4.5 for client-side PDF rendering
- **Internationalization**: i18next 25.6 with react-i18next and browser language detection
- **Charts & Visualization**: Recharts 2.15 for risk score visualization
- **UI Components**: Comprehensive shadcn/ui library including:
  - Forms, dialogs, dropdowns, tooltips
  - Cards, badges, buttons, avatars
  - Data tables, calendars, date pickers
  - Progress bars, sliders, tabs, accordions

### System Architecture

```
┌──────────────────┐     ┌───────────────────────┐     ┌──────────────────────────┐
│  User Browser    │────▶│  Next.js Frontend     │────▶│  AI & Cloud Services     │
│  (Port 9002)     │     │  (React + TypeScript) │     │  (Google Cloud)          │
└──────────────────┘     └───────────────────────┘     └──────────────────────────┘
                                   │                               │
                                   ▼                               ▼
                          ┌──────────────────┐         ┌─────────────────────────┐
                          │  Firebase Stack  │         │  Genkit AI Flows        │
                          │  ─────────────── │         │  (Port 4000)            │
                          │  • Auth          │         └─────────────────────────┘
                          │  • Firestore     │                    │
                          │  • Storage       │         ┌──────────┼──────────────────┐
                          │  • Hosting       │         ▼          ▼          ▼       ▼
                          └──────────────────┘   ┌─────────┐┌────────┐┌──────┐┌─────────┐
                                                  │ Gemini  ││ DocAI  ││ Meet ││Calendar │
                                                  │ 2.5     ││  API   ││ API  ││   API   │
                                                  │ Flash   ││        ││      ││         │
                                                  └─────────┘└────────┘└──────┘└─────────┘
```

### Lawyer Consultation Flow

```
User → Browse Lawyers (Filter by specialization, location, rate, rating)
              ↓
      Select Lawyer Profile (View credentials, reviews, availability)
              ↓
      Submit Consultation Request (Attach documents, describe issue)
              ↓
      Lawyer Reviews Request (Dashboard notification)
              ↓
      Schedule via Google Calendar (Lawyer sets appointment)
              ↓
      Generate Google Meet Link (Automatic video conferencing)
              ↓
      Video Consultation Session (Face-to-face legal consultation)
              ↓
      Real-time Chat & Document Sharing (Before/during/after consultation)
              ↓
      Leave Review & Rating (User provides feedback)
```

### Document Processing Pipeline

```
1. User Upload (PDF/Image/Text)
        ↓
2. Extract Text 
   - PDF: pdfjs-dist (client-side)
   - Images: Google Document AI OCR
   - Text: Direct input
        ↓
3. 🛡️ MASK SENSITIVE DATA
   - Gemini AI identifies sensitive info
   - Replace with placeholders ([PERSON_NAME_1], [ADDRESS_1], etc.)
        ↓
4. AI Analysis (Parallel Processing)
   - Generate Summary (key points, do's/don'ts)
   - Calculate Risk Score (0-100 with breakdown)
   - Extract Timeline (dates, deadlines, milestones)
   - Identify Terms (legal jargon for lookup)
        ↓
5. Store Masked Content (Firestore)
   - Only masked data is saved
   - Original sensitive info never stored
        ↓
6. Display to User
   - Interactive summary view
   - Click terms for definitions
   - "What-if" scenario analysis
   - Negotiation suggestions
```

### Component Flow

```
┌─────────────────────┐
│  Document Upload    │ (Upload PDF/Image/Text)
│  Component          │
└─────────┬───────────┘
          ↓
┌─────────────────────┐
│  Server Actions     │ (lib/actions.ts)
│  - processDocument  │
│  - uploadDocument   │
└─────────┬───────────┘
          ↓
┌─────────────────────┐
│  Genkit AI Flows    │ (src/ai/flows/)
│  1. mask-sensitive  │ 🛡️ Privacy first
│  2. summary         │
│  3. risk-score      │
│  4. timeline        │
│  5. terms-lookup    │
└─────────┬───────────┘
          ↓
┌─────────────────────┐
│  Gemini 2.5 Flash   │ (AI Processing)
│  API Calls          │
└─────────┬───────────┘
          ↓
┌─────────────────────┐
│  Firestore Storage  │ (Masked data only)
│  + User History     │
└─────────┬───────────┘
          ↓
┌─────────────────────┐
│  Summary View       │ (Interactive UI)
│  - Interactive Text │ - Click term definitions
│  - Risk Score Chart│ - Timeline visualization
│  - What-if Chat    │ - Negotiation suggestions
└─────────────────────┘
```

## 📁 Project Structure

```
clarity-docs/
├── src/
│   ├── app/                          # Next.js App Router (Pages & Layouts)
│   │   ├── page.tsx                  # Landing page with features showcase
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── globals.css               # Global styles and Tailwind directives
│   │   ├── clarity/                  # 📄 Document Analysis Feature
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Document upload interface
│   │   │   └── summary/
│   │   │       └── page.tsx          # Analysis results & interactive summary
│   │   ├── lawyers/                  # ⚖️ Lawyer Marketplace
│   │   │   └── page.tsx              # Browse & search verified lawyers
│   │   ├── consultation/             # 📋 Consultation Requests
│   │   │   └── page.tsx              # Submit/manage consultation requests
│   │   ├── chat/                     # 💬 Real-time Messaging
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx          # Chat interface with attachments
│   │   ├── dashboard/                # 🏠 Role-based Dashboards
│   │   │   ├── user/                 # User dashboard (document history, consultations)
│   │   │   │   └── page.tsx
│   │   │   ├── lawyer/               # Lawyer dashboard (clients, schedule, earnings)
│   │   │   │   └── page.tsx
│   │   │   └── admin/                # Admin dashboard (verification, users, analytics)
│   │   │       └── page.tsx
│   │   ├── lawyer-verification/      # 🔍 Lawyer Verification Portal (Admin only)
│   │   │   └── page.tsx
│   │   ├── sign-in/                  # 🔐 Authentication
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   └── settings/                 # ⚙️ User Settings
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── auth/                     # Authentication Components
│   │   │   ├── auth-provider.tsx    # Firebase Auth context provider
│   │   │   └── role-selection-dialog.tsx # User role selection on signup
│   │   ├── clarity-docs/             # Document Analysis Components
│   │   │   ├── document-upload.tsx   # File upload & text input
│   │   │   ├── document-history.tsx  # Past document history list
│   │   │   ├── summary-view.tsx      # Main summary display
│   │   │   ├── interactive-text.tsx  # Clickable text with term highlighting
│   │   │   ├── term-lookup-popover.tsx # Term definition popover
│   │   │   └── summary-skeleton.tsx  # Loading skeleton
│   │   ├── lawyer/                   # Lawyer Feature Components
│   │   │   ├── lawyer-card.tsx       # Individual lawyer profile card
│   │   │   ├── lawyer-list.tsx       # Lawyer listing with filters
│   │   │   ├── consultation-request-form.tsx # Request form
│   │   │   └── chat-interface.tsx    # Real-time chat component
│   │   ├── layout/                   # Layout Components
│   │   │   ├── header.tsx            # Main site header
│   │   │   ├── app-header.tsx        # Authenticated app header
│   │   │   ├── footer.tsx            # Site footer
│   │   │   ├── hero-actions.tsx      # CTA buttons
│   │   │   ├── get-started-button.tsx
│   │   │   └── language-switcher.tsx # i18n language selector
│   │   ├── ui/                       # shadcn/ui Components (40+ components)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (30+ more)
│   │   ├── i18n-provider.tsx         # Internationalization provider
│   │   └── performance-monitor.tsx   # Web Vitals tracking
│   │
│   ├── ai/                           # AI Orchestration Layer (Genkit)
│   │   ├── genkit.ts                 # Genkit configuration (Gemini 2.5 Flash)
│   │   ├── dev.ts                    # Genkit dev server (port 4000)
│   │   └── flows/                    # AI Flow Definitions
│   │       ├── mask-sensitive-data.ts           # 🛡️ Privacy protection
│   │       ├── generate-plain-language-summary.ts # Document summarization
│   │       ├── generate-risk-score.ts           # Risk analysis (0-100)
│   │       ├── generate-contract-timeline.ts    # Date/deadline extraction
│   │       ├── answer-what-if-question.ts       # Interactive Q&A
│   │       ├── lookup-term-definitions.ts       # Legal term explanations
│   │       ├── generate-examples.ts             # Real-world examples
│   │       ├── generate-negotiation-suggestions.ts # Negotiation tips
│   │       └── process-document-flow.ts         # Main orchestration flow
│   │
│   ├── context/
│   │   └── app-state-provider.tsx    # Global app state management
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx            # Responsive mobile detection
│   │   └── use-toast.ts              # Toast notification hook
│   │
│   ├── lib/                          # Utility Functions & Actions
│   │   ├── actions.ts                # Server actions for document processing
│   │   ├── firebase.ts               # Firebase initialization & config
│   │   ├── firestore-actions.ts      # Firestore database operations
│   │   ├── storage-actions.ts        # Firebase Storage operations
│   │   ├── chat-actions.ts           # Real-time chat operations
│   │   ├── lawyer-actions.ts         # Lawyer profile & consultation management
│   │   ├── google-meet-actions.ts    # Google Meet integration
│   │   ├── i18n.ts                   # i18next configuration
│   │   ├── utils.ts                  # General utility functions
│   │   ├── placeholder-images.ts     # Image utilities
│   │   ├── sample-lawyers.ts         # Sample data for testing
│   │   └── env.d.ts                  # Environment variable types
│   │
│   ├── types/
│   │   ├── lawyer.ts                 # Lawyer & profile types
│   │   └── consultation.ts           # Consultation request types
│   │
│   ├── locales/                      # Internationalization Translations
│   │   ├── en.json                   # English
│   │   └── hi.json                   # Hindi
│   │
│   └── images/
│       ├── logo.png
│       └── cover.png
│
├── scripts/                          # Admin Utility Scripts
│   ├── upgrade-user-role.ts          # User role management (user→lawyer→admin)
│   ├── fix-lawyer-verification-status.ts # Fix verification issues
│   ├── test-google-credentials.ts    # Test Google Cloud setup
│   └── README.md                     # Scripts documentation
│
├── docs/
│   └── blueprint.md                  # Project blueprint & design docs
│
├── public/                           # Static Assets
│
├── Configuration Files:
├── apphosting.yaml                   # Firebase App Hosting config
├── firebase.json                     # Firebase project configuration
├── firestore.rules                   # Firestore security rules (role-based)
├── firestore.indexes.json            # Database indexes for performance
├── storage.rules                     # Firebase Storage security rules
├── cors.json                         # CORS configuration for storage
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.mjs                # PostCSS configuration
├── tsconfig.json                     # TypeScript configuration
├── components.json                   # shadcn/ui configuration
├── package.json                      # Dependencies & scripts
├── .env                              # Environment variables (gitignored)
└── README.md                         # This file
```

### Key Directories Explained:

- **`app/`**: Next.js 15 App Router with file-based routing and React Server Components
- **`ai/`**: Genkit AI flows powered by Google Gemini 2.5 Flash for document analysis
- **`components/`**: Reusable React components organized by feature
- **`lib/`**: Business logic, Firebase operations, and utility functions
- **`scripts/`**: Admin CLI tools for user management and system maintenance
- **`types/`**: TypeScript type definitions for type safety
- **`locales/`**: i18next translation files for internationalization

## 🔧 Development

### Available Scripts

```bash
# Development (Port 9002 with Turbopack for ultra-fast builds)
npm run dev

# Genkit AI Development Server (Required for AI features)
npm run genkit:dev         # Start Genkit UI on port 4000
npm run genkit:watch       # Auto-restart on changes

# Production Build & Deployment
npm run build              # Next.js production build
npm start                  # Start production server

# Code Quality
npm run typecheck          # TypeScript type checking
npm run lint               # ESLint code linting

# Admin Scripts (see scripts/README.md)
npx tsx scripts/upgrade-user-role.ts <email> <role>
npx tsx scripts/test-google-credentials.ts
npx tsx scripts/fix-lawyer-verification-status.ts
```

**Important**: The Genkit server (`npm run genkit:dev`) must be running concurrently with the Next.js dev server for AI document analysis features to work. Run them in separate terminal windows.

### Admin Scripts

The `scripts/` directory contains utility scripts for managing the application:

- **`upgrade-user-role.ts`**: Upgrade user roles (user → lawyer → admin) in Firestore
- **`fix-lawyer-verification-status.ts`**: Fix lawyer verification statuses
- **`test-google-credentials.ts`**: Test Google Cloud service account credentials

See `scripts/README.md` for detailed usage instructions.

**Example: Upgrade user to lawyer role**
```bash
npx tsx scripts/upgrade-user-role.ts user@example.com lawyer
```

### AI Flow Development

ClarityDocs uses **Genkit 1.14** with **Google Gemini 2.5 Flash** for AI orchestration. Each analysis feature corresponds to a specific flow in `src/ai/flows/`:

#### Core AI Flows:

1. **`mask-sensitive-data.ts`** 🛡️ (Privacy First)
   - Runs BEFORE all other flows
   - Detects and masks: names, addresses, phone numbers, emails, ID numbers, financial data, land details, DOB
   - Uses structured output with placeholders: `[PERSON_NAME_1]`, `[ADDRESS_1]`, etc.
   - Ensures original sensitive data never reaches storage

2. **`generate-plain-language-summary.ts`**
   - Document summarization with structured key points
   - Extracts Do's and Don'ts
   - Identifies document tone (friendly/neutral/strict)
   - Returns JSON-structured summary

3. **`generate-risk-score.ts`**
   - Risk analysis with 0-100 scoring
   - Positive and negative factor breakdowns
   - Overall risk assessment with reasoning

4. **`generate-contract-timeline.ts`**
   - Automatic date and deadline extraction
   - Milestone identification with descriptions
   - Timeline visualization data

5. **`answer-what-if-question.ts`**
   - Interactive Q&A based on document context
   - Scenario analysis and implications
   - Context-aware responses

6. **`lookup-term-definitions.ts`**
   - Legal term explanations in plain language
   - Context-specific definitions
   - User-friendly explanations

7. **`generate-examples.ts`**
   - Real-world examples and practical scenarios
   - "In Simple Terms" explanations
   - Relatable analogies

8. **`generate-negotiation-suggestions.ts`**
   - Strategic negotiation tips and talking points
   - Identifies unfavorable clauses
   - Provides alternative wording suggestions

9. **`process-document-flow.ts`**
   - Main document processing pipeline orchestration
   - Coordinates all AI flows in sequence
   - Error handling and retry logic

#### Genkit Configuration:

```typescript
// src/ai/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
```

#### Testing Flows:

- Access Genkit UI at `http://localhost:4000` when running `npm run genkit:dev`
- Test individual flows with sample inputs
- View flow execution traces and debugging info
- Monitor API usage and performance

### Adding New Features

#### 1. Create AI Flow
```bash
# Create new flow in src/ai/flows/
touch src/ai/flows/your-new-feature.ts
```

Example flow structure:
```typescript
import { ai } from '../genkit';
import { z } from 'genkit';

export const yourNewFeatureFlow = ai.defineFlow(
  {
    name: 'yourNewFeature',
    inputSchema: z.string(),
    outputSchema: z.object({
      result: z.string(),
    }),
  },
  async (input) => {
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Your prompt here: ${input}`,
    });
    return { result: text };
  }
);
```

#### 2. Create Server Action
Add action in `src/lib/actions.ts`:
```typescript
export async function yourNewFeature(documentText: string) {
  const result = await runFlow(yourNewFeatureFlow, documentText);
  return result;
}
```

#### 3. Create UI Component
Add component in `src/components/clarity-docs/`:
```typescript
export function YourNewFeature({ data }) {
  return <div>{/* Your UI here */}</div>;
}
```

#### 4. Integrate in Summary View
Update `src/components/clarity-docs/summary-view.tsx`:
```typescript
import { YourNewFeature } from './your-new-feature';

// Add to component
<YourNewFeature data={yourData} />
```

## 🔐 Security Best Practices

### Privacy & Data Protection 🛡️

ClarityDocs implements **comprehensive privacy protection** through automatic sensitive data masking:

#### How Data Masking Works:
1. **Upload/Input** → User uploads document or pastes text
2. **Text Extraction** → Extract text from PDF/image (if needed)
3. **🛡️ MASK SENSITIVE DATA** → Gemini AI identifies and masks ALL sensitive information
4. **Secure Processing** → All AI analysis happens on masked content only
5. **Privacy-First Storage** → Only masked content is saved to Firestore (never original)

#### What Gets Automatically Masked:
- 👤 **Personal Names**: John Smith → `[PERSON_NAME_1]`
- 🏢 **Organizations**: Acme Corp → `[ORGANIZATION_1]`
- 📍 **Addresses**: 123 Main St, New York → `[ADDRESS_1]`
- 🏞️ **Land Details**: Survey No. 45/2A, Plot 123 → `[LAND_DETAIL_1]`
- 📞 **Phone Numbers**: +1-234-567-8900 → `[PHONE_NUMBER_1]`
- 📧 **Emails**: user@example.com → `[EMAIL_1]`
- 🪪 **ID Numbers**: Aadhar, PAN, Passport, SSN → `[ID_NUMBER_1]`
- 💳 **Financial Data**: Account numbers, amounts → `[ACCOUNT_NUMBER_1]`, `[AMOUNT_1]`
- 🎂 **Dates of Birth**: 01/01/1990 → `[DOB_1]`

#### Privacy Guarantees:
✅ Original sensitive data is **NEVER stored** in the database  
✅ Masking happens **BEFORE** any AI processing or analysis  
✅ All document views show **ONLY masked content**  
✅ Document history contains **ONLY masked versions**  
✅ Summary, risk analysis, timeline, and all features use **masked data only**  
✅ Even if database is compromised, sensitive data is safe

### Firebase Security Rules

ClarityDocs implements **role-based access control** with comprehensive Firestore security rules (`firestore.rules`):

#### User Roles:
- **User** (default): Can upload documents, view own data, request consultations
- **Lawyer**: All user permissions + manage lawyer profile, respond to consultations
- **Admin**: All permissions + verify lawyers, manage users, access admin dashboard

#### Security Rules Summary:
```javascript
// Users collection - users can only read/write their own data
match /users/{userId} {
  allow read, write: if isOwner(userId);
}

// Document History - users can only access their own documents
match /documentHistory/{documentId} {
  allow read: if resource.data.userId == request.auth.uid;
  allow create: if request.resource.data.userId == request.auth.uid;
}

// Lawyer Profiles - public read if authenticated, write by owner/admin
match /lawyerProfiles/{profileId} {
  allow read: if isAuthenticated();
  allow update: if isOwner(userId) || isAdmin();
}

// Consultation Requests - only participants can access
match /consultationRequests/{requestId} {
  allow read: if isParticipant() || isAdmin();
  allow update: if isParticipant() || isAdmin();
}

// Chat Sessions - only participants can access messages
match /chatSessions/{sessionId} {
  allow read: if isSessionParticipant();
  match /messages/{messageId} {
    allow read, write: if isSessionParticipant();
  }
}
```

Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

### Environment Variables & API Security

#### Environment Variable Guidelines:
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables only (safe to expose)
- ✅ Keep server-side API keys in `.env` file (never commit to git)
- ✅ Add `.env` to `.gitignore` to prevent accidental commits
- ✅ Rotate API keys immediately if exposed in git history
- ✅ Use different API keys for development and production
- ✅ Restrict API keys by domain/IP in Google Cloud Console

#### API Key Management:
| API Key Type | Exposure | Security Measures |
|--------------|----------|-------------------|
| **Firebase API Key** | ✅ Safe to expose | Public by design, protected by Firebase security rules |
| **Google Cloud API Keys** | ❌ Server-side only | Restrict by IP/domain in Google Cloud Console |
| **Gemini API Key** | ❌ Server-side only | Monitor usage quotas, set spending limits |
| **Service Account Keys** | ❌ Server-side only | Store securely with `\\n` escaping, rotate regularly |

#### Service Account Security:
- ✅ Store private keys securely with proper newline escaping (`\\n` in `.env`)
- ✅ Use least privilege IAM roles (only required permissions)
- ✅ Regularly rotate service account keys (every 90 days recommended)
- ✅ Never commit service account JSON files to version control
- ✅ Use separate service accounts for development and production
- ✅ Test credentials with `scripts/test-google-credentials.ts`

## 🚀 Deployment

### Firebase App Hosting (Recommended)

ClarityDocs is configured for Firebase App Hosting with `apphosting.yaml`. This provides serverless backend hosting optimized for Next.js applications.

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase Project**
   ```bash
   firebase init hosting
   firebase init firestore
   ```

3. **Deploy Firestore Rules & Indexes**
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

4. **Configure Environment**
   - Add production environment variables in Firebase Console
   - Ensure API keys have proper domain restrictions
   - Configure Firebase App Hosting environment variables

5. **Deploy to Firebase App Hosting**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
   
   Or use Firebase App Hosting for automatic deployments:
   ```bash
   # Connect your repository to Firebase App Hosting
   # Configure build settings in Firebase Console
   # Automatic deployments on git push
   ```

### Alternative Deployments

- **Vercel**: `vercel --prod`
- **Netlify**: Connect repository for auto-deployment
- **Google Cloud Run**: Containerized deployment

## 📊 Usage Analytics & Monitoring

Track key metrics to improve user experience and system performance:

### Application Analytics:
- 📄 **Document Processing**: Analysis completion rates, average processing time
- 🔍 **Feature Usage**: Most used features (Risk Score, Timeline, What-if, etc.)
- ⚖️ **Lawyer Marketplace**: Consultation request rates, lawyer response times
- 💬 **Chat Activity**: Real-time chat usage, message volume
- 👥 **User Engagement**: Retention rates, active users, session duration
- 🔐 **Authentication**: Sign-up conversion, login success rates

### Performance Monitoring:

The application includes a **PerformanceMonitor** component (`src/components/performance-monitor.tsx`) that tracks Web Vitals in production:

- **LCP (Largest Contentful Paint)**: Page load performance (< 2.5s is good)
- **FID (First Input Delay)**: Interactivity (< 100ms is good)
- **CLS (Cumulative Layout Shift)**: Visual stability (< 0.1 is good)

### API & Error Monitoring:
- 🔥 **Firebase Performance**: Monitor Firestore query performance
- 🤖 **Genkit Traces**: AI flow execution times and error rates
- 📊 **Google Cloud Monitoring**: API usage, quotas, and costs
- 🚨 **Error Tracking**: Client-side and server-side error rates

### Recommended Tools:
- **Firebase Analytics**: Built-in user analytics and events
- **Google Cloud Console**: API usage, billing, and quotas
- **Sentry** (optional): Real-time error tracking and performance monitoring
- **Vercel Analytics** (if deployed on Vercel): Edge function performance

## 🤝 Contributing

We welcome contributions! ClarityDocs is an open-source project that benefits from community input.

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/joe-anidas/Clarity-Docs.git
   cd Clarity-Docs
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes**
   - Follow TypeScript best practices
   - Use ESLint rules (run `npm run lint`)
   - Follow component structure conventions
   - Add comments for complex logic
   - Update types in `src/types/` if needed

4. **Test thoroughly**
   - Test all AI flows work correctly
   - Check mobile responsiveness
   - Test authentication flows
   - Verify Firebase security rules
   - Run `npm run typecheck` before committing

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: Add amazing feature"
   ```
   
   Use conventional commit messages:
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

6. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Submit Pull Request**
   - Include description of changes
   - Reference any related issues
   - Add screenshots for UI changes
   - Describe testing done
   - Wait for code review

### Contribution Guidelines

#### Code Style:
- Use TypeScript for all new files
- Follow existing component patterns
- Use Tailwind CSS for styling (no inline styles)
- Implement responsive design (mobile-first)
- Add proper TypeScript types (no `any`)

#### Component Guidelines:
- Use functional components with hooks
- Implement React.memo for expensive components
- Use `useMemo` and `useCallback` appropriately
- Add proper prop types with TypeScript interfaces
- Include JSDoc comments for complex components

#### AI Flow Guidelines:
- Define clear input/output schemas with Zod
- Add error handling and retry logic
- Test flows in Genkit UI before integration
- Document prompt engineering decisions
- Consider token limits and costs

### Reporting Issues

Help us improve ClarityDocs by reporting issues:

#### 🐛 Bug Reports:
When reporting bugs, include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
  1. Go to '...'
  2. Click on '...'
  3. See error
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: 
  - Browser and version
  - Operating system
  - Node.js version
  - Any relevant console errors

#### 💡 Feature Requests:
When requesting features, describe:
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Any alternative solutions considered?
- **Additional Context**: Screenshots, mockups, or examples

#### 📚 Documentation:
Help improve documentation by:
- Fixing typos and grammar
- Adding missing information
- Clarifying confusing sections
- Adding code examples
- Translating to other languages

### Areas for Contribution

We'd especially welcome contributions in these areas:
- 🌐 **Internationalization**: Add more language translations (Tamil, Telugu, Malayalam, etc.)
- 🎨 **UI/UX**: Improve design, accessibility, and user experience
- 🧪 **Testing**: Add unit tests, integration tests, E2E tests
- 📱 **Mobile**: Optimize mobile experience and PWA features
- 🤖 **AI Prompts**: Improve prompt engineering for better results
- 📊 **Visualizations**: Add more charts and data visualizations
- 🔒 **Security**: Enhance security features and audits
- ⚡ **Performance**: Optimize bundle size, loading times, and caching

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. Genkit Server Won't Start
**Problem**: `npm run genkit:dev` fails or port 4000 is busy

**Solution**:
```bash
# Check if port 4000 is already in use
lsof -i :4000

# Kill the process if needed
kill -9 <PID>

# Restart Genkit server
npm run genkit:dev
```

#### 2. Document AI / OCR Errors
**Problem**: PDF/image upload fails with API errors

**Solution**:
- Verify Document AI API is enabled in Google Cloud Console
- Check processor ID and location in `.env` file
- Ensure service account has `documentai.apiUser` role
- Test credentials: `npx tsx scripts/test-google-credentials.ts`
- Check Document AI quotas and billing

#### 3. Genkit Server Connection Issues
**Problem**: Frontend can't connect to AI flows

**Solution**:
- Ensure Genkit server is running: `npm run genkit:dev` (separate terminal)
- Check Genkit server logs for errors
- Verify `GEMINI_API_KEY` is set correctly in `.env`
- Confirm Genkit is accessible at `http://localhost:4000`
- Check Genkit UI for flow execution errors

#### 4. PDF Processing Issues
**Problem**: PDF upload doesn't extract text properly

**Solution**:
- Verify `pdfjs-dist` is installed: `npm list pdfjs-dist`
- Check browser console for PDF.js errors
- Try with a different PDF file (some PDFs may be corrupted)
- For image-based PDFs, ensure Document AI OCR is working
- Check if PDF has text layer (OCR may be required)

#### 5. Firebase Authentication Issues
**Problem**: Can't sign in/up or OAuth fails

**Solution**:
- Verify Firebase config in `.env` (all `NEXT_PUBLIC_FIREBASE_*` variables)
- Check Firebase project authentication is enabled
- For Email/Password: Ensure provider is enabled in Firebase Console
- For Google OAuth:
  - Verify OAuth client is configured in Google Cloud Console
  - Check redirect URIs match exactly: `https://your-project-id.firebaseapp.com/__/auth/handler`
  - Add authorized domains in Firebase Console
  - Wait 5-10 minutes for OAuth changes to propagate
- Clear browser cache and cookies
- Check browser console for specific Firebase auth errors

#### 6. Environment Variable Issues
**Problem**: Environment variables not loading or incorrect

**Solution**:
- Verify `.env` file exists in root directory
- Check variable names match exactly (case-sensitive)
- For private key, ensure newlines are escaped properly: `\\n`
- Restart dev server after changing `.env` file
- Don't put quotes around values unless value contains spaces
- Example correct format:
  ```env
  GEMINI_API_KEY=AIzaSyA...
  GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n"
  ```
- Use `scripts/test-google-credentials.ts` to verify credentials

#### 7. Role-Based Access Issues
**Problem**: Users can't access features or dashboards

**Solution**:
- Check user role in Firestore: `users/{userId}` → `role` field
- Use admin script to upgrade role:
  ```bash
  npx tsx scripts/upgrade-user-role.ts user@example.com lawyer
  ```
- Supported roles: `user`, `lawyer`, `admin`
- Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- Users may need to sign out and back in after role changes
- Clear browser cache if role changes don't reflect

#### 8. Firestore Permission Denied
**Problem**: "Missing or insufficient permissions" error

**Solution**:
- Deploy security rules: `firebase deploy --only firestore:rules`
- Check user is authenticated (signed in)
- Verify user has correct role for the operation
- Check Firestore security rules in `firestore.rules`
- Inspect Firestore Rules Playground in Firebase Console
- Ensure document structure matches security rules expectations

#### 9. Firebase Storage Upload Fails
**Problem**: Document upload fails with storage errors

**Solution**:
- Verify Firebase Storage is enabled in Firebase Console
- Deploy storage rules: `firebase deploy --only storage:rules`
- Check file size limits (default 10MB, configurable)
- Ensure user is authenticated
- Verify CORS configuration in `cors.json`
- Check Storage quotas and billing

#### 10. Build Errors
**Problem**: `npm run build` fails with TypeScript errors

**Solution**:
```bash
# Type check first
npm run typecheck

# Fix TypeScript errors
# Check for missing types
npm install --save-dev @types/node @types/react @types/react-dom

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

#### 11. Performance Issues
**Problem**: App is slow or unresponsive

**Solution**:
- Check Firestore indexes are deployed: `firebase deploy --only firestore:indexes`
- Monitor Web Vitals in browser DevTools
- Check Genkit server response times in Genkit UI
- Verify caching is working (check Network tab)
- Reduce image sizes and use Next.js Image optimization
- Check for unnecessary re-renders with React DevTools
- Monitor Gemini API response times (target < 5s)

### Getting Help

If you're still experiencing issues:

1. **Check GitHub Issues**: [Search existing issues](https://github.com/joe-anidas/Clarity-Docs/issues)
2. **Create New Issue**: Provide detailed information (see Reporting Issues section)
3. **Check Logs**: 
   - Browser console logs
   - Genkit server logs
   - Firebase Console logs
   - Next.js terminal output
4. **Join Discussion**: [GitHub Discussions](https://github.com/joe-anidas/Clarity-Docs/discussions)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

ClarityDocs is built with amazing open-source technologies and services:

### AI & Cloud Services
- **[Google Gemini 2.5 Flash](https://ai.google.dev/)**: Powerful language understanding and generation
- **[Genkit](https://firebase.google.com/docs/genkit)**: AI orchestration and flow management framework
- **[Google Document AI](https://cloud.google.com/document-ai)**: Advanced OCR and document processing
- **[Google Cloud Translation API](https://cloud.google.com/translate)**: Multi-language support

### Backend & Database
- **[Firebase](https://firebase.google.com/)**: Authentication, hosting, and real-time infrastructure
  - **Firestore**: NoSQL database with real-time sync
  - **Authentication**: Secure user management with OAuth
  - **Cloud Storage**: File storage and CDN
  - **Hosting**: Production deployment
- **[Google Meet API](https://developers.google.com/meet)**: Video consultation integration
- **[Google Calendar API](https://developers.google.com/calendar)**: Appointment scheduling

### Frontend & UI
- **[Next.js](https://nextjs.org/)**: Full-stack React framework with App Router
- **[React](https://react.dev/)**: Component-based UI library
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)**: Beautiful, accessible component library
- **[Radix UI](https://www.radix-ui.com/)**: Unstyled, accessible component primitives
- **[Lucide Icons](https://lucide.dev/)**: Beautiful, consistent icon set

### Development Tools
- **[React Hook Form](https://react-hook-form.com/)**: Performant form handling
- **[Zod](https://zod.dev/)**: TypeScript-first schema validation
- **[i18next](https://www.i18next.com/)**: Internationalization framework
- **[pdfjs-dist](https://mozilla.github.io/pdf.js/)**: Client-side PDF rendering
- **[Recharts](https://recharts.org/)**: Composable charting library
- **[date-fns](https://date-fns.org/)**: Modern date utility library

### Community & Contributors
- Special thanks to all contributors who have helped improve ClarityDocs
- Thanks to the open-source community for building and maintaining these incredible tools
- Thanks to early users for feedback and bug reports

---

**Made with ❤️ by [Joe Anidas](https://github.com/joe-anidas)**

*Empowering users to understand complex documents and make informed decisions*

*Democratizing access to legal knowledge and consultation*

## 🔗 Links & Resources

### Project Links
- 🌐 **Live Demo**: [Coming Soon](#)
- 📖 **Documentation**: [GitHub Wiki](https://github.com/joe-anidas/Clarity-Docs/wiki) (Coming Soon)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/joe-anidas/Clarity-Docs/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/joe-anidas/Clarity-Docs/discussions)
- 📦 **Releases**: [GitHub Releases](https://github.com/joe-anidas/Clarity-Docs/releases)

### Documentation
- 📘 [Project Blueprint](docs/blueprint.md): Original design and feature specifications
- 🔧 [Admin Scripts Guide](scripts/README.md): User role management and utilities
- 🔐 [Firebase Setup Guide](#setting-up-firebase): Detailed Firebase configuration
- 🤖 [AI Flows Documentation](#ai-flow-development): Genkit flow development guide

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Google Gemini API](https://ai.google.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs)

### Community
- 👨‍💻 **Author**: [Joe Anidas](https://github.com/joe-anidas)
- 📧 **Contact**: [GitHub Profile](https://github.com/joe-anidas)
- 🌟 **Star this repo**: Help others discover ClarityDocs!

---

<div align="center">

### 📄 ClarityDocs

**Transforming Complex Documents into Crystal-Clear Insights**

[![GitHub stars](https://img.shields.io/github/stars/joe-anidas/Clarity-Docs?style=social)](https://github.com/joe-anidas/Clarity-Docs/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/joe-anidas/Clarity-Docs?style=social)](https://github.com/joe-anidas/Clarity-Docs/network/members)
[![GitHub issues](https://img.shields.io/github/issues/joe-anidas/Clarity-Docs)](https://github.com/joe-anidas/Clarity-Docs/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Made with ❤️ for everyone who's ever been confused by legal jargon

**[Get Started](#-quick-start)** • **[Documentation](#-links--resources)** • **[Contribute](#-contributing)**

</div>