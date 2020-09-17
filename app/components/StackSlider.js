import React from 'react';
import {Box} from 'rebass';

const StackSlider = (props) => {
    const [open, setOpen] = React.useState(false);
    let { mainView, slideView, ...rest } = props;

    function openSlide(data) {
        setOpen(true);
    }

    function closeSlide() {
        setOpen(false);
    }

    rest = {...rest, slideOpen: open };

    return (
        <Box sx={{ overflow: 'hidden', maxHeight: '100vh' }}>
            <Box
                className={ open ? 'slide-open' : '' }
                sx={{
                    height: '100vh',
                    transition: '0.5s transform ease',
                    transform: open ? 'translateX(-30%)' : 'translateX(0)',
                    overflow: 'scroll'
                }}
            >
                { React.createElement(mainView, ({...rest, openSlide, closeSlide })) }
            </Box>
            <Box sx={{
                overflow: 'hidden'
            }}>
                <Box
                    sx={{
                        position: 'fixed',
                        right: 0,
                        left: 0,
                        top: 0,
                        bottom: 0,
                        height: '100vh',
                        zIndex: 1201,
                        transition: '0.3s transform ease',
                        transform: open ? 'translateX(0)' : 'translateX(100%)',
                        backgroundColor: 'midnight',
                        overflowY: 'scroll'
                    }}
                >
                    { React.createElement(slideView, ({...rest, openSlide, closeSlide })) }
                </Box>
            </Box>
        </Box>
    );
};

export default StackSlider;
