import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddApplication from './pages/AddApplication';
import ApplicationDetails from './pages/ApplicationDetails';
import EditApplication from './pages/EditApplication';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
    <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <HelpCircle className="w-7 h-7" />
    </div>
    <h2 className="text-xl font-bold text-slate-900 mb-2">Page Not Found</h2>
    <p className="text-sm text-slate-500 mb-6">
      The page you are looking for does not exist or has been moved.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Return to Dashboard</span>
    </Link>
  </div>
);

export const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <Router>
        <div className="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
          {/* Sidebar */}
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          {/* Main content wrapper */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Navbar */}
            <Navbar onOpenMobile={() => setIsMobileMenuOpen(true)} />

            {/* Viewport content */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/applications/new" element={<AddApplication />} />
                <Route path="/applications/:id" element={<ApplicationDetails />} />
                <Route path="/applications/:id/edit" element={<EditApplication />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
