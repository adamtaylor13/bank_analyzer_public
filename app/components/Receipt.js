import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import {spacing} from '@material-ui/system';
import Box from '@material-ui/core/Box';
import {updateTransaction} from "../actions/api";
import { withStyles } from '@material-ui/core';
import Icon from "./Icon";
import IconButton from '@material-ui/core/IconButton';
import {isMobileView} from "../reducers";


const mapStateToProps = state => {
    return {
        isMobile: isMobileView(state)
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateTransaction: transaction => {
            dispatch(updateTransaction(transaction));
        }
    };
};

const Receipt = (props) => {
    const { transaction, isMobile } = props;
    const [isHover, setHover] = React.useState(false);

    React.useEffect(() => {
        if (isMobile) {
            setHover(true);
        }
    }, [props.isMobile]);

    function removeReceipt() {
        props.updateTransaction({ ...transaction, receipt: null });
    }

    if (!transaction.receipt) return null;

    const styles = theme => ({
        bgImg: {
            backgroundImage: `url(/images/receipts/${transaction.receipt})`,
            backgroundSize: 'cover',
        },
    });
    const iconSize = isMobile ? 'lg' : '2x';

    const ThumbnailContainer = props => {

        function toggleHover() {
            if (!isMobile) {
                setHover(!isHover);
            }
        }

        return (
            <Paper style={{ overflow: 'hidden' }} onMouseEnter={toggleHover} onMouseLeave={toggleHover}>
                {/* TODO: Full Screen View */}
                <div className={`receipt-wrapper ${isMobile ? 'isMobile' : ''} ${isHover ? 'hover' : ''}`}>
                    {/*<Button className="view-btn" variant="outlined">*/}
                    {/*    <Icon icon="receipt" color="green" size={iconSize} position="left"/>*/}
                    {/*    View Receipt*/}
                    {/*</Button>*/}
                    <IconButton className="trash-btn" onClick={() => removeReceipt()} variant="outlined">
                        <Icon icon="trash" color="red" size={iconSize} />
                    </IconButton>
                    <div className={`receipt thumbnail ${props.classes.bgImg}`} />
                </div>
            </Paper>
        );
    };
    const Styled = withStyles(styles)(ThumbnailContainer);
    return ( <Styled>{ props.children }</Styled> );
};

export default connect(mapStateToProps, mapDispatchToProps)(Receipt);
