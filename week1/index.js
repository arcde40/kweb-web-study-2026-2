const express = require('express');

const app = express();

app.get('/hello',(req,res)=>{
    res.send("Hello, world!");
});

app.get('/bye',(req,res)=>{
    res.send("Good bye");
})

app.listen(8080,()=>{
    console.log("server listening on port 8080");
})