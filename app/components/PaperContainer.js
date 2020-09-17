import React from 'react';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import {spacing} from '@material-ui/system';
import Box from '@material-ui/core/Box';

const PaperContainer = (props) => {
    return (
        <Paper>
            <Box {...props}>
                <Card>
                    <Box py={2}>
                        <Container>
                            { props.children }
                        </Container>
                    </Box>
                </Card>
            </Box>
        </Paper>
    );
};

export default PaperContainer;
