'use strict';

console.log(`process.env.SERVER = ${process.env.SERVER}`);
// get the environment variable, but default to localhost:8082 if its not set
const SERVER = process.env.SERVER ? process.env.SERVER : "http://localhost:8082";

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// express-handlebars is a templating library 
// https://www.npmjs.com/package/express-handlebars
// - look inside the views folder for the templates
// data is inserted into a template inside {{ }}
const engine = require('express-handlebars').engine;

// request is used to make REST calls to the backend microservice
// details here: https://www.npmjs.com/package/request
var request = require('request');

// create the server
const app = express();

// set up handlbars as the templating engine
app.set('view engine', 'hbs');
app.engine('hbs', engine({
    extname: 'hbs',
    defaultView: 'default'
}));

app.use(express.static('images'));

// set up the parser to get the contents of data from html forms 
// this would be used in a POST to the server as follows:
// app.post('/route', urlencodedParser, (req, res) => {}
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const commentsMock = [
    {
        eventId: 1,
        author: "Tanner",
        desc: "The pizza was good"
    },
    {
        eventId: 1,
        author: "Anderson",
        desc: "The pizza was great"
    },
    {
        eventId: 2,
        author: "Connor",
        desc: "The pizza was very good"
    },
    {
        eventId: 2,
        author: "Tanner",
        desc: "The pizza was great"
    },

]

const users = [
    {
        username: "user1",
        email: "user1@email.com"
    },
    {
        username: "a",
        email: "a"
    }
]

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://user:user@cluster0.aws5yps.mongodb.net/?retryWrites=true&w=majority";





var cloudComments = []
const client = new MongoClient(uri);

async  function getComments() {
    cloudComments = []
    console.log("GETTING COMMENTS")
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls

        const myDB = client.db("test-app");
        const myColl = myDB.collection("comments");
        const cursor = myColl.find({});// select *
        for await (const doc of cursor) {
            //console.dir(doc)
            cloudComments.push(doc)
        }
        
       

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
        return cloudComments;
    }
    
}
getComments().catch(console.error);

async function addComment(author, postId, desc) {
    try {
        // Connect to the MongoDB cluster
        
        await client.connect();

        // Make the appropriate DB calls

        const myDB = client.db("test-app");
        const myColl = myDB.collection("comments");
        await myColl.insertOne({
            "author": author,
            "eventId": postId,
            "desc": desc}
        );
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.post('/comment',urlencodedParser, function(req, res) {
    console.log(req.body.desc)
    addComment(req.body.author, eid, req.body.desc).then( () =>{
        res.redirect("event/"+ eid)}
        );
    
});
module.exports = app;



function userExists(username, email) {
    // Use the Array.prototype.some() method to check if any object in the array matches the given username and email
    return users.some(function (obj) {
        return obj.username === username && obj.email === email;
    });
}

var logged_in = false

// defines a route that receives the post request to /event
app.post('/login',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "SERVER=http://localhost:8082 node server.js",
        request.post(  // first argument: url + data + formats
            {
                url: SERVER + '/login',  // the microservice end point for adding an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from server will be json format
            },
            () => {
                if (userExists(req.body.username, req.body.email)) {
                    logged_in = true
                    console.log("Login successful")
                    console.log(req.body.ssn)
                }
                res.redirect("/"); // redirect to the home page on successful response
            });

    });

app.get('/logout', (req, res) => {
    logged_in = false
    res.redirect("/")
})


// defines a route that receives the request to /
app.get('/', (req, res) => {
    // make a request to the backend microservice using the request package
    // the URL for the backend service should be set in configuration 
    // using an environment variable. Here, the variable is passed 
    // to npm start inside package.json:
    //  "start": "SERVER=http://localhost:8082 node server.js",
    request.get(  // first argument: url + return format
        {
            url: SERVER + '/events',  // the microservice end point for events
            json: true  // response from server will be json format
        }, // second argument: function with three args,
        // runs when server response received
        // body hold the return from the server
        (error, response, body) => {
            if (error) {
                console.log('error:', error); // Print the error if one occurred
                res.render('error_message',
                    {
                        layout: 'default',  //the outer html page
                        error: error // pass the data from the server to the template
                    });
            }
            else {
                if (!logged_in) {
                    console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    // console.log(body); // print the return from the server microservice
                    res.render('login',
                        {
                            layout: 'default',  //the outer html page
                            template: 'index-template', // the partial view inserted into 
                            // {{body}} in the layout - the code
                            // in here inserts values from the JSON
                            // received from the server
                            login: body
                        }); // pass the data from the server to the template
                }
                else {

                    // console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    // console.log(body); // print the return from the server microservice
                    res.render('home',
                        {
                            layout: 'default',  //the outer html page
                            template: 'index-template', // the partial view inserted into 
                            // {{body}} in the layout - the code
                            // in here inserts values from the JSON
                            // received from the server
                            events: body.events
                        }); // pass the data from the server to the template
                }
            }
        });
});

// defines a route that receives the post request to /event
app.post('/event',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "SERVER=http://localhost:8082 node server.js",
        request.post(  // first argument: url + data + formats
            {
                url: SERVER + '/event',  // the microservice end point for adding an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from server will be json format
            },
            () => {
                res.redirect("/"); // redirect to the home page on successful response
            });

    });


