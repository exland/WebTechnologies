document.getElementById("loginBtn2").addEventListener("click", function()
{
    login();
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
            login();   
        }
     }
 });

function login()
{
    var [usernameForm, passwordForm] = getLoginForm();

    if(usernameForm.value === "" || passwordForm.value === "")
    {
    document.getElementById("dialogTxt").textContent = "Please enter an username and a password!"
    document.getElementById("errorDialog").showModal();
    return;
    }

    var xhr =  new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/login",true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"username": usernameForm.value, "password": passwordForm.value}));
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4)
        {
            if(xhr.responseText === "ERROR:USERNOTFOUND")
            {
                document.getElementById("dialogTxt").textContent = "User not found!"
                document.getElementById("errorDialog").showModal();
                resetRegistrationForm(0);
                return;
            }
            else if(xhr.responseText === "ERROR:ALREADY LOGGED IN")
            {
                document.getElementById("dialogTxt").textContent = "Already logged in!"
                document.getElementById("errorDialog").showModal();
                resetRegistrationForm(0);
                return;
            }
            else
            {
                
                saveSessionID(xhr.responseText, usernameForm.value)
                window.location.href = "/index";
            }
        }
    }
}

function getLoginForm()
{
    var usernameForm = document.getElementById("username");
    var passwordForm = document.getElementById("password");

    return [usernameForm, passwordForm];
}

document.addEventListener("DOMContentLoaded", function()
{

    if(window.localStorage.getItem('session') != "0" && window.localStorage.getItem('session') != null)
    {
        window.location.href = "/index";
    }
    
})

function saveSessionID(sessionID, username)
{
    window.localStorage.setItem('session', sessionID);
    window.localStorage.setItem('username', username);
}