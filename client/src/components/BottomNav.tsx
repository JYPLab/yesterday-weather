import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';

const tabs = [
  { path: '/', icon: 'home', label: '홈' },
  { path: '/', icon: 'notifications_active', label: '알림' },
  { path: '/settings', icon: 'settings', label: '설정' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 w-full max-w-[375px] flex justify-around items-center h-20 px-8 pb-4 bg-surface/70 backdrop-blur-xl z-50 rounded-t-[2rem] shadow-[0px_-10px_30px_rgba(25,28,30,0.04)]">
      {tabs.map((tab) => {
        const isActive =
          tab.label === '설정'
            ? location.pathname === '/settings'
            : tab.label === '알림'
              ? location.pathname === '/'
              : false;

        return (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center transition-transform active:scale-90 ${
              isActive ? 'text-primary' : 'text-outline-variant'
            }`}
          >
            <Icon name={tab.icon} filled={isActive} className="text-2xl" />
            <span className="font-headline font-medium text-[10px] mt-1">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
