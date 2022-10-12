const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const { urlencoded } = require("body-parser");

mongoose.connect("mongodb://localhost:27017/userdb", {useNewUrlParser: true});

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

var username = "Anon";
var noteStored = [];
var title = "";
var desc = "";
var findRes = "";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    public: {
        type: Boolean,
        default: false
    }
});

const notes = mongoose.model('note_iosd', noteSchema);

var date = new Date(); 
var current_date = date.getDate() + "/"+ (date.getMonth()+1)  + "/" + date.getFullYear();
var current_time = date.getHours() + ":"  + date.getMinutes();

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    notes: [noteSchema]
  });

const user = mongoose.model('user_IOSD', userSchema);

app.get("/", function(req,res){
    res.sendFile(__dirname + "\\index.html");
});

app.get("/register", function(req,res){
    res.sendFile(__dirname + "\\public\\html\\register.html");
});

app.get("/login", function(req,res){
    res.sendFile(__dirname + "\\public\\html\\login.html");
});

app.post("/register", function(req, res){
    const newUser = new user({
        username: req.body.username,
        password: req.body.password,
        notes: []
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            noteStored.splice(0, noteStored.length);
            username = req.body.username;
            res.render("notes", {title_val: title, desc_val: desc, user: username, newListItems: noteStored});
        }
    });
});

app.post("/login", function(req, res){
    const userName = req.body.username;
    const pass = req.body.password;
    user.findOne({username: userName}, function(err, founduser){
        if(err)
        {
            console.log(err);
        }
        else{
            if(founduser && founduser.password===pass)
            {
                username = req.body.username;
                noteStored = founduser.notes;
                noteStored = founduser.notes;
                res.render("notes", {title_val: title, desc_val: desc, user: username, newListItems: noteStored});
            }
            else{
                console.log("Incorrect password!");
                res.sendFile(__dirname + "\\public\\html\\login.html");
            }
        }
    });
});

app.post("/notes_find", function(req, res){
    user.findOne({username: username}, function(err, doc){
        if(err){
            console.log(err);
        }
        else{
            var i = 0;
            var flag = 0;
            for(i; i<doc.notes.length; i++){
                if(req.body.find === doc.notes[i].title || req.body.upd === doc.notes[i].title)
                {
                    title = doc.notes[i].title;
                    desc = doc.notes[i].description;
                    break;
                }
            }
            findRes = title;  
            res.render("notes", {title_val: title, desc_val: desc, user: username, newListItems: noteStored});
            title = "";
            desc = "";
        }
    });
});

app.post("/notes_addition", function(req, res){
    user.findOne({username: username}, function(err, doc){
        if(err){
            console.log(err);
        }
        else{
            noteStored = doc.notes;
            var date = new Date(); 
            var current_date = date.getDate() + "/"+ (date.getMonth()+1)  + "/" + date.getFullYear();
            var current_time = date.getHours() + ":"  + date.getMinutes();
            var userNote = new notes({
                title: req.body.title,
                description: req.body.note,
                creator: username,
                date: current_date,
                time: current_time
            });
            noteStored.push(userNote);
            console.log(noteStored);
            user.updateOne({username: username}, {notes: noteStored}, function(err, doc){
                if(err){
                    console.log(err);
                }
            });
            res.render("notes", {title_val: title, desc_val: desc, user: username, newListItems: noteStored});
        }
    });
});

app.post("/notes_update", function(req, res){
    user.findOne({username: username}, function(err, doc){
        if(err){
            console.log(err);
        }
        else{
            var i = 0;
            for(i; i<doc.notes.length; i++){
                if(findRes === doc.notes[i].title)
                {
                    break;
                }
            }  
            var userNote = new notes({
                title: req.body.title,
                description: req.body.description,
                creator: username,
                date: doc.notes[i].date,
                time: doc.notes[i].time
            });
            noteStored[i] = userNote;
            user.updateOne({username: username}, {notes: noteStored}, function(err, doc){
                if(err){
                    console.log(err);
                }
            });
            res.render("notes", {title_val: title, desc_val: desc, user: username, newListItems: noteStored});
        }
    });
});

app.post("/notes_delete", function(req, res){
    console.log(req.body.del);
    user.findOne({username: username}, function(err, doc){
        if(err){
            console.log(err);
        }
        else{
            var i = 0;
            for(i; i<doc.notes.length; i++){
                if(req.body.del === doc.notes[i].title)
                {
                    break;
                }
            }  
            noteStored.splice(i, 1);
            user.updateOne({username: username}, {notes: noteStored}, function(err, doc){
                if(err){
                    console.log(err);
                }
            });
            res.render("notes", {title_val: title, desc_val: desc, user: username, newListItems: noteStored});
        }
    });
});

app.post("/notes_view", function(req, res){
    user.findOne({username: username}, function(err, doc){
        if(err){
            console.log(err);
        }
        else{
            var i = 0;
            for(i; i<doc.notes.length; i++){
                if(req.body.view === doc.notes[i].title)
                {
                    break;
                }
            }
            noteStored[i].public = !(noteStored[i].public);  
            user.updateOne({username: username}, {notes: noteStored}, function(err, doc){
                if(err){
                    console.log(err);
                }
            });
            res.render("notes", {title_val: title, desc_val: desc, user: username, newListItems: noteStored});
        }
    });
});

app.get("/:sharedNoteUser", function(req, res){
    user.findOne({username: req.params.sharedNoteUser}, function(err, doc){
        if(err){
            console.log(err);
        }
        else{
            var shareNotes = [];
            for(var i = 0; i < doc.notes.length; i++)
            {
                if(doc.notes[i].public){
                    shareNotes.push(doc.notes[i]);
                }
            }
            res.render("sharing", {user: req.params.sharedNoteUser, sharedListItems: shareNotes});
        }   
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
    console.log("Server is running!");
});
