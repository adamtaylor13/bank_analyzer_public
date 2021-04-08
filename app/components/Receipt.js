import React from 'react';
import {connect} from 'react-redux';
import Paper from '@material-ui/core/Paper';
import {updateTransaction} from "../actions/api";
import {withStyles} from '@material-ui/core';
import Icon from "./Icon";
import IconButton from '@material-ui/core/IconButton';
import {isMobileView} from "../reducers";


const mapStateToProps = state => {
    return {
        isMobile: isMobileView(state)
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateTransaction: transaction => {
            dispatch(updateTransaction(transaction));
        }
    };
};

const Receipt = (props) => {
    const { transaction, isMobile } = props;
    const [isHover, setHover] = React.useState(false);

    React.useEffect(() => {
        if (isMobile) {
            setHover(true);
        }
    }, [props.isMobile]);

    function removeReceipt() {
        props.updateTransaction({ ...transaction, receipt: null });
    }

    if (!transaction.receipt) return null;

    const styles = theme => ({
        bgImg: {
            backgroundImage: `url(/images/receipts/${transaction.receipt})`,
            backgroundSize: 'cover',
        },
    });
    const iconSize = isMobile ? 'lg' : '2x';

    const ThumbnailContainer = props => {

        function toggleHover() {
            if (!isMobile) {
                setHover(!isHover);
            }
        }

        return (
            <Paper style={{ overflow: 'hidden' }} onMouseEnter={toggleHover} onMouseLeave={toggleHover}>
                {/* TODO: Full Screen View */}
                <div className={`receipt-wrapper ${isMobile ? 'isMobile' : ''} ${isHover ? 'hover' : ''}`}>
                    {/*<Button className="view-btn" variant="outlined">*/}
                    {/*    <Icon icon="receipt" color="green" size={iconSize} position="left"/>*/}
                    {/*    View Receipt*/}
                    {/*</Button>*/}
                    <IconButton className="trash-btn" onClick={() => removeReceipt()} variant="outlined">
                        <Icon icon="trash" color="red" size={iconSize} />
                    </IconButton>
                    <div className={`receipt thumbnail ${props.classes.bgImg}`} />
                </div>
            </Paper>
        );
    };
    const Styled = withStyles(styles)(ThumbnailContainer);
    return ( <Styled>{ props.children }</Styled> );
};

export default connect(mapStateToProps, mapDispatchToProps)(Receipt);
