import React from 'react';
import {Box} from 'rebass';

const PaperBox = (props) => {
    return (
        <Box bg={ props.dark ? 'midnight' : 'midnightOff'} p={3} sx={{ borderRadius: '5x'}} {...props}>
            { props.children }
        </Box>
    );
};

export default PaperBox;
