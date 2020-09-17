import React from 'react';
import { connect } from 'react-redux';
import {isMobileView} from "../../reducers";
import TransactionsTable from "../data-displays/tables/TransactionsTable";
import Navbar from "../Navbar";
import {
    Button,
} from 'rebass';

const mapStateToProps = state => {
    return { isMobile: isMobileView(state) }
};

const TransactionList = (props) => {
    const [selectedRows, setSelectedRows] = React.useState({});
    const [multiMode, setMultiMode] = React.useState(false);

    props = { ...props, selectedRows, setSelectedRows, multiMode, setMultiMode };

    return (
        <Navbar
            label={multiMode ? `${Object.keys(selectedRows).filter(id => selectedRows[id]).length} Transactions Selected` : "Transaction List"}
            content={
                <>
                { multiMode ? (
                    <Button variant='text' onClick={() => {
                        setMultiMode(false);
                        setSelectedRows({});
                    }}>
                        Cancel
                    </Button>
                ) : null }
                </>
            }>
            <TransactionsTable hideTotalRow={ true } showCategoryFilter={ true } { ...props } />
        </Navbar>
    );
};

export default connect(mapStateToProps, null)(TransactionList);
