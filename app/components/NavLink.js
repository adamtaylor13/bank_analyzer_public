import React, {useState, useEffect} from 'react';
import {Box} from 'rebass';
import theme from "../theme";
import { NavLink as RouterNavLink } from "react-router-dom";

const NavLink = (props) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: theme.space[3],
                paddingRight: theme.space[3],
                height: 50,
                textDecoration: 'none',
                color: theme.colors.lightgray,
                position: 'relative',
                fontSize: '1rem',
                '&.active': {
                    backgroundColor: theme.colors.midnightOff,
                    color: theme.colors.tangelo,
                    '& > svg': {
                        color: theme.colors.tangelo,
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        width: 5,
                        backgroundColor: theme.colors.tangelo,
                        height: '100%',
                        left: 0,
                    }
                },
                '& > svg': {
                    color: theme.colors.granite,
                },
            }}
            as={RouterNavLink}
            {...props}
        >
            {props.children}
        </Box>
    );
};

export default NavLink;
