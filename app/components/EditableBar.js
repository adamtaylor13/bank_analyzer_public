import React, {useState, useEffect} from 'react';
import {
    Box,
    Card,
    Image,
    Heading,
    Text,
    Flex,
} from 'rebass';
import { Input, Label, Select, Textarea } from '@rebass/forms';
import Icon from "./Icon";

const EditableBar = (props) => {
    const { disabled, children, prefix, danger, flex, type, ...rest } = props;

    let sx = {
        position: 'relative',
        backgroundColor: danger ? 'danger' : 'midnightOff',
        fontSize: '1.2rem'
    };

    if (flex) {
        sx = {...sx, display: 'flex', justifyContent: 'space-between'};
    }

    return (
        <Box
            px={3}
            py={3}
            mb='1px'
            sx={sx}
            { ...rest }
        >
            { children }
            { (disabled || danger || flex)  ? null : (
                <Box
                    sx={{
                        position: 'absolute',
                        right: 3,
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                >
                    <Icon icon={props.icon ? props.icon : 'chevron-right'} size={'lg'} prefix={ prefix ? prefix : '' }/>
                </Box>
            ) }
        </Box>
    );
};

export default EditableBar;
