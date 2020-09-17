import React from 'react';
import { connect } from 'react-redux';
import {Box, Heading, Text, Flex} from 'rebass';
import withCategoryFromUrl from "../../higher-order/withCategoryFromUrl";
import {dollarsFloat, toDollars} from "../../../utility";
import StackSlider from "../../StackSlider";
import Navbar from "../../Navbar";
import Icon from "../../Icon";
import {
    selectCategories
} from "../../../reducers";
import Button from "../../styled-components/Button";
import DollarInput from "../../styled-components/DollarInput";
import BottomBarButton from "../../styled-components/BottomBarButton";
import TwoColRow from "../../styled-components/TwoColRow";
import {updateCategory} from "../../../actions/api";

const mapStateToProps = state => {
    return {
        categories: selectCategories(state),
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateCategory: category => {
            dispatch(updateCategory(category));
        }
    };
};

const MainView = props => {

    const handleCategorySelect = (categoryToAdjust) => {
        props.setSlideData({ categoryToAdjust });
        props.openSlide();
    };

    return (
        <Navbar label={''}
                navIcon='chevron-left'
                onNavIconClick={() => props.history.goBack() }
        >
            <Box p={3}>
                <Heading>Select Category</Heading>
                <TwoColRow col1={'Amount to adjust:'} col2={ toDollars(props.category.difference) }/>
                <Box mb={4}/>

                { props.categories.filter(c => {
                    return c.difference > 0;
                }).map((o,idx) => (
                    <Box p={3} my={2} key={idx}
                         onClick={() => handleCategorySelect(o)}
                         bg={'midnightOff'}
                         sx={{
                             borderRadius: '4px',
                             position: 'relative',
                         }}>
                        <Flex justifyContent={'space-between'}>
                            <Text>{ o.name }</Text>
                            <Text>{ toDollars(o.difference) }</Text>
                        </Flex>
                    </Box>
                )) }
            </Box>
        </Navbar>
    );
};

const SlideView = props => {

    const [adjustment, setAdjustment] = React.useState('0.00');

    if (!props.slideOpen) { return null; }

    const parsedAdjustment = (parseFloat(adjustment) > 0 ? parseFloat(adjustment) : 0);
    const over = props.category.difference + parsedAdjustment;
    const spent = props.slideData.categoryToAdjust.budgeted - props.slideData.categoryToAdjust.difference + parsedAdjustment;
    const left = dollarsFloat(props.slideData.categoryToAdjust.budgeted - spent);

    const saveAdjustments = () => {
        // Make sure we've got a dollars float rounded to decimal places and not a string
        const dollarsAdjustment = dollarsFloat(adjustment);

        // TODO: If the category already has an adjustment the keys will overwrite.
        //  We need to gracefully handle an existing adjustment and just add this to that adjustment

        // The category that was negative
        const priorToAdjustments = props.category.adjustments;
        const categoryTo = { ...props.category, adjustments: { ...priorToAdjustments, [props.slideData.categoryToAdjust._id.toString()]: dollarsAdjustment * -1 } };

        // The category we're adjusting to
        const priorFromAdjustments = props.slideData.categoryToAdjust.adjustments;
        const categoryFrom = { ...props.slideData.categoryToAdjust, adjustments: { ...priorFromAdjustments, [props.category._id.toString()]: dollarsAdjustment } };

        props.updateCategory(categoryTo);
        props.updateCategory(categoryFrom);
        props.history.push('/');
    };

    const validateAdjustment = val => {
        let proposedAdjustment = Math.abs(dollarsFloat(val));
        if (proposedAdjustment > left) {
            proposedAdjustment = left;
        }
        setAdjustment(dollarsFloat(proposedAdjustment));
    };

    return (
        <Navbar label={''}
                navIcon='chevron-left'
                onNavIconClick={props.closeSlide}
        >
            <Box p={3}>
                <Box mb={5}>
                    <Heading color={'roman'}>{ props.category.name }</Heading>
                    <hr/>
                    <Flex justifyContent={'space-between'} alignItems={'center'}>
                        <Text fontSize={'1.2rem'}>Over:</Text>
                        <Text fontSize={'1.2rem'}>{ toDollars(over) }</Text>
                    </Flex>

                    <Button fullWidth fontSize={'1.2rem'} bg={'midnightOff'} mt={2}
                        onClick={() => {
                            validateAdjustment(props.category.difference);
                        }}>
                        <Icon icon={'balance-scale'} position={'left'} />
                        Balance All
                    </Button>
                </Box>

                <Box mb={5}>
                    <Heading color={'roman'}>{ props.slideData.categoryToAdjust.name }</Heading>
                    <hr/>
                    <Flex justifyContent={'space-between'} alignItems={'center'}>
                        <Text fontSize={'1.2rem'}>Budgeted:</Text>
                        <Text fontSize={'1.2rem'}>{ toDollars(props.slideData.categoryToAdjust.budgeted) }</Text>
                    </Flex>
                    <Flex justifyContent={'space-between'} alignItems={'center'}>
                        <Text fontSize={'1.2rem'}>Spent:</Text>
                        <Text fontSize={'1.2rem'}>{ toDollars(spent) }</Text>
                    </Flex>
                    <Flex justifyContent={'space-between'} alignItems={'center'}>
                        <Text fontSize={'1.2rem'}>Left:</Text>
                        <Text fontSize={'1.2rem'}>{ toDollars(left) }</Text>
                    </Flex>
                </Box>

                <Flex flexDirection={'column'} alignItems={'center'}>
                    <Text fontSize={'1.5rem'} mb={2} color={'roman'}>Adjustment</Text>
                    <DollarInput value={adjustment} modifyValue={ setAdjustment }/>
                </Flex>
            </Box>

            { adjustment > 0 ? (
                <BottomBarButton
                    variant="contained"
                    color="success"
                    onClick={ saveAdjustments }>
                    Save Changes
                </BottomBarButton>
            ) : null }
        </Navbar>
    );
};

const BalanceCategory = withCategoryFromUrl((props) => {

    const [slideData, setSlideData] = React.useState({});

    if (props.isLoadingCategory) {
        return <Text>Loading...</Text>;
    }

    props = { ...props, slideData, setSlideData };

    return (
        <StackSlider
            { ...props }
            mainView={ MainView }
            slideView={ SlideView }
        />
    );
});

export default connect(mapStateToProps, mapDispatchToProps)(BalanceCategory);
