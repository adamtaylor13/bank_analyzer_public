import React from 'react';
import {Box} from 'rebass';


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
