import React from 'react';
interface Step2CommandDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCommand: (command: string) => void;
    commands: Array<{
        key: string;
        label: string;
        description: string;
        icon: React.ComponentType<any>;
    }>;
}
declare const Step2CommandDialog: React.FC<Step2CommandDialogProps>;
export default Step2CommandDialog;
