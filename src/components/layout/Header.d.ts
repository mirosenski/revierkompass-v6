import React from 'react';
interface HeaderProps {
    onAdminLogin: () => void;
    onBackToWizard: () => void;
    onGoToAdmin?: () => void;
    currentView: 'wizard' | 'login' | 'admin';
}
declare const Header: React.FC<HeaderProps>;
export default Header;
