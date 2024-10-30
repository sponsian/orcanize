import React from 'react';
import { Flex, Box, Button, Text } from 'ui';
import { ReefSigner } from '@reef-chain/react-lib';
import AccountDisplay from './AccountDisplay';


interface AccountSelectorProps {
    signers: ReefSigner[];
    selectAccount: (accountAddress: string) => void;
    setSelExtensionName: (name: string | undefined) => void
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ signers, selectAccount, setSelExtensionName}) => {
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
                                selectAccount={() => selectAccount(signer.address)}/>
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


export default AccountSelector