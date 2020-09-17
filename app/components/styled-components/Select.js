import React from 'react';
import Input from "./Input";
import MenuItem from '@material-ui/core/MenuItem';

const Select = (props) => {
    return (
        <Input type="select" displayEmpty fullWidth={ true } {...props} >
            <MenuItem value="">
                <em>None</em>
            </MenuItem>
            { props.children }
        </Input>
    )
};

export default Select;
