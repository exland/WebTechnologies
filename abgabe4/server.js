"use strict";
// In this file, we write the server implementation
const express = require('express');
const  http = require('http');
const app = express();
const port = process.env.PORT || 3000;
const path =  require('path')
const fs = require('fs')
const readline = require('readline');
var bodyParser = require('body-parser');
const { json } = require('body-parser');
const { type } = require('os');
var  w2v = require('word2vec');

const { compile } = require('ejs');

var jsonQuestions_unsorted = require('./data/Questions.json');
var jsonAnswers_unsorted = require('./data/Answers.json');
const { parse } = require('path');
const { redirect } = require('express/lib/response');
const res = require('express/lib/response');

// Part 1
// For part one, we just serve the static files and a dummy endpoint to fetch data
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.listen(port, () => {
  loadJSON();
  console.log(`Example app listening at http://localhost:${port}`);
});
app.set('appPath','public/')
app.set('view engine', 'ejs')
//app.use(express.static('static'));

var jsonQuestions_sorted = []; 
var jsonAnswers_sorted = [];
var biggestID = 0;
var biggestAnswerId = 0;
var logged_users = {};

var qmodel;

class User
{
  constructor(username, password) 
  {
    this.username = username;
    this.password = password;
  }
}


app.get('/new', (req,res)=>
{
  res.sendFile(path.resolve(app.get('appPath') + '/new.html'))
})

app.post('/new', (req,res) =>
{
  biggestID++;
  if(logged_users[req.body['id']] == undefined)
  {
    res.send("NOTLOGGED")
    console.log("NOTLOGGED")
    return;
  }
  jsonQuestions_sorted.push([biggestID.toString(), req.body['mgs']])
  jsonQuestions_unsorted[biggestID.toString()] = req.body['mgs']
  
  //newQuestionw2v(req.body['mgs'], biggestID)
  var id = biggestID
  var arg = req.body['mgs']
  var mgs =  preprocess(arg.Body)
    w2v.loadModel('./data/word_vectorsQ.txt',  (error, model) =>
    {
      var search = mgs.split(' ');
      var word_vec = null;
      search.forEach(word =>
      {
        var tmp = model.getVector(word)
        
        if(tmp != null)
        {
            if(word_vec == null)
            {
                word_vec = tmp.values
            }
            else
            {
                word_vec = addvector(word_vec, tmp.values)
            }
        }
        else
        {
            if(word != '')
            {
              var simmilar_word = model.mostSimilar(word,1);
              if(simmilar_word != null)
              {
                console.log(simmilar_word.values.length)
                word_vec = addvector(word_vec,simmilar_word.values)
              }
              
            }
         
        }
      });
      if(word_vec == null)
      {
          console.log("here")
          return
      }
      if(word_vec.length != 100)
      {
          console.log("not 100")
      }
      var scaled_word_vec = new Array(100).fill(0)
      for(var i = 0; i < word_vec.length; i++)
      {
          scaled_word_vec[i] = word_vec[i]/search.length;
      }

      let first =  getFirstLine('./data/qentities.txt')
      first.then(function(result)
      {
        console.log(result.split(' '))
        var tmp = result.split(' ')
        var value=  parseInt(tmp[0])
        value++
        var str =  value.toString() + ' ' + tmp[1]
        fs.readFile('./data/qentities.txt', 'utf8', function (err,data) {
        var formatted = data.replace(result, str);
        fs.writeFile('./data/qentities.txt', formatted, 'utf8', function (err) {
        if (err) 
          {
            return console.log(err);
          }
        else
          {
            var logger = fs.createWriteStream('./data/qentities.txt', 
            {
              flags: 'a' // 'a' means appending (old data will be preserved)
            })
            var str = id.toString() + " "
            for(var i = 0; i < scaled_word_vec.length - 1; i++)
            {
              str = str + scaled_word_vec[i].toString() + " ";
            }
            str = str + scaled_word_vec[scaled_word_vec.length - 1]+ '\n';
            logger.write(str)
            logger.end()
            sortData(jsonQuestions_sorted);
            fs.writeFileSync('./data/Questions.json', JSON.stringify(jsonQuestions_unsorted))
            res.send(biggestID.toString());
          }    
         });
        });
      })
    });
  

})


