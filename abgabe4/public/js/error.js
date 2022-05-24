window.addEventListener('keypress', function (e)
{
     if (e.key === 'Enter')
     {
       var field  =  document.getElementById('Userquery').value.replaceAll(" ", "-").toLowerCase()
       location.href =  "/query/"+ field
     }
 });



 document.getElementById("logoutBtn").addEventListener("click", function()
{
    var xhr =  new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/logout",true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"session": window.localStorage.getItem('session')}));
    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("loginBtn").style.display = "block";
    document.getElementById("registerBtn").style.display = "block";
    window.localStorage.setItem('session', '0')
    document.getElementById("loginMsg").textContent = "";

    
    
})