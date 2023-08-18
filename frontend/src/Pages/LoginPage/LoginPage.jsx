import {useState, useEffect} from 'react' 
import LoginForm from "../../Components/LoginForm/LoginForm";
import "./LoginPage.css";


export default function LoginPage({
  setUserId,
  setFirstName,
  setLastName,
  setAccessToken,
}) {
  const [img, setImg] = useState();

  const fetchImage = async () => {
    await fetch("/api/logo")
      .then(response => response.blob())
      .then(imageBlob => setImg(URL.createObjectURL(imageBlob)))
      .catch(err => {
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
      <div className="login-box">
        <img className="login-logo" src={img} />
        <LoginForm
          setUserId={setUserId}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setAccessToken={setAccessToken}
        />
      </div>
    </div>
  );
}
