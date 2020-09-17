// example theme.js

const init = {
    animation: {
        timing: {
            standard: '0.3s',
        },
    },
    breakpoints: ['40em', '52em', '64em'],
    fontSizes: [
        12, 14, 16, 20, 24, 32, 48, 64
    ],
    colors: {
        white: '#ffffff',
        black: '#000000',
        granite: '#5F6062',
        roman: '#888E92',
        tangelo: '#E48625',
        midnight: '#243143',
        midnightOff: '#374354',
        // midnight: '#01024e',
        'midnight-l': '#22235a',
        maroon: '#543864',
        mauve: '#8b4367',
        salmon: '#ff6464',
        blue: '#07c',
        lightgray: '#f6f6ff',
        danger: '#E63462',
        successGreen: '#29b673',
    },
    space: [
        0, 4, 8, 16, 32, 64, 128, 256
    ],
    fonts: {
        body: 'system-ui, sans-serif',
        heading: 'inherit',
        monospace: 'Menlo, monospace',
    },
    fontWeights: {
        body: 400,
        heading: 700,
        bold: 700,
    },
    lineHeights: {
        body: 1.5,
        heading: 1.25,
    },
    shadows: {
        small: '0 0 4px rgba(0, 0, 0, .125)',
        large: '0 0 24px rgba(0, 0, 0, .125)'
    },
    variants: {
        wrap: {
            bg: 'midnightOff',
            mb: 1,
            width: '100%',
        },
        btn: {
            icon: {
                color: 'white'
            }
        }
    },
    text: {
        fontSize: '1rem',
        sub: {
            fontSize: '1.5rem',
            color: 'roman',
        },
        bar: {
            minWidth: 'unset',
            fontSize: '1.2rem',
        },
        subtitle: {
            color: 'roman',
        },
        barLabel: {
            color: 'white'
        },
        barText: {
            minWidth: 'unset',
            fontSize: '1.2rem',
            color: 'roman'
        }
    },
    buttons: {
        fontSize: '1.2rem',
        primary: {
            color: 'white',
            bg: 'tangelo',
        },
        danger: {
            borderRadius: '5px',
            color: 'white',
            bg: 'danger',
            fontSize: '1rem',
            px: '1rem',
            py: '0.5rem',
        },
        action: {
            borderRadius: '5px',
            color: 'white',
            bg: 'tangelo',
            px: '1rem',
            py: '0.5rem',
        },
        full: {
            width: '100%',
            alt: {
                bg: 'mauve',
            },
            alt2: {
                bg: 'granite',
            },
            primary: {
                bg: 'tangelo'
            },
            secondary: {
                bg: 'mauve',
                color: 'white'
            },
            danger: {
                bg: 'danger'
            }
        },
        text: {
            bg: 'transparent',
        },
        alt: {
            bg: 'mauve',
        },
        alt2: {
            bg: 'granite',
        },
        nav: {
            color: 'tangelo',
            bg: 'midnightOff',
        }
    },
    forms: {
        textarea: {
            borderRadius: '5px',
            color: 'lightgray',
            // minHeight: 120,
        },
        label: {
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.4)',
            width: 'unset',
        },
        select: {
            fontSize: '1.2rem'
        },
        input: {
            fontSize: '1.2rem',
            borderRadius: '5px',
        },
        noBorder: {
            fontSize: '1.2rem',
            border: 0,
            borderRadius: 5,
            transition: '0.3s boxShadow ease',
            paddingLeft: 0,
            paddingTop: 0,
            // boxShadow: '0px 0px 2px 0px grey inset',
            '&:focus': {
               // boxShadow: '0px 0px 3px 0px grey',
                outline: 'none',
            }
        }
    }
};

export default applyProps(init, null, {});

function applyProps(parent, key, previousProps) {
    // console.log('parent', parent);
    // console.log('key', key);
    // console.log('previousProps', previousProps);

    if (parent instanceof Array) {
        return { [key]: parent };
    }

    let props = Object.keys(parent).map(mapProps(parent)).filter(Boolean).reduce((prev, curr) => {
        const ret = { ...prev, ...curr };
        return ret;
    }, {});
    let subs = Object.keys(parent).map(mapSubObjects(parent)).filter(Boolean);
    // console.log('props', props);
    // console.log('subs', subs);

    if (subs.length) {
        let childAppliedProps = subs.map((s, i) => {
            // console.log(`s - ${s} from subs ${subs}`);
            // console.log('parent[s]', parent[s]);
            // console.log('passing:', {...previousProps, ...props});
            return applyProps(parent[s], s, {...previousProps, ...props});
        }).reduce((prev, curr) => {
            return ({ ...prev, ...curr });
        }, {});

        let returnVal = { ...previousProps, ...props, ...childAppliedProps };
        if (key) {
            returnVal = { [key]: returnVal };
        }
        return returnVal;
    } else {
        let returnVal = { ...previousProps, ...props };
        if (key) {
            returnVal = { [key]: returnVal };
        }
        return returnVal;
    }
}

function mapProps(parent) {
    return function (prop) {
        return typeof parent[prop] !== 'object' ? { [prop]: parent[prop] } : null
    };
}

function mapSubObjects(parent) {
    return function (prop) {
        return typeof parent[prop] === 'object' ? prop : null
    };
}

