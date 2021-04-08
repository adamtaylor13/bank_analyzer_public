import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import Container from '@material-ui/core/Container';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {selectFunds} from "../reducers";
import moment from 'moment';
import {deleteFund, updateFund} from "../actions/api";

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
        display: 'block',
        width: '100%',
    },
    input: {
        display: 'none',
    },
    flex: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    flexCol: {
        display: 'flex',
        flexDirection: 'column',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        display: 'block',
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    padding: {
        padding: '10px'
    },
    noGutters: {
        paddingRight: 0,
        paddingLeft: 0,
    },
}));

const mapStateToProps = state => {
    return {
        funds: selectFunds(state),
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateFund: (fund) => {
            dispatch(updateFund(fund));
        },
        deleteFund: (fundId) => {
            dispatch(deleteFund(fundId));
        }
    }
};

const MainView = props => {
    const classes = useStyles();

    const { fund, setFund, setView, closeFundModal, deleteFund } = props;

    if (!fund) return null;

    function handleDeleteClick() {
        deleteFund(fund._id);
        closeFundModal();
    }

    function updateName(e) {
        props.updateFund({ ...fund, name: e.target.value });
    }

    function onDateChange(date) {
        date = moment(date).format('YYYY-MM-DD').toString();
        setFund({ ...fund, date: date });
    }

    return (
        <>
            <DialogTitle id="simple-dialog-title">
                <div className="flex">
                    { fund.name }
                    <Button className={`danger`}
                            variant="contained"
                            size="small"
                            onClick={ handleDeleteClick }>
                        <FontAwesomeIcon className={ classes.leftIcon } icon="trash" />
                        Delete
                    </Button>
                </div>
            </DialogTitle>
            <Container>

                {/*<TextField*/}
                    {/*label="Memo"*/}
                    {/*className={classes.textField}*/}
                    {/*defaultValue={ fund.name || '' }*/}
                    {/*onBlur={ updateName }*/}
                    {/*margin="normal"*/}
                    {/*variant="outlined"*/}
                    {/*fullWidth={ true }*/}
                {/*/>*/}

            </Container>
        </>
    );
};

const withFundsModal = (WrappedComponent) => (props)  => {
    const { propFund, ...rest } = props;
    const [fund, setFund] = useState(propFund);
    const [view, setView] = useState(null);
    const [open, setOpen] = useState(false);


    useEffect(() => {
        setFund(propFund);
        setView(null);
    }, [propFund]);

    function onClose() {
        setView(null);
        setOpen(false);
        // props.updateFund(fund);
    }

    /**
     * TODO: Next view should be the transfer view
     *  This view will allow us to move an arbitrary amount
     *  of money to a selected fund, from other funds.
     */
    let ViewComponent = null;
    switch(view) {
        default:
            ViewComponent = MainView;
    }

    function onOpen(fund) {
        setOpen(true);
        setFund(fund);
    }

    return (
        <div>
            <WrappedComponent openFundsModal={ onOpen } closeFundsModal={ onClose } { ...rest } />

            <Dialog onClose={ onClose } aria-labelledby="simple-dialog-title" open={ open }>
                <ViewComponent fund={ fund }
                               setFund={ setFund }
                               setView={ setView }
                               updateFund={ props.updateFund }
                               deleteFund={ props.deleteFund }
                               closeFundModal={ onClose }/>
            </Dialog>
        </div>
    );
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withFundsModal);
