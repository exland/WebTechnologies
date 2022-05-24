document.getElementById("logoutBtn").addEventListener("click", function()
{
    var xhr =  new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/logout",true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"session": window.localStorage.getItem('session')}));

    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("loginBtn").style.display = "block";
    document.getElementById("registerBtn").style.display = "block";
    window.localStorage.setItem('session', '0');
    document.getElementById("loginMsg").textContent = "";
    
})

window.addEventListener('keypress', function (e)
{
     if (e.key === 'Enter')
     {
       var field  =  document.getElementById('Userquery').value.replaceAll(" ", "-").toLowerCase()
       location.href =  "/query/"+ field
     }
 });


document.addEventListener("DOMContentLoaded",  function()
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
    var data = document.getElementsByClassName("idTransfer")[0].id.split('e')

    window.localStorage.setItem('questionID',data[1])
    var upvoteList;
    var xhr =  new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/getupvotes",true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"session": window.localStorage.getItem('session')}));
    xhr.onreadystatechange =  function()
    {
        if (xhr.readyState === 4)
        {
            upvoteList = JSON.parse(xhr.responseText)
            var upvoteBtns = document.getElementsByClassName("upvoteBtn");
            Array.from(upvoteBtns).forEach(function (element) {
                upvoteList.forEach(element1 => {
                    if(element.id == element1)
                    {
                        console.log(element.id)
                        element.style.background = "url(../download3.svg)";
                        element.disabled = true;
                    }
                });
                    
              });
        }
    }

    var upvoteList2;
    var xhr2 =  new XMLHttpRequest();
    xhr2.open("POST","http://localhost:3000/getupvotesq",true);
    xhr2.setRequestHeader('Content-Type', 'application/json');
    xhr2.send(JSON.stringify({"session": window.localStorage.getItem('session')}));
    xhr2.onreadystatechange =  function()
    {
        if (xhr2.readyState === 4)
        {
            upvoteList2 = JSON.parse(xhr2.responseText)
            var upvoteBtns2 = document.getElementsByClassName("upvoteBtn2");
            Array.from(upvoteBtns2).forEach(function (element) {
                upvoteList2.forEach(element1 => {
                    if(element.id == element1)
                    {
                        console.log(element.id)
                        element.style.background = "url(../download3.svg)";
                        element.disabled = true;
                    }
                });
                    
              });
        }
    }
})

async function changeBtnColor(id)
{

    document.getElementById(id).style.background = "url(../download3.svg)";
    document.getElementById(id).disabled = true;
    var score = document.getElementById("score"+id).textContent;
    document.getElementById("score"+id).textContent = "Upvotes: " + (parseInt(score.split(':')[1]) + 1).toString();
    var xhr =  new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/upvote",true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"upvote": id.toString(), "session": window.localStorage.getItem('session')}));
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4)
        {
            if(xhr.responseText == "ERROR")
            {
                document.getElementById(id).style.background = "url(../upvote-svgrepo-com.svg)";
                var score = document.getElementById("score"+id).textContent;
                document.getElementById("score"+id).textContent = "Upvotes: " + (parseInt(score.split(':')[1]) - 1).toString();
                document.getElementById("dialogTxt").textContent = "You are not logged in!"
                document.getElementById(id).disabled = false;
                document.getElementById("errorDialog").showModal();
                return;
            }
            else
            {
                
            }
        }
    }
}

async function changeBtnColorQuestion(id)
{

    document.getElementById(id).style.background = "url(../download3.svg)";
    document.getElementById(id).disabled = true;
    var score = document.getElementById("score"+id).textContent;
    document.getElementById("score"+id).textContent = "Upvotes: " + (parseInt(score.split(':')[1]) + 1).toString();
    var xhr =  new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/upvoteq",true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"upvote": id.toString(), "session": window.localStorage.getItem('session')}));
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4)
        {
            if(xhr.responseText == "ERROR")
            {
                document.getElementById(id).style.background = "url(../upvote-svgrepo-com.svg)";
                var score = document.getElementById("score"+id).textContent;
                document.getElementById("score"+id).textContent = "Upvotes: " + (parseInt(score.split(':')[1]) - 1).toString();
                document.getElementById("dialogTxt").textContent = "You are not logged in!"
                document.getElementById(id).disabled = false;
                document.getElementById("errorDialog").showModal();
                return;
            }
            else
            {
                
            }
        }
    }
}