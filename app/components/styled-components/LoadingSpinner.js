import React from 'react';
import {connect} from 'react-redux';
import {Flex, Heading,} from 'rebass';
import Icon from "../Icon";
import {isAppProcessing} from "../../reducers";

const mapStateToProps = state => {
    return {
        isLoading: isAppProcessing(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

const LoadingIcon = (props) => {
    return (
        <Flex
            justifyContent={'center'}
            alignItems={'center'}
            flexDirection={'column'}
            sx={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: '35%',
                bg: 'maroon',
                display: props.isLoading ? 'flex' : 'none !important',
            }}
        >
            {/* Above it's important to keep the inline properties intact */}
            <Heading mb={3}>Processing Data</Heading>
            <Icon icon={'circle-notch'} className={'fa-spin'} size={'3x'} sx={{
                animation: 'fa-spin 2s infinite linear'
            }}/>
        </Flex>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(LoadingIcon);
