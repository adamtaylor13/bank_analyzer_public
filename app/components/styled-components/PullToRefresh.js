import React from 'react';
import Hammer from 'react-hammerjs';
import {Box} from 'rebass';
import Icon from "../Icon";

const PullToRefresh = (props) => {
    const { onRefresh } = props;

    if (!(onRefresh && onRefresh instanceof Function)) {
        throw new Error('Must define a function to be called on pulldown');
    }

    const MAX_PULL_DISTANCE = 250;
    const HALF_OPEN_DISTANCE = MAX_PULL_DISTANCE / 2;
    let ptrWrapper;
    let ptrIcon;

    function ensureContainersAreRendered(cb) {
        if (!ptrWrapper) {
            ptrWrapper = document.getElementById('ptr-wrapper');
        }
        if (!ptrIcon) {
            ptrIcon = document.getElementById('ptr-icon');
        }
        return cb; // Function def; to be called by something else
    }

    function setY(y) {
        return new Promise((resolve, reject) => {
            ptrWrapper.style.transform = `translateY(${Math.abs(y) / 3}px)`;
            ptrIcon.style.transform = `translateY(${Math.abs(y) / 6}px)`;
            ptrIcon.style.opacity = `${y / MAX_PULL_DISTANCE}`;
            resolve();
        });
    }

    function transition(doWork) {
        ptrWrapper.style.transition = '225ms cubic-bezier(0, 0, 0.2, 1) 0ms';
        ptrIcon.style.transition = '225ms cubic-bezier(0, 0, 0.2, 1) 0ms';

        doWork().then(() => {
            // In order to wait for transition to stop
            // https://stackoverflow.com/a/15618028/6535053
            ptrWrapper.addEventListener('webkitTransitionEnd', () => {
                ptrWrapper.style.transition = "";
            }, false);
            ptrIcon.addEventListener('webkitTransitionEnd', () => {
                ptrIcon.style.transition = "";
            }, false);
        });
    }

    const onPanStart = () => {
        ptrWrapper = document.getElementById('ptr-wrapper');
        ptrIcon = document.getElementById('ptr-icon');
    };

    const onPan = (pan) => {
        const body = document.getElementsByTagName('body')[0];
        const scrollTop = body.scrollTop;
        const { distance, direction } = pan;

        if (distance <= MAX_PULL_DISTANCE && scrollTop <= 0 && direction === 16) {
            // Only if at the top of the container (i.e. Pulling against the top)
            setY(distance);
        }
    };

    const onPanEnd = panEnd => {
        const { distance, direction } = panEnd;
        const body = document.getElementsByTagName('body')[0];
        const scrollTop = body.scrollTop;
        if (distance >= HALF_OPEN_DISTANCE && scrollTop <= 0 && direction === 16) {
            // Finish opening and do work
            transition(() => setY(MAX_PULL_DISTANCE));
            onRefresh().then(() => {
                transition(() => setY(0));
            });
            // setTimeout(() => {
            //     transition(() => setY(0));
            // }, 1000);
        } else {
            transition(() => setY(0));
        }
    };

    return (
        <Hammer
            onPanStart={ensureContainersAreRendered(onPanStart)}
            onPan={ensureContainersAreRendered(onPan)}
            onPanEnd={ensureContainersAreRendered(onPanEnd)}
            options={{
                touchAction: 'auto',
                recognizers: {
                    pan: { threshold: 0 }
                }
            }}
            direction={ 'DIRECTION_VERTICAL' }
        >
            <Box id='ptr-wrapper'>
                <Box id='ptr-icon'>
                    <Icon icon={'spinner'} size={'2x'} spin />
                </Box>
                {props.children}
            </Box>

        </Hammer>
    )
};

export default PullToRefresh;
