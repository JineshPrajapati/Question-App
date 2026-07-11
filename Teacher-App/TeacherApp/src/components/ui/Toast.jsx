import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast container component to be used in App.jsx
export const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

// Toast utility functions
export const showToast = {
  success: (message) => {
    toast.success(message, {
      icon: '✅'
    });
  },
  error: (message) => {
    toast.error(message, {
      icon: '❌'
    });
  },
  warning: (message) => {
    toast.warning(message, {
      icon: '⚠️'
    });
  },
  info: (message) => {
    toast.info(message, {
      icon: 'ℹ️'
    });
  },
  promise: async (promise, messages = {}) => {
    return toast.promise(promise, {
      pending: messages.pending || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred'
    });
  }
}; 