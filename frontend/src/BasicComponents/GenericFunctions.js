import { decodeToken } from "react-jwt";

// Gets the user id of the current user
export function GetUserId() {
  const token = localStorage.getItem("accessToken");
  var decodedAccessToken = decodeToken(token);
  var user = decodedAccessToken["sub"]["id"];
  return user;
}

// Returns the date as a normal string without all the GMT shit
export function GetDateString(projDate) {
  // console.log({ projDate });
  if (typeof projDate !== "undefined") {
    let words = projDate.split(" ");
    let dateOnly = words[1] + " " + words[2] + " " + words[3];
    return dateOnly;
  }
}

// Returns the date as a normal string without all the GMT shit
export function GetDateStringTime(projDate) {
  if (typeof projDate !== "undefined") {
    let words = projDate.split(" ");
    let dateOnly = words[1] + " " + words[2] + " " + words[3];

    words = words[4].split(":");
    let hoursMins = words[0] + ":" + words[1];

    return hoursMins + " " + dateOnly;
  }
}

// Converts the fraction to a percentage
export function GetPercentage(numerator, denominator) {
  if (denominator === 0) {
    return 0;
  } else {
    var num = (numerator / denominator) * 100;
    // return Math.round(num * 100) / 100;
    return Math.round(num);
  }
}
