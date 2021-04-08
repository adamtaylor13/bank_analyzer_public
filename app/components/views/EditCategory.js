import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {_try, formatDate, toDollars} from "../../utility";
import {Redirect} from "react-router-dom";
import {selectCategories} from "../../reducers";
import BottomBarButton from "../styled-components/BottomBarButton";
import {queueAlert} from "../../actions/actions";
import {removeAdjustment, updateCategory} from "../../actions/api";
import Navbar from "../Navbar";
import {Box, Flex, Text,} from 'rebass';
import EditableBar from "../EditableBar";
import StackSlider from "../StackSlider";
import Icon from "../Icon";
import theme from "../../theme";
import CategoryTypes from "../../../server/CategoryTypes";
import withCategoryFromUrl from "../higher-order/withCategoryFromUrl";
import DollarInput from "../styled-components/DollarInput";
import Cell from "../data-displays/tables/Cell";
import Button from "../styled-components/Button";

const SlideView = props => {
    const { list, closeSlide, activeIdx, onClick } = props;
    const [activeIndex, setActiveIndex] = React.useState(activeIdx);

    useEffect(() => {
        closeSlide();
    }, [activeIndex]);

    const updateActiveIndex = (evt) => {
        const active = evt.target.innerText;
        setActiveIndex(list.indexOf(active));
        onClick(active);
    };

    return (
        <Navbar label='Select Category Type'
                    navIcon='chevron-left'
                    onNavIconClick={props.closeSlide}
        >
            { list.map((item,idx) => (
                <Box p={3} mb='1px' key={idx}
                     onClick={ updateActiveIndex }
                     sx={{
                         position: 'relative',
                         backgroundColor: idx === activeIndex ? 'midnightOff' : '',
                     }}>{ item }
                    { idx === activeIndex ? (
                        <Icon icon='check' color='tangelo' style={{
                            position: 'absolute',
                            right: theme.space[2],
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}/>
                    ) : null}
                </Box>
            )) }
        </Navbar>
    );
};

const mapStateToProps = state => {
    return {
        categories: selectCategories(state),
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        sendErrorAlert: (msg) => {
            dispatch(queueAlert({
                variant: 'error',
                message: msg,
                autoHideDuration: 2500,
            }));
        },
        updateCategory: (category) => {
            dispatch(updateCategory(category));
        },
        deleteAdjustment: (_id, category) => {
            dispatch(removeAdjustment(_id, category));
        }
    };
};

const MainView = connect(mapStateToProps, mapDispatchToProps)((props) => {

    const { categories, category, isLoadingCategory, redirect, activeCategory, setActiveCategory, ...rest } = props;
    const [showSaveOption, setShowSaveOption] = React.useState(true);
    const [deletePromptIndex, setDeletePromptIndex] = React.useState(-1);

    if (isLoadingCategory) {
        return <div>Loading...</div>
    }

    if (redirect) {
        return <Redirect to="/" />;
    }

    const adjustBudgetedAmt = (val) => {
        const newBudgeted = parseFloat(val);
        if (newBudgeted.toString() !== 'NaN') {
            setActiveCategory({ ...activeCategory, budgeted: newBudgeted });
        } else {
            setActiveCategory({ ...activeCategory, budgeted: '' });
        }
    };

    const saveCategory = () => {
        let cat = { ...category, ...activeCategory };
        props.updateCategory(cat);
        props.history.push(`/category/${category._id}`)
    };

    // Transform a category _id to its name
    function keyToName(key) {
        return categories.filter(c => c._id.toString() === key)[0].name;
    }


    return (
        <Navbar
            label={`Edit Category`}
            navIcon="times"
            onNavIconClick={() => props.history.push(`/category/${category._id}`)}
        >
            <EditableBar flex>
                <BarLabel>Name</BarLabel>
                <BarText>{ category.name }</BarText>
            </EditableBar>

            <EditableBar flex>
                <BarLabel>Time Period</BarLabel>
                <BarText>{ formatDate(category.timeperiod) }</BarText>
            </EditableBar>

            <EditableBar flex>
                <BarLabel>Spent</BarLabel>
                <BarText>{toDollars(category.spent)}</BarText>
            </EditableBar>

            <EditableBar flex>
                <BarLabel>Type</BarLabel>
                <BarText>{ category.type }</BarText>
            </EditableBar>

            <Box variant={'wrap'}>
                <DollarInput label={'Amount'} value={ activeCategory.budgeted } modifyValue={ adjustBudgetedAmt } />
                {activeCategory.budgeted ? (
                    <Text variant='subtitle'>Original Budgeted
                        Amount: {toDollars(category.budgeted)}</Text>
                ) : null}
            </Box>

            { category.adjustments ? (
                Object.keys(category.adjustments).map((key, i) => {
                    return (
                        <Flex px={2} justifyContent='space-between' key={i} alignItems={'center'}
                        onClick={() => {
                            if (deletePromptIndex === i) {
                                setDeletePromptIndex(-1);
                            } else {
                                setDeletePromptIndex(i);
                            }
                        }}
                              sx={{
                                  minHeight: '52px'
                              }}
                        >
                            <Cell>{ keyToName(key) }</Cell>
                            { deletePromptIndex === i ? (
                                <Cell>
                                    <Button color={'danger'} onClick={() => {
                                        props.deleteAdjustment(key, category);
                                    }}>
                                        <Icon icon={'trash'} position={'left'} />
                                        Delete?
                                    </Button>
                                </Cell>
                            ) : (
                                <>
                                    <Icon icon={'balance-scale'}/>
                                    <Cell>{ toDollars(category.adjustments[key]) }</Cell>
                                </>
                            ) }
                        </Flex>
                    );
                })
            ) : null }

            {showSaveOption ? (
                <BottomBarButton
                    color="success"
                    variant="contained"
                    onClick={saveCategory}>
                    Save Changes
                </BottomBarButton>
            ) : null}
        </Navbar>
    );
});

const EditCategory = withCategoryFromUrl((props) => {

    // activeCategory extracted upward one layer so that the same state can
    // be modified by 2 separate components separated by different prop layers.
    const [activeCategory, setActiveCategory] = React.useState({});
    const [activeIdx, setActiveIdx] = React.useState(-1);

    // Update the type activeIdx
    useEffect(() => {
        if (_try(() => activeCategory.type, false)) {
            let i = Object.keys(CategoryTypes).indexOf(activeCategory.type);
            setActiveIdx(i);
        } else if (_try(() => props.category.type, false)) {
            let i = Object.keys(CategoryTypes).indexOf(props.category.type);
            setActiveIdx(i);
        }
    }, [activeCategory, props.category]);

    return (
        <StackSlider
            // Purposefully passing category prop down
            { ...props }
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            mainView={ MainView }

            list={Object.keys(CategoryTypes)}
            activeIdx={activeIdx}
            onClick={type => setActiveCategory({ ...activeCategory, type }) }
            slideView={ SlideView } />
    );
});

export const BarLabel = props => <Text variant='barLabel'>{props.children}</Text>
export const BarText = props => <Text variant='barText'>{props.children}</Text>
export default EditCategory;
