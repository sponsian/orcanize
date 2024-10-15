import React from 'react';
import { CircularProgress } from "@material-ui/core";
import { Button, Flex } from 'ui';

interface LoadingStateProps {
    cancelConnection: () => void;
}


const LoadingState: React.FC<LoadingStateProps> = ({cancelConnection}) => {
    return <Flex column css={{ justifyContent: 'center', width: '100%' }}>
        <CircularProgress 
            className="spinner-wallet-auth-modal"
            style={{margin: 'auto', marginBottom: '2vh', marginTop: '2vh'}}/>
        <Button
            onClick={cancelConnection}>Cancel Connection</Button>
    </Flex>
}


export default LoadingState;