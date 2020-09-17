import React from 'react';
import { Button as RebassButton } from 'rebass';
import { withRouter } from 'react-router-dom';
import Icon from "../Icon";

const Button = (props) => {
    const { styleType, className, bg, icon, ...rest } = props;

    return (
        <RebassButton {...rest}>
            { icon ? (
               <Icon icon={icon} variant={'btn.icon'} position={'left'}/>
            ) : null }
            { props.children }
        </RebassButton>
    );
};

export const ButtonLink = withRouter((props) => {
    return (
        <Button {...props} onClick={() => props.history.push(props.to)}>{props.children}</Button>
    );
});

export default Button;
