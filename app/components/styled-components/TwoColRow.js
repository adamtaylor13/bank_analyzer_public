import React from 'react';
import {Text, Flex,} from 'rebass';

const TwoColRow = (props) => {
    return (
        <Flex justifyContent={'space-between'} alignItems={'center'}>
            <Text fontSize={'1.2rem'}>{ props.col1 }</Text>
            <Text fontSize={'1.2rem'}>{ props.col2 }</Text>
        </Flex>
    )
};

export default TwoColRow;
