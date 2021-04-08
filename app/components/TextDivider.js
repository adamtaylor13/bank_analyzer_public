import React, {forwardRef, useEffect, useRef, useState} from 'react';
import Divider from '@material-ui/core/Divider';

const TextDivider = forwardRef(({ text, offset }, ref) => {
    const [width, setWidth] = useState(null);
    const style = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
    };

    const hrStyle = {
        width: `calc(100% - ${width}px)`,
        marginRight: 0,
        marginLeft: 0
    };

    const spanStyle = {
        color: '#555',
        whiteSpace: 'nowrap'
    };

    const spanRef = useRef();
    useEffect(() => {
        if (spanRef.current) {
            const width = spanRef.current.getBoundingClientRect().width + (offset ? offset : 15);
            setWidth(width);
        }
    }, [spanRef.current]);

    return (
        <div ref={ref} style={style}>
            <span ref={spanRef} style={spanStyle}>{ text }</span>
            <Divider className="divider-w-text" style={ hrStyle }/>
        </div>
    );
});

export default TextDivider;

