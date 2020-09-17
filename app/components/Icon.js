import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import amber from '@material-ui/core/colors/amber';
import green from '@material-ui/core/colors/green';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import theme from "../theme";
import {
    Box,
    Card,
    Image,
    Heading,
    Text,
    Flex,
} from 'rebass';

const useStyles = makeStyles(theme => ({
    left: {
        marginRight: theme.spacing(2),
    },
    right: {
        marginLeft: theme.spacing(2),
    },
    warning: {
        color: amber[700],
    },
    error: {
        color: theme.palette.error.dark,
    },
    red: {
        color: theme.palette.error.dark,
    },
    primary: {
        color: theme.palette.primary.main,
    },
    green: {
        color: green[600]
    },
    white: {
        color: theme.palette.common.white,
    }
}));

const Icon = (props) => {
    const { position, icon, color, size = 'sm', prefix, spinner, willSpin, ...rest} = props;
    let { sx } = props;
    const classes = useStyles();

    let className = [classes[position], classes[color], rest.className];
    className = className.filter(Boolean);

    if (willSpin) {
        sx = { ...sx, display: 'block' }; // Used to prevent "wobble": https://fontawesome.com/how-to-use/on-the-web/styling/animating-icons
    }

    return (
        <Box sx={sx} as={'span'}>
            {/* Above it's important to keep the inline properties intact */}
            <FontAwesomeIcon
                className={className.join(' ')}
                icon={[ prefix ? prefix : 'fas', icon ]}
                size={ size }
                color={ color ? theme.colors[color] : 'white' }
                { ...rest }
            />
        </Box>
    );
};

export default Icon;
