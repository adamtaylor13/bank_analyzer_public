import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import ToDollars from "../utility";
import Card from '@material-ui/core/Card';

function getClassName(transaction) {
    if (!transaction) { return; }
    let className = 'transaction-list-item';
    if (transaction.amount < 0) {
        className += ' credit';
    }
    if (!transaction.budget_category) {
        className += ' no-category';
    }
    return className;
}

const useStyles = makeStyles(theme => ({
    memo: {
        padding: '7px',
        backgroundColor: '#e7e7e7',
        borderRadius: '5px',
        margin: '0 -5px',
    },
}));


const TransactionCard = ({ transaction, transactionsModal }) => {
    const classes = useStyles();

    return (
        <Card className={getClassName(transaction)} onClick={() => transactionsModal(transaction) }>
            <div className="flex f-full">
                <div>
                    <p>{ transaction.name }</p>
                    { transaction.account_name }
                    <p className="sub">{ transaction.budget_category }</p>
                </div>
                <div>
                    <p>{ transaction.date }</p>
                    <p>{ ToDollars(transaction.amount) }</p>
                </div>
            </div>
            { transaction.memo ? (
                <p className={classes.memo}>{ transaction.memo }</p>
            ) : (<></>) }
        </Card>
    );
};

export default TransactionCard;
