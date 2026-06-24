import React from "react";

interface LoadingOverlayProps {
  show: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div
      className={`position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center`}
      style={{ zIndex: 1050, backgroundColor: "rgba(0,0,0,0.5)", }}
    >
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Đang xử lý...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
