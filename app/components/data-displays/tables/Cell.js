import React from 'react';
import {Box} from 'rebass';


const Cell = (props) => {

    const { isDollarCell, applyCorrelation, isMobile, dispatch, noRender, emptyDisplay, transform, ...rest } = props;
    let passedProps = { ...rest };

    if (transform) {
        passedProps.value = transform(passedProps.value);
    }

    return (
        <Box
            p={2}
            maxWidth={180}
            overflow='hidden'
            sx={{
                ...props.sx,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
            { passedProps.children ? passedProps.children : passedProps.value }
        </Box>
    );
};

export default Cell;
