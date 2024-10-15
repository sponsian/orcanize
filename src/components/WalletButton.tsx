import React from 'react';
import { Button } from 'ui';

interface WalletButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}


const WalletButton: React.FC<WalletButtonProps> = ({onClick, icon, label}) => {
    return (
    <Button
        variant="wallet"
        fullWidth
        onClick={onClick}>
        {label}
        {icon}
    </Button>
    )
}


export default WalletButton;