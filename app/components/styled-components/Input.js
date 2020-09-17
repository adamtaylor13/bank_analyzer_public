import React from 'react';
import TextField from '@material-ui/core/TextField';
import MuiSelect from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

const Input = (props) => {
    const id = new Date().toString();
    const { type, native, children, HelperText, ...rest } = props;

    let classes = ['Label-Wrapper'];

    const renderInputType = () => {
        switch (type) {
            case 'select':
                return (
                    <>
                        <InputLabel shrink htmlFor={ id }>
                            { props.label }
                        </InputLabel>
                        <MuiSelect
                            id={ id }
                            inputProps={{ id }}
                            { ...rest }>
                            { children }
                        </MuiSelect>
                    </>
                );
            default:
                return (
                    <>
                        <TextField
                            id={ id }
                            fullWidth={ true }
                            margin="dense"
                            { ...rest }
                        />
                        { HelperText ? HelperText : null }
                    </>
                );
        }
    };

    return (
        <div className={ classes.join(' ') } >
            { renderInputType() }
        </div>
    );
};

export default Input;
