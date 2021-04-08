import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {activateFund, deleteFund, updateFund} from "../../../actions/api";
import Dialog from '@material-ui/core/Dialog';
import {isAppLoading, selectFundById, selectUnaccountedMoneyInSinkingFund} from "../../../reducers";
import {Redirect} from "react-router-dom";
import Navbar from "../../Navbar";
import BottomBarButton from "../../styled-components/BottomBarButton";
import EditableBar from "../../EditableBar";
import {Box, Button, Flex, Heading, Text} from 'rebass';
import {Label, Radio} from '@rebass/forms';
import Icon from "../../Icon";
import DollarInput from "../../styled-components/DollarInput";
import DatePicker from "../../DatePicker";
import PaperBox from "../../styled-components/PaperBox";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import advancedFormat from 'dayjs/plugin/advancedFormat';
import {toDollars} from "../../../utility";
import Prompt from "../../styled-components/Prompt";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

const mapStateToProps = (state, ownProps) => {
    return {
        fund: selectFundById(ownProps.match.params.fundId, state),
        isAppLoading: isAppLoading(state),
        unallocated: selectUnaccountedMoneyInSinkingFund(state),
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        updateFund: (fund) => {
            dispatch(updateFund(fund));
        },
        deleteFund: (fundId) => {
            dispatch(deleteFund(fundId));
            ownProps.history.goBack();
        },
        activateFund: (fundId, amount) => {
            dispatch(activateFund(fundId, amount));
        },
    }
};

