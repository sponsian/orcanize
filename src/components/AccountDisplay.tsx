import React from 'react';
import { Flex, Text, Button } from 'ui';
import { ReefSigner } from '@reef-chain/react-lib';
import { shortenAddress } from '../utils/walletHelper';


interface AccountDisplayProps {
    signer: ReefSigner;
    selectAccount: () => void
}


const AccountDisplay: React.FC<AccountDisplayProps> = ({ signer, selectAccount}) => {
    return (
        <Flex 
            row 
            css={{ justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 84 84">
                      <path 
                        fill="#5b5b5b" 
                        d="M25 7L43 7L43 16ZM61 7L61 25L52 25ZM61 79L43 79L43 70ZM25 79L25 61L34 61ZM7 25L25 25L25 34ZM79 25L79 43L70 43ZM79 61L61 61L61 52ZM7 61L7 43L16 43Z">
                      </path>
                      <path 
                        fill="#eaeaea" 
                        d="M10 16a6,6 0 1,1 12,0a6,6 0 1,1 -12,0M64 16a6,6 0 1,1 12,0a6,6 0 1,1 -12,0M64 70a6,6 0 1,1 12,0a6,6 0 1,1 -12,0M10 70a6,6 0 1,1 12,0a6,6 0 1,1 -12,0">
                      </path>
                      <path 
                        fill="#9d84d6" 
                        d="M25 25L43 25L43 43L25 43ZM31.5 36.2a4.7,4.7 0 1,0 9.4,0a4.7,4.7 0 1,0 -9.4,0M61 25L61 43L43 43L43 25ZM45.2 36.2a4.7,4.7 0 1,0 9.4,0a4.7,4.7 0 1,0 -9.4,0M61 61L43 61L43 43L61 43ZM45.2 49.8a4.7,4.7 0 1,0 9.4,0a4.7,4.7 0 1,0 -9.4,0M25 61L25 43L43 43L43 61ZM31.5 49.8a4.7,4.7 0 1,0 9.4,0a4.7,4.7 0 1,0 -9.4,0">
                      </path>
                    </svg>     
            <Flex 
                column 
                css={{ justifyContent: 'center', marginLeft: '0.5vw' }}>
                <Text 
                    size="small" 
                    css={{ marginBottom: '1vh' }}>{signer.name}</Text>
                <Text 
                    size="small">Native address: {shortenAddress(signer.address)}</Text>
                 
            </Flex>
            <Button 
                    variant="wallet" 
                    css={{ justifyContent: 'center', marginTop: '2vh' }} 
                    onClick={selectAccount}>Select</Button>   
        </Flex>
    )
}

export default AccountDisplay
