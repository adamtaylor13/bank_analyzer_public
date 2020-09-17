import React from 'react';
import {Input, Label} from '@rebass/forms';
import {Box} from 'rebass';
import Icon from "../Icon";

function stripDollarSign(val) {
    if (val) {
        return val.toString().replace(/\$/g, '');
    }
    return val;
}

function cleanStringValue(value) {
    return parseFloat(stripDollarSign(value)).toFixed(2);
}

const DollarInput = (props) => {
    const { value, ...passedProps } = props;
    const fontSize = 1.5;
    console.log('value', value);

    if (props.defaultValue) {
        throw new Error('Only use value with DollarInput')
    }

    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(cleanStringValue(value));
    const [resetValue, setResetValue] = React.useState(false);
    const width = (`${ (value ? cleanStringValue(value) : '0.00') || '0.00'}`.length * 13) + 'px';

    console.log('internalValue', internalValue);

    return (
        <Box p={2}>
            <Box p={1} bg={'midnightOff'} sx={{
                position: 'relative',
                borderRadius: '4px',
                paddingRight: '30px !important',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
            }}
            >
                <Label sx={{
                    width: 'unset',
                    marginRight: 2,
                }}>
                    { props.label }
                </Label>
                <Box sx={{
                    position: 'relative',
                    paddingLeft: `${fontSize}rem`,
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                        content: '"$"',
                        position: 'absolute',
                        left: 0,
                        color: props.color,
                        fontSize: `${fontSize}rem`,
                    }
                }}
                >
                    <Input {...passedProps}
                           variant='noBorder'
                           value={ internalValue }
                           onChange={ e => setInternalValue(e.target.value) }
                           sx={{
                                fontSize: `1.25rem`,
                                padding: 0,
                                textAlign: 'right',
                                width: width,
                                transition: 'all 0.3s',
                                transform: isFocused ? 'translateX(0px)' : 'translateX(30px)',
                            }}
                           placeholder={'0.00'}
                           type='number'
                           onBlur={e => {
                               setIsFocused(false);

                               // This is set if we need to allow the Icon below to handle the click
                               // instead of the blur event firing
                               if (resetValue || e.target.value === '') {
                                   setInternalValue('0.00');
                                   props.modifyValue(0);
                                   setResetValue(false);
                               } else {
                                   const val = cleanStringValue(e.target.value);
                                   setInternalValue(val);
                                   props.modifyValue(val);
                               }

                           }}
                           onFocus = {e => {
                               setIsFocused(true);

                               // If placeholder value, onFocus empty it to prep for entry
                               if (e.target.value === '0.00') {
                                   setInternalValue('');
                               } else {
                                   e.target.select();
                               }
                           }}
                    />
                    <Icon icon={'times-circle'} color={'tangelo'} size={'lg'}
                          onMouseDown={() => setResetValue(true) }
                          sx={{
                              position: 'absolute',
                              transition: 'all 0.3s',
                              right: isFocused ? '-30px' : '-90px',
                              transform: isFocused ? 'rotate(0deg)' : 'rotate(270deg)',
                          }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default DollarInput;
