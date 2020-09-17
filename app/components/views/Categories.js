import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import CategoryTable from "../data-displays/tables/CategoryTable";
import Fab from "../styled-components/Fab";
import Navbar from "../Navbar";
import Typography from '@material-ui/core/Typography';
import {
    Box,
    Text,
    Heading,
    Flex
} from 'rebass';
import {
    amountBudgetedForMonth,
    amountSpentThisMonth,
    selectAdditionalIncome,
    selectCategories,
    selectIncome
} from "../../reducers";
import TwoColRow from "../styled-components/TwoColRow";
import ToDollars from "../styled-components/ToDollars";
import Icon from "../Icon";
import Prompt from "../styled-components/Prompt";
import Button from "../styled-components/Button";
import {toDollars} from "../../utility";

const useStyles = makeStyles(theme => ({
    table: {
        marginTop: theme.spacing(3),
    },
    spaceLeft: {
        width: 180,
        marginRight: theme.spacing(1),
        display: 'inline-block',
    }
}));

const mapStateToProps = state => {
    return {
        categories: selectCategories(state),
        budgeted: amountBudgetedForMonth(state),
        spent: amountSpentThisMonth(state),
        income: selectIncome(state),
        additionalIncome: selectAdditionalIncome(state),
    }
};

const Categories = (props) => {
    const classes = useStyles();
    const { categories, dispatch, ...rest } = props;
    const [isEditing, setIsEditing] = React.useState(false);
    const [infoModalOpen, setInfoModalOpen] = React.useState(false);

    function createCategory() {
        props.history.push('/category/new');
    }

    function handleItemClick(id) {
        props.history.push(`/category/${id}`);
    }

    // TODO: Removing this edit btn, maybe add this functionality back somewhere else?
    return (
        <Navbar label="Categories"
                content={''}>
            { !categories || !categories.length ? (
                <Typography>It seems you don't have any categories set up yet!</Typography>
            ) : (
                <Box pb={5}>

                    <Box p={3}>
                        <TwoColRow col1={<Text>Income:</Text>}
                                   col2={
                                       <Flex>
                                           { props.additionalIncome > 0 ? (
                                               <Box onClick={() => setInfoModalOpen(true) }>
                                                   <Icon icon={'info-circle'} color={'blue'} position={'left'}/>
                                               </Box>
                                           ) : null }
                                           <ToDollars>{props.income}</ToDollars>
                                       </Flex>
                                   }/>

                        <TwoColRow col1={<Text>Budgeted:</Text>}
                                   col2={<ToDollars>{props.budgeted}</ToDollars>}/>
                        <TwoColRow col1={<Text>Spent:</Text>}
                                   col2={<ToDollars>{props.spent}</ToDollars>}/>

                    </Box>

                    <CategoryTable className={ classes.table } rows={ categories } { ...rest } editMode={isEditing} onItemClicked={ handleItemClick }/>
                </Box>
            ) }

            <Prompt open={ infoModalOpen }
                    centered
                    btns={[{ text: 'Okay', onClick: () => setInfoModalOpen(false), variant: 'secondary' }]}
            >
                <Flex justifyContent={'center'} p={3} mb={3}>
                    <Heading color={'roman'}>You've got an additional { toDollars(props.additionalIncome)} from sinking funds this month.</Heading>
                </Flex>
            </Prompt>

            <Fab onClick={ createCategory } icon="plus" />
        </Navbar>
    );

};

export default connect(mapStateToProps, null)(Categories);


