import EditableBar from "./components/EditableBar";
import moment from 'moment';

/**
 * @param amount
 * @param decimalCount
 * @param decimal
 * @param thousands
 * @returns {string}
 */
export const toDollars = (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        // Doing this because I was getting like -1.23E-18 which is dumb
        const notVeryLowNegativeValue = parseFloat(amount.toFixed(3)) !== -0.00;
        const negativeSign = amount < 0 && notVeryLowNegativeValue ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + "$" + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        console.log(e)
    }
};

export const sortByDate = transactions => {
    return transactions.sort((t1, t2) => {
        let diff = new Date(t2.date) - new Date(t1.date);
        if (diff === 0) {
            return t1.name > t2.name ? 1 : -1;
        }
        return diff;
    });
};

export const sortByName = transactions => {
    return transactions.sort((t1, t2) => t1.name > t2.name ? 1 : -1);
};

export const sortByAmount = transactions => {
    return transactions.sort((t1, t2) => {
        let diff = parseFloat(t2.amount) - parseFloat(t1.amount);
        return diff;
    });
};

// By date, then name, then amount
export const defaultTransactionSort = transactions => {
    return transactions.sort((t1, t2) => {
        let diff = new Date(t2.date) - new Date(t1.date);
        if (diff === 0) {
            let nameDiff = t1.name === t2.name;
            if (nameDiff) {
                // Try by amount
                return parseFloat(t1.amount) - parseFloat(t2.amount);
            } else {
                return t1.name > t2.name;
            }
        }
        return diff;
    });
};

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getDollarsFromE = e => {
    return parseFloat(e.target.value.replace(/,/g, ''));
};

export const dollarsFloat = val => {
    if (typeof val === 'string') {
        return parseFloat(parseFloat(val).toFixed(2));
    } else {
        return parseFloat(val.toFixed(2));
    }
};

export const firstCapitalOnly = str => {
    const words = str.split(' ');
    let formattedStr = words.map(word => {
        return word[0].toUpperCase() + word.substr(1).toLowerCase();
    }).join(' ');

    return formattedStr;
};

export const _try = (fn, fallback) => {
    try {
        return fn();
    } catch(err) {
        return fallback;
    }
};

export const totalAdjustments = category => {
    if (!category.adjustments || Object.keys(category.adjustments).length === 0) {
        return 0;
    } else {
        return dollarsFloat(Object.keys(category.adjustments).reduce((prev, curr) => prev + category.adjustments[curr], 0));
    }
};

export const formatDate = timeperiod => {
    const hasDay = /\d\d\d\d-\d\d-\d\d/;
    if (hasDay.test(timeperiod)) {
        return moment(timeperiod).format('MMM DD, YYYY');
    } else {
        return moment(timeperiod).format('MMM, YYYY');
    }
};
