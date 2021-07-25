var mongo = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
MongoClient.connect(url, function (err, db) {
   if (err) throw err;
   var dbo = db.db("ToDoList");
   dbo.createCollection("Users", function (err, res) {
      if (err) {
         console.log(err);
      }else{
         console.log("Collection created!");
      }
   });
      dbo.createCollection("Tasks", function (err, res) {
         if (err) {
            console.log(err);
         }else{
            console.log("Collection created!");
         }
      
      db.close();
   });
});
var count = 0;
var tasks = [];//
//

app.use(express.static('public'));
app.use(bodyParser.json());
app.get('/getTaskId', function (req, res) {
   var TaskbuttonId=req.query.buttonId;
   MongoClient.connect(url, {poolSize: 100},function (err, db) {
      if (err) throw err;
      var dbo = db.db("ToDoList");
      var o_id = new ObjectId(TaskbuttonId);
      dbo.collection("Tasks").find({_id:o_id}).forEach(function (result){
         var taskarray=[];
         taskarray.push(result)
         if(taskarray.length==1){
            res.send(result);
            db.close();
         }else{
            res.send('no');
            db.close();
         }
      })
   
   });
   
});
//localhost:5000/getTask?userId=9859385943858359
app.get('/getTasks', function (req, res) {
   var userId=req.query.userId;
   MongoClient.connect(url, {poolSize: 100},function (err, db) {
      if (err) throw err;
      var dbo = db.db("ToDoList");
      dbo.collection("Tasks").find({CreatedBy: userId}).toArray(function (err,result){
         if (err) throw err;
            res.send(result);
            db.close();
         
      })
   
   });
});

app.post('/checkUserData', function (req, res) {
   var user = req.body;
   MongoClient.connect(url, {poolSize: 100},function (err, db) {
      if (err) throw err;
      var dbo = db.db("ToDoList");
      dbo.collection("Users").find({ name: user.name }).toArray(function (error,resultname) {
         if (resultname!=undefined && resultname.length>0) {
             res.send('username already exists');
             db.close();
            
         }else{
            dbo.collection("Users").find({ email: user.email }).toArray(function (error,resultmail) {
               if (resultmail!=undefined && resultmail.length>0) {
                  res.send('email already exists');
                  db.close();
               }else{
                  dbo.collection("Users").insertOne(user, function (err, result) {
                     console.log(result);
                     if (err) throw err;
                     res.send('yes');
                     db.close();
                  });
               }
            });
         }
      });
   });
});

app.post('/checkUserLogin', function (req, res) {
   var userInput = req.body;
   MongoClient.connect(url, {poolSize: 100},function (err, db) {
      if (err) throw err;
      var dbo = db.db("ToDoList");
      var query = {
         email: userInput.email,
         pw: userInput.pw
      };
      dbo.collection("Users").find(query).toArray(function (err,result){
         if (err) throw err;
         if(result.length==1){
            res.send(result[0]._id);
         }else{
            res.send('no');
         }
      })
   
   });
});


app.post('/saveTask', function (req, res) {
   // console.log(req.data);
   MongoClient.connect(url, {poolSize: 100},function (err, db) {
      if (err) throw err;
      var dbo = db.db("ToDoList");
   var task = req.body;//obj
   dbo.collection("Tasks").insertOne(task, function (err, result) {
      console.log(result);
      if (err) throw err;
      res.send(result.insertedId);
      db.close();
   });
   // console.log(task);
   // task.id = count;
   // tasks.push(task);
   // res.send(count + '');
   // count++;
});
});
app.put('/getCurrentTask', function (req, res) {
   // console.log(req.data);
   MongoClient.connect(url, {poolSize: 100},function (err, db) {
      if (err) throw err;
      var dbo = db.db("ToDoList");
      var buttonId={_id: new ObjectID(req.body.button)};
   var newValues = {
      $set: { 'title': req.body.title,
      'description': req.body.description,
      }
   };
   dbo.collection("Tasks").updateOne(buttonId,newValues, function (err, result) {
      console.log(result);
      if (err) throw err;
      res.send(result._id);
      db.close();
   });
});
});
app.put('/moveTask', function (req, res) {
   // console.log(req.data);
   MongoClient.connect(url, {poolSize: 100},function (err, db) {
      if (err) throw err;
      var dbo = db.db("ToDoList");
   var task ={
      $set:{'status': req.body.taskStatus}
   };
   var taskId={_id: new ObjectID(req.body.taskId)};

   dbo.collection("Tasks").updateOne(taskId,task, function (err, result) {
      console.log(result);
      if (err) throw err;
      res.send(result._id);
      db.close();
   });
});
});
app.delete('/deleteTask', function (req, res) {
   MongoClient.connect(url, {poolSize: 100},function (err, db) {
      if (err) throw err;
      var dbo = db.db("ToDoList");
   var taskId ={ _id: new ObjectId(req.query.taskId)};
   dbo.collection("Tasks").deleteOne(taskId, function (err, result) {
      
      if (err) throw err;
      if (err==null){
         res.status(200).send('task deleted')
      }
      db.close();
   });
   
});
});


var server = app.listen(5000, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})
