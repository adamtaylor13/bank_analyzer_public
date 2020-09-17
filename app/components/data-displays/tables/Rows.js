import React from 'react';
import TableRowBase from "./TableRowBase";
import {capitalizeFirstLetter} from "../../../utility";
import Cell from "./Cell";

const Rows = (props) => {
    const { rows, cellmap, isMobile, ...rest } = props;
    return (
        <>
            {rows.map((row, rowIndex) => (
                <TableRowBase key={ rowIndex }
                              hover={ true }
                              index={ rowIndex }
                              length={ rows.length }
                              row={ row } { ...rest }
                              className={ row && row.className ? row.className : '' } >

                    { cellmap.map((cell, cellIndex) => {

                        let { name, hideOnLastRow, mobile, renderOnTotal = true, ...cellProps } = cell;

                        if (typeof cell.name === 'function') {
                            name = cell.name({ ...row, isMobile });
                        } else {
                            name = cell.name.split('.').reduce((prev, curr) => prev[curr], row);
                            if (cell.capFirstLetter) {
                                name = capitalizeFirstLetter(name);
                            }
                        }

                        cellProps = {
                            ...cellProps,
                            value: name,
                            isMobile,
                        };

                        const lastRow = rows.length - 1 === rowIndex;
                        const noRender = lastRow && hideOnLastRow || (isMobile && !mobile);
                        if (noRender) {
                            return <Cell noRender={ true } key={ cellIndex }/>;
                        }

                        let hideCellOnTotalRow = !renderOnTotal && lastRow && row.name.toLowerCase() === 'total';
                        const emptyDisplay = hideCellOnTotalRow;
                        if (emptyDisplay) {
                            return <Cell emptyDisplay={ true } key={ cellIndex }/>;
                        }

                        return <Cell { ...cellProps } key={ cellIndex } />;
                    })}
                </TableRowBase>
            ))}
        </>
    );
};

export default Rows;
