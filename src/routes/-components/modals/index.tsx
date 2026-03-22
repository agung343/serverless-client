import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEsc);
    return () => removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-20 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}>
          <div
            className="
          fixed
          top-6 left-6
          transform
          transition-all duration-300 ease-out
          translate-x-0 translate-y-0 scale-95 opacity-0
          data-[open=true]:top-1/2
          data-[open=true]:left-1/2
          data-[open=true]:-translate-x-1/2
          data-[open=true]:-translate-y-1/2
          data-[open=true]:scale-100
          data-[open=true]:opacity-100
        "
            data-open={open}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative z-10 w-full min-w-md rounded-lg bg-white p-6 shadow-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
