import React from 'react';
import Button from "./Button";

const BtnFull = (props) => {

    const variant = props.variant ? `full.${props.variant}` : 'full';

    return (
        <Button fullWidth fontSize={'1.2rem'} mt={2} {...props} variant={variant}>
            { props.children }
        </Button>
    )
};

export default BtnFull;
