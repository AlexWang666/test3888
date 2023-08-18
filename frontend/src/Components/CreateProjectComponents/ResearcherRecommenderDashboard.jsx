import React, { Component, useEffect, useState } from 'react';
// import * as React from 'react';
// import "../pages/CreateProblem.css"
// import axios from "axios"
import { makeStyles } from '@material-ui/core/styles'
// import { Input, InputLabel, FormControl, FormHelperText, Button , ButtonGroup, TextField, Paper} from '@material-ui/core';
// import { CgLoadbar } from "react-icons/cg";
// import FilledInput from '@material-ui/core/FilledInput';
// import InputAdornment from '@material-ui/core/InputAdornment';
// import CurrencyInput from 'react-currency-input-field';
// import MenuItem from '@material-ui/core/MenuItem';
// import { alpha } from '@material-ui/core/styles'
// import { KeyboardDatePicker } from "@material-ui/pickers";
import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
// import Slide from '@mui/material/Slide';
// import {
//     DatePicker,
//     KeyboardDatePicker,
//     TimePicker,
//     DateTimePicker,
//     MuiPickersUtilsProvider,
//   } from '@material-ui/pickers';
// import DateFnsUtils from '@date-io/date-fns';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
// import { useHistory, Link } from 'react-router-dom'
import { DataGrid } from "@mui/x-data-grid";
// import {Chart} from 'chart.js'
// import * as Plotly from 'plotly.js';
// import fingerprintGraph from './fingerprintGraph.png';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// import Popover from '@mui/material/Popover';
// import Typography from '@mui/material/Typography';
// import ResearcherProfilePopup from './ResearcherProfilePopup';
// import "./ResearcherProfilePopup.css"


const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      margin: 15
    },
    dialogDashboard: {
        align: 'center',
        textAlign: 'center', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        maxHeight: '100vh',
        // minWidth: '100vh',
        // maxWidth: '100vh'
    }, 
    recommenderDashboard: {
      // flexDirection: 'row'
    }
  }));

  
export default function ResearcherRecommendationDashboard(openRecomDashboard, SetOpenRecomDashboard, topResearchers, projectFingerprint) {

    const classes = useStyles();

    const [profileUrl, setProfileUrl] = React.useState("default");
    // const [getRequestSent, setGetRequestSent] = React.useState(false);
    const [openProfilePopup, setOpenProfilePopup] = React.useState(false);

    const handleClose = () => {
      setOpenProfilePopup(false);
        
    };


    // const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    // const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    //   setAnchorEl(event.currentTarget);
    // };
  
    // const handlePopoverClose = () => {
    //   setAnchorEl(null);
    // };
  
    // const open = Boolean(anchorEl);
    
    const nameClicked = (e, url, organisation) => {
      e.preventDefault();
      // console.log(openRecomDashboard);
      // setProfileUrl("https://stackoverflow.com/questions/44292187/anchor-tag-isnt-calling-the-onclick-function-in-react");
      // console.log(setProfileUrl);
      // console.log(typeof(setProfileUrl));
      if (organisation == "USYD") {
        setProfileUrl(url);
        setOpenProfilePopup(true);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      
      // console.log(url);
    }




    const researcherProfilePopup = () => {
      return (
        <Dialog
                  className = {classes.dialogDashboard}
                  open={openProfilePopup}
                  onClose={handleClose}
                  fullWidth
                  maxWidth="xl"
                  // aria-labelledby="alert-dialog-title"
                  // aria-describedby="alert-dialog-description"
                  >
                      <DialogTitle className={classes.dialogSuccessText} id="alert-dialog-title">
                      {"Researcher profile page"}
                      </DialogTitle>
                      <DialogContent className={classes.dialogDashboard}>
                        {/* <div> */}
                            {/* <h1>{profileUrl}</h1> */}
                            <iframe 
                              align="center"
                              src={profileUrl}
                            ></iframe>
                        {/* </div> */}
               </DialogContent> 
                      
             </Dialog>
      );
    }

    const columns = [
        { field: "id", headerName: " ", width: 10 },
        { field: "title", headerName: "Name", width: 300, 
            renderCell: (params) => (
              // <a href="#" onClick={(e) => nameClicked(e, params.row.Url, params.row.Organisation)}>{params.value}</a>
              <a href={params.row.link}>{params.value}</a>
            )
        },
        { field: "org", headerName: "Organisation", width: 100 },
        { field: "email", headerName: "Email", width: 250, 
            renderCell: (params) => (
              <a href={"mailto:".concat(params.value)}>{params.value}</a>
            )   
        },
        { field: "snippet", headerName: "Profile snippet", width: 1000 },
        // { field: "Phone", headerName: "Phone", width: 150, 
        //     renderCell: (params) => (
        //       <a href={"tel:".concat(params.value)}>{params.value}</a>
        //     )
        //  },

        
        // { field: "link", headerName: "Url", width: 150, 
        //     // renderCell: (params) => (
        //     //   <a href={params.value}>{params.row.Name}</a>
        //     // )
        //  },
        // { field: "FingerprintCsv", headerName: "Interests", width: 650 },
        
      ];

    const getRows = () => {
        var rows = [];
        var row = {};
        var id = 1;

        for (const key in topResearchers) {
          // console.log("key:", key);
          row = topResearchers[key];
          // row['Name'] = <Link to= {row["Url"]}>{row['Name']}</Link>
          row['id'] = id;
          // row['Url'] = '<a href="mailto:info@searten.com">info@searten.com</a></p>;'
          rows.push(row);

          id++;
          
        }
        
        
        return rows;
      };

           
  
  
    
    // console.log(topResearchers);
    if (openRecomDashboard) {
      return (
      
                          
        <div className={classes.recommenderDashboard} 
            style={{ height: 600, width: "100%", marginBottom: "10px", display:'inline-block' }}>
            
            {/* FOR THE WEIGHTS OF KEYWORDS */}
            {/* <ResponsiveContainer width="100%" height="100%">
              <BarChart
              layout="vertical"
                width={500}
                height={800}
                data={projectFingerprint}
                margin={{
                  top: 5,
                  right: 150,
                  left: 75,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis  type = "number"/>
                <YAxis type = "category" dataKey="keywords"/>
                <Tooltip />
                <Bar dataKey="score" fill="#8884d8" />
                {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
              {/* </BarChart> */}
            {/* </ResponsiveContainer> */} 
            
            <DataGrid
                rows={getRows()}
                columns={columns}
                pageSize={20}
                rowsPerPageOptions={[20]}
                checkboxSelection={false}
                // onRowClick={(param) => {
                // handleSelect(param);
                // }}
            ></DataGrid> 
                   
            {researcherProfilePopup()}
        </div>
   
      );

    }

    

}