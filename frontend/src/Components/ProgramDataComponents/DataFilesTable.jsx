/*
  DATA FILES TABLE
  The list of files used for a program.
*/


import React from 'react'

import "./DataFilesWidgets.css";
import "../../Main.css";

export default function DataFilesTable({ filesList }) {
    // filesList: The list of project data files.
    // - fileName: File name
    // - numCollaborators: Number of collaborators
    // - createDate: Last edited

    return (
        <table className="default-table" id="clickable-table">
        <tbody>
            <tr>
                <td id="profile-pic-column"></td>
                <td>File Name</td>
                <td>Collaborators</td>
                <td>Last Edited</td>
            </tr>

            {filesList.map((file) => (
                <tr key={file.id}>
                    <td>
                        <p>&#x1F4DD;</p>
                    </td>
                    <th>{file.fileName}</th>
                    <td>{file.numCollaborators}</td>
                    <td>{file.createDate}</td>
                </tr>
            ))}
        </tbody>
        </table>
    );
}