const FundDetailView = (props) => {

    // Fund definition
    const [fund, setFund] = useState(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [canSave, setCanSave] = React.useState(false);
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [promptDelete, setPromptDelete] = React.useState(false);
    const [unallocated, setUnallocated] = React.useState(props.unallocated); // Local state so we can update it

    // Activation Types
    const activationTypes = {
        NUMBER: 'number',
        ALL: 'all',
    };
    const [activationType, setActivationType] = React.useState(activationTypes.ALL);
    const [activationAmount, setActivationAmount] = React.useState('0.00');
    // -----------------

    const check = () => {
        return typeof fund.goal !== 'NaN' && typeof fund.reserved !== 'NaN';
    };

    useEffect(() => {
        if (!props.fund) return
        setFund(props.fund);
        setActivationAmount(props.fund.reserved);
    }, [props.fund]);

    useEffect(() => {
        if (!fund) return
        setCanSave(check());
    }, [fund]);

    if (props.isAppLoading || !fund) {
        return null;
    }

    if (!props.fund) {
        return <Redirect to='/' />
    }

    const handleClose = (e, reason) => {
        if (reason === 'backdropClick') {
            setModalIsOpen(false);
            setTimeout(() => {
                setActivationType(activationTypes.NUMBER);
            }, 300);
        }
    };

    const activateFunds = () => {
        props.activateFund(fund._id, parseFloat(activationAmount));
    };

    function saveChanges() {
        props.updateFund(fund);
        props.history.push('/funds');
    }

    function setReserved(value) {
        setFund({ ...fund, reserved: value });
    }

    function setGoal(value) {
        setFund({ ...fund, goal: value });
    }

    const showFinishFundBtn = fund.reserved !== fund.goal
                                && unallocated >= (fund.goal - fund.reserved)
                                && fund.goal !== 0;

    return (
        <Navbar
            navIcon="times"
            onNavIconClick={() => props.history.push('/funds') }
            actionIcon={'trash'}
            onActionIconClick={() => {
                // Only trigger if not already open
                if (!promptDelete) {
                    setPromptDelete(true);
                }
            }}
        >

                <Flex
                    justifyContent='space-between'
                    flexDirection='column'
                >
                    <Flex justifyContent={'center'} alignItems={'center'} m={3}>
                        <Heading mb={3}>{ fund.name }</Heading>
                    </Flex>

                    { unallocated ? (
                        <Box bg={'midnightOff'} mb={4}>
                            <Flex justifyContent='space-between' alignItems='center' sx={{ pt: 3, pb: 2, px: 3, fontSize: '1rem' }}>
                                <Text color='roman'>Unallocated funds:</Text>
                                <Text color='white' as='span'>{ toDollars(unallocated) }</Text>
                            </Flex>
                            <Flex justifyContent={'center'} alignItems={'center'} sx={{ p: 3, bg: 'midnight', m: 3, borderRadius: 3 }}
                                  onClick={() => {
                                      setFund({...fund, reserved: (fund.reserved + unallocated).toFixed(2)});
                                      setUnallocated(0);
                                  } }>
                                <Icon icon='check-circle' size='lg' color='tangelo' position={'left'} />
                                Apply towards Fund
                            </Flex>
                        </Box>
                    ) : null }

                    <Box bg={'midnightOff'} mb={1} sx={{ width: '100%'}}>
                        <DollarInput label={'Amount Saved'} value={ fund.reserved } modifyValue={ setReserved } />
                        {/* Only show this if we haven't already hit our goal AND we have the funds to finish it out */}
                        { showFinishFundBtn ? (
                            <Flex justifyContent={'center'} alignItems={'center'} sx={{ p: 3, bg: 'midnight', m: 3, borderRadius: 3 }}
                                onClick={() => setFund({ ...fund, reserved: fund.goal }) }>
                                <Icon icon='check-circle' size='lg' color='tangelo' position={'left'} />
                                Finish Fund
                            </Flex>
                        ) : null }
                    </Box>

                    <Box bg={'midnightOff'} mb={1} sx={{ width: '100%'}}>
                        <DollarInput label={'Goal'} value={ fund.goal } modifyValue={ setGoal } />
                    </Box>

                    <EditableBar flex onClick={ () => setShowDatePicker(true) } alignItems={'center'}>
                        <Label>Due Date</Label>
                        { fund.due_date ? (
                            <Flex flexDirection={'column'}>
                                <Text fontSize={2}>{ dayjs(fund.due_date).format('ddd, MMM Do YYYY') }</Text>
                                <Text color='roman' fontSize={2}>Due { dayjs(fund.due_date).fromNow() }</Text>
                            </Flex>
                        ) : (
                            <>
                                <Text fontSize={2}>(Optional) Pick due date</Text>
                                <Icon icon={'calendar-alt'} color={'tangelo'}/>
                            </>
                        ) }
                    </EditableBar>

                    <Box p={3}>
                        <Button onClick={ () => setModalIsOpen(true) } variant={'full.alt'}>Activate Funds</Button>
                    </Box>
                </Flex>


                <Dialog open={ modalIsOpen } onClose={ handleClose }>
                    <PaperBox>
                        <Heading color='roman'>How much do you want to activate?</Heading>

                        <Flex alignItems='center' justifyContent='center' flexDirection='column' my={3}>
                            <Label my={3} width={'100%'}>
                                <Radio name='type' value={ activationTypes.ALL } onChange={ () => setActivationType(activationTypes.ALL) } defaultChecked />
                                All of it
                            </Label>
                            <Label mt={3} width={'100%'}>
                                <Radio name='type' value={ activationTypes.NUMBER } onChange={ () => setActivationType(activationTypes.NUMBER) } />
                                Specific Amount
                            </Label>
                        </Flex>

                        { activationType === activationTypes.NUMBER ? (
                            <DollarInput value={ activationAmount } modifyValue={ setActivationAmount } my={3} />
                        ) : null }

                        <Button onClick={ activateFunds } mt={3} variant='action' sx={{ width: '100%' }}>Confirm</Button>
                    </PaperBox>
                </Dialog>

            { canSave ? (
                <BottomBarButton
                    color={"success"}
                    onClick={ saveChanges }
                >
                    Save Changes
                </BottomBarButton>
            ) : null }

            <DatePicker date={fund.due_date}
                        onAccept={val => setFund({ ...fund, due_date: val.format('YYYY-MM-DD') }) }
                        onClear={ () => setFund({ ...fund, due_date: null }) }
                        show={ showDatePicker }
                        setShow={ setShowDatePicker }/>

            <Prompt msg={'Are you sure you wish to delete this sinking fund?'}
                    open={ promptDelete }
                    centered
                    onConfirmClick={() => {
                        setPromptDelete(false);
                        props.deleteFund(fund._id);
                    }}
                    onCancelClick={() => setPromptDelete(false)}
            />

        </Navbar>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(FundDetailView);

