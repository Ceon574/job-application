# 📸 Application Screenshots

This directory is designated for storing genuine screenshots of the Job Application Tracker application.

### Recommended Screenshots:
1. **`dashboard.png`**: The main Job Application Tracker dashboard showing:
   - Summary statistics cards (Total, Applied, Interview, Offer, Accepted, Rejected, Declined, Follow-up Overdue)
   - Search bar and status filter dropdown
   - Responsive applications table with badges (Status, Follow-up Overdue)
   - Action buttons (View Details, Edit, Change Status, Delete)
   - MongoDB Atlas connection indicator in the sidebar

2. **`application-details.png`**: The single application details view displaying:
   - Application ID badge and company banner
   - Applied date, follow-up date, expected salary, and notes
   - The vertical chronological status transition history timeline with dates and times

3. **`add-application.png`**: The Add Application form with validation rules and error states.

4. **`status-transition-modal.png`**: The status transition dialog enforcing the finite state machine.

### How to Capture & Update:
1. Start the backend (`cd backend && npm start`) and frontend (`cd frontend && npm run dev`).
2. Open `http://localhost:5173` in your browser.
3. Use your OS screenshot tool (`Win + Shift + S` on Windows, or browser DevTools screenshot) to capture the application views.
4. Save the image files directly into this `screenshots/` directory.
