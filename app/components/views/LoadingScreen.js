import React from 'react';
import {Flex, Heading,} from 'rebass';

const Loading = props => {
    return (
        <Flex alignItems='center' justifyContent='center' sx={{ height: '100vh', bg: 'midnight', color: 'white' }}>
            <Heading>Loading</Heading>
        </Flex>
    );
};

export default Loading;
