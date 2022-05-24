
var obj = {}
var shell ={} 





document.getElementById("submitBtn").addEventListener("click", function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/new', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        if(document.getElementById('input').value === "")
        {
            return;
        }
        var text = document.getElementById('input').value.split('\n')

        obj["Title"] =  text[0];
        var very_end = '</p>'
        var body = ""
        text.shift();
        text.forEach(element => {
         body += HTML_converter(element)
        });
        shell["id"] =   window.localStorage.getItem('session')
   
        console.log(body)
        var date = new Date()
        var creation = ""
        creation += date.getFullYear().toString()+ '-' + 
                    (date.getMonth() + 1).toString() + '-' +
                    date.getDate().toString() +'T' + 
                    date.getHours().toString() +':'+
                    date.getMinutes().toString()+':'+
                    date.getSeconds().toString()+'Z';

        obj["Body"] = body;
        obj["Score"] =999999;
        obj["CreationDate"] =  creation
        obj["OwnerUserId"] = window.localStorage.getItem('username')
        shell["mgs"] =  obj
        console.log(shell)
        xhr.send(JSON.stringify(shell))
        xhr.onreadystatechange = function()
        {
            if(xhr.readyState == 4)
            {
                if(xhr.responseText == 'NOTLOGGED')
                {
                    document.getElementById("dialogTxt").textContent = "You are not logged in!"
                    document.getElementById("errorDialog").showModal();
                    document.getElementById('input').value = "";
                    return;
                }
                else
                {
                    window.location.href = "/question/"+ xhr.responseText;
                }
            }
        }
        document.getElementById('input').value = ""
        //window.location.replace('/')

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
    window.localStorage.setItem('session', '0')
    document.getElementById("loginMsg").textContent = "";

    
    
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
     }
 });


function HTML_converter(str)
{
	
	var start = '<p>'
    var end = '<\/p>\n'
    start += str
    start+=end
    return start;

};

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