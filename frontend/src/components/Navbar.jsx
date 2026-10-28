import React from 'react';
import { Menu, Plus, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onOpenMobile }) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 text-sm tracking-tight">
            Job Tracker
          </span>
        </Link>
      </div>

      <Link
        to="/applications/new"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add</span>
      </Link>
    </header>
  );
};

export default Navbar;
