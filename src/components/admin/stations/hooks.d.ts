import { StationFormData } from './types';
export declare const useFormValidation: (formData: StationFormData) => {
    errors: Record<string, string>;
    isValid: boolean;
};
