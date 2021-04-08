import React from 'react';
import {Link} from "react-router-dom";

const StyledLink = (props) => <Link style={{ textDecoration: 'none', color: 'unset' }} {...props}>{props.children}</Link>;
export default StyledLink;