function preprocess(originalString) 
{
    // rewrite more user friendly? 
    
    var regex_tags = /(<([^>]+)>)/ig;
    var regex_space = /\s+/ig;
    var regex_special_chars = /[^A-Za-z 0-9]/ig;
    var tmp = originalString.replace(regex_tags, "")
    tmp =  tmp.replace(regex_space, " ")
    tmp = tmp.replace(regex_special_chars, " ")


    return tmp.toLowerCase()
}

async function getFirstLine(pathToFile) {
  const readable = fs.createReadStream(pathToFile);
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader.on('line', (line) => {
      reader.close();
      resolve(line);
    });
  });
  readable.close();
  return line;
}


function newQuestionw2v(arg, id)
{
  
}


app.get('/login',(req,res)=>
{
  res.sendFile(path.resolve(app.get('appPath') + '/login.html'))
})


function renderIndex(res)
{
  var data = [];
  for (let index = 0; index < 20; index++) {
    var element = jsonQuestions_sorted[index]
    var href = '/question/' + element[0]
    element[1]['id'] = href;
    data.push(element[1])
  }
 
  res.render(path.resolve(app.get('appPath') + '/index'), {questions:data})
}


app.get('/index', (req, res) => {
  renderIndex(res)
});


app.post('/getupvotes', async function (req, res)  {
  if(logged_users[req.body.session] != undefined)
  {
    const data = fs.readFileSync('./db/user.json');
    var obj = JSON.parse(data);
    for(var i = 0; i < obj['registerData'].length; i++)
      {
        if(obj['registerData'][i].username == logged_users[req.body.session].username)
        {
          res.send(JSON.stringify(obj['registerData'][i].upvotes));
        }
      }
  }
  
});

app.post('/getupvotesq', async function (req, res)  {
  if(logged_users[req.body.session] != undefined)
  {
    const data = fs.readFileSync('./db/user.json');
    var obj = JSON.parse(data);
    for(var i = 0; i < obj['registerData'].length; i++)
      {
        if(obj['registerData'][i].username == logged_users[req.body.session].username)
        {
          res.send(JSON.stringify(obj['registerData'][i].upvotesq));
        }
      }
  }
  
});

app.post('/upvote', async function (req, res)  {
  console.log(req.body.upvote);
  if(logged_users[req.body.session] != undefined)
  {
    for(var i in jsonAnswers_unsorted)
    {
      if(i == req.body.upvote)
      {
        jsonAnswers_unsorted[i].Score = jsonAnswers_unsorted[i].Score + 1;
      }
    }
    fs.writeFileSync('./data/Answers.json', JSON.stringify(jsonAnswers_unsorted))

    const data = fs.readFileSync('./db/user.json');
    var obj = JSON.parse(data);
    for(var i = 0; i < obj['registerData'].length; i++)
    {
      if(obj['registerData'][i].username == logged_users[req.body.session].username)
      {
        obj['registerData'][i].upvotes.push(parseInt(req.body.upvote))
        console.log(obj['registerData'][i].upvotes)
        fs.writeFileSync('./db/user.json', JSON.stringify(obj))
      }
    }
    console.log("Finished upvote")
  }
  else
  {
    res.send("ERROR")
  }
});

function addvector(a,b){
  return a.map((e,i) => e + b[i]);
}

app.get('/error', (req, res)=>
{
  res.render(path.resolve(app.get('appPath') + '/error'),{Error:"There was nothing to be found"})
});

app.post('/answer', (req, res)=>
{

  if(logged_users[req.body['id']] == undefined)
  {
    res.send("NOTLOGGED")
    console.log("NOTLOGGED")
    return;
  }
  biggestAnswerId++
  console.log(req.body['mgs'])
  jsonAnswers_sorted.push([biggestAnswerId.toString(), req.body['mgs']])
  jsonAnswers_unsorted[biggestAnswerId.toString()] = req.body['mgs']
  fs.writeFileSync('./data/Answers.json', JSON.stringify(jsonAnswers_unsorted))
  res.send("200")
})


app.get('/answer', (req, res)=>
{
  res.sendFile(path.resolve(app.get('appPath') + '/answer.html'))
})

