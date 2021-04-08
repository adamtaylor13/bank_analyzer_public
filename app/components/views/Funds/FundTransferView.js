import React, {useState} from 'react';
import {connect} from 'react-redux';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import Box from '@material-ui/core/Box';
import {selectFunds} from "../../../reducers";
import {getDollarsFromE, toDollars} from "../../../utility";
import {withoutId} from "../../../../server/filters";
import Icon from "../../Icon";
import {updateFunds} from "../../../actions/api";
import PaperContainer from "../../PaperContainer";
import PaperHeader from "../../PaperHeader";

const useStyles = makeStyles(theme => ({
    trashBtn: {
        backgroundColor: theme.palette.error.dark,
        color: 'white',
        height: 35,
        width: 35,
        marginLeft: 10
    }
}));

const mapStateToProps = state => {
    return {
        funds: selectFunds(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateFunds: funds => {
            dispatch(updateFunds(funds))
        }
    };
};

const FundTransferView = (props) => {
    const classes = useStyles();
    const [transferPool, setTransferPool] = useState(0);
    const [givingFunds, setGivingFunds] = useState([]);
    const [receivingFunds, setReceivingFunds] = useState([]);

    // useEffect(() => {
    //     setGivingFunds(props.funds);
    // }, [props.funds]);

    const calculateTransferPool = () => {
        const giving = givingFunds.reduce((prev, curr) => prev + curr.pooling, 0);
        const siphoning = receivingFunds.reduce((prev, curr) => prev + curr.siphoning, 0);
        if (isNaN(giving - siphoning)) return;
        setTransferPool(giving - siphoning);
    };

    const addFundToGiving = fund => {
        setGivingFunds([ ...givingFunds.filter(withoutId(fund._id)), fund]);
        calculateTransferPool();
    };

    const addFundToReceiving = fund => {
        setReceivingFunds([ ...receivingFunds.filter(withoutId(fund._id)), fund]);
        calculateTransferPool();
    };

    const updateGiving = (e, fund) => {
        // TODO: Don't allow pooling to be larger than the total reserved amount.
        //  Otherwise, you could try to pool a negative number which shouldn't be allowed.
        fund.pooling = getDollarsFromE(e);
        addFundToGiving(fund);
    };

    const updateReceiving = (e, fund) => {
        fund.siphoning = getDollarsFromE(e);
        addFundToReceiving(fund);
    };

    const removeGivingFund = fund => {
        setGivingFunds([...givingFunds.filter(withoutId(fund._id))]);
        calculateTransferPool();
    };

    const removeReceivingFund = fund => {
        console.log('receivingFunds', receivingFunds);
        if (receivingFunds.length === 0) return;
        setReceivingFunds([...receivingFunds.filter(withoutId(fund._id))]);
        calculateTransferPool();
    };

    const toggleFund = fund => {
        const fundIsGiving = givingFunds.length === 0 ? false : givingFunds.filter(f => f._id.toString() === fund._id.toString()).length > 0;
        console.log('fundIsGiving', fundIsGiving);
        if (fundIsGiving) {
            removeGivingFund(fund);
            addFundToReceiving(fund);
            calculateTransferPool();
        } else {
            removeReceivingFund(fund);
            addFundToGiving(fund);
            calculateTransferPool();
        }
    };

    const calculateTotalsAndSave = () => {
        calculateTransferPool();
        if (transferPool < 0) {
            console.log('Cannot save while pool is negative');
        } else if (transferPool !== 0) {
            console.log('Cannot save while pool still has money in it');
        }

        let fundsToUpdate = [
            ...givingFunds.map(fund => {
                console.log(`${fund.name} is losing ${fund.pooling}`);
                const difference = fund.reserved - fund.pooling;
                if (difference < 0) {
                    // TODO: Show alert
                    throw Error('Cannot set fund to negative');
                }

                const { pooling, ...fields} = fund;
                return {...fields, reserved: difference};
            }),
            ...receivingFunds.map(fund => {
                console.log(`${fund.name} is gaining ${fund.siphoning}`);
                const difference = fund.reserved + fund.siphoning;

                const { siphoning, ...fields} = fund;
                return {...fields, reserved: difference};
            })
        ];

        props.updateFunds(fundsToUpdate);
        setGivingFunds([]);
        setReceivingFunds([]);
    };

    return (
        <>
            <PaperContainer mb={2}>
                <PaperHeader display="Transfer Funds" onClick={ props.onClose } />
            </PaperContainer>

            <ul>
                { props.funds.map((fund, i) => {
                    return <Button key={i} onClick={() => toggleFund(fund)}>
                        {fund.name}
                    </Button>;
                }) }
            </ul>

            <PaperContainer mt={2}>
                <Grid container direction="row" alignItems="center" justify="space-between">
                    <div>
                        { givingFunds.map((f, i) => (
                            <Card key={i} style={{ marginTop: 15 }}>
                                <Box p={2}>
                                    <Grid container direction="row" alignItems="center">
                                        <Typography variant="subtitle2" style={{ marginRight: 10 }}>{ f.name }</Typography>
                                        <TextField
                                            id="outlined-adornment-amount"
                                            // className={clsx(classes.margin, classes.textField)} // TODO
                                            variant="outlined"
                                            label="Pooling"
                                            defaultValue={ f.pooling || '' }
                                            onChange={(e) => updateGiving(e, f) }
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                            margin="normal"
                                        />
                                        <Button
                                            className={classes.trashBtn}
                                            variant="contained"
                                            onClick={() => removeGivingFund(f) }>
                                            <Icon icon="trash"></Icon>
                                        </Button>
                                    </Grid>
                                </Box>
                            </Card>
                        ))}
                    </div>
                    <div>
                        Amount Pooled:
                        { toDollars(transferPool) }
                    </div>
                    <div>
                        { receivingFunds.map((f, i) => (
                            <Card key={i} style={{ marginTop: 15 }}>
                                <Box p={2}>
                                    <Grid container direction="row" alignItems="center">
                                        <Typography variant="subtitle2" style={{ marginRight: 10 }}>{ f.name }</Typography>
                                        <TextField
                                            id="outlined-adornment-amount"
                                            // className={clsx(classes.margin, classes.textField)} // TODO
                                            variant="outlined"
                                            label="Siphoning"
                                            defaultValue={ f.siphoning || '' }
                                            onChange={(e) => updateReceiving(e, f) }
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                            margin="normal"
                                        />
                                        <Button
                                            className={classes.trashBtn}
                                            variant="contained"
                                            onClick={() => removeReceivingFund(f) }>
                                            <Icon icon="trash"></Icon>
                                        </Button>
                                    </Grid>
                                </Box>
                            </Card>
                        ))}
                    </div>
                </Grid>
            </PaperContainer>

            <Button variant="contained" color="primary"
                    onClick={() => calculateTotalsAndSave() }>
                Save Changes
            </Button>
        </>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(FundTransferView);
