# InternTrack Pro – AI Internship Application Tracker

InternTrack Pro is a complete, production-ready, React-based SaaS web application designed to track and manage internship and job applications. It integrates Firebase Authentication and Cloud Firestore for real-time, per-user data storage and features smart features like URL parsing metadata auto-fill, analytics, data exporting (CSV/JSON), and data backup and restoration.

This project was built for **Digital Heroes** by **Raj Gupta** (rajcseaiml1234@gmail.com).

## 🚀 Key Features

* **Secure Authentication**: Firebase Auth for login, signup, forgot password, logout, and persistent sessions via the "Remember Me" toggle.
* **Smart URL Auto-Fill**: Regex-based client-side metadata crawler extracts company names and job titles from common job postings (LinkedIn, Google Careers, Greenhouse, Lever, Workday, etc.).
* **Real-time Synchronization**: Powered by Firestore listeners (`onSnapshot`) to update data metrics instantly without page reloads.
* **Dashboard Analytics**: Key metrics displayed through cards (Total Applications, Interviews, Offers, Rejections, and Success Rate = Offers / Total) and a recent activity log.
* **Data Portability**: Download backups in JSON, restore backups (via JSON file uploader, with validation), and export spreadsheet-compatible CSV files.
* **Advanced Searches & Filters**: Client-side filtering by status and query, and sorting (Newest, Oldest, Company name) ensuring instant responsiveness.
* **Premium UX/UI**: Responsive layout (collapses to cards on mobile), dark/light mode context, custom toast notifications, loading states, empty folders, and deletion dialogs.

---

## 🛠️ Project Structure

```
/
├── .env.example                # Template for environment configuration
├── .gitignore                  # Standard git exclusions list
├── index.html                  # Main HTML entry point
├── package.json                # Project dependencies and script declarations
├── vite.config.js              # Vite configuration
├── vercel.json                 # Vercel single page app redirects rewrite rule
└── src/
    ├── main.jsx                # Main mounting element
    ├── App.jsx                 # Routing table & core CRUD controllers
    ├── index.css               # Design system styling tokens (dark/light themes)
    ├── firebase.js             # Firebase SDK client initialization
    ├── context/
    │   ├── AuthContext.jsx     # Firebase auth context
    │   ├── ThemeContext.jsx    # Theme toggle context
    │   └── ToastContext.jsx    # Alert toast notifications context
    ├── utils/
    │   ├── urlParser.js        # Job URL scraper engine
    │   ├── exporters.js        # CSV/JSON file creator helpers
    │   └── dateHelpers.js      # Input date formatting helpers
    ├── components/
    │   ├── Sidebar.jsx         # Responsive sidebar navigation
    │   ├── Navbar.jsx          # Top navbar with profile actions
    │   ├── ProtectedRoute.jsx  # Route gatekeeper redirector
    │   ├── ApplicationModal.jsx# URL autofiller, data validation, and editor
    │   ├── DeleteConfirmationModal.jsx # Removal confirmation dialog
    │   ├── StatusBadge.jsx     # Dynamic pill tags
    │   ├── StatsCard.jsx       # KPI cards
    │   └── ToastContainer.jsx  # Alerts system container
    └── pages/
        ├── Login.jsx           # Sign In & Password Recovery page
        ├── Register.jsx        # Sign Up page
        ├── Dashboard.jsx       # Analytics dashboard & dev widget
        ├── Tracker.jsx         # Advanced filterable application grid
        └── Settings.jsx        # Exporter controls & Backup/Restore wizard
```

---

## 🔧 Installation & Setup

### 1. Firebase Project Configuration
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project called `InternTrack Pro`.
3. In **Build > Authentication**, enable the **Email/Password** sign-in method.
4. In **Build > Firestore Database**, click **Create Database**. Start in **Production Mode** and select your regional location.
5. In the **Rules** tab of Firestore, paste the following rules and click **Publish**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /applications/{applicationId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
       }
     }
   }
   ```
6. In **Project Settings**, scroll down to **Your apps**, click the web icon (`</>`), name your app, and copy the `firebaseConfig` keys.

### 2. Local Environment Setup
1. Clone the project and navigate into the directory.
2. Duplicate the env template:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file and replace the placeholders with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=interntrack-pro.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=interntrack-pro
   VITE_FIREBASE_STORAGE_BUCKET=interntrack-pro.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:12345:web:abcd
   ```