// defines a route that receives the post request to /event/like to like the event
app.post('/event/like',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
        // changed to a put now that real data is being updated
        request.put(  // first argument: url + data + formats
            {
                url: SERVER + '/event/like',  // the microservice end point for liking an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from backend will be json format
            },
            () => {
                res.redirect("/"); // redirect to the home page on successful response
            });

    });


// defines a route that receives the delete request to /event/like to unlike the event
app.post('/event/unlike',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
        request.delete(  // first argument: url + data + formats
            {
                url: SERVER + '/event/like',  // the microservice end point for liking an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from backend will be json format
            },
            () => {
                res.redirect("/"); // redirect to the home page on successful response
            });

    });

// create other get and post methods here - version, login,  etc





// generic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

// specify the port and start listening
const SERVICE_PORT = process.env.SERVICE_PORT ? process.env.SERVICE_PORT : 8080;
const server = app.listen(SERVICE_PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});
var eid = -1
app.get('/event/:id', (req, res) => {
    request.get(  // first argument: url + return format
        {
            url: SERVER + '/events/',  // the microservice end point for events
            json: true  // response from server will be json format
        },
        (error, response, body) => {

            if (error) {
                console.log('error:', error); // Print the error if one occurred
                res.render('error_message',
                    {
                        layout: 'default',  //the outer html page
                        error: error // pass the data from the server to the template
                    });
            }
            else {
                eid = req.params.id;
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log(body); // print the return from the server microservice
                getComments().then((comments)=> {
                    console.log(comments)
                res.render('event',
                    {
                        layout: 'default',  //the outer html page
                        template: 'index-template', // the partial view inserted into 
                        // {{body}} in the layout - the code
                        // in here inserts values from the JSON
                        // received from the server
                        events: body.events.filter((val) => val.id == req.params.id),
                        eventId: req.params.id,
                        comments: comments.filter((val) =>val.eventId == eid) 
                    }); // pass the data from the server to the template))
                
                 })
            }
        });

});

// defines a route that receives the post request to /event/like to like the event
app.post('/event/like2',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
        // changed to a put now that real data is being updated
        request.put(  // first argument: url + data + formats
            {
                url: SERVER + '/event/like',  // the microservice end point for liking an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from backend will be json format
            },
            () => {
                res.redirect(eid)// redirect to the home page on successful response
            });

    });


app.post('/event/unlike2',
    urlencodedParser,
    (req, res) => {
        request.delete(  // first argument: url + data + formats
            {
                url: SERVER + '/event/like',  // the microservice end point for liking an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from backend will be json format
            },
            () => {
                res.redirect(eid)
            });

    });
  

