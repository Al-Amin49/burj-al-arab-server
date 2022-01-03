const express= require('express');
const app= express();
const bodyParser= require('body-parser');
const cors= require('cors');
const admin =require('firebase-admin');
app.use(bodyParser.json());
app.use(cors());

require('dotenv').config()

const serviceAccount = require("./configs/burj-arabic-firebase-adminsdk-gif4d-852780c39f.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const MongoClient  = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lmrib.mongodb.net/arabRestaurent?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookingsCollection = client.db("arabRestaurent").collection("bookings");
app.post('/addBooking', (req, res)=>{
    const newBooking = req.body;
    bookingsCollection.insertOne(newBooking)
    .then(result=>{
        res.send(result.insertedCount>0);
    })
})

    app.get('/bookings', (req, res)=>{
        const bearer=req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken =bearer.split(' ')[1];
            // console.log('token',idToken);
            admin.auth().verifyIdToken(idToken)
            .then((decodedToken) => {
              const tokenEmail = decodedToken.email;
              const queryEmail = req.query.email;
              console.log(tokenEmail , queryEmail);
          if(tokenEmail == queryEmail){
            bookingsCollection.find({email: queryEmail})
            .toArray((err, documents)=>{
              res.send(documents);
            }) 
          }
          else{
            res.status(401).send('Unauthorized access.');
          }
            })
            .catch((error) => {
              res.status(401).send('Unauthorized access.')
            });
    
        }
        else{
res.status(401).send('Unauthorized access.')
        }     
})
});

app.get('/',(req, res)=>{
    res.send('I am working')
})

app.listen(5000, ()=>console.log('Listening on port 5000'))