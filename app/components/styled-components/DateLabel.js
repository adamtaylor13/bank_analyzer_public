import React from 'react';
import MaterialUIPicker from "../DatePicker";
import {Input} from '@rebass/forms';

const DateLabel = (props) => {
    const { onClick, onDateChange, ...rest } = props;
    const [open, setOpen] = React.useState(false);

    function handleAccept(value) {
        setOpen(false);
        onDateChange(value);
    }

    function handleOpenClick() {
        if (!open) {
            setOpen(true);
        }
    }

    return (
        <div onClick={ handleOpenClick } style={{ width: '100%' }}>
            <Input {...rest} variant='noBorder' />
            <MaterialUIPicker date={props.date}
                              label="Date"
                              onAccept={ handleAccept }
                              open={open}
            />
        </div>
    );
};

export default DateLabel;
