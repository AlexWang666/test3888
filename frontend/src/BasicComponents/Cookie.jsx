import "axios";

const extractCSRFRefreshToken = () => {
  var splitByComma = document.cookie.split(";");
  var cookieObject = {};
  splitByComma.map((pair) => {
    var splitPair = pair.split("=");
    var key = splitPair[0].trim();
    var value = splitPair[1].trim();
    cookieObject[key] = value;
  });
  return cookieObject["csrf_refresh_token"];
};

export { extractCSRFRefreshToken };
