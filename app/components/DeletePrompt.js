import React from 'react';
import {Button, Heading} from 'rebass';
import PaperBox from "./styled-components/PaperBox";

const DeletePrompt = (props) => {
    return (
        <PaperBox>
            <Heading color='white' fontSize='1.2rem' sx={{ textAlign: 'center' }} mb={3}>{ props.children }</Heading>
            <Button onClick={props.onConfirm} variant='danger' sx={{ width: '100%' }}>Yes, Delete It</Button>
        </PaperBox>
    );
};

export default DeletePrompt;
