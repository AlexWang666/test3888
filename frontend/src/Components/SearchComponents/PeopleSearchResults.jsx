/*
  PEOPLE SEARCH
  The preview of users returned by the search query.
*/

import React from 'react'

import "../../Main.css";
import "../MarketplaceComponents/Marketplace.css"
import "./SearchComponents.css"

export default function PeopleSearchResults({ peopleList, goToProfile }) {
  // peopleList: The list of people to be displayed
  // - first_name: The user's first name
  // - last_name: The user's last name
  // - education: The user's current affiliated uni
  // - bio: The user's bio
  // - pfp: User's profile picture

  // goToProfile: Takes the user to the description of the program.

  return (
    <div className="boxes-holder">
      {peopleList.map((peopleInfo) => (

        <div key={peopleInfo.id}
          className="person-box-rectangle"
          onClick={() => goToProfile(peopleInfo.id)}>

          <div className="upper-elements-centred">
            <div className="profile-picture" id="marketplace-pfp">
              {peopleInfo.pfp}
            </div>

            <div>
              <p className="project-name">
                {peopleInfo.first_name}&nbsp;{peopleInfo.last_name}
              </p>

              <p className="default-paragraph-5">
                {peopleInfo.education}
              </p>
            </div>
          </div>

          <div className="upper-elements">
            <p className="marketplace-box-paragraph">
              {peopleInfo.bio}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