### 3. Installation Commands
Install all dependencies:
```bash
npm install
```

### 4. Running Locally

You can run the application locally using either a live Cloud Firebase project, or the local offline Firebase Emulator Suite (zero cloud setup required).

#### Option A: Run with Local Emulators (Offline, Zero Config)
If you don't have a Firebase project setup, you can test the application completely offline:
1. Ensure you have the `firebase-tools` CLI installed globally:
   ```bash
   npm install -g firebase-tools
   ```
2. Start the local emulators in your project root:
   ```bash
   npm run emulators
   ```
   *This starts Auth on port `9099`, Firestore on port `8080`, and the emulator control panel UI on `localhost:4000`.*
3. In a separate terminal window, launch the React development server:
   ```bash
   npm run dev
   ```
   *The application will automatically detect that it's running on `localhost` with no `.env` variables and hook into the local emulators.*

#### Option B: Run with Cloud Firebase
1. Open the `.env` file and verify all VITE_FIREBASE_* variables are filled out.
2. Launch the React development server:
   ```bash
   npm run dev
   ```
   *The application will connect directly to your Google Cloud database.*

Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 5. Compiling for Production
Build the compiled package assets:
```bash
npm run build
```

---

## ☁️ Vercel Deployment Steps

This project is configured to deploy directly on the Vercel Free Plan. The `vercel.json` file handles Single Page App routing redirects correctly.

### Option A: Using the Vercel CLI
1. Open your terminal in the project root directory.
2. Install Vercel CLI globally (if not already done):
   ```bash
   npm install -g vercel
   ```
3. Run the deployment command:
   ```bash
   vercel
   ```
4. Authenticate, choose your Vercel organization, select **Create a new project**, link it, and leave the default build configurations.
5. In the CLI or in the Vercel Dashboard under **Project Settings > Environment Variables**, add your `.env` variables:
   * `VITE_FIREBASE_API_KEY`
   * `VITE_FIREBASE_AUTH_DOMAIN`
   * `VITE_FIREBASE_PROJECT_ID`
   * `VITE_FIREBASE_STORAGE_BUCKET`
   * `VITE_FIREBASE_MESSAGING_SENDER_ID`
   * `VITE_FIREBASE_APP_ID`
6. Trigger the production build:
   ```bash
   vercel --prod
   ```

### Option B: Deploying via GitHub Git Integration
1. Push the code repository to a GitHub, GitLab, or Bitbucket repository.
2. Log in to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Import your repository.
4. Expand the **Environment Variables** section and add all keys from your local `.env` file.
5. Click **Deploy**. Vercel will automatically build and deploy your application on every push.

---

## 🧪 Testing Checklist

Ensure everything is fully operational by following this test sequence:

1. **Authentication Gatekeeper**: Go to `/settings` when logged out. Confirm it redirects you to `/login`.
2. **Registration Validation**: Try signing up with mismatched passwords or passwords under 6 characters. Confirm warnings display. Sign up with name `Raj Gupta` and verify redirect.
3. **Smart Autofill pasting**: Add a new application, paste `https://jobs.lever.co/spotify/e2b6d0-apply` or `https://boards.greenhouse.io/stripe/jobs/12345` in the URL. Blur out or click **Auto-Fill**. Confirm company and role fill and show a success toast.
4. **Data Syncing**: Check your Firestore database console. Confirm that added entries appear in real-time under a collection named `applications`, and that their `userId` matches your account's auth UID.
5. **Portability Tests**: 
   * Click **Export CSV** in settings. Verify columns open correctly in Sheets.
   * Click **Download Backup** in settings. Save the JSON file. Delete an application, then upload the backup JSON via **Restore Backup**. Confirm the deleted application reappears in your list.
6. **Mobile Layout Check**: Open the browser console, toggle mobile device emulation (e.g. iPhone SE). Ensure the table transforms into cards and the sidebar collapses to a hamburger menu.

---

## 🧑‍💻 Developed By

* **Developer**: Raj Gupta
* **Contact Email**: rajcseaiml1234@gmail.com
* **Built For**: [Digital Heroes](https://digitalheroesco.com)
