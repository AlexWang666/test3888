import axios from "axios";
// import {frontend_ip_address, frontend_port, api_ip_address, api_port} from "../../../deployment/local_deployment_config.json";
import {frontend_ip_address, frontend_port, api_ip_address, api_port} from "../../../deployment/deployment_config.json";
import { extractCSRFRefreshToken } from "../BasicComponents/Cookie"

// axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.baseURL = "http://".concat(frontend_ip_address, ":", frontend_port);

/*
* Intercepts all responses, if a response has a 401 status code
* (not authorized), send a request to refresh the access_token
* and retry the original request.
*
* If the access_token couldn't be refreshed (eg refresh_token expired),
* remove the expired access_token from local storage. This will cause
* App.jsx to show the login screen again.
*/
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response.status === 401 &&
      !error.config._retry &&
      error.response.config.url != "/api/refresh_access_token"
    ) {
      error.config._retry = true;
      var headers = { "X-CSRF-TOKEN": extractCSRFRefreshToken() };
      axios
        .post(
          "/api/refresh_access_token",
          {},
          { withCredentials: true, headers: headers }
        )
        .then((response) => {
          if (response.status != 200) {
            localStorage.removeItem("accessToken");
          }
        window.location.reload()
        })
        .catch((error) => {
          console.log(error)
          localStorage.removeItem("accessToken");
          window.location.reload();
        });
    }
  }
);
