import React from 'react';
import { connect } from 'react-redux';
import FormControl from '@material-ui/core/FormControl';
import { updateSelectedTimePeriod} from "../actions/api";
import {
    Box,
    Card,
    Image,
    Heading,
    Text,
    Flex,
} from 'rebass';
import { Label, Select } from '@rebass/forms';
import { selectTimeperiods, selectUserSelectedTimeperiod} from "../reducers";
import {SET_NAVBAR_SLIDER_IS_OPEN} from "./Navbar";

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        updateSelectedTimeperiod: timeperiod => {
            dispatch(updateSelectedTimePeriod(timeperiod));
        },
        closeNavbar: () => {
            dispatch({ type: SET_NAVBAR_SLIDER_IS_OPEN, isOpen: false });
        }
    }
};

const mapStateToProps = state => {
    return {
        timeperiods: selectTimeperiods(state),
        selectedTimeperiod: selectUserSelectedTimeperiod(state)
    }
};

const BudgetPeriodSelect = (props) => {

    const [timeperiod, setTimeperiod] = React.useState(props.selectedTimeperiod);

    function handleChange(event) {
        setTimeperiod(event.target.value);
        props.updateSelectedTimeperiod({ timeperiod: event.target.value });
        props.closeNavbar();
    }

    const monthNames = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
    };

    const dateSort = (a,b) => {
        let [ fullMatchA, yearA, monthA ] = a.match(/(\d\d\d\d)-(\d\d)/);
        let [ fullMatchB, yearB, monthB ] = b.match(/(\d\d\d\d)-(\d\d)/);
        if (yearA !== yearB) {
            return parseInt(yearB) - parseInt(yearA);
        } else {
            return parseInt(monthB) - parseInt(monthA);
        }
    };

    return (
        <Box
            p={2}
            width={1}
            variant='outlined'
            as={FormControl}
        >
            <Label htmlFor='month-select'
                   sx={{
                       color: 'tangelo',
                       margin: '0 0 0.4rem 8px',
                       fontSize: '0.85rem',
                   }}
            >Month</Label>
            <Select
                id='month-select'
                name='month-select'
                value={ timeperiod }
                onChange={ handleChange }
                sx={{
                    height: '55px',
                    fontSize: '1.1rem',
                    borderColor: 'tangelo',
                }}
            >
                { props.timeperiods.sort(dateSort).map((m, i) => {
                    let [ fullMatch, year, month ] = m.match(/(\d\d\d\d)-(\d\d)/);
                    return (
                        <option key={i} value={ m }>{ monthNames[month] } { year }</option>
                    );
                })}
            </Select>
        </Box>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(BudgetPeriodSelect);