app.get('/query/:Query', (req,res)=>
{
  var query = req.params.Query
  var regex_tags = /(<([^>]+)>)/ig;
  var regex_space = /\s+/ig;
  var regex_special_chars = /[^A-Za-z 0-9]/ig;
  var tmp = query.replace(regex_tags, "")
  query = query.replace(regex_special_chars, " ")
  query =  query.replace(regex_space, " ")
  console.log(query)

  w2v.loadModel('./data/word_vectorsQ.txt',  (error, model) =>
  {
    var search = query.split(' ');
    var word_vec = null;
    search.forEach(word =>
    {
      var tmp = model.getVector(word)
      if(tmp != null)
      {
          if(word_vec == null)
          {
              word_vec = tmp.values
          }
          else
          {
              word_vec = addvector(word_vec, tmp.values)
          }
      }
    });
    if(word_vec == null)
    {
        console.log("here")
        res.redirect('/error')
        return
    }
    if(word_vec.length != 100)
    {
        console.log("not 100")
    }
    var scaled_word_vec = new Array(100).fill(0)
    for(var i = 0; i < word_vec.length; i++)
    {
        scaled_word_vec[i] = word_vec[i]/search.length;
    }

    w2v.loadModel('./data/qentities.txt',  (error1, model) =>
    {
      if(error1)
      {
        console.log(err)
      }
      var similiar_questions = model.getNearestWords(scaled_word_vec)
      var qid = [];
      similiar_questions.forEach(element => {
          qid.push(element.word)
      });

      var data = [];
      for (let index = 0; index < qid.length; index++) {
        var element = jsonQuestions_unsorted[qid[index]]
        var href = '/question/' + qid[index]
        element['id'] = href;
        data.push(element)
      }
    
      res.render(path.resolve(app.get('appPath') + '/query'), {questions:data})
      console.log("Query done")
    });

  });
})

app.post('/upvoteq', async function (req, res)  {
  console.log(req.body.upvote);
  if(logged_users[req.body.session] != undefined)
  {
    for(var i in jsonQuestions_unsorted)
    {
      if(i == req.body.upvote)
      {
        jsonQuestions_unsorted[i].Score = jsonQuestions_unsorted[i].Score + 1;
      }
    }
    fs.writeFileSync('./data/Questions.json', JSON.stringify(jsonQuestions_unsorted))

    const data = fs.readFileSync('./db/user.json');
    var obj = JSON.parse(data);
    for(var i = 0; i < obj['registerData'].length; i++)
    {
      if(obj['registerData'][i].username == logged_users[req.body.session].username)
      {
        obj['registerData'][i].upvotesq.push(parseInt(req.body.upvote))
        console.log(obj['registerData'][i].upvotesq)
        fs.writeFileSync('./db/user.json', JSON.stringify(obj))
      }
    }
    console.log("Finished upvote question")
  }
  else
  {
    res.send("ERROR")
  }
});

app.get('/question/:Id', (req,res)=> {
  var question_id = req.params.Id
  var question_id_int = question_id.split('.')[0]
  var body = ""
  var title = ""
  var userid = ""
  var question;
  var qid = "";
  jsonQuestions_sorted.forEach(element => {
    if(element[0] === question_id_int)
    {
      body = element[1].Body

      title = element[1].Title
      userid = element[1].OwnerUserId
      question = element[1]
      qid = element[0]
    }
  
  });
  if(body === "")
  {
    res.redirect('/error')
    return
  }
  var answers = []
  jsonAnswers_sorted.forEach(element => {

    if(element[1].ParentId == question_id_int)
    {
      element[1]['id'] = element[0];
      answers.push(element[1]);
    }
  })

  

  w2v.loadModel("./data/qentities.txt",  (error1, model) =>
  {
    if(error1)
    {
      console.log(err)
    }
    var q_vec = model.getVector(question_id_int)
    var data = [];

    if(q_vec != null)
    {
      var similar = model.getNearestWords(model.getVector(question_id_int), 30)
      if(similar.length != 0)
      {
        for (let index = 0; index < similar.length; index++)
        {
          var element = jsonQuestions_unsorted[similar[index].word]
          if(element != undefined)
          {
            var href = '/question/' + similar[index].word
            element['id'] = href;
            data.push(element)
          }
          else
          {
            console.log("Not found" + similar[index].word)
          }
          
        }
      }
    }
    
    

    res.render(path.resolve(app.get('appPath') + '/question'), {questiontitle:body, title:title, answers:answers, userid:userid, question:question, qid:qid, similarQuestions:data})
  })
  

  // und dann in der json tue ma die einzelnen daten schicken und clientside zusammen piocken 
})

