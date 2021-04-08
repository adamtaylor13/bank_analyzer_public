import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ToDollars from "../utility";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {makeStyles} from '@material-ui/core/styles';
import {sortByDate} from "../../server/utility";
import TransactionCard from "./TransactionCard";
import {thisMonth} from "../../server/filters";

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
}));

const BudgetCategoryItem = ({ item, transactions, openModal }) => {

    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    // Sort by date descending
    transactions = sortByDate(transactions);
    transactions = transactions.filter(thisMonth);

    function handleClick() {
        setOpen(!open);
    }

    function renderBudgetTransactionList() {
        return (
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    { transactions.map((trans, index) => {
                        return (
                            <TransactionCard transaction={trans} transactionModal={openModal} key={index}/>
                            // <ListItem className={classes.flex}
                            //           onClick={() => openModal(trans) }
                            //           button
                            //           key={ index }>
                            //     <div className={classes.flexCol}>
                            //         <span>{ trans.name }</span>
                            //         <span>{ trans.date }</span>
                            //     </div>
                            //     <div>
                            //         <span>{ ToDollars(trans.amount) }</span>
                            //     </div>
                            // </ListItem>
                        );
                    }) }
                </List>
            </Collapse>
        );
    }

    return (
        <Card style={{ marginBottom: '5px' }}>
            <CardContent>
                <ListItem button onClick={handleClick} alignItems="flex-start">
                    <ListItemText primary={item.name} secondary={
                        <>
                        <span style={{ display: 'block' }}>
                            <span style={{ width: '100px', paddingRight: '25px', display: 'inline-block' }}>
                                Amount:
                            </span>
                            <span>{ToDollars(item.amount)}</span>
                        </span>
                            <span style={{ display: 'block' }}>
                            <span style={{ width: '100px', paddingRight: '25px', display: 'inline-block' }}>
                                Spent:
                            </span>
                            <span>{ToDollars(item.spent)}</span>
                        </span>
                        </>
                    }/>
                </ListItem>
            </CardContent>

            {/* Collapsed list underneath */}
            { renderBudgetTransactionList() }

        </Card>
    );
};

export default BudgetCategoryItem;
