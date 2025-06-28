import React from 'react';
export declare class ErrorBoundary extends React.Component<{
    children: React.ReactNode;
}, {
    hasError: boolean;
    error: any;
}> {
    constructor(props: {
        children: React.ReactNode;
    });
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
        error: any;
    };
    render(): string | number | boolean | import("react/jsx-runtime").JSX.Element | Iterable<React.ReactNode>;
}
