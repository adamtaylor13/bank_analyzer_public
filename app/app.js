import React, {useEffect} from 'react';
import {connect} from 'react-redux';

import './App.scss';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import {makeStyles} from '@material-ui/core/styles';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import {library} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import Alert from "./components/Alert";
import {checkWidth} from "./actions/mobile";
import {isAppLoading, isAuthenticated, isMobileView} from "./reducers";
import {Redirect, Route, Switch} from "react-router-dom";
import {views} from './components/views/View';
import Login from "./components/views/Login";
import {ThemeProvider} from 'theme-ui';
import theme from "./theme";
import {Box} from 'rebass';
import LoadingScreen from "./components/views/LoadingScreen";
import LoadingSpinner from "./components/styled-components/LoadingSpinner";
import BottomNav from "./components/BottomNav";


library.add(fas, far);

const mapDispatchToProps = (dispatch) => {
    return {
        handleWindowResize: () => {
            dispatch(checkWidth());
        }
    }
};

const mapStateToProps = state => {
    return {
        isMobile: isMobileView(state),
        isAuthenticated: isAuthenticated(state),
        isLoading: isAppLoading(state),
    }
};


const useStyles = makeStyles(theme => ({
    container: {
        paddingLeft: 0,
        paddingRight: 0
    }
}));

function App(props) {
    const classes = useStyles();

    const { isMobile, isAuthenticated } = props;

    // Listen to window resize events and set the isMobile prop accordingly
    useEffect(() => {
        window.addEventListener('resize', props.handleWindowResize);
        return () => {
            window.removeEventListener('resize', props.handleWindowResize);
        };
    }, []);

    if (props.isLoading && isAuthenticated) {
        return (
            <ThemeProvider theme={theme}>
                <LoadingScreen/>
            </ThemeProvider>
        )
    }

    const PrivateRoute = ({ component, isAuthenticated, ...rest }) => {
        return (
            <Route
                {...rest}
                render={props => {
                    return isAuthenticated ? (
                        <>
                            { React.createElement(component, props) }
                        </>
                    ) : (
                        <Redirect to="/login" render={() => <Login />}/>
                    );
                }
                }
            />
        );
    };

    // Build all the viewRoutes
    let viewRoutes = [];
    views.forEach((view, i) => {
        viewRoutes.push((<PrivateRoute path={view.route} isAuthenticated={isAuthenticated} component={view.component} key={i} exact={view.exact}/>));
        if (view.subviews) {
            view.subviews.forEach((subview, j) => {
                viewRoutes.push((<PrivateRoute path={subview.route} isAuthenticated={isAuthenticated} component={subview.component} key={j}/>))
            });
        }
    });

    return (
        <MuiPickersUtilsProvider utils={ MomentUtils }>
            <ThemeProvider theme={theme}>
                <React.Fragment>
                    <CssBaseline />
                    <Box
                        onContextMenu={e => {
                            // Prevent right-clicking
                            e.preventDefault();
                        }}
                         minHeight='100vh'
                        sx={{
                            bg: 'midnight',
                            color: 'lightgray',
                        }}>
                        <Container className={isMobile ? classes.container : ''}>
                            <Switch>
                                { viewRoutes }
                                <Route exact path="/" render={() => (
                                    <Redirect to="/categories"/>
                                )}/>
                                <Route exact path="/login" component={ Login }></Route>
                            </Switch>
                            { isAuthenticated ? (
                                <BottomNav />
                            ) : null }
                            <Alert />
                        </Container>
                        <LoadingSpinner />
                    </Box>
                </React.Fragment>
            </ThemeProvider>
        </MuiPickersUtilsProvider>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

