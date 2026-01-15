import { toast } from 'sonner';

export const notify = {
    success: (message, options = {}) => toast.success(message, options),
    error: (message, options = {}) => toast.error(message, options),
    loading: (message, options = {}) => toast.loading(message, options),
    info: (message, options = {}) => toast.info(message, options),
    warning: (message, options = {}) => toast.warning(message, options),
    dismiss: (toastId) => toast.dismiss(toastId),
    promise: (promise, messages, options = {}) => toast.promise(promise, messages, options),
};
export { default as NotificationContainer } from './NotificationContainer';
