import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PhoneContainerProps {
  children: ReactNode;
  onClose?: () => void;
}

export const PhoneContainer = ({ children, onClose }: PhoneContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Phone Container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="relative w-full max-w-[412px] h-[892px] mx-auto bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden
          sm:h-[85vh] sm:max-h-[892px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Status Bar */}
        <div className="absolute top-0 inset-x-0 h-7 bg-gray-900 flex items-center justify-between px-6">
          <div className="text-xs text-gray-400">9:41</div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>
            </svg>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z"/>
            </svg>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-9 right-4 z-50 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Content */}
        <div className="h-full pt-8 overflow-hidden">
          {children}
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-900" />
      </motion.div>
    </motion.div>
  );
}; 