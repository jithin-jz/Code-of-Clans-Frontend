import { toast } from 'sonner';

export const notify = {
    success: (message, options = {}) => {
        if (options.description) return toast.success(message, options);
        return toast.success("Success", { description: message, ...options });
    },
    error: (message, options = {}) => {
        if (options.description) return toast.error(message, options);
        return toast.error("Error", { description: message, ...options });
    },
    loading: (message, options = {}) => {
        if (options.description) return toast.loading(message, options);
        return toast.loading("Loading...", { description: message, ...options });
    },
    info: (message, options = {}) => {
        if (options.description) return toast.info(message, options);
        return toast.info("Information", { description: message, ...options });
    },
    warning: (message, options = {}) => {
        if (options.description) return toast.warning(message, options);
        return toast.warning("Warning", { description: message, ...options });
    },
    dismiss: (toastId) => toast.dismiss(toastId),
    promise: (promise, messages, options = {}) => toast.promise(promise, messages, options),
    custom: (jsx, options = {}) => toast.custom(jsx, options),
};
export { default as NotificationContainer } from './NotificationContainer';
