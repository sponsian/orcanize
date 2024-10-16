import React from 'react';
import { Flex, Text, Button } from 'ui';

interface UnsupportedNetworkProps {
    switchToMainnet: () => void
}


const UnsupportedNetwork: React.FC<UnsupportedNetworkProps> = ({switchToMainnet}) => {
    return (
        <Flex 
            column 
            css={{ gap: '$md' }}>
            <Text 
                variant="formError">Please switch to Reef Chain Mainnet</Text>
            <Button 
                color="cta" 
                fullWidth 
                onClick={switchToMainnet}>Switch to Reef Chain Mainnet</Button>
        </Flex>
    )
}


export default UnsupportedNetwork;