/*
  DRIVE NAVIGATION CHAIN
  The list of folders and subfolders opened at the top of the page.
*/

import React from 'react'

import "../../Main.css";
import "./DriveComponents.css"

export default function DriveNavigationChain({ folderFilesList }) {
    // folderFileList: The list folders or files in the history
    // - name: The title of the subfolder or file

    return (
        <div className="upper-elements">
            {folderFilesList.map((fileName) => (
                <div key={fileName.id} className="navigation-p">
                    {fileName.name} /&nbsp;
                </div>
            ))}
        </div>
    );
}
