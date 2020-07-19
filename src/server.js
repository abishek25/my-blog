const express = require("express")
const bodyParser = require("body-parser")
import { MongoClient } from 'mongodb'
import path from "path";
const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'/build')));
const withDB = async(operations,res) =>{
     try{
      const client = await MongoClient.connect('mongodb://localhost:27017',{ useUnifiedTopology: true },{ useNewUrlParser:true })
      const db = client.db('myBlog');

      await operations(db)
     
      client.close();
        }
        catch(error){
            res.status(500).json({message:'something wrong',error})
        }
    }
app.get('/api/articles/:name', async(req,res)=>{
 
 withDB(async(db) =>{
    const articleName= req.params.name;

    const articleInfo = await db.collection('articles').findOne({name:articleName})
    res.status(200).send(articleInfo);
 },res)
})


app.post('/api/articles/:name/upvote', async(req,res)=>{
    withDB(async(db)=>{
        const articleName= req.params.name;

        const articleInfo = await db.collection('articles').findOne({name:articleName})
        await db.collection('articles').updateOne({ name: articleName }, {
          '$set': {
              upvote: articleInfo.upvote + 1,
          },
      });
      const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).send(updatedArticleInfo);
      },res)
    })
 

app.post("/api/articles/:name/comment", (req,res) =>{
const{username , text }= req.body;
const articleName = req.params.name;

withDB(async(db) =>{

    const articleInfo =await db.collection('articles').findOne({name:articleName})
    await db.collection('articles').updateOne({name: articleName},{

        '$set' : {
            comments : articleInfo.comments.concat({username,text}),
        },
    })
const updatedInfo = await db.collection('articles').findOne({name:articleName})
res.status(200).json(updatedInfo);
},res)
})



// app.get("/hello", (req,res) => {
//     res.send("hello");
// })

// app.get("/hello/:name",(req,res) =>{
//     res.send(`Hello ${req.params.name}`)
// })

// app.post("/hello", (req,res)=>
//     res.send(`Hello ${req.body.name}`)
// )


app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname + '/build/index.html'));
})


app.listen(8000,()=>{
    console.log("connected to 8000")
})

