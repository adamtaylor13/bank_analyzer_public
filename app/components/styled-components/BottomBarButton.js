import React from 'react';
import {Button} from 'rebass';

const BottomBarButton = (props) => {
    return (
        <Button
            sx={{ position: 'fixed', height: '70px', bottom: 0, width: '100%', paddingBottom: '50px', bg: 'successGreen', fontSize: '1.2rem' }}
            {...props}>
            { props.children }
        </Button>
    );
};

export default BottomBarButton;
