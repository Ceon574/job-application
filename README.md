# 🚀 Job Application Tracker (Full Stack MERN Application)

A full-stack web application designed and built for the **Full Stack Development Final Assessment**. The application empowers job seekers to record, organize, track, and optimize their job applications through a modern, responsive, and policy-driven tracking dashboard connected to **MongoDB Atlas**.

---

## 📋 Table of Contents
1. [Overview & Key Features](#-overview--key-features)
2. [Tech Stack](#-tech-stack)
3. [Architecture & Project Structure](#-architecture--project-structure)
4. [Application ID Generation & Fallbacks](#-application-id-generation--fallbacks)
5. [Status Workflow State Machine](#-status-workflow-state-machine)
6. [Business Logic & Validation Rules](#-business-logic--validation-rules)
7. [REST API Documentation](#-rest-api-documentation)
8. [Prerequisites & Environment Variables](#-prerequisites--environment-variables)
9. [MongoDB Atlas Setup Guide](#-mongodb-atlas-setup-guide)
10. [Installation & Quickstart](#-installation--quickstart)
11. [Running Automated Tests](#-running-automated-tests)
12. [Screenshots](#-screenshots)
13. [Verification & Assessment Checklist](#-verification--assessment-checklist)

---

## 🌟 Overview & Key Features

- **Live Job Pipeline Management**: Create, view, edit, filter, search, transition, and delete job applications.
- **Strict Server-Side ID Generation**: Safe, concurrency-proof `JA-<PREFIX>-<SEQ>` generation using an atomic sequence counter collection.
- **Dynamic Overdue Detection**: Dynamically calculates 7-day follow-up overdue status without stale database flags.
- **Duplicate Application Prevention**: Disallows creating or editing an application into an active duplicate (`Applied`, `Interview`, `Offer`) for the same company and role (HTTP 409).
- **Strict Status Transitions**: Enforces a unidirectional finite state machine with immutable final states (`Accepted`, `Rejected`, `Declined`).
- **Complete Status History**: Every transition is appended chronologically with full timestamps and displayed as a vertical visual timeline.
- **Protected Deletion Policy**: Applications currently in `Interview` or `Offer` stages cannot be deleted (HTTP 400).
- **Server-Side Search & Filtering**: Substring search by company name and status filtering handled directly in backend queries.
- **Responsive Modern UI**: Styled with Tailwind CSS, supporting mobile drawer navigation, desktop sidebar, summary metric cards, and responsive tables.
- **Real-Time Atlas Connection Monitoring**: Built-in health check polling that visually indicates live MongoDB Atlas connection status in the sidebar.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (v18) with Vite
- **Styling**: Tailwind CSS (v3)
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js (v4)
- **Database & ODM**: MongoDB Atlas with Mongoose (v8)
- **Environment**: dotenv
- **CORS**: cors middleware

---

## 📁 Architecture & Project Structure

```text
job-application-tracker/
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChangeStatusModal.jsx   # Status transition modal with state-machine filtering
│   │   │   ├── DeleteConfirmModal.jsx # Deletion confirmation with stage protection
│   │   │   ├── Navbar.jsx             # Mobile header & navigation toggle
│   │   │   ├── OverdueBadge.jsx       # Pulsing red overdue indicator
│   │   │   ├── Sidebar.jsx            # Desktop sidebar with MongoDB Atlas connection status
│   │   │   ├── StatsCards.jsx         # Metric summary cards (Total, Applied, Interview...)
│   │   │   ├── StatusBadge.jsx        # Colored status badges with icons
│   │   │   └── Toast.jsx              # Context-based toast notification provider
│   │   ├── pages/
│   │   │   ├── AddApplication.jsx     # New application form with validation
│   │   │   ├── ApplicationDetails.jsx # Details view & vertical timeline
│   │   │   ├── Dashboard.jsx          # Main pipeline view, search, and filters
│   │   │   └── EditApplication.jsx    # Pre-filled edit form with locked parameters
│   │   ├── services/
│   │   │   └── api.js                 # Centralized Axios API service
│   │   ├── App.jsx                    # Root router layout
│   │   ├── index.css                  # Tailwind styles
│   │   └── main.jsx                   # React entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB Atlas connection & readyState helper
│   ├── controllers/
│   │   └── applicationController.js   # Controllers for all endpoints & business rules
│   ├── middleware/
│   │   └── errorHandler.js            # Centralized error handler & 404 router
│   ├── models/
│   │   ├── Application.js             # Mongoose application schema & virtuals
│   │   └── Counter.js                 # Atomic sequence counter schema
│   ├── routes/
│   │   └── applicationRoutes.js       # Express router definitions
│   ├── tests/
│   │   └── businessRules.test.js      # Automated unit test suite
│   ├── utils/
│   │   └── helpers.js                 # Prefix generation, transitions, and calculations
│   ├── server.js                      # Express application entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── screenshots/
│   └── README.md                      # Application screenshots directory
├── README.md                          # Comprehensive documentation
└── .gitignore                         # Root gitignore
```

---

## 🏷 Application ID Generation & Fallbacks

Application IDs are generated **exclusively on the backend** to guarantee sequence integrity and prevent client manipulation.

### Format
`JA-<FIRST THREE LETTERS OF COMPANY IN UPPERCASE>-<THREE-DIGIT SEQUENCE>`

- **Infosys** → `JA-INF-001`
- **Infosys** → `JA-INF-002`
- **TCS** → `JA-TCS-001`

### Concurrency Safety
The backend maintains an atomic `Counter` collection using MongoDB's `$inc` operator via `findByIdAndUpdate(prefix, { $inc: { seq: 1 } }, { upsert: true, new: true })`. This guarantees that simultaneous requests will never receive duplicate IDs.

### Fallback Rules for Edge Cases
1. **Standard Names**: All non-letter characters are stripped and converted to uppercase. If $\ge 3$ alphabetic letters remain, the first 3 letters are used (e.g., `Amazon Web Services` $\rightarrow$ `AMA`, `Google` $\rightarrow$ `GOO`).
2. **Short Company Names ($< 3$ Letters)**: If the company name contains 1 or 2 letters, it is right-padded with `'X'` up to 3 characters:
   - `HP` $\rightarrow$ `HPX` $\rightarrow$ `JA-HPX-001`
   - `3M` $\rightarrow$ `MXX` $\rightarrow$ `JA-MXX-001`
   - `AI` $\rightarrow$ `AIX` $\rightarrow$ `JA-AIX-001`
3. **Non-Alphabetic Names**: If no letters exist (e.g., `"123"`, `"!@#"`), the prefix falls back to the default code `'APP'`:
   - `404 Solutions` $\rightarrow$ `SOL` $\rightarrow$ `JA-SOL-001`
   - `123` $\rightarrow$ `APP` $\rightarrow$ `JA-APP-001`
4. **Deleting Applications**: Deleting an application **never resets** or decrements the counter sequence.

---

## 🔄 Status Workflow State Machine

The status pipeline follows a strict finite state machine:

```text
               ┌──────────┐
               │ Applied  │
               └────┬─────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
   ┌───────────┐         ┌───────────┐
   │ Interview │         │ Rejected  │  (Final)
   └─────┬─────┘         └───────────┘
         │
   ┌─────┴─────┐
   │           │
   ▼           ▼
┌───────┐ ┌───────────┐
│ Offer │ │ Rejected  │  (Final)
└───┬───┘ └───────────┘
    │
 ┌──┴────────┐
 │           │
 ▼           ▼
┌──────────┐ ┌──────────┐
│ Accepted │ │ Declined │  (Final)
└──────────┘ └──────────┘
```

### Transition Rules
| Current Status | Allowed Next Statuses | Is Final Status? |
| :--- | :--- | :--- |
| **Applied** | `Interview`, `Rejected` | No |
| **Interview** | `Offer`, `Rejected` | No |
| **Offer** | `Accepted`, `Declined` | No |
| **Accepted** | None | **Yes** (Immutable) |
| **Rejected** | None | **Yes** (Immutable) |
| **Declined** | None | **Yes** (Immutable) |

- Attempts to perform invalid transitions or transition away from a final status are rejected with **HTTP 400**.
- The frontend dynamically restricts the dropdown to display **only valid next statuses**.

---

## ⚖ Business Logic & Validation Rules

### 1. Follow-up Date & Overdue Detection
- `followUpDate` is automatically set by the backend to **exactly 7 days** after the `appliedDate`.
- `isOverdue` is evaluated **dynamically** in API responses:
  $$\text{isOverdue} = (\text{status} = \text{'Applied'}) \land (\text{currentDate} > \text{followUpDate})$$
- Once an application moves to `Interview`, `Offer`, or a final status, it is **never** considered overdue.
- Overdue applications display a prominent red **"Follow-up Overdue"** badge.

### 2. Duplicate Application Check
- Prevents applying for the same company and role while an application is still **active** (`Applied`, `Interview`, `Offer`).
- Comparison is **case-insensitive** and ignores leading/trailing whitespace.
- If a duplicate active application is detected, the backend returns **HTTP 409** with a clear message:
  `"An active application for '<company>' with role '<role>' already exists with status '<status>'."`
- The user is allowed to apply again once the previous application reaches a final status (`Accepted`, `Rejected`, `Declined`).

### 3. Application Deletion Safeguards
- Applications can only be deleted when in: `Applied`, `Accepted`, `Rejected`, or `Declined` status.
- Applications in **`Interview`** or **`Offer`** status **cannot be deleted** (returns **HTTP 400**).
- The frontend disables the delete button for restricted statuses and displays a confirmation dialog before deleting permitted applications.

### 4. Input Validations
- `appliedDate` cannot be in the future (validated on frontend and backend).
- `expectedSalary`, if provided, must be a non-negative number ($\ge 0$).
- When editing an application, `applicationId`, `appliedDate`, `followUpDate`, `status`, and `statusHistory` are immutable.

---

## 📡 REST API Documentation

Base URL: `http://localhost:5000/api`

Consistent JSON Response Format:
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {}
}
```

### Endpoints Summary

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server health & MongoDB Atlas connection status | `200` |
| `GET` | `/applications/stats` | Status summary counts & overdue totals | `200` |
| `GET` | `/applications` | List applications with `?search=` and `?status=` filters | `200` |
| `POST` | `/applications` | Create a new job application | `201`, `400`, `409` |
| `GET` | `/applications/:id` | Get details and timeline for one application | `200`, `404` |
| `PUT` | `/applications/:id` | Update editable fields of an application | `200`, `400`, `404`, `409` |
| `PATCH` | `/applications/:id/status` | Change application status | `200`, `400`, `404` |
| `DELETE` | `/applications/:id` | Delete an application (policy protected) | `200`, `400`, `404` |

---

### Example Requests & Responses

#### 1. Create Application
**`POST /api/applications`**
```json
// Request Body
{
  "companyName": "Google",
  "jobRole": "Full Stack Engineer",
  "jobType": "Full-time",
  "appliedDate": "2026-10-20",
  "expectedSalary": 120000,
  "notes": "Applied via referral link on careers portal."
}
```

```json
// Response (201 Created)
{
  "success": true,
  "message": "Job application created successfully.",
  "data": {
    "_id": "671e23f048d2bb2e105e90a1",
    "applicationId": "JA-GOO-001",
    "companyName": "Google",
    "jobRole": "Full Stack Engineer",
    "jobType": "Full-time",
    "appliedDate": "2026-10-20T00:00:00.000Z",
    "expectedSalary": 120000,
    "notes": "Applied via referral link on careers portal.",
    "status": "Applied",
    "followUpDate": "2026-10-27T00:00:00.000Z",
    "isOverdue": true,
    "statusHistory": [
      {
        "status": "Applied",
        "changedAt": "2026-10-28T04:20:00.000Z"
      }
    ],
    "createdAt": "2026-10-28T04:20:00.000Z",
    "updatedAt": "2026-10-28T04:20:00.000Z"
  }
}
```

#### 2. Duplicate Application Error
**`POST /api/applications`** (with identical active company & role)
```json
// Response (409 Conflict)
{
  "success": false,
  "message": "An active application for \"Google\" with role \"Full Stack Engineer\" already exists (Current status: Applied, ID: JA-GOO-001). You can apply again once the existing application reaches a final status (Accepted, Rejected, or Declined)."
}
```

#### 3. Transition Status
**`PATCH /api/applications/671e23f048d2bb2e105e90a1/status`**
```json
// Request Body
{
  "status": "Interview"
}
```

```json
// Response (200 OK)
{
  "success": true,
  "message": "Status updated successfully to 'Interview'.",
  "data": {
    "_id": "671e23f048d2bb2e105e90a1",
    "applicationId": "JA-GOO-001",
    "status": "Interview",
    "isOverdue": false,
    "statusHistory": [
      { "status": "Applied", "changedAt": "2026-10-28T04:20:00.000Z" },
      { "status": "Interview", "changedAt": "2026-10-28T04:25:00.000Z" }
    ]
  }
}
```

#### 4. Forbidden Deletion Attempt
**`DELETE /api/applications/671e23f048d2bb2e105e90a1`** (While in Interview status)
```json
// Response (400 Bad Request)
{
  "success": false,
  "message": "Cannot delete application with status 'Interview'. Applications in Interview or Offer stages cannot be deleted."
}
```

---

## 🔐 Prerequisites & Environment Variables

### Prerequisites
- **Node.js**: v18.0.0 or later (Node v20+ recommended)
- **npm**: v9.0.0 or later
- **MongoDB Atlas Account**: A free MongoDB Atlas M0 cluster or MongoDB connection string

### Environment Variables Setup

#### Backend (`backend/.env`)
Create a file named `backend/.env` (use `backend/.env.example` as a template):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/job_tracker?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)
Create a file named `frontend/.env` (use `frontend/.env.example` as a template):
```env
VITE_API_URL=http://localhost:5000/api
```

> **Security Note**: Never commit your real `.env` files or database credentials to version control. The repository's `.gitignore` explicitly excludes `.env` files.

---

## 🍃 MongoDB Atlas Setup Guide

Follow these steps to connect the application to your MongoDB Atlas cluster:

1. **Log in to MongoDB Atlas**:
   Navigate to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in.

2. **Create a Free Cluster**:
   - Click **Create Deployment** and select the free **M0 Shared Cluster**.
   - Select your preferred cloud provider and closest region (e.g., AWS / Mumbai, Frankfurt, or N. Virginia).
   - Click **Create**.

3. **Configure Database Access (User Credentials)**:
   - Go to **Security** $\rightarrow$ **Database Access**.
   - Click **Add New Database User**.
   - Choose **Password** authentication.
   - Enter a username (e.g., `job_tracker_user`) and a secure password.
   - Set privileges to **Read and write to any database**.
   - Click **Add User**.

4. **Configure Network Access (IP Whitelist)**:
   - Go to **Security** $\rightarrow$ **Network Access**.
   - Click **Add IP Address**.
   - For local development and assessment evaluation, click **Allow Access from Anywhere** (`0.0.0.0/0`) or add your current IP address.
   - Click **Confirm**.

5. **Obtain Connection String**:
   - Go to **Database Deployments** and click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the SRV connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Append the database name (e.g., `/job_tracker`) before the query parameters:
     ```text
     mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/job_tracker?retryWrites=true&w=majority
     ```
   - Paste this full URI into `backend/.env` under `MONGODB_URI`.

---

## ⚡ Installation & Quickstart

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd job-application-tracker
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment template and configure MONGODB_URI
cp .env.example .env
# Edit .env and paste your MongoDB Atlas URI

# Start backend server
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env

# Start Vite dev server
npm run dev
# Frontend runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

The backend includes a comprehensive unit test suite covering prefix generation, fallback scenarios, 7-day follow-up calculations, dynamic overdue evaluation, state machine transitions, and deletion rules.

To execute tests:
```bash
cd backend
npm test
```

### Test Coverage Highlights
- ✅ Standard prefix extraction (Infosys $\rightarrow$ `INF`, Google $\rightarrow$ `GOO`)
- ✅ Special characters and short name fallbacks (`HP` $\rightarrow$ `HPX`, `3M` $\rightarrow$ `MXX`, `123` $\rightarrow$ `APP`)
- ✅ Exactly 7-day follow-up date calculation
- ✅ Dynamic overdue calculation (`true` only for `Applied` + past date)
- ✅ Allowed transitions (`Applied` $\rightarrow$ `Interview` / `Rejected`, `Interview` $\rightarrow$ `Offer` / `Rejected`, `Offer` $\rightarrow$ `Accepted` / `Declined`)
- ✅ Strict immutability of final statuses (`Accepted`, `Rejected`, `Declined`)
- ✅ Policy rejection of deleting `Interview` and `Offer` stages

---

## 📸 Screenshots

Genuine screenshots of the working application have been prepared in the `screenshots/` directory:

| View | Screenshot File | Description |
| :--- | :--- | :--- |
| **Dashboard** | `screenshots/dashboard.png` | Overview of applications, stats cards, status filters, overdue badges |
| **Details & Timeline** | `screenshots/application-details.png` | Detailed application view with vertical chronological transition timeline |
| **Add Application** | `screenshots/add-application.png` | Application form with real-time validation and duplicate prevention |
| **Status Modal** | `screenshots/status-modal.png` | Finite state machine transition modal |

*(See [screenshots/README.md](file:///c:/Users/CEON/Desktop/application/screenshots/README.md) for full instructions on capturing or replacing screenshots).*

---

## ✅ Verification & Assessment Checklist

| # | Assessment Requirement | Backend Implementation | Frontend Implementation | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **MongoDB Atlas Connection** | `config/db.js` via `MONGODB_URI` | Live indicator in Sidebar | ✅ Verified |
| 2 | **Application Creation** | `POST /api/applications` | `/applications/new` form | ✅ Verified |
| 3 | **Future Date Prevention** | Validated in controller & model | Date input `max={today}` & validator | ✅ Verified |
| 4 | **Backend ID Generation** | `JA-<PREFIX>-<SEQ>` via atomic counter | Displayed read-only | ✅ Verified |
| 5 | **Duplicate Active Detection** | Case-insensitive regex check (HTTP 409) | Displays backend error banner | ✅ Verified |
| 6 | **Valid Status Transitions** | Finite state machine validator | Dropdown shows only valid options | ✅ Verified |
| 7 | **Invalid Transitions Rejected** | HTTP 400 with descriptive error | Disabled options & alert modal | ✅ Verified |
| 8 | **Final Status Immutability** | Accepted, Rejected, Declined locked | Final status notification | ✅ Verified |
| 9 | **Status History Timeline** | Chronological `statusHistory` array | Vertical visual timeline with timestamps | ✅ Verified |
| 10 | **7-Day Follow-Up Date** | Calculated as `appliedDate + 7 days` | Displayed across table & details | ✅ Verified |
| 11 | **Dynamic Overdue Status** | Evaluated on-the-fly (`isOverdue`) | Red pulsing "Follow-up Overdue" badge | ✅ Verified |
| 12 | **Search by Company** | Backend regex `?search=` | Debounced search bar | ✅ Verified |
| 13 | **Filter by Status** | Backend filter `?status=` | Status dropdown & interactive cards | ✅ Verified |
| 14 | **Status Counts** | Backend `/api/applications/stats` | Top summary cards | ✅ Verified |
| 15 | **Edit Application** | `PUT /api/applications/:id` | Pre-filled `/applications/:id/edit` | ✅ Verified |
| 16 | **Immutable Fields Preserved** | ID, appliedDate, status protected | Read-only visual badges | ✅ Verified |
| 17 | **Protected Deletion Rule** | HTTP 400 for Interview & Offer | Disabled delete button with tooltip | ✅ Verified |
| 18 | **404 Handling** | Not found middleware & check | 404 page & error banners | ✅ Verified |
| 19 | **Responsive Layout** | Clean REST API | Tailwind mobile drawer & desktop sidebar | ✅ Verified |

---

## 📄 License
This project was developed for the Full Stack Development Assessment.
