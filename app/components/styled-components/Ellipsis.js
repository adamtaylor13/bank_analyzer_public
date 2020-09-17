import React, {useState, useEffect} from 'react';
import {
    Box,
    Card,
    Image,
    Heading,
    Text,
    Flex
} from 'rebass';


const Ellipsis = (props) => {
    return (
        <Box
            whiteSpace='nowrap'
            textOverflow='ellipsis'
            overflow='hidden'
            minWidth={props.minWidth}
        >
            {props.children}
        </Box>
    );
};

export default Ellipsis;
