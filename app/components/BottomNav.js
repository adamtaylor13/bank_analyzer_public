import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Box} from 'rebass';
import Icon from "./Icon";

const BottomNav = (props) => {

    const navButtons = [
        { name: 'categories', icon: 'list' },
        { name: 'funds', icon: 'funnel-dollar' },
        { name: 'accounts', icon: 'file-invoice-dollar' },
        { name: 'transactions', icon: 'search-dollar' },
    ];
    const activeRoute = props.location.pathname.split('/')[1];

    const sx = {
        bg: 'midnight',
        // boxShadow: `0px 3px 5px 5px ${theme.colors.midnight}`,
    };

    function goToRoute(route) {
        props.history.push(`/${route}`);
    }

    return (
        <Box id='bottom-nav' sx={sx}>
            { navButtons.map((b, i) => (
                <Box key={i}>
                    <Icon icon={b.icon}
                          size={'2x'}
                          color={ activeRoute === b.name ? 'tangelo' : 'white' }
                          onClick={() => goToRoute(b.name)}
                    />
                </Box>
            )) }
        </Box>
    )
};

export default withRouter(connect()(BottomNav));
