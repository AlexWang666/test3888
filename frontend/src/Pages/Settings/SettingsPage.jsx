/* MARKET PROJECT DESCRIPTION */
/*
   A description of the project clicked on in the marketplace.
*/

import React from "react";
import SearchBar from "../../Components/SearchComponents/SearchBar";

import "../../Main.css";

export default function SettingsPage() {

    return (
        <div className="projects-page">

            <div className="upper-elements">
               <h1 className="default-heading">Settings</h1>

               <SearchBar />
            </div>

        </div>
    );
}
