/*
  PROJECT DATA BUDGET
  The detailed budget breakdown for a program.
*/


import React from 'react'

import "../../Main.css";
import "./ProjectDataWidgets.css"

export default function ProjectDataBudget({ cashMoney, exhaustion }) {
    // cashMoney: Information about the money
    // - institution: University or industry funding body
    // - cash: Cash
    // - inKind: In-Kind

    // exhaustion: Amount of money spent already


    // Determine total amount of money
    // Determine total in-kind and cash
    var totalMoneh = 0;
    var totalCash = 0;
    var totalInKind = 0;
    for(var i=0; i<cashMoney.length; i++) {
        totalMoneh = totalMoneh+cashMoney[i].cash+cashMoney[i].inKind;
        totalCash = totalCash+cashMoney[i].cash;
        totalInKind = totalInKind+cashMoney[i].inKind;
    }


    // Determines percentage of budget exhausted
    var exhausted = 0;
    if (totalMoneh !== 0) {
        exhausted = Math.round((exhaustion/totalMoneh) * 1000)/1000;
    }


    return (
        <div className="team-data-rectangle">

            <div className="upper-elements">
                <p className="default-heading-3">Budget</p>
                <p id="align-right">
                    Total Funds: <b>${totalMoneh}</b>
                </p>
            </div>

            <div className="upper-elements">
                <p id="align-right" style={{color: '#6A7881'}}>
                    In-Kind: <b>${totalInKind}</b>,
                    Cash: <b>${totalCash}</b>
                </p>
            </div>

            <p>&nbsp;</p>
            <p><b>Exhaustion</b></p>
            <p>&nbsp;</p>

            <div className="upper-elements">
                <progress className="default-progress-bar"
                            value={exhausted}
                            max={1} />

                <p id="align-right"><b>{exhausted*100}%</b> Exhausted</p>
            </div>

            <p>&nbsp;</p>
            <p><b>Breakdown</b></p>
            <p>&nbsp;</p>

            <table className="invisible-table">
            <tbody>
                {cashMoney.map((funder) => (
                    <tr key={funder.id}>
                        <td className="funder-row">
                            <p><b>{funder.institution}</b></p>
                        </td>

                        <td>
                            <p id="budget-p">Cash: <b>${funder.cash}</b></p>
                            <p id="budget-p">In-Kind: <b>${funder.inKind}</b></p>
                        </td>

                        <td>
                            <progress className="progress-budget-bar"
                                        value={funder.cash}
                                        max={funder.cash+funder.inKind} />
                        </td>
                    </tr>
                ))}
            </tbody>
            </table>

        </div>
    );
}
