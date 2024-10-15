import React from 'react';
import { Flex, Box, Button, Text } from 'ui';
import { ReefSigner } from '@reef-chain/react-lib';
import AccountDisplay from './AccountDisplay';


interface AccountSelectionProps {
    signers: ReefSigner[];
    selectAccount: () => void;
    setSelExtensionName: (name: string | undefined) => void
}

const AccountSelection: React.FC<AccountSelectionProps> = ({ signers, selectAccount, setSelExtensionName}) => {
    return (
        <Box 
            css={{ width: '$full'}}>
            <Flex 
                column 
                css={{ width: '$full', gap: '$md'}}>
                {
                    signers && signers.map((signer) => (
                        <Flex 
                            row 
                            key={signer.address} 
                            css={{ justifyContent: 'center'}}>
                            <AccountDisplay 
                                signer={signer} 
                                selectAccount={selectAccount}/>
                        </Flex>
                    ))
                }
                <Button 
                    variant="wallet" 
                    fullWidth 
                    css={{ justifyContent: 'center', margin: 'auto' }}
                    onClick={() => setSelExtensionName(undefined)}>Switch Wallet</Button>
            </Flex>
        </Box>
    )
}


export default AccountSelection