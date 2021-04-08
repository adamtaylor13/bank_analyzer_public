import React from 'react';
import {Box} from 'rebass';


const Drawer = (props) => {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    function handleClick(evt) {
        setOpen(false);
        props.onClose();
    }

    return (
        // Wrapper
        <Box
            sx={{
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                zIndex: '1300',
                visibility: open ? 'visible' : 'hidden',
                opacity: open ? '1' : '0',
            }}
        >
            {/* Backdrop */}
            <Box sx={{
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                zIndex: '-1',
                transition: '225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                visibility: open ? 'visible' : 'hidden',
                opacity: open ? '1' : '0',
            }}
                 onClick={ handleClick }
            />
            {/* Actual Drawer */}
            <Box
                width='80%'
                height='100vh'
                bg='midnight'
                color='white'
                sx={{
                    position: 'fixed',
                    top: '0',
                    left: open ? '0' : '-100%',
                    transition: '225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
                    zIndex: '1200',
                }}
            >
                {props.children}
            </Box>
        </Box>
    );
};

export default Drawer;
