import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import withTransactions from "./withTransactions";
import {selectCategories} from "../../reducers";
import {_try} from "../../utility";

const mapStateToProps = state => {
    return {
        categoriesFromState: selectCategories(state),
    }
};


const withCategoryFromUrl = (WrappedComponent) => (props) => {
    const { categoriesFromState, ...rest } = props;
    const [category, setCategory] = React.useState(null);
    const [isLoading, setLoading] = React.useState(true);
    const [redirect, setRedirect] = React.useState(false);

    React.useEffect(() => {
        if (!props.categoriesFromState || !props.categoriesFromState.length) {
            setLoading(true);
        } else {
            setLoading(false);

            const categoryId = _try(() => props.match.params.catId, null);
            const category = _try(() => categoriesFromState.filter(b => b._id === categoryId)[0], null);
            if (!categoryId || !category) {
                setRedirect(true);
            }

            setCategory(category);
        }
    }, [props.categoriesFromState]);

    return (
        <WrappedComponent category={ category } isLoadingCategory={ isLoading } redirect={ redirect } { ...rest } />
    )
};

export default compose(
    withTransactions,
    compose(
        connect(mapStateToProps), withCategoryFromUrl
    )
);

