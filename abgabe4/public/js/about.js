document.addEventListener("DOMContentLoaded", function()
{
    if(window.localStorage.getItem('session') == "0" && window.localStorage.getItem('session') != null)
    {
        document.getElementById("loginMsg").textContent = "";
    }
    else
    {   
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("loginMsg").textContent = "Your session id is: " + window.localStorage.getItem('session') + '.';
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("registerBtn").style.display = "none";
    }
})

document.getElementById("logoutBtn").addEventListener("click", function()
{
    var xhr =  new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/logout",true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"session": window.localStorage.getItem('session')}));

    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("loginBtn").style.display = "block";
    document.getElementById("registerBtn").style.display = "block";
    document.getElementById("loginMsg").textContent = "Login to ask a question.";
    window.localStorage.setItem('session', "0")
})

window.addEventListener('keypress', function (e)
{
     if (e.key === 'Enter')
     {
       var field  =  document.getElementById('Userquery').value.replaceAll(" ", "-").toLowerCase()
       location.href =  "/query/"+ field
     }
 });