import React from 'react';
import {connect} from 'react-redux';
import BudgetPeriodSelect from "./BudgetPeriodSelect";
import {makeStyles} from '@material-ui/core/styles';
import {isMobileView} from "../reducers";
import Icon from "./Icon";
import Button from "./styled-components/Button";
import {views} from './views/View';
import {withRouter} from 'react-router-dom';
import {Box, Flex, Heading, Text} from 'rebass';
import Drawer from "./Drawer";
import NavLink from "./NavLink";
import FilterIconController from "./FilterIconController";

const drawerWidth = '80%';
const useStyles = makeStyles(theme => {
    return {
        tabs: {
            flexGrow: 1,
            marginBottom: theme.spacing(3),
        },
        root: {
            display: 'flex',
        },
        appBar: {
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            display: 'flex',
            alignItems: 'center',
            minHeight: 56,
            flexDirection: 'row',
            // paddingRight: theme.spacing(3)
        },
        appBarShift: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        noRender: {
            display: 'none',
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
        },
        drawerHeader: {
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end',
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: -drawerWidth,
        },
        contentShift: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        },
        drawerList: {},
        navLinks: {
        },
        active: {
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
        },
    };
});

const mapStateToProps = state => {
    return {
        isMobile: isMobileView(state),
        isNavbarSliderOpen: state.navbarState.isOpen
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        setNavbarSliderOpen: isOpen => {
            dispatch({ type: SET_NAVBAR_SLIDER_IS_OPEN, isOpen });
        }
    }
};

export const SET_NAVBAR_SLIDER_IS_OPEN = 'SET_NAVBAR_SLIDER_IS_OPEN';
export function navbarState(state = { isOpen: false }, action) {
    switch (action.type) {
        case SET_NAVBAR_SLIDER_IS_OPEN:
            return { ...state, isOpen: action.isOpen };
        default:
            return state
    }
}


const Navbar = (props) => {
    const classes = useStyles();
    const currentRoute = props.location.pathname;
    const viewIndex = views.indexOf(views.find(view => currentRoute.includes(view.route)));

    let TabProps = {
        value: viewIndex,
        indicatorColor: "primary",
        textColor: "primary",
        centered: true,
    };

    function handleDrawerOpen() {
        props.setNavbarSliderOpen(true);
    }

    function handleDrawerClose() {
        props.setNavbarSliderOpen(false);
    }

    return (
        <Box pb={'100px'}>
            <Box className={classes.tabs} sx={{
                width: '100%',
                position: 'fixed',
                top: 0,
                boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)',
                borderRadius: '4px',
                marginBottom: '24px',
                zIndex: 100,
            }}
            >
                <>
                    <Flex
                        px={2}
                        py={2}
                        color='lightgray'
                        bg='midnight'
                        alignItems='center'
                        justifyContent='space-between'
                    >
                        { props.navIcon ? (
                            <Button variant={'nav'} onClick={ props.onNavIconClick }>
                                <Icon icon={ props.navIcon } size="lg" color="tangelo"/>
                            </Button>
                        ) : (
                            <FilterIconController/>
                        ) }
                        <Heading p={2} sx={{ display: 'inline', fontSize: '1rem'}}>
                            { props.label }
                        </Heading>
                        { props.actionIcon ? (
                            <Button variant={'danger'} onClick={ props.onActionIconClick }>
                                <Icon icon={ props.actionIcon } size="lg" color="white" />
                            </Button>
                        ) : null }
                        { props.content }
                    </Flex>

                    <Drawer
                        className={classes.drawer}
                        variant="temporary"
                        anchor="left"
                        open={props.isNavbarSliderOpen}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        onClose={handleDrawerClose}
                    >
                        <Flex
                            flexDirection='column'
                            justifyContent='space-between'
                            height='100vh'
                            pb={2}
                        >
                            <div>
                                { views.map((view, i) => (
                                    <NavLink
                                        to={view.route}
                                        key={i}
                                        onClick={() => props.setNavbarSliderOpen(false)}
                                    >
                                        <Icon icon={view.icon} size="lg" position="left" color='tangelo'/>
                                        <Text>
                                            {view.label}
                                        </Text>
                                    </NavLink>
                                )) }
                            </div>
                            <BudgetPeriodSelect />
                        </Flex>
                    </Drawer>
                </>
            </Box>
            <Box pt={'76px'}>
                { props.children }
            </Box>
        </Box>
    );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navbar));
