# 📄 ClarityDocs: AI-Powered Document Simplification

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Google AI](https://img.shields.io/badge/Google%20AI-Gemini-blue?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

> **Transform complex documents into crystal-clear insights with AI-powered analysis**

ClarityDocs is an intelligent document analysis platform that uses advanced AI to break down complex legal documents, contracts, and agreements into simple, actionable insights. Get risk assessments, interactive timelines, negotiation suggestions, and plain-language explanations instantly.

## ✨ Key Features

### 🤖 **AI-Powered Document Analysis**
- **Smart Summarization**: Generates structured summaries with key points, Do's, and Don'ts
- **Risk Assessment**: Calculate risk scores (0-100) with detailed positive/negative breakdowns
- **Tone Analysis**: Identifies friendly, neutral, or strict language patterns in clauses

### 📊 **Interactive Insights**
- **Timeline Extraction**: Automatically identifies and visualizes key dates, deadlines, and milestones  
- **Scenario Analysis**: Interactive "What-if" chat to explore document implications
- **Term Definitions**: Click any highlighted term for instant plain-language explanations

### 🔍 **Smart Document Processing**
- **Multi-format Support**: Upload PDFs, images (JPG, PNG) with OCR extraction
- **Text Input**: Paste document content directly for instant analysis
- **Document Type Detection**: Optimized analysis for rentals, loans, employment contracts, ToS
- **🔒 Privacy Protection**: Automatic sensitive data masking before processing and storage

### 💬 **Negotiation Intelligence**
- **Negotiation Suggestions**: AI-generated talking points for unfavorable clauses
- **Real-world Examples**: "In Simple Terms" explanations with practical scenarios
- **Multi-language Support**: Translate summaries to Hindi, Tamil, Telugu, Malayalam

### ⚖️ **Lawyer Consultation & Marketplace**
- **Verified Lawyer Network**: Browse and connect with verified legal professionals
- **Lawyer Profiles**: View qualifications, specializations, ratings, and hourly rates
- **Video Consultations**: Schedule and conduct Google Meet consultations directly in the app
- **Integrated Scheduling**: Book appointments via Google Calendar integration
- **Real-time Chat**: Message lawyers directly about your legal questions
- **Consultation Requests**: Submit detailed requests with document attachments
- **Lawyer Dashboard**: Legal professionals can manage consultations, availability, and client interactions

### 📁 **Document History & Management**
- **Document History**: Automatically saves all processed documents with timestamps
- **Quick Access**: View and reload any previous document summary instantly
- **Search & Filter**: Find past documents by name, type, or upload date
- **Delete Control**: Remove unwanted documents from your history anytime

### 🔐 **Secure & User-Friendly**
- **Firebase Authentication**: Secure user accounts with email/password and Google OAuth
- **Cloud Storage**: Documents securely stored in Firestore with user-level permissions
- **Privacy-First**: Only you can access your documents - full data isolation
- **🛡️ Data Masking**: Automatic detection and masking of sensitive information (names, addresses, phone numbers, financial details, ID numbers, etc.)
- **Masked Storage**: All documents stored with masked sensitive data for maximum privacy
- **Responsive Design**: Beautiful, mobile-friendly interface with dark/light themes

## ⚡ Performance Optimizations

ClarityDocs is built with performance in mind, featuring:

### 🚀 **Frontend Optimizations**
- **React.memo**: Memoized components to prevent unnecessary re-renders
- **useMemo & useCallback**: Optimized expensive computations and callbacks
- **Next.js Image Optimization**: Automatic image compression, lazy loading, and WebP/AVIF format support
- **Code Splitting**: Dynamic imports for heavy components and routes
- **Component Memoization**: Feature cards and UI elements are memoized for better performance

### 🗄️ **Data & Caching**
- **In-Memory Caching**: 5-minute cache for document history queries
- **Smart Cache Invalidation**: Automatic cache updates on data changes
- **Optimized Firebase Queries**: Limited queries with proper indexing
- **Lazy Loading**: Components and data loaded on-demand

### 🌐 **Network Optimizations**
- **DNS Prefetching**: Pre-resolve Firebase and Google Cloud domains
- **Resource Preloading**: Critical fonts and assets preloaded
- **Compression**: Gzip compression enabled for all assets
- **HTTP Headers**: Optimized security and caching headers

### 📊 **Performance Monitoring**
- **Web Vitals Tracking**: Monitors LCP, FID, and CLS metrics
- **Performance Observer API**: Real-time performance monitoring in production
- **Console Logging**: Development-time performance insights

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

### For Users:
- **Renters**: Understanding lease agreements and rental contracts
- **Employees**: Reviewing employment contracts and workplace policies  
- **Small Businesses**: Analyzing supplier agreements and service contracts
- **Consumers**: Decoding terms of service and privacy policies
- **Students**: Learning from legal document structures and language

### For Lawyers:
- **Expand Client Base**: Reach users who need legal consultation
- **Virtual Consultations**: Conduct video meetings via integrated Google Meet
- **Efficient Scheduling**: Manage appointments through Google Calendar sync
- **Document Review**: Access client documents for consultation preparation
- **Flexible Practice**: Set your own rates, availability, and specializations
- **Verified Profile**: Build trust with verified credentials and user ratings

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Google Cloud Account** with enabled APIs:
  - Gemini API (AI-powered analysis)
  - Document AI API (OCR & text extraction)
  - Translation API (multi-language support)
  - Google Meet API (video consultations)
  - Google Calendar API (appointment scheduling)
- **Firebase Project** with the following services:
  - Authentication (Email/Password & Google OAuth)
  - Firestore Database (document storage)
  - Cloud Storage (file uploads)

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
   
   **Terminal 2: Genkit AI Server**
   ```bash
   npm run genkit:dev
   ```

5. **Access the Application**
   - Frontend: `http://localhost:9002`
   - Genkit UI: `http://localhost:4000` (optional)

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
   - Enable indexes for efficient queries
   
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
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI/ML**: Google Gemini API, Genkit AI orchestration
- **Backend Services**: 
  - **Firebase Authentication**: User management with Email/Password & Google OAuth
  - **Cloud Firestore**: NoSQL database for documents, user data, and lawyer profiles
  - **Firebase Storage**: Secure file storage for document uploads and chat attachments
  - **Firebase Hosting**: Production deployment and CDN
- **Google Cloud APIs**: 
  - **Document AI**: OCR and text extraction from PDFs/images
  - **Translation API**: Multi-language support
  - **Google Meet API**: Video consultation scheduling
  - **Google Calendar API**: Appointment management
- **State Management**: React Context + Hooks
- **Form Handling**: React Hook Form + Zod validation

### System Architecture

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ User Browser│───▶│ Next.js Frontend │───▶│ AI & Cloud Services │
└─────────────┘    └──────────────────┘    └─────────────────────┘
                            │                        │
                            ▼                        ▼
                   ┌─────────────────┐    ┌─────────────────────┐
                   │ Firebase Stack  │    │ Genkit AI Flows     │
                   │ • Auth          │    └─────────────────────┘
                   │ • Firestore     │             │
                   │ • Storage       │    ┌────────┼────────────────┐
                   │ • Hosting       │    ▼        ▼        ▼       ▼
                   └─────────────────┘  ┌───────┐┌──────┐┌────┐┌─────────┐
                                        │Gemini ││DocAI ││Meet││Calendar │
                                        │  API  ││ API  ││API ││   API   │
                                        └───────┘└──────┘└────┘└─────────┘
```

### Lawyer Consultation Flow

```
User → Browse Lawyers → Select Lawyer → Request Consultation
                                              ↓
                                  Lawyer Reviews Request
                                              ↓
                                  Schedule via Google Calendar
                                              ↓
                                  Generate Google Meet Link
                                              ↓
                                  Video Consultation Session
                                              ↓
                                  Real-time Chat & Document Sharing
```

### Document Processing Pipeline

```
User Upload (PDF/Image/Text)
        ↓
Extract Text (Document AI OCR)
        ↓
🛡️ MASK SENSITIVE DATA (Gemini AI)
        ↓
Generate Summary & Analysis
        ↓
Store Masked Content (Firestore)
        ↓
Display to User (Only Masked Data)
```

### Component Flow

```
DocumentUpload → ClarityPage → SummaryView
     ↓               ↓            ↓
File/Text → Server Actions → AI Flows → Gemini API
     ↓               ↓            ↓
OCR Extract → Mask Data → Process → Results → Interactive UI
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── clarity/           # Document analysis
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── summary/
│   │       └── page.tsx
│   ├── lawyers/           # 🆕 Lawyer marketplace
│   │   └── page.tsx
│   ├── consultation/      # 🆕 Consultation requests
│   │   └── page.tsx
│   ├── chat/              # 🆕 Real-time messaging
│   │   └── [sessionId]/
│   │       └── page.tsx
│   ├── dashboard/         # User & lawyer dashboards
│   │   ├── user/
│   │   ├── lawyer/
│   │   └── admin/
│   ├── lawyer-verification/ # 🆕 Lawyer verification portal
│   │   └── page.tsx
│   ├── sign-in/          # Authentication pages
│   │   └── page.tsx
│   ├── sign-up/
│   │   └── page.tsx
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── favicon.ico
├── components/
│   ├── auth/             # Authentication components
│   │   ├── auth-provider.tsx
│   │   └── role-selection-dialog.tsx
│   ├── clarity-docs/     # Document analysis components
│   │   ├── document-upload.tsx
│   │   ├── summary-view.tsx
│   │   ├── interactive-text.tsx
│   │   ├── term-lookup-popover.tsx
│   │   └── summary-skeleton.tsx
│   ├── lawyer/           # 🆕 Lawyer-specific components
│   │   ├── lawyer-card.tsx
│   │   ├── lawyer-list.tsx
│   │   ├── consultation-request-form.tsx
│   │   └── chat-interface.tsx
│   ├── layout/           # Navigation & layout
│   │   ├── header.tsx
│   │   ├── app-header.tsx
│   │   ├── footer.tsx
│   │   ├── hero-actions.tsx
│   │   └── get-started-button.tsx
│   └── ui/              # shadcn/ui components
├── ai/                   # AI orchestration layer
│   ├── flows/           # Genkit AI flows
│   │   ├── generate-plain-language-summary.ts
│   │   ├── generate-risk-score.ts
│   │   ├── generate-contract-timeline.ts
│   │   ├── answer-what-if-question.ts
│   │   ├── lookup-term-definitions.ts
│   │   ├── generate-examples.ts
│   │   ├── generate-negotiation-suggestions.ts
│   │   ├── mask-sensitive-data.ts           # 🛡️ NEW: Privacy protection
│   │   └── process-document-flow.ts
│   ├── genkit.ts        # AI configuration
│   └── dev.ts           # Genkit development server
├── context/
│   └── app-state-provider.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── actions.ts       # Server actions
│   ├── firebase.ts      # Firebase configuration
│   ├── firestore-actions.ts  # Database operations
│   ├── storage-actions.ts    # File storage operations
│   ├── chat-actions.ts       # 🆕 Real-time chat operations
│   ├── lawyer-actions.ts     # 🆕 Lawyer profile & consultation management
│   ├── google-meet-actions.ts # 🆕 Google Meet integration
│   ├── utils.ts         # Utility functions
│   └── env.d.ts         # Environment types
├── types/
│   ├── lawyer.ts        # 🆕 Lawyer & consultation types
│   └── consultation.ts  # 🆕 Consultation request types
└── images/
    ├── logo.png
    └── cover.png
```

## 🔧 Development

### Available Scripts

```bash
# Development server (port 9002)
npm run dev

# Genkit AI development UI
npm run genkit:dev
npm run genkit:watch

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

### AI Flow Development

ClarityDocs uses **Genkit** for AI orchestration. Each analysis feature corresponds to a flow:

- `generate-plain-language-summary.ts` - Document summarization
- `generate-risk-score.ts` - Risk analysis with scoring
- `generate-contract-timeline.ts` - Date and deadline extraction
- `answer-what-if-question.ts` - Interactive Q&A
- `lookup-term-definitions.ts` - Legal term explanations
- `generate-examples.ts` - Real-world examples
- `generate-negotiation-suggestions.ts` - Negotiation tips
- `mask-sensitive-data.ts` - 🛡️ **Privacy protection & data masking**
- `process-document-flow.ts` - Document processing pipeline

### Adding New Features

1. **Create AI Flow**: Add new flow in `src/ai/flows/`
2. **Server Action**: Export action in `src/lib/actions.ts`
3. **UI Component**: Add interface in `components/clarity-docs/`
4. **Integration**: Connect in `SummaryView.tsx`

## 🔐 Security Best Practices

### Privacy & Data Protection
- 🛡️ **Automatic Data Masking**: All sensitive information is automatically detected and masked
- 🔒 **Masked Storage**: Only masked content is stored in Firestore (never original sensitive data)
- 🎯 **Comprehensive Coverage**: Masks names, addresses, phone numbers, emails, ID numbers, financial details, land details, and dates of birth
- ✅ **Privacy-First Processing**: Masking happens immediately after document text extraction, before any AI processing or storage

### Sensitive Data Handling
The application automatically masks the following types of information:
- **Personal Names**: Individuals and organizations → `[PERSON_NAME_1]`, `[ORGANIZATION_1]`
- **Addresses**: Complete addresses, streets, cities → `[ADDRESS_1]`
- **Land Details**: Survey numbers, plot numbers → `[LAND_DETAIL_1]`
- **Contact Info**: Phone numbers, emails → `[PHONE_NUMBER_1]`, `[EMAIL_1]`
- **ID Numbers**: Aadhar, PAN, passport, etc. → `[ID_NUMBER_1]`
- **Financial Data**: Account numbers, amounts → `[ACCOUNT_NUMBER_1]`, `[AMOUNT_1]`
- **Dates of Birth**: Personal DOB references → `[DOB_1]`

### Environment Variables
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables only
- ✅ Keep server-side API keys in `.env` (never commit)
- ✅ Rotate API keys if exposed in git history
- ✅ Use Firebase Security Rules for data protection

### API Key Management
- **Firebase API Key**: Safe to expose (public by design)
- **Google Cloud API Keys**: Server-side only, restrict by IP/domain
- **Gemini API Key**: Server-side only, monitor usage quotas

### Service Account Security
- Store private keys securely with proper newline escaping
- Use least privilege IAM roles
- Regularly rotate service account keys

## 🚀 Deployment

### Firebase App Hosting (Recommended)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Project**
   ```bash
   firebase init hosting
   ```

3. **Configure Environment**
   - Add production environment variables in Firebase Console
   - Ensure API keys have proper domain restrictions

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Alternative Deployments

- **Vercel**: `vercel --prod`
- **Netlify**: Connect repository for auto-deployment
- **Google Cloud Run**: Containerized deployment

## 📊 Usage Analytics

Track key metrics to improve user experience:

- Document analysis completion rates
- Most used features (Risk Score, Timeline, etc.)
- API response times and error rates
- User retention and engagement patterns

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow TypeScript and ESLint conventions
4. **Test thoroughly**: Ensure all AI flows work correctly
5. **Submit PR**: Include description of changes and testing done

### Reporting Issues

- 🐛 **Bug Reports**: Include steps to reproduce, expected vs actual behavior
- 💡 **Feature Requests**: Describe use case and proposed solution
- 📚 **Documentation**: Help improve clarity and completeness

## 🔍 Troubleshooting

### Common Issues

1. **Genkit Server Won't Start**
   ```bash
   # Check if port 4000 is available
   lsof -i :4000
   # Kill process if needed
   kill -9 <PID>
   ```

2. **Document AI Errors**
   - Verify processor ID and location
   - Check service account permissions
   - Ensure Document AI API is enabled

3. **Firebase Auth Issues**
   - Verify API key is correct
   - Check Firebase project configuration
   - Ensure Authentication is enabled

4. **Environment Variable Issues**
   - Check `.env` file exists and has correct format
   - Verify private key newlines are escaped properly
   - Restart development server after changes

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI**: Gemini API for powerful language understanding
- **Firebase**: Authentication and hosting infrastructure  
- **shadcn/ui**: Beautiful, accessible component library
- **Genkit**: AI orchestration and development tools
- **Next.js**: Full-stack React framework
- **Tailwind CSS**: Utility-first styling approach

## 🔗 Links

- **Live Demo**: [Coming Soon](#)
- **Documentation**: [Coming Soon](#)
- **Issues**: [GitHub Issues](https://github.com/joe-anidas/ClarityDocs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/joe-anidas/ClarityDocs/discussions)

---

**Made with ❤️ for everyone who's ever been confused by legal jargon**

*Empowering users to understand documents and make informed decisions*