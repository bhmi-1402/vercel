const express = require('express');
const app = express();

var bodyParser = require('body-parser'); 

const getDataUser = require('./GetUserData');
const AddNewUser = require('./AddNewUser');
const SearchUser = require('./SearchUser');
const cors = require('cors');
const path = require('path');
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const router = express.Router();
app.use(`/.netlify/functions/api`, router);

app.use(express.static(path.join(__dirname,'public')));

app.get('/',(rq,rs)=>{
   rs.send("naveen");
});



app.post("/signup",async (req,res)=>{
   console.log(req.body.email);
   const result = await SearchUser({"email":req.body.email});
   if(!result.found)
   {
      const response =  await AddNewUser(req.body);
      res.send({response,result,"EmailValid":true});
   }
   else
   {
      res.send({"EmailValid":false})
   }
})

app.post('/login',async (req , res)=>{
   const result = await SearchUser({"email":req.body.email});
   console.log(result);
   let auth =(result.response[0].password==req.body.password);
   if(auth)
   {
      res.send({"valid":auth,"User":result})
   }
   else
   {
      res.send({"valid":auth});
   }
})




const http = require('http').Server(app);

const PORT = 4000 || process.env.PORT ;

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
          }
});

app.use(cors());

let ActiveUser=[];

socketIO.on('connection',(socket)=>{
   console.log("Server ID");
   
   socket.on('send',(data)=>{
      console.log(data);
      socketIO.emit('response',data);
   });

   socket.on('userData',(data)=>{

     if(!ActiveUser.includes(data)) 
     ActiveUser.push(data);

     socketIO.emit("responseActiveUser",ActiveUser);
   })
    
   socket.on('typing',(data)=>{
     console.log(data);
     socketIO.emit('Typingresponse',data);
   });
});


  
http.listen(PORT, () => {
   console.log(`Server listening on ${PORT}`);
},"0.0.0.0");