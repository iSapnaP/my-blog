import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';



const app = express();
app.use(express.static(path.join(__dirname,'build')));
app.use(bodyParser.json());

const withDb = async (operations,res) => {
    try{
        
    const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser:true});
    const db = client.db('my-blog');
    await operations(db);
    client.close();

    }
    catch(error){
        res.status(500).json("Something went wrong!", error);
    }
    
    
}


app.post("/api/articles/:name/upvote",async (req, res) => {
   
    const articleName= req.params.name;
    withDb(async(db) =>{
    const articleInfo = await db.collection('articles').findOne({name:articleName});
    await db.collection('articles').updateOne(
        {name:articleName},
        {
        '$set': {
            'upvotes':articleInfo.upvotes + 1 
        },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({name:articleName});
    res.status(200).json(updatedArticleInfo);
},res)
   
    
})
app.post("/api/articles/:name/add-comment",(req, res) =>{
    const articleName= req.params.name;
    const {user, comment} = req.body;
    withDb(async(db) =>{
        const articleInfo = await db.collection('articles').findOne({name:articleName});
        await db.collection('articles').updateOne(
            {name:articleName},
            {
            '$set': {
                'comments':articleInfo.comments.concat({user, comment})
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(updatedArticleInfo);
    },res)
})
app.get("/api/articles/:name",async (req, res) =>{
    
        const articleName= req.params.name;
    withDb(async(db) =>{
        const articleInfo = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(articleInfo);
        

    },res )
    

    
   

})
app.get('*',(req, res)=>{
    res.sendFile(path.join(__dirname + '/build/index.html'));
})
app.listen(8000, () => console.log("listening on port 8000"));