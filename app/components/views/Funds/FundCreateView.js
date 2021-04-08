import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography';
import BottomBarButton from "../../styled-components/BottomBarButton";
import {createNewFund} from "../../../actions/api";
import DollarInput from "../../styled-components/DollarInput";
import Navbar from "../../Navbar";
import EditableBar from "../../EditableBar";
import {Text,} from 'rebass';
import {Input, Label} from '@rebass/forms';
import DatePicker from "../../DatePicker";

const mapStateToProps = state => {
    return {}
};

const mapDispatchToProps = dispatch => {
    return {
        createNewFund: (fund) => {
            dispatch(createNewFund(fund));
        }
    }
};

const FundCreateView = props => {
    const [canSave, setCanSave] = React.useState(false);
    const [fund, setFund] = useState({
        name: '',
        account_id: null,
        due_date: null,
        goal: null,
        active: true,
        reserved: 0,
        available: 0,
    });
    const [showDatePicker, setShowDatePicker] = React.useState(false);

    useEffect(() => {
        if (props.sinkingFundAccount) {
            setFund({ ...fund, account_id: props.sinkingFundAccount.account_id });
        }
    }, [props.sinkingFundAccount]);

    const onDateChange = val => {
        if (!val) return;
        setFund({ ...fund, due_date: val.format('YYYY-MM-DD') });
        calculateDaysTillGoal();
        setCanSave(check());
    };

    const clearDate = () => {
        setFund({ ...fund, due_date: null });
        setCanSave(check());
    };

    const calculateDaysTillGoal = () => {
        if (fund.due_date) {
            const due = moment(fund.due_date).fromNow();
            return due;
        }
    };

    const updateGoal = value => {
        const goal = parseFloat(value.replace(/,/g, ''));
        setFund({ ...fund, goal });
        setCanSave(check());
    };

    const updateFundName = e => {
        const name = e.target.value;
        setFund({ ...fund, name });
        setCanSave(check());
    };

    function check() {
        return fund.goal && fund.name;
    }

    function createNewFund(fund) {
        props.createNewFund(fund);
        props.history.push('/funds');
    }

    return (
        <Navbar
            label="Create New Fund"
            navIcon="times"
            onNavIconClick={() => props.history.push('/funds')}>

            <EditableBar disabled>
                <Label>Fund Name</Label>
                <Input variant='noBorder'
                       defaultValue={ fund.name }
                       onBlur={ updateFundName }/>
            </EditableBar>

            <EditableBar disabled onClick={() => setShowDatePicker(true)}>
                <Label>Due Date (Optional)</Label>
                <Text>{ fund.due_date || "" }</Text>
                <Typography>{ calculateDaysTillGoal() }</Typography>
            </EditableBar>

            <EditableBar disabled>
                <DollarInput label={'Target Goal'}
                             value={ fund.goal }
                             modifyValue={ updateGoal } />
            </EditableBar>

            { canSave ? (
                <BottomBarButton
                    onClick={() => createNewFund(fund)}
                    color="success"
                    variant="contained">
                    Save Fund
                </BottomBarButton>
            ) : null }
            <DatePicker date={fund.due_date}
                        onAccept={ onDateChange }
                        onClear={clearDate}
                        show={showDatePicker}
                        setShow={setShowDatePicker}/>
        </Navbar>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(FundCreateView);
