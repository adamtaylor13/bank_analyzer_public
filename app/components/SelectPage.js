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
import Navbar from "./Navbar";

const SelectPage = (props) => {
    console.log('props.options', props.options);
    return (
        <Box sx={{
            overflow: 'hidden'
        }}>
            <Box
                sx={{
                    position: 'fixed',
                    right: 0,
                    left: 0,
                    top: 0,
                    bottom: 0,
                    height: '100vh',
                    zIndex: 1201,
                    transition: '0.3s transform ease',
                    transform: props.trigger ? 'translateX(0)' : 'translateX(100%)',
                    backgroundColor: 'midnight',
                    overflowY: 'scroll'
                }}
            >
                <Navbar label={props.label}
                        navIcon='chevron-left'
                        onNavIconClick={() => props.back()}
                >
                    { props.options.map((o,idx) => (
                        <Box
                            p={3}
                            mb='1px'
                            key={idx}
                        >
                            { o }
                        </Box>
                    )) }
                </Navbar>
            </Box>
        </Box>
    );
};

export default SelectPage;
