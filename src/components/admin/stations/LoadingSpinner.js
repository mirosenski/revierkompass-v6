import { jsx as _jsx } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
export const LoadingSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-12 w-12'
    };
    return (_jsx(Loader2, { className: `animate-spin ${sizeClasses[size]}` }));
};
