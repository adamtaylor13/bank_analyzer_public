import React from 'react';
import {connect} from 'react-redux';
import dayjs from 'dayjs';
import {Box, Flex} from 'rebass';
import Icon from "./Icon";
import theme from "../theme";
import Button from "./styled-components/Button";
import {selectFilters, selectUserSelectedTimeperiod} from "../reducers";
import DatePicker from "./DatePicker";
import {toggleFilter} from "../actions/actions";

// TODO: This is really clean, we should organize like this in more places
const FilterIconController = (props) => {
    const { dispatch } = props;
    const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
    const [showDatePicker, setShowDatePicker] = React.useState(false);

    const sx = {
        position: 'relative',
        zIndex: 10,
    };

    const triangle = 10;
    const bg = theme.colors.midnightOff;
    const left = 10;
    const dropdownFilterItemSX = {
        minWidth: 250,
    };

    const FlexIt = (props) => {
        return (
            <Flex justifyContent={'space-between'} alignItems={'center'} p={2} { ...props } />
        );
    };

    const Dropdown = () => {
        const sx = {
            position: 'absolute',
            top: '50px',
            left: `${left}px`,
            bg: bg,
            p: 3,
            borderRadius: 5,
            '&::before': {
                content: "''",
                position: 'absolute',
                top: `-8px`,
                width: 0,
                height: 0,
                left: `${left - 8}px`,
                borderLeft: `${triangle}px solid transparent`,
                borderRight: `${triangle}px solid transparent`,
                borderBottom: `${triangle}px solid ${bg}`,
            },
        };
        return showFilterDropdown ? (
            <Box id={'filter-dropdown'} sx={sx}>

                <Flex justifyContent={'space-between'} alignItems={'center'} mb={3} >
                    <Button id={'clear-filter-btn'} flex={1} mr={2}>
                        <Icon icon='ban' color='white' size='lg' />
                    </Button>
                    <Button flex={2} variant='alt' onClick={() => setShowDatePicker(true)}>
                        { dayjs(props.activeDate).format('MMM, YYYY') }
                    </Button>
                </Flex>

                { Object.keys(props.filters).map((filterKey, i) => (
                    <Box key={i} className={'dropdown-filter-item'} sx={dropdownFilterItemSX}>
                        { props.filters[filterKey].active ? (
                            <FlexIt onClick={() => dispatch(toggleFilter(filterKey))}>
                                <Icon icon='check-circle' size='2x' color='tangelo' />
                                { props.filters[filterKey].label }
                            </FlexIt>
                        ) : (
                            <FlexIt onClick={() => dispatch(toggleFilter(filterKey))}>
                                <Icon icon='circle' prefix='far' size='2x' color='white' />
                                { props.filters[filterKey].label }
                            </FlexIt>
                        ) }
                    </Box>
                )) }
            </Box>
        ) : null;
    };

    const Overshadow = () => {
        const sx = {
            position: 'absolute',
            top: 0,
            height: '100vh',
            left: 0,
            right: 0,
            bg: theme.colors.midnight,
            opacity: 0.74,
            zIndex: 9,
        };
        return showFilterDropdown ? (
            <Box id={'filter-overshadow'} sx={sx} onClick={() => setShowFilterDropdown(false)}/>
        ) : null;
    };

    return (
        <>
            <Box sx={sx}>
                <Box m={2}>
                    <Icon icon={'filter'}
                          color={'tangelo'}
                          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                          size={'2x'}
                    />
                </Box>
                <Dropdown />
                <DatePicker date={ props.activeDate }
                            onAccept={ () => {} }
                            onClear={ () => {} }
                            show={ showDatePicker }
                            setShow={ setShowDatePicker }/>
            </Box>
            <Overshadow />
        </>
    );
};

export default connect((state) => ({
    filters: selectFilters(state),
    activeDate: selectUserSelectedTimeperiod(state),
}) )(FilterIconController);
