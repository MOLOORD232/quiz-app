import React from 'react';
import 'tailwindcss/tailwind.css';

const Button = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <button
    className={`inline-flex items-center justify-center rounded-md font-medium transition-colors 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
    disabled:pointer-events-none disabled:opacity-50 
    bg-blue-500 text-white hover:bg-blue-600 h-10 px-4 py-2 ${className}`}
    ref={ref}
    {...props}
  >
    {children}
  </button>
));
Button.displayName = 'Button';

const Card = ({ className = '', ...props }) => (
  <div
    className={`rounded-lg border bg-white shadow-sm p-4 ${className}`}
    {...props}
  />
);

export { Button, Card };

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
