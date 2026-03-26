import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface Props {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  trailing?: React.ReactNode;
}

export default function TopAppBar({ title, showBack = false, onBack, trailing }: Props) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface flex items-center px-6 h-16">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={handleBack}
              className="hover:bg-surface-container-low transition-colors p-2 rounded-full -ml-2 active:scale-95 duration-200"
            >
              <Icon name="arrow_back" className="text-primary" />
            </button>
          )}
          <h1 className="font-headline font-bold tracking-tight text-lg text-on-surface">
            {title}
          </h1>
        </div>
        {trailing}
      </div>
    </header>
  );
}
