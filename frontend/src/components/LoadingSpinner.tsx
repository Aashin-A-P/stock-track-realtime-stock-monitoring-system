// components/LoadingSpinner.tsx
import React from "react";

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-4">
    {/* increase animation speed from 1s to 1.5s */}
    <style>{`
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
        .animation-spin {
            animation: spin 1.5s linear infinite;
        }
    `}</style>

    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default LoadingSpinner;
