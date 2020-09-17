import React from 'react';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import {noInterestPaid, noOffsetTransactions, noPaychecks} from "../../server/filters";
import withTransactions from "./higher-order/withTransactions";
import { makeStyles } from '@material-ui/core/styles';
import {sortByDate, toDollars} from "../utility";
import PaperHeader from "./PaperHeader";

const useStyles = makeStyles(theme => ({
    flex: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    flexCol: {
        display: 'flex',
        flexDirection: 'column',
    },
    padding: {
        padding: '10px'
    },
}));

const OffsetList = props => {
    const classes = useStyles();
    const { transactions, handleOffsetSelect, noExistingOffsets } = props;
    if (!transactions) { return null; }

    let possibleOffsets = sortByDate(transactions.filter(t => t.amount < 0).filter(noPaychecks).filter(noInterestPaid));
    if (noExistingOffsets) {
        possibleOffsets = possibleOffsets.filter(noOffsetTransactions)
    }

    return (
        <Container style={{ paddingTop: '10px' }}>
            <PaperHeader onClick={() => props.setView('MAIN') } display="Select Offset" my={3} />
            { possibleOffsets.map((trans, index) => (
                <Card className={`${classes.flex} ${classes.padding}`} key={index} onClick={e => handleOffsetSelect(e, trans)} style={{ marginBottom: '10px' }}>
                    <div className={classes.flexCol}>
                        <p>{ trans.name } </p>
                        <p>{ trans.date }</p>
                    </div>
                    <div>
                        <p>({ toDollars(trans.amount) })</p>
                    </div>
                </Card>
            ))
            }
        </Container>
    );
};

// Will need to do our own filtering since we're not using withFilter
export default withTransactions(OffsetList);