app.get('/', (req, res) => {
  renderIndex(res)

});


app.get('/register', (req, res)=> {
  res.sendFile(path.resolve(app.get('appPath') + '/register.html'))
})

app.get('/about', (req, res)=>
{
  res.sendFile(path.resolve(app.get('appPath')+'/about.html'))
  
})

app.post('/register', (req,res)=> {
  var obj;
  fs.readFile("./db/user.json",(err, data) =>
  {
      obj = JSON.parse(data);
      if(!usernameValidation(obj["registerData"], req.body.username))
      {
        res.send("ERROR:USERNAME")
        return;
      }
      obj["registerData"].push(req.body)
      fs.writeFileSync("./db/user.json",JSON.stringify(obj));
      res.send("SUCCES");
  })
})

app.post('/login', (req,res)=> {
  var obj;
  fs.readFile("./db/user.json",(err, data) =>
  {
      obj = JSON.parse(data);
      if(findUser(obj["registerData"], req.body.username, req.body.password))
      {
        for (const [key, value] of Object.entries(logged_users))
        {
          if(value.username === req.body.username)
          {
            res.send("ERROR:ALREADY LOGGED IN")
            console.log("already");
            return;
          }
        }
        var session_id;
        while(true)
        {
          session_id = Math.random().toString(36).substr(2, 9);
          if(logged_users[session_id] === undefined)
          {
            logged_users[session_id] = new User(req.body.username, req.body.password)
            break;
          }
        }
        console.log(logged_users)
        res.send(session_id)
        console.log("end");

        return;
      }
      else
      {
        res.send("ERROR:USERNOTFOUND")
        console.log("not");
      }
  })
})

app.post('/logout', (req,res)=> {
  delete logged_users[req.body.session]
  console.log(logged_users)
})



function sortData(array)
{
  jsonQuestions_sorted =  (array.sort(function(a, b) {return a[1].Score - b[1].Score})).reverse();
}

function loadJSON()
{

  
  var array = []
  for(var i in jsonQuestions_unsorted)
  {
    //console.log("i = " + i)
    var parsed_i =  parseInt(i)
    if(parsed_i > biggestID)
    {
      biggestID = parsed_i
    }
   // console.log(biggestID)
    var pushed = [i, jsonQuestions_unsorted [i]]
    array.push(pushed);
  }
  jsonQuestions_sorted = (array.sort(function(a, b) {return a[1].Score - b[1].Score})).reverse();

  var array2 = []
  for(var i in jsonAnswers_unsorted)
  {
    var parsed_i =  parseInt(i)
    if(parsed_i > biggestAnswerId)
    {
      biggestAnswerId = parsed_i
    }

    array2.push([i, jsonAnswers_unsorted [i]]);
  }
  jsonAnswers_sorted = (array2.sort(function(a, b) {return a[1].Score - b[1].Score})).reverse();
 // console.log(jsonQuestions_sorted)
}


app.get('/search', (req, res) => {
  res.send('API for ' + req.query["query"]);
});

app.get('/sim/:qid', (req, res) => {
  res.send('API for ' + req.params.qid);
});


function usernameValidation(jsonArray, username)
{
  for(var i = 0; i < jsonArray.length; i++)
  {
    if(jsonArray[i].username === username)
    {
      return false;
    }
  }
  return true;
}

function findUser(jsonArray, username, password)
{
  for(var i = 0; i < jsonArray.length; i++)
  {
    if(jsonArray[i].username === username)
    {
      if(jsonArray[i].password === password)
      {
        return true;
      }
    }
  }
  return false;
}




app.use(function (request, response, next_element) {
  response.status(404).render(path.resolve(app.get('appPath') + '/error'),{Error:"Ups! This page does not exist !"})
})