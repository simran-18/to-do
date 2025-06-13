import { toast } from 'react-toastify';

export const showSuccessToast = (message) => {
  toast.dismiss();  // remove all existing toasts
  toast.success(message);
};

export const showErrorToast = (message) => {
  toast.dismiss();  // remove all existing toasts
  toast.error(message);
};

export const showInfoToast = (message) => {
  toast.dismiss();  // remove all existing toasts
  toast.info(message);
};
