// Source: https://stackoverflow.com/a/54749871/6535053

import {useEffect, useState} from 'react';

export default function useLongPress(callback = () => {}, ms = 300) {
    const [startLongPress, setStartLongPress] = useState(false);
    const [data, setData] = useState({});

    useEffect(() => {
        let timerId;
        if (startLongPress) {
            timerId = setTimeout(() => callback(data), ms);
        } else {
            clearTimeout(timerId);
        }

        return () => {
            clearTimeout(timerId);
        };
    }, [startLongPress]);

    return {
        onMouseDown: (el) => {
            setStartLongPress(true);
            setData(el.target.dataset);
        },
        onMouseUp: (el) => {
            setStartLongPress(false);
            setData(el.target.dataset);
        },
        onMouseLeave: (el) => {
            setStartLongPress(false);
            setData(el.target.dataset);
        },
        onTouchStart: (el) => {
            setStartLongPress(true);
            setData(el.target.dataset);
        },
        onTouchEnd: (el) => {
            setStartLongPress(false);
            setData(el.target.dataset);
        },
        onTouchMove: (el) => {
            setStartLongPress(false);
            setData(el.target.dataset);
        }
    };
}
