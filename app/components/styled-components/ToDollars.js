import React from 'react';
import {Text} from 'rebass';
import {toDollars} from "../../utility";

const ToDollars = (props) => {
    return (
        <Text {...props}>{toDollars(props.children)}</Text>
    )
};

export default ToDollars;
