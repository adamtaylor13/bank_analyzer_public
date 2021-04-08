import React from 'react';
import {connect} from 'react-redux';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/core/styles';
import {fetchSyncTransactions, syncAccounts, updateIncome} from "../../actions/api";
import {queueAlert, setAppProcessing} from "../../actions/actions";
import Navbar from "../Navbar";
import {Text} from 'rebass';
import EditableBar from "../EditableBar";
import {BarLabel} from "./EditCategory";
import {isAppProcessing, selectIncome} from "../../reducers";
import DollarInput from "../styled-components/DollarInput";
import BottomBarButton from "../styled-components/BottomBarButton";

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
}));

function sendTestAlert() {}
const mapDispatchToProps = (dispatch) => {
    return {
        resyncTransactions: () => {
            dispatch(fetchSyncTransactions());
        },
        sendTestAlert: () => {
            const tests = [
                {
                    variant: 'success',
                    message: 'Testing success alerts',
                    autoHideDuration: 2500,
                },
                {
                    variant: 'info',
                    message: 'Testing info alerts',
                    autoHideDuration: 2500,
                },
                {
                    variant: 'warning',
                    message: 'Testing warning alerts',
                    autoHideDuration: 2500,
                },
                {
                    variant: 'error',
                    message: 'Testing error alerts',
                    autoHideDuration: 2500,
                }
            ];

            dispatch(queueAlert(tests[0]));
            let index = 1;
            const interval = setInterval(() => {
                dispatch(queueAlert(tests[index]));
                if (index === tests.length - 1) {
                    clearInterval(interval);
                }
                index++;
            }, 2500);
        },
        syncAccounts: () => {
            dispatch(syncAccounts())
        },
        updateIncome: (val) => {
            dispatch(updateIncome(val));
        },
        toggleProcess: (val) => {
            dispatch(setAppProcessing(val));
        }
    }
};

const mapStateToProps = state => {
    return {
        income: selectIncome(state),
        isProcessing: isAppProcessing(state),
    }
};

const Admin = (props) => {
    const classes = useStyles();

    const [income, setIncome] = React.useState(props.income);
    function saveIncome() {
        props.updateIncome({ income });
    }

    return (
        <Navbar
            label="Admin">
            <Button variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={ props.resyncTransactions }>
                Sync Transactions
            </Button>

            <Button variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={ props.sendTestAlert }>
                Send Test Alert
            </Button>

            <Button variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={ props.syncAccounts }>
                Sync Accounts
            </Button>

            <Button variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={() => props.toggleProcess(!props.isProcessing) }>
                Toggle Processing Loader
            </Button>

            <EditableBar mt={3} disabled>
                <BarLabel>Income</BarLabel>
                <Text fontSize={1}>This should be your take-home income, not adjusted for savings.</Text>
                <DollarInput value={income} modifyValue={setIncome} />
            </EditableBar>

            {/* Purposefully matching like this so string will be coerced to number */}
            {props.income != income ? (
                <BottomBarButton
                    color="success"
                    variant="contained"
                    onClick={saveIncome}>
                    Save Income
                </BottomBarButton>
            ) : null}
        </Navbar>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
