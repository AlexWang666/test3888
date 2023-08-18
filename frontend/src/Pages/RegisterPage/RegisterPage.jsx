import RegisterForm from "../../Components/RegisterForm/RegisterForm";
import "./RegisterPage.css";
import "../LoginPage/LoginPage.css";
import { useEffect, useState } from "react";

export default function RegisterPage({ setUserId, setFirstName, setLastName }) {
  const [img, setImg] = useState();

  const fetchImage = async () => {
    await fetch("/api/logo")
      .then((response) => response.blob())
      .then((imageBlob) => setImg(URL.createObjectURL(imageBlob)))
      .catch((err) => {
        console.log(err);
        console.log(err.message);
        throw Error(err.message);
      });
  };

  useEffect(() => {
    fetchImage();
  }, []);

  return (
    <div className="login-page">
      <div className="login-box" id="register-box">
        {/* <img className="login-logo" src={"././img/searten_logo.jpg"} /> */}
        <img className="login-logo" src={img} />

        <RegisterForm
          setUserId={setUserId}
          setFirstName={setFirstName}
          setLastName={setLastName}
        />
      </div>
    </div>
  );
}
