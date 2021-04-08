import React from 'react';
import PaperBox from "./PaperBox";
import Dialog from '@material-ui/core/Dialog';
import Icon from "../Icon";
import {Box, Button, Heading, Text,} from 'rebass';
import BtnFull from "./BtnFull";

const Prompt = (props) => {
    let sx = {};

    if (props.centered) {
        sx = {
            minHeight: '100vh',
            overflow: 'scroll',
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            flexDirection: 'column',
            position: 'relative'
        };
    }

    return (
        <Dialog open={ props.open || false } onClose={ props.handleClose } fullScreen>
            <PaperBox sx={sx} dark>
                {/* Cancel Icon */}
                <Button onClick={() => props.onCancelClick()} sx={{ position: 'absolute', top: 2, left: 2}} bg={'midnightOff'}>
                    <Icon icon={'times'} size="lg" color="tangelo"/>
                </Button>

                {/* Main Text */}
                <Heading color={'roman'} textAlign={'center'} mb={4}>{ props.msg }</Heading>

                {/* Iterate over an array of detailTexts */}
                { props.detailTexts && props.detailTexts.length ? (
                    props.detailTexts.map((d, i) => {
                        return (
                            <Box bg={'midnightOff'} p={4} sx={{ borderRadius: 4 }} mb={i < props.detailTexts.length ? 4 : 2} key={i}>
                                <Text textAlign={'center'} color={'lightgray'}>{ d }</Text>
                            </Box>
                        );
                    })
                ) : null }

                { props.children ? (
                    props.children
                ) : null }

                {/* Either iterate over btns array or use default yes/no btns */}
                { props.btns && props.btns.length ? (
                    props.btns.map((btn, i) => {
                        return (
                            <BtnFull {...btn} key={i}>{ btn.text }</BtnFull>
                        );
                    })
                ) : (
                    <>
                        <BtnFull variant={'danger'} onClick={props.onConfirmClick}>Yes</BtnFull>
                        <BtnFull variant={'alt2'} onClick={props.onCancelClick}>No</BtnFull>
                    </>
                ) }
            </PaperBox>
        </Dialog>
    );
};

export default Prompt;
