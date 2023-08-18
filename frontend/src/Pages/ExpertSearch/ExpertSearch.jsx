import React from "react";
import axios from "axios";
import { Grid } from  'react-loader-spinner'
import TextareaAutosize from 'react-textarea-autosize';
import Switch from "react-switch";
import { decodeToken } from "react-jwt";




import "../../Main.css";
import "./ExpertSearch.css"
import ResearcherRecommendationDashboard from "../../Components/CreateProjectComponents/ResearcherRecommenderDashboard";

export default function ExpertSearch() {
    const [data, setData] = React.useState("");
    const maxDataLength = 3500;

    const [projectFingerprint, setProjectFingerprint] = React.useState([]);
    const [openRecomDashboard, SetOpenRecomDashboard] = React.useState(false);
    const [topResearchers, setTopResearchers] = React.useState({});
    const [showLoadingIcon, setShowLoadingIcon] = React.useState(false);
    // const [hasKeywords, setHasKeywords] = React.useState(false);

    // Gets the user id for use everywhere on the page
    const getUserId = () => {
        const token = localStorage.getItem("accessToken");
        var decodedAccessToken = decodeToken(token);
        var user = decodedAccessToken["sub"]["id"];

        return user;
    }

    const userId = getUserId();

    const openRecommendationDashboard = async () => {
        SetOpenRecomDashboard(false);
        setShowLoadingIcon(true);
        // const params = {name: "", shortDesc: "", longDesc: data, hasKeywords: hasKeywords};
        const params = {name: "", shortDesc: "", longDesc: data, userId: userId, 
                        date: new Date()};
        console.log(params);
        var gotResearchers = false;
        var gotGraph = false;
    
        
    
        console.log(params);
        
        // await axios.get("/api/get-project-fingerprint", {params}).then((response) => {
        //     setProjectFingerprint(response.data);
               
        //     // console.log(response.data);
            
             gotGraph = true;
    
            
        //     }, (error) => {
        //         console.log(error);
        //     }
        //     );
    
        await axios.get("/api/get-top-researchers", {params}).then((response) => {
            setTopResearchers(response.data);
            console.log(topResearchers);
            // console.log('received researchers');
            // SetOpenRecomDashboard(true);
            // console.log(topResearchers);
            gotResearchers = true;
            console.log(topResearchers);
            }, (error) => {
                console.log(error);
            }
            );
    
        // console.log(gotResearchers, gotGraph);
        
        if (gotGraph && gotResearchers) {
            setShowLoadingIcon(false);
            SetOpenRecomDashboard(true);

        }
        
    };  


    const displayLoadingIcon = () => {
        if (showLoadingIcon) {
            return (
            <div className="loading-icon">
                <Grid
                    height="100"
                    width="100"
                    color="#0066ff"
                    ariaLabel="grid-loading"
                    radius="12.5"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={showLoadingIcon}
                />
            </div>
            );
        }
        
    }
    

        

    return (
        <div className="projects-page">
            <div className="centred-div">
                <h1>Expert Search</h1>
            </div>
            
            <h1>Project Description</h1>
            {/* <br></br> */}
            
            {/* <div style={{alignItems: 'center', justifyContent: 'center'}}>
                <h3 style={{display: "inline"}}>Search using keywords:  </h3>
                <Switch onChange={(x) => {setHasKeywords(x); console.log(hasKeywords);}} 
                        uncheckedIcon={false}
                        checkedIcon={false} 
                        checked={hasKeywords} />
            </div> */}
                
            {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                <h3 style={{marginRight: "10px"}}>Search using keywords:    </h3>
                <Switch onChange={(x) => {setHasKeywords(x); console.log(hasKeywords);}} 
                        uncheckedIcon={false}
                        checkedIcon={false} 
                        checked={hasKeywords} />
            </div> */}
            
            
            
            <div className="centred-div">
                {/* <textarea
                    type="textarea"
                    className="default-form-text-small"
                    onChange={(event) => {
                        setData(event.target.value);
                    }}
                ></textarea> */}
                <TextareaAutosize
                    id="message"
                    className="project-desc-textbox"
                    minRows='4'
                    maxRows='10'
                    maxLength={maxDataLength}
                    onChange={(event) => {
                        setData(event.target.value);}}
                ></TextareaAutosize>
            </div>

            <p style={{textAlign: 'right', marginRight: '1%', marginTop: '-0.75%'}}>
                {data.length}/{maxDataLength} characters
            </p>
            

            <div className="centred-div">
                <button 
                className="default-button"
                type="button"
                onClick={openRecommendationDashboard}
                >
                Find Experts
                </button>
            </div>
            <br></br>


            {displayLoadingIcon(showLoadingIcon)}
                
            
            
            


        <br></br>
        
        

        {ResearcherRecommendationDashboard(openRecomDashboard, SetOpenRecomDashboard, topResearchers, projectFingerprint)}

        </div>
        
    );
}