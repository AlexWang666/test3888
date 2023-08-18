/*
  PROJECT DATA OUTCOMES
  The breakdown of publications, patents and other information for a program.
*/


import React from 'react'

import "../../Main.css";
import "./ProjectDataWidgets.css"

export default function ProjectDataOutcomes({ outcomes, media }) {
    // outcomes: Information about publications and other events
    // - publications: Number of publications
    // - conferences: Number of conferences
    // - patents: Number of patents

    // media: Information about hype
    // - articles: Number of articles
    // - articleVisits: Number of article visits
    // - videos: Number of videos
    // - views: Number of views

    return (
        <div className="outcomes-data-rectangle" id="align-right">
            <p className="default-heading-3">Outcomes</p>

            <p>&nbsp;</p>

            <table className="invisible-table">
            <tbody>
                <tr>
                    <td>
                        Publications: <b>{outcomes.publications}</b>
                    </td>

                    <td>
                        Conferences: <b>{outcomes.conferences}</b>
                    </td>

                    <td>
                        Patents: <b>{outcomes.patents}</b>
                    </td>
                </tr>
            </tbody>
            </table>

            <p>&nbsp;</p>

            <p className="default-heading-3">Media</p>

            <p>&nbsp;</p>

            <table className="invisible-table">
            <tbody>
                <tr>
                    <td>
                        News Articles: <b>{media.articles}</b>
                    </td>

                    <td>
                        Article Visits: <b>{media.articleVisits}</b>
                    </td>
                </tr>

                <tr>
                    <td>
                        Videos: <b>{media.videos}</b>
                    </td>

                    <td>
                        Video Views: <b>{media.views}</b>
                    </td>
                </tr>
            </tbody>
            </table>

        </div>
    );
}
