import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextDivider from "./TextDivider";
import {selectFilters} from "../reducers";
import {activateFilter, deactivateFilter} from "../actions/actions";

const mapStateToProps = state => {
    return {
        filters: selectFilters(state),
    };
};

const mapDispatchToProps = dispatch => {
    return {
        activateFilter: filterName => dispatch(activateFilter(filterName)),
        deactivateFilter: filterName => dispatch(deactivateFilter(filterName)),
    }
};

const FilterList = (props) => {
    const [anchorEl, setAnchorEl] = useState(null);

    if (!props.filters) return null;

    function handleClick(event) {
        setAnchorEl(event.currentTarget);
    }
    function handleClose() {
        setAnchorEl(null);
    }

    function handleChange(e) {
        let filterName = e.target.value;
        const checked = e.target.checked;

        if (checked) {
            props.activateFilter(filterName);
        } else {
            props.deactivateFilter(filterName);
        }
    }

    const FilterOption = (props) => {
        const { label, name } = props;
        return (
            <MenuItem>
                <FormControlLabel
                    label={ label }
                    control={
                        <Checkbox
                            checked={ props.filters[name].active }
                            onChange={ handleChange }
                            value={ name }
                            color="primary"
                        />
                    }
                />
            </MenuItem>
        );
    };

    return (
        <div>
            <Button
                variant="outlined"
                aria-owns={anchorEl ? 'simple-menu' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
            >
                Filter
            </Button>
            <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
                  MenuListProps={{ className: 'menu' }}
            >
                <TextDivider text="Category" offset={35}/>
                <FilterOption label="Uncategorized" name="uncategorized" filters={props.filters}/>

                <TextDivider text="Property" offset={35}/>
                <FilterOption label="Offset Transaction" name="isOffset" filters={props.filters}/>
                <FilterOption label="Not Offset" name="isNotOffset" filters={props.filters}/>
                <FilterOption label="Pending" name="isPending" filters={props.filters}/>
                <FilterOption label="No Transfers" name="noTransfers" filters={props.filters}/>
                <FilterOption label="No Credit Card Payments" name="noCCPayments" filters={props.filters}/>
            </Menu>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(FilterList);
