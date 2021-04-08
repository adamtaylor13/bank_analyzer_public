import React from 'react';
import {connect} from 'react-redux';
import dayjs from 'dayjs';
import {Box, Flex, Text,} from 'rebass';
import {Checkbox, Input, Label, Select} from '@rebass/forms';
import Navbar from "../Navbar";
import EditableBar from "../EditableBar";
import BottomBarButton from "../styled-components/BottomBarButton";
import {createCategory} from "../../actions/api";
import DatePicker from "../DatePicker";
import DollarInput from "../styled-components/DollarInput";
import {selectFunds, selectUserSelectedTimeperiod} from "../../reducers";
import {formatDate} from "../../utility";
import CategoryTypes from "../../../server/CategoryTypes";

const mapDispatchToProps = (dispatch) => {
    return {
        createCategory: category => {
            dispatch(createCategory(category));
        }
    };
};

const mapStateToProps = state => {
    return {
        currentMonth: () => {
            return selectUserSelectedTimeperiod(state).match(/\d\d\d\d-(\d\d)/)[1];
        },
        availableSinkingFunds: () => {
            return selectFunds(state);
        }
    };
}

const NewCategory = props => {
    const availableSinkingFunds = props.availableSinkingFunds();
    const [name, setName] = React.useState('New Category Name');
    const [budgeted, setBudgeted] = React.useState(0);
    const [timeperiod, setTimeperiod] = React.useState(new dayjs().month(props.currentMonth() - 1));
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [useSinkingFund, setUseSinkingFund] = React.useState(false);
    const [sinkingFundToLink, setSinkingFundToLink] = React.useState(availableSinkingFunds[0]);

    function createNewCategory() {
        let catToCreate = { name, budgeted, timeperiod: timeperiod.format('YYYY-MM'), spent: 0, type: CategoryTypes.DYNAMIC };

        if (useSinkingFund) {
            catToCreate.type = CategoryTypes.FUND;
            catToCreate.sinking_fund_id = sinkingFundToLink;
        }

        props.createCategory(catToCreate);
        props.history.push('/categories');
    }

    return (
        <Navbar
            label='New Category'
            navIcon='times'
            onNavIconClick={() => props.history.goBack()}>
            <Box>
                <Flex
                    justifyContent='space-between'
                    flexDirection='column'>
                    <EditableBar disabled>
                        <Label>Name</Label>
                        <Input variant='noBorder' fontSize='1.2rem'
                               value={ name }
                               onBlur={e => e.target.value.trim() ? setName(e.target.value.trim()) : setName('New Category Name')}
                               onFocus={e => e.target.value.trim() === 'New Category Name' ? setName('') : null }
                               onChange={e => setName(e.target.value)}
                        />
                    </EditableBar>

                    <EditableBar disabled>
                        <Label>Budgeted</Label>
                        <DollarInput value={budgeted} modifyValue={ setBudgeted } />
                    </EditableBar>

                    <EditableBar flex onClick={() => setShowDatePicker(true)}>
                        <Text as='label'>Timeperiod</Text>
                        <Text>{ formatDate(timeperiod) }</Text>
                    </EditableBar>

                    <EditableBar disabled flex>
                        <Label htmlFor={'use-sinking-fund'} sx={{
                            display: 'inline'
                        }}>Use Sinking Fund?</Label>
                        <Checkbox id={'use-sinking-fund'} onClick={e => setUseSinkingFund(e.target.checked)} sx={{
                            color: useSinkingFund ? 'tangelo' : 'roman'
                        }}/>
                    </EditableBar>

                    { useSinkingFund ? (
                        <EditableBar disabled>
                            <Select
                                id='sinking-fund-select'
                                name='sinking-fund-select'
                                defaultValue={ sinkingFundToLink }
                                onChange={ e => {
                                    console.log('e.target.value', e.target.value);
                                    setSinkingFundToLink(availableSinkingFunds.filter(f => f._id === e.target.value)[0]);
                                } }
                                sx={{
                                    height: '55px',
                                    fontSize: '1.1rem',
                                    borderColor: 'tangelo',
                                }}
                            >
                                { availableSinkingFunds.map((f, i) => {
                                    return (
                                        <option key={i} value={ f._id }>{ f.name }</option>
                                    );
                                })}
                            </Select>
                        </EditableBar>
                    ) : null }

                </Flex>
            </Box>

            {/* Bottom save button */}
            <BottomBarButton
                variant="contained"
                color="success"
                onClick={ createNewCategory }>
                Create Category
            </BottomBarButton>
            <DatePicker date={ timeperiod }
                        onAccept={ val => setTimeperiod(new dayjs(val)) }
                        onClear={ () => setTimeperiod(new dayjs()) }
                        show={ showDatePicker }
                        setShow={ setShowDatePicker }/>
        </Navbar>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(NewCategory);
