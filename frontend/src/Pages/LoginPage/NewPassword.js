/*
  NEW PASSWORD
  This is where the user enters their new password.
*/

const resetPassword = async () => {
  var newPassword = document.querySelector(".text-input").value;
  var token = window.location.href.split('/')[4];

  fetch("/api/reset-password", {
    "method": "POST",
    "headers": {"Content-Type": "application/json"},
    "body": JSON.stringify({
      "password": newPassword,
      "token": token,
    }),
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    window.location.replace("http://beta.searten.com");
  });
}
