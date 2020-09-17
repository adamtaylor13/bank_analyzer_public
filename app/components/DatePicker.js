import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import {
    Box,
    Card,
    Image,
    Heading,
    Text,
    Flex,
    Button,
} from 'rebass';
import { Input, Label, Select, Textarea } from '@rebass/forms';
import Icon from "./Icon";
import Navbar from "./Navbar";
import EditableBar from "./EditableBar";

dayjs.extend(advancedFormat);

const datePickerStyles = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '900',
    bg:'roman',
};

const containerStyles = {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    bg: 'rgba(0,0,0,0.5)',
};

function DatePicker(props) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [show, setShow] = useState(props.show);

    useEffect(() => {
        setShow(props.show);
    }, [props.show]);

    useEffect(() => {
        if (props.date) {
            setSelectedDate(dayjs(props.date));
        } else { // Default to now
            setSelectedDate(dayjs().clone());
        }
    }, [props.date]);

    if (!show) {
        return null;
    }

    function handleOkClick() {
        props.onAccept(selectedDate.clone());
        props.setShow(false);
    }

    function handleCancelClick() {
        props.setShow(false);
    }

    function handleClearClick() {
        props.onClear();
        props.setShow(false);
    }

    function addMonth() {
        setSelectedDate(selectedDate.clone().add(1, 'M'));
    }

    function subtractMonth() {
        setSelectedDate(selectedDate.clone().subtract(1, 'M'));
    }

    function changeDate(date) {
        const newDate = selectedDate.clone().date(date);
        setSelectedDate(dayjs(newDate).date(date));
    }

    function renderSwitcher() {
        return (
            <Flex alignItems='center' justifyContent='space-between' p={3}>
                <Icon icon='caret-left' size='lg' onClick={ subtractMonth }/>
                <Text>{selectedDate.format('MMMM YYYY')}</Text>
                <Icon icon='caret-right' size='lg' onClick={addMonth}/>
            </Flex>
        )
    }

    const CalBlock = props => {
        return <Text
            sx={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&.active': {
                    borderRadius: '20px',
                    bg: 'tangelo',
                }
            }}
            onClick={() => changeDate(props.children)}
            {...props}
        >{props.children}</Text>;
    }

    function renderDaysForMonth() {
        const daysInMonth = selectedDate.daysInMonth();
        const activeDay = selectedDate.date();
        const startIndex = dayjs(selectedDate.format("YYYY-MM")).day();
        const arr = [[]]; // Array of weeks

        for (let i = 0; i < startIndex; i++) {
            arr[0].push(<CalBlock key={i + 'blank'}/>)
        }

        for (let i = 0; i < daysInMonth; i++) {
            const dow = selectedDate.date(i + 1).format('dd');

            if (dow === 'Su') {
                // Need a new week
                arr.push([]);
            }
            arr[arr.length - 1].push(<CalBlock key={i} className={activeDay === i+1 ? 'active' : ''}>{i + 1}</CalBlock>);
        }
        return arr.map((week, i) => {
            if (i > 0) {
                if (week.length < 7) {
                    const left = 7 - week.length;
                    for (let j = 0; j < left; j++) {
                        week.push(<CalBlock key={j}/>);
                    }
                }
            }

            return <Flex justifyContent='space-around' alignItems='center' key={i}>{week}</Flex>;
        });
        // return arr;
    }

    return (
        // Container
        <Box sx={containerStyles}>
            {/* Dialog */}
            <Box sx={datePickerStyles}>
                {/* Header */}
                <Box p={3} bg='tangelo'>
                    <Text>{ selectedDate.format('YYYY') }</Text>
                    <Heading>{ selectedDate.format('ddd, MMM Do') }</Heading>
                </Box>
                {/* Body */}
                <Box p={2}>
                    {/* Month Month Switcher */}
                    <Box>
                        { renderSwitcher() }
                    </Box>
                    {/* Days of Week*/}
                    <Flex justifyContent='space-around' alignItems='center' p={2}>
                        <Text>Su</Text>
                        <Text>Mo</Text>
                        <Text>Tu</Text>
                        <Text>We</Text>
                        <Text>Th</Text>
                        <Text>Fr</Text>
                        <Text>Sa</Text>
                    </Flex>
                    {/* Days of the month (1-x)*/}
                    <Box p={2}>
                        { renderDaysForMonth() }
                    </Box>
                    {/* Actions at bottom */}
                    <Flex pt={2} justifyContent='space-between'>
                        <Button bg='tangelo' onClick={ handleClearClick }>Clear</Button>
                        <Box>
                            <Button mr={3} bg='tangelo' onClick={handleCancelClick}>Cancel</Button>
                            <Button bg='tangelo' onClick={() => handleOkClick()}>Ok</Button>
                        </Box>
                    </Flex>
                </Box>
            </Box>
        </Box>
    );
}

// TODO: This will be dope
// function MonthPicker(props) {
//     return (
//         <Box sx={containerStyles}>
//             {/* Dialog */}
//             <Box sx={datePickerStyles}>
//                 {/* Header */}
//                 <Box p={3} bg='tangelo'>
//                     <Text>{ selectedDate.format('YYYY') }</Text>
//                     <Heading>{ selectedDate.format('ddd, MMM Do') }</Heading>
//                 </Box>
//                 {/* Body */}
//                 <Box p={2}>
//                     {/* Month Month Switcher */}
//                     <Box>
//                         { renderSwitcher() }
//                     </Box>
//                     {/* Days of Week*/}
//                     <Flex justifyContent='space-around' alignItems='center' p={2}>
//                         <Text>Su</Text>
//                         <Text>Mo</Text>
//                         <Text>Tu</Text>
//                         <Text>We</Text>
//                         <Text>Th</Text>
//                         <Text>Fr</Text>
//                         <Text>Sa</Text>
//                     </Flex>
//                     {/* Days of the month (1-x)*/}
//                     <Box p={2}>
//                         { renderDaysForMonth() }
//                     </Box>
//                     {/* Actions at bottom */}
//                     <Flex pt={2} justifyContent='space-between'>
//                         <Button bg='tangelo' onClick={ handleClearClick }>Clear</Button>
//                         <Box>
//                             <Button mr={3} bg='tangelo' onClick={handleCancelClick}>Cancel</Button>
//                             <Button bg='tangelo' onClick={() => handleOkClick()}>Ok</Button>
//                         </Box>
//                     </Flex>
//                 </Box>
//             </Box>
//         </Box>
//     );
// }

export default DatePicker;
