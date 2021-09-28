const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');
const bcrypt = require('bcryptjs');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'root',
        database: 'cybersecuriteportal'
    }
})

const app = express();

let intialPath = path.join(__dirname, "public");

app.use(bodyParser.json());
app.use(express.static(intialPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(intialPath, "index.html"));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(intialPath, "login.html"));
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(intialPath, "register.html"));
})

app.post('/register-user', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name.length || !email.length || !password.length) {
        res.json('Merci de remplir tous les champs');
    }
    //  else{
    //    db("users").insert({
    //        name: name,
    //        email: email,
    //        password: password
    //    })
    //    .returning(["name", "email"])
    //    .then(data => {
    //        res.json(data[0])
    //    })
    //    .catch(err => {
    //        if(err.detail.includes('already exists')){
    //            res.json('Cet e-mail est déjà utilisé par un autre utilisateur');
    //        }
    //    })
    //  }
    else {
        try {
            const hash = await bcrypt.hash(password, 10);
            await db('users').insert({ name: name, email: email, password: hash });
            res.status(200).json('All good!');
        } catch (e) {
            console.log(e);
            if (e.detail.includes('existe déjà')) {
                res.json('Cet e-mail est déjà utilisé par un autre utilisateur');
            }
        }
    }
})

app.post('/login-user', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await db('users').first('*').where({email: email});
        if(user) {
            const validPass = await bcrypt.compare(password, user.password);
            if(validPass) {
                res.json('We good');
            } else {
                res.json('E-mail or password is incorrect');
            }
        } else {
            res.status(404).json("Il n'existe aucun utilisateur");
        }

    } catch(e) {
        res.status(500).json('Something broke!');
    }
})

app.listen(3000, (req, res) => {
    console.log('listening on port 3000......')
})