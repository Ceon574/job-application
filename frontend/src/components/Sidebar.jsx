import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Database,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { getHealth } from '../services/api';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const [dbStatus, setDbStatus] = useState({ isConnected: false, checking: true });

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await getHealth();
        setDbStatus({
          isConnected: res?.data?.database?.isConnected || false,
          checking: false,
          dbName: res?.data?.database?.databaseName || 'Atlas',
        });
      } catch (err) {
        setDbStatus({ isConnected: false, checking: false });
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/applications/new',
      label: 'Add Application',
      icon: PlusCircle,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white p-5 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
            Job Tracker
          </h1>
          <span className="text-xs text-indigo-300 font-medium tracking-wide">
            Full Stack MERN
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div className="space-y-1.5 flex-1">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* System info / MongoDB Atlas Status Card */}
      <div className="pt-4 border-t border-slate-800">
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              MongoDB Atlas
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus.checking
                  ? 'bg-amber-400 animate-pulse'
                  : dbStatus.isConnected
                  ? 'bg-emerald-400'
                  : 'bg-rose-400'
              }`}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {dbStatus.checking
              ? 'Checking status...'
              : dbStatus.isConnected
              ? 'Connected & Active'
              : 'Disconnected (Check .env)'}
          </div>
        </div>

        <div className="mt-3 px-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> v1.0.0
          </span>
          <span>Final Assessment</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full shadow-2xl z-10 animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
