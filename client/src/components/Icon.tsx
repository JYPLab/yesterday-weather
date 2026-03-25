import React from 'react';

interface Props {
  name: string;
  filled?: boolean;
  className?: string;
}

export default function Icon({ name, filled, className = '' }: Props) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}
