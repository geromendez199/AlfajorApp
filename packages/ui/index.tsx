import React from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = 'primary',
  ...props
}) => {
  const styles = {
    primary: 'bg-primary text-ivory hover:bg-primary-dark',
    secondary: 'bg-secondary text-ivory hover:bg-primary',
    ghost: 'bg-transparent border border-primary text-primary hover:bg-ivory'
  };
  return (
    <button
      className={clsx(
        'rounded-lg px-4 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ title, children, className }) => (
  <div className={clsx('rounded-xl border border-primary/10 bg-white p-4 shadow-sm', className)}>
    {title && <h3 className="mb-2 text-lg font-semibold text-primary">{title}</h3>}
    {children}
  </div>
);

export const PageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children
}) => (
  <div className="min-h-screen bg-ivory text-charcoal">
    <header className="border-b border-primary/10 bg-white px-6 py-4 shadow-sm">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
  </div>
);
