import toast from 'react-hot-toast';

const notify = {
    success: (message, options = {}) => toast.success(message, options),
    error: (message, options = {}) => toast.error(message, options),
    loading: (message, options = {}) => toast.loading(message, options),
    dismiss: (toastId) => toast.dismiss(toastId),
    promise: (promise, messages, options = {}) => toast.promise(promise, messages, options),
    custom: (component, options = {}) => toast.custom(component, options),
};

export { notify };
export { default as NotificationContainer } from './NotificationContainer';
