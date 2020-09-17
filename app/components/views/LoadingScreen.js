import React from 'react';
import {
    Box,
    Card,
    Image,
    Heading,
    Text,
    Flex,
    Button,
} from 'rebass';
import { Input, Label, Select, Textarea, Radio } from '@rebass/forms';

const Loading = props => {
    return (
        <Flex alignItems='center' justifyContent='center' sx={{ height: '100vh', bg: 'midnight', color: 'white' }}>
            <Heading>Loading</Heading>
        </Flex>
    );
};

export default Loading;
