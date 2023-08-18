import React from 'react'

import "./TaskComponents.css"
import "../../Main.css";

import { GetDateString } from "../../BasicComponents/GenericFunctions";

export default function ActiveTasks({ taskList, goToTask }) {
    // taskList: The list of tasks to be displayed
    // - name: Title
    // - type: Type (task or milestone)
    // - author: Author who created the task
    // - pfp: Profile picture of the author
    // - description: Short description
    // - due: When the task is due

    // goToTask: Takes the user to the description of the task.

    return (
        <div className="boxes-holder">
            {taskList.map((taskInfo) => (

                <div key={taskInfo.id}
                  className="task-box-rectangle"
                  onClick={()=>goToTask(taskInfo.id, taskInfo.type)}>

                    <div className="upper-elements">
                        <p className="task-name">{taskInfo.name}</p>
                    </div>

                    <p>&nbsp;</p>

                    <div className="upper-elements">
                      <div className="task-type-icon" id={taskInfo.type+"-type"}>
                          <p>{taskInfo.type.toUpperCase()}</p>
                      </div>

                      <p className="project-name" id="align-right">
                          {GetDateString(taskInfo.due)}
                      </p>
                    </div>

                    <div className="upper-elements">
                        <p className="task-box-paragraph">
                            {taskInfo.description}
                        </p>
                    </div>

                    <div className="upper-elements-centred">
                        <div className="profile-picture" id="marketplace-pfp">
                            {taskInfo.pfp}
                        </div>
                        <p className="marketplace-author-name">
                            Assigned to {taskInfo.author}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
