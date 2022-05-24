document.getElementById("registerBtn2").addEventListener("click", function()
{
     registerNewUser()
})

window.addEventListener('keypress', function (e)
{
     if (e.key === 'Enter')
     {
        if(document.getElementById("Userquery") === document.activeElement)
        {
          var field  =  document.getElementById('Userquery').value.replaceAll(" ", "-").toLowerCase()
          location.href =  "/query/"+ field
        }
        else
        {
            registerNewUser();   
        }
     }
 });


function getRegistrationForm()
{
     var usernameForm = document.getElementById("username");
     var passwordForm = document.getElementById("password");
     var confirmPasswordForm = document.getElementById("confirmPassword");

     return [usernameForm, passwordForm, confirmPasswordForm];
}

function resetRegistrationForm(formNumber)
{
     switch (formNumber) {
          case 0:
               document.getElementById("username").value = "";
               return;
          default:
               document.getElementById("username").value = "";
               document.getElementById("password").value = "";
               document.getElementById("confirmPassword").value = "";
               return;
     }
}

window.addEventListener('beforeunload', resetRegistrationForm, false);
window.addEventListener('load', resetRegistrationForm, false);

function registerNewUser()
{
     var [usernameForm, passwordForm, confirmPasswordForm] = getRegistrationForm();

     if(usernameForm.value === "" || passwordForm.value === "" || confirmPasswordForm.value === "")
     {
          document.getElementById("dialogTxt").textContent = "Please enter an username and a password!"
          document.getElementById("errorDialog").showModal();
          return;
     }
     if(passwordForm.value != confirmPasswordForm.value)
     {
          document.getElementById("dialogTxt").textContent = "Passwords are not identical!"
          document.getElementById("errorDialog").showModal();
          return;
     }
     if(passwordForm.value === usernameForm.value)
     {
          resetRegistrationForm();
          document.getElementById("dialogTxt").textContent = "Password can't be username!"
          document.getElementById("errorDialog").showModal();
          return;
     }

     var xhr =  new XMLHttpRequest();
     xhr.open("POST","http://localhost:3000/register",true);
     xhr.setRequestHeader('Content-Type', 'application/json');
     xhr.send(JSON.stringify({"username": usernameForm.value, "password": passwordForm.value, "upvotes": [], "upvotesq": []}));
     
     xhr.onreadystatechange = function()
     {
          if (xhr.readyState === 4)
          {
               if(xhr.responseText === "ERROR:USERNAME")
               {
                    document.getElementById("dialogTxt").textContent = "Username already exists!"
                    document.getElementById("errorDialog").showModal();
                    resetRegistrationForm(0);
                    return;
               }
               else
               {
                    //Succesfully registered
                    document.getElementById("dialogTxt2").innerHTML = "Succesfully registered!<br />Close to go to the login page!"
                    document.getElementById("succesDialog").showModal();
                    resetRegistrationForm(4);
               }
          }
     }
}

document.getElementById("succesLoginBtn").addEventListener("click", function()
{
     window.location.href = "/login.html";
})