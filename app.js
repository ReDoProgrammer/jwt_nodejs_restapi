require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

const posts =[
    {
        username:'Kyle',
        title:'Post 1'
    },
    {
        username:'ReDo',
        title:'Post 1'
    },
    {
        username:'Kyle',
        title:'Post 1'
    }
]

app.get('/posts',authenticateToken,(req,res)=>{
    res.status(200).json({
        posts:posts.filter(x=>x.username == req.user.username)
    });
});

let refershTokens = [];
app.post('/token',(req,res)=>{
    const refreshToken = req.body.token;

    if(refreshToken == null) return res.sendStatus(401);

    if(!refershTokens.includes(refreshToken)) return res.sendStatus(403);

    console.log('array:',refershTokens);
    jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403);
        console.log(user);
        const accessToken = generateAccessToken({username:user.username});

        res.json({
            accessToken:accessToken
        });
    })

})

app.post('/login',(req,res)=>{
    let {username,password} = req.body;
    let user = {
        username:username
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET);
    
    //push refreshToken into array
    refershTokens.push(refreshToken);

    res.json({
        accessToken:accessToken,
        refreshToken:refreshToken
    })
});

app.delete('/logout',(req,res)=>{
    refershTokens = refershTokens.filter(token => token!== req.body.token);
    console.log('token:',req.body.token,'logout: ',refershTokens);
    res.sendStatus(204);
})


function authenticateToken(req,res,next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403);

        req.user = user;
        next();
    });

}

function generateAccessToken(user){
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'20s'});
}

app.listen(3000,()=>{
    console.log(`app is running on port 3000`);
})