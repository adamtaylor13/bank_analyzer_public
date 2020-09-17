import {setMobileView} from "./actions";

export const checkWidth = () => dispatch => {
    const width = window.innerWidth;
    dispatch(setMobileView(width <= 900));
};
