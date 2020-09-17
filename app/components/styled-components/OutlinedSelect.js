import React, {useState, useEffect, useRef } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles(theme => ({
    formControl: {
    },
    changed: {
        color: 'red'
    }
}));

const OutlinedSelect = (props) => {
    const classes = useStyles();
    const { label, id, onChange, value, children, name } = props;

    const inputLabel = useRef(null);
    const [labelWidth, setLabelWidth] = useState(0);
    useEffect(() => {
        setLabelWidth(inputLabel.current.offsetWidth);
    }, []);

    const [modified, setModified] = useState(false);

    function handleChange(e) {
        setModified(true);
        onChange(e);
    }

    // TODO: Remember initial value and only change style if that value changes
    return (
        <FormControl
            className={`${classes.formControl}`}
            variant="outlined"
            fullWidth={ true }
            margin="normal">
            <InputLabel  ref={inputLabel} htmlFor={ id }>
                { label }
            </InputLabel>
            <Select
                style={{ color: `${modified ? 'salmon' : 'inherit'}` }}
                value={ value }
                onChange={ handleChange }
                input={<OutlinedInput labelWidth={labelWidth} name={ name } id={ id } />} >
                { children }
            </Select>
        </FormControl>
    );
};

export default OutlinedSelect;
