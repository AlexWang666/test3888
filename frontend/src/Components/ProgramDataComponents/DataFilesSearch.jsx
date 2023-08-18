/*
  DATA FILES SEARCH
  The search bar used near the top of the data files page.
*/


import React from 'react'

import "./DataFilesWidgets.css";
import "../../Main.css";

export default function DataFilesSearch() {
    // TODO: Add date picker and search functionality

    return (
        <table className="file-search-table" id="clickable-table">
        <tbody>
            <tr>
                <td>
                    From Date:
                    <input
                        type="date"
                        className="form-elements-data-files"
                    >
                    </input>
                </td>
                <td>
                    To Date:
                    <input
                        type="date"
                        className="form-elements-data-files"
                    >
                    </input>
                </td>
                <td>
                    Projects:
                    <select className="form-elements-data-files">
                        <option value="Project1">Project 1</option>
                        <option value="Project2">Project 2</option>
                        <option value="Project3">Project 3</option>
                    </select>
                </td>
            </tr>
        </tbody>
        </table>
    );
}
