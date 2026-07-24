import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Wrapper around react-hot-toast for consistent usage across the app
 */

export const showToast = {
  /**
   * Show a success toast notification
   */
  success: (message: string) => {
    toast.success(message);
  },

  /**
   * Show an error toast notification
   */
  error: (message: string) => {
    toast.error(message);
  },

  /**
   * Show a loading toast notification
   * Returns a toast id that can be used to dismiss or update the toast
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Show a custom toast notification
   */
  custom: (message: string) => {
    toast(message);
  },

  /**
   * Show a promise-based toast notification
   * Automatically shows loading, success, and error states
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },

  /**
   * Dismiss a specific toast by id
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};

export default showToast;
