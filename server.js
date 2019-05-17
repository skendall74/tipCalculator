const express = require('express');
const path = require('path');
const session = require('express-session');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const PORT = process.env.PORT || 3001;
const app = express();
const crypto = require("crypto");
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const {Storage} = require('@google-cloud/storage');
const TWILIO_ACCOUNT_SID = "ACd4789025c22842f1b8d831ef03ddd403";
const TWILIO_AUTH_TOKEN = "ca7ecd44f3a7fbf65b879c2ad531e8b7";
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const sightengine = require('sightengine')('371368091', '4BnEGw9V9dMnfRfMYzSP');
const unirest = require('unirest');
const stripe = require('stripe')('STRIPE_PUBLISHABLE_KEY');
const moment = require('moment');
// - - - - - UNCOMMENT ONCE IN DEVELOPMENT MODE - - - - - //

// INPUT STRIPE_SECRET_KEY INTO THE .ENV FILE

// const stripe = require('stripe')(process.env.STRIPE_PUBLISHABLE_KEY); //STRIPE PUBLISHABLE KEY - - WILL NEED TO BE REPLACED TO .ENV SECRET KEY

// require('dotenv').config();   // WHERE WE REQUIRE THE STRIPE_SECRET_KEY
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // STRIPE SECRET KEY

// - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Initialize the app with a service account, granting admin privileges
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://twiliocms.firebaseio.com',
  storageBucket: 'gs://twiliocms.appspot.com/postImages',
});

let dir = './tmp';

// stuff for database and storage
const db = firebaseAdmin.firestore();
let users = db.collection('users');
let posts = db.collection('posts');
let jobs = db.collection('jobs');
const storage = new Storage();
const bucketName = 'textadorposts';

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({secret: 'smsCount', resave: true, saveUninitialized: true}));
app.use(express.static('public'));
app.use(require('body-parser').text());

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

let messageBody = "";
let messageNumber = "";
let systemNumber = "";
let mySystemNumber = "";
let myUserId = "";
let myPostTitle = "";
let myPostDescription = "";
let myPostPrice = "";
let myCellNumber = "";
let ringOwnerCellNumber = "";
let handle = "";

let myName = "";
let cashAddress = "";
let cashAmount = "";
let textadorBucks = "";
let wage = "";
let job = {};

let myRingJob = '';

app.post('/charge', async (req, res) => {
  try {
    let { status } = await stripe.charges.create({
      amount: 2000,
      currency: 'usd',
      description: 'An example charge',
      source: req.body,
    });

    res.json({ status });
  } catch (err) {
    res.status(500).end();
  }
});

app.post('/api', (req, res) => {
    let smsCount = req.session.counter || 0;
    console.log("========================================> FIRST SESSION: ", smsCount)
    messageBody = req.body.Body.trim().toLowerCase();
    messageNumber = req.body.From.trim();
    jobSystemNumber = req.body.To.trim();
    systemNumber = req.body.To.trim();
    textadorNumber = req.body.To.trim();
    users = db.collection('users');
    posts = db.collection('posts');
    mySystemNumber = "";

    console.log("+++++++++ Message FROM: ", messageNumber)
    console.log("+++++++++ Message TO: ", systemNumber)
    console.log("+++++++++ Message JOB: ", jobSystemNumber)
    console.log("+++++++++ Message SMS: ", smsCount)
    console.log("+++++++++ Message Body: ", messageBody)


    if (messageBody === "join") {
        thisUser = users.where("myCellNumber", "==", messageNumber).get().then(thisUserSnap => {
            console.log("myCellNumber", "==", messageNumber);

            if (thisUserSnap.empty) {
                var twiml = new MessagingResponse();
                req.session.counter = 100;
                message = 'Welcome.\n\nTo join this RING\n\nenter the PASSCODE now.';
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            }
            else {
                var twiml = new MessagingResponse();
                req.session.counter = 0;
                message = 'Only one account per Ring is required.';
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            }
        });
    }
    // Get Start Words  POST
    if (messageBody === "post") {
        console.log("POST ++++++++++++++++++++++++") 
        // enter PIN
        var twiml = new MessagingResponse();
        req.session.counter = 201;
        message = 'Ready to POST\n\n Enter your PASSCODE to confirm.\n';
        twiml.message(message);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    }
    // Get Start Words  READ
    if (messageBody === "read") {
        console.log("READ ++++++++++++++++++++++++")
        // Send latest post and options for NEXT
        posts = posts.where("ringNumber", "==", systemNumber).orderBy('createdAt', 'desc').get().then(snapshot => {
            if (snapshot.empty) {
                // we don't have a user in the system.
                console.log("NO USER FOUND")
                let twiml = new MessagingResponse();
                message = 'You need to be a member of this RING to POST.\n\nPlease JOIN the RING first.';
                req.session.counter = 0;
                myPostTitle = messageBody
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'texts/xml'});
                res.end(twiml.toString());
                // we could change the session counter to CREATE USER
            }
            else {

                let doc = snapshot.docs[0];
                let authorHandle = doc.data().authorHandle;
                authorHandle = authorHandle.toUpperCase();
                let title = doc.data().title.toUpperCase();
                let description = doc.data().description;
                let image = doc.data().image;
                
                let twiml = new MessagingResponse();
                let message = twiml.message();
                req.session.counter = 0;
                message.body(title + '\n\n' + description + '\n\n' + 'Posted by: ' + authorHandle);
                message.media(image);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
                console.log("423 Get Jobhs Session Counter: " + smsCount);
            }
        }).catch (err => {
            console.log(err.errors[0].message);
        });
    }
    // Get Start Words  JOBS
    if (messageBody === "jobs") {
        console.log("JOBS ++++++++++++++++++++++++") 
        // Send most recent job
        findJob = db.collection('jobs').where('jobOpen', '==', true).where("systemNumber", "==", systemNumber).orderBy('startDate', 'desc').get().then(snapshot => {
            if (snapshot.empty) {
                // we don't have a user in the system.
                console.log("NO JOB FOUND")
                // we could change the session counter to CREATE USER
                let twiml = new MessagingResponse();
                req.session.counter = 0;
                let message = twiml.message();
                message.body('No available jobs in your area.');
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
                console.log("No Jobs COUNTER: " + smsCount);
            }
            else {
                let doc = snapshot.docs[0];
                let title = doc.data().title;
                title = title.toUpperCase();
                let wage = doc.data().wage;
                let startAddress = doc.data().startAddress;
                let startDate = doc.data().startDate;
                startDate = moment(startDate).format('LLL');
                
                console.log("FIRST TITLE: ", title)
                console.log("FIRST WAGE: ", wage)
                console.log("FIRST Address: ", startAddress)

                let twiml = new MessagingResponse();
                req.session.counter = 0;
                let message = twiml.message();
                message.body(title + '\n\nWHERE:\n' + startAddress + '\n\nWHEN:\n' + startDate + '\n\nGET:\n$ ' + wage + '\n\nGet there and send WORK to begin.');
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
                console.log("423 Get Jobhs Session Counter: " + smsCount);
            }
        }).catch (err => {
            console.log('427 ' + err);
        });
    }
    // Get Start Words  WORK
    if (messageBody === "work") {
        console.log("WORK ++++++++++++++++++++++++") 
        // Send JOB PIN and generate CODE
        workJobs = db.collection('jobs').where('jobOpen', '==', true).where("systemNumber", "==", systemNumber).orderBy('startDate', 'desc').get().then((snapshot) => {
            if (snapshot.empty) {
                // we don't have a user in the system.
                console.log("NO JOB FOUND")
                // we could change the session counter to CREATE USER
            }
            else {

                let doc = snapshot.docs[0];
                let title = doc.data().title;
                title = title.toUpperCase();
                let wage = doc.data().wage;
                let startAddress = doc.data().startAddress;

                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>> THIS JOB: ", doc.id)

                let twiml = new MessagingResponse();
                let message = twiml.message();
                req.session.counter = 501;
                message.body('Confirm you are at:\n' + startAddress + '\n\n' + '\nSend your PASSCODE now:');
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
                console.log("Session Counter: " + req.session.counter);
            }
        })
    }
    // Get Start Words  CASH
    if (messageBody === "cash") {
        console.log("CASH ++++++++++++++++++++++++") 
        // enter PIN
        var twiml = new MessagingResponse();
        req.session.counter = 601;
        message = 'CASH Request\n\n Enter your PASSCODE to confirm.\n';
        twiml.message(message);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    }
    // Get Start Words  BAL
    if (messageBody === "bal") {
        console.log("BALANCE ++++++++++++++++++++++++") 
        // FIND the USER
        user = users.where("myCellNumber", "==", messageNumber).get().then(snapshot => {
            if (snapshot.empty) {

                let doc = snapshot.docs[0];
                console.log("WE FOUND THIS USER: ", doc.id);

                // we don't have a user in the system.
                console.log("NO USER FOUND")
                let twiml = new MessagingResponse();
                message = 'You must be a member of this RING first.\n\nSend JOIN to get started.';
                req.session.counter = 0;
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'texts/xml'});
                res.end(twiml.toString());
                // we could change the session counter to CREATE USER
            }
            else {

                let doc = snapshot.docs[0];

                // We will use these variables for the person sending this message
                handle = doc.data().handle.toUpperCase();
                balance = doc.data().balance;

                console.log("WE FOUND THIS USER: ", doc.id);
                console.log("WE FOUND THIS USER: ", handle);
                console.log("WE FOUND THIS USER BALANCE: ", balance);


                let twiml = new MessagingResponse();
                req.session.counter = 0;
                message = 'You have:\n\n$' + balance;
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());

            }
        });
    }
    // Get Start Words  LIST
    if (messageBody === "list") {
        console.log("LIST ++++++++++++++++++++++++") 
        // List of valid commands
        console.log("LIST ++++++++++++++++++++++++") 
        // List of valid commands
        console.log('(else catch all)')
        var twiml = new MessagingResponse();
        req.session.counter = 0;
        message = 'You can use the following commands:\n\nREAD - Read recent posts\nPOST - Post a photo message\nJOBS - Find jobs nearby\nBAL - Balance\nCASH - Request Cash';
        twiml.message(message);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    }
    // If work DONE
    if (messageBody == "done") {
        let twiml = new MessagingResponse();
        req.session.counter = 515;
        twiml.message("Send YES if everything went as planned.\nOtherwise send a message to the BOSS explainging the issue. ");
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
        console.log("Session Counter: " + req.session.counter);
    }


    // Building a New USER in reverse order of avoid double if/else. 
    if (smsCount >= 104 && smsCount <= 106) {
        console.log('smsCount >= 104 && smsCount <= 106')
        thisRing = users.where("myCellNumber", "==", messageNumber).get().then(thisUserSnap => {
            let doc = thisUserSnap.docs[0];
            thisUser = doc.id;
            let passcode = doc.data().passcode;
            console.log("this user: ", thisUser);
            
            if(req.body.NumMedia !== '0') {
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                };
                const filename = `${req.body.MessageSid}.jpg`;
                const url = req.body.MediaUrl0;
                let localFile = `./tmp/${req.body.MessageSid}.jpg`;                                   
                sightengine.check(['nudity', 'type', 'wad', 'scam', 'text', 'offensive']).set_url(url).then(function(result) {
                    console.log("=========image scan results=====>", result);
                    console.log("=========image scan url=====>", url);
    
                    // if the image passes moderation, then...
                    if (result.offensive.prob <= .1 && result.nudity.safe >= .9 && result.weapon <= .1 && result.drugs <= .1 && result.alcohol <= .1 && result.scam.prob <= .1 && result.type.illustration <= .15) {
                        // Download the image
                        request(url).pipe(fs.createWriteStream(localFile))
                        .on('close', () => {
                            console.log('Image downloaded. in Create new textador');
                            // upload image
                            function uploadImage() {
                                storage.bucket(bucketName).upload(localFile, {
                                    // Support for HTTP requests made with `Accept-Encoding: gzip`
                                    gzip: true,
                                    metadata: {
                                    // Enable long-lived HTTP caching headers
                                    // Use only if the contents of the file will never change
                                    // (If the contents will change, use cacheControl: 'no-cache')
                                    cacheControl: 'public, max-age=31536000',
                                    },
                                }).catch (err => {
                                    console.log("ERROR: ", err);
                                });   
                            }
                            // save post to database
                            function saveUserToDatabase() {
                                db.collection('users').doc(thisUser).update({
                                    textadorImage: `https://storage.googleapis.com/textadorposts/${filename}`,
                                    imageModeration: result
                                }).then(ref => {
                                    fs.unlinkSync(localFile);
                                })
    
                            }
                            // They made it, send them a welcome message.
                            function notifyNewTextador() {
                                let twiml = new MessagingResponse();
                                req.session.counter = 0;
                                twiml.message('Your profile is complete. Visit online at:\nhttps://textador.com/user/' + thisUser + '\n\nValid commands:\n\nREAD - read recent posts\nJOBS - find jobs\POST - post a message\n\nLIST - other commands\n\nYour PASSCODE: Remember this for authentication:\n\n' + passcode);
                                res.writeHead(200, {'Content-Type': 'text/xml'});
                                res.end(twiml.toString());
                                console.log("Session Counter: " + req.session.counter);
                            }
    
                            //  this helps with keeping things flowing safely
                            uploadImage();
                            setTimeout(saveUserToDatabase, 3000);
                            setTimeout(notifyNewTextador, 3000);
                            // they made it, so we can set the counter back to 0.
                        });
                    }
                    // Something is not right with the image. They get two more tries. 
                    else {
                        message = 'Your photo did not meet our guidlines. Please do not use inapropriate images.';
                        if (result.text.has_artificial > .1) {
                            message = message + "\n\n The image contains artificial text. Please send a real photo of yourself";
                        }
                        if (result.scam.prob > .15  ) {
                            message = message + "\n\n The image may be a scam. Please send a real photo of yourself"
                        }
                        if (result.drugs > .1 ) {
                            message = message + "\n\n The image may contain drugs. Please send a real photo of yourself"
                        }
                        if (result.alcohol > .1   ) {
                            message = message + "\n\n The image may contain alcohol. Please send a real photo of yourself"
                        }
                        if (result.weapon > .1 ) {
                            message = message + "\n\n The image may contain weapons. Please send a real photo of yourself"
                        }
                        if (result.type.illustration > .15 ) {
                            message = message + "\n\n This may not be a photograph. Please send a real photo of yourself"
                        }
                        if (result.offensive.prob > .1) {
                            message = message + "\n\n The image may be offensive to some. Please send a real photo of yourself"
                        }
                        if (result.nudity.safe < .9) {
                            message = message + "\n\n The image may contain nudity. Please send an appropriate image of yourself"
                        }
                        req.session.counter = smsCount + 1;
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                    }
                }).catch(function(err) {
                // Handle error
                console.log(err);
                    console.log("issue with image scan. Please use .jpg images");
                });
            }
            else {
                let twiml = new MessagingResponse();
                req.session.counter = smsCount + 1;
                message = ('Please send a photograph taken from your phone.');
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
                console.log("Session Counter: " + smsCount);
            }
        }).then(ref => {
            console.log("369 thisUserSnap: ", ref)
        })
    }
    // building a USER Reverse SMS count to avoid multiple if/else
    if (smsCount === 103) {
        console.log('smsCount === 103')
        thisUser = users.where("myCellNumber", "==", messageNumber).get().then(thisUserSnap => {

            let doc = thisUserSnap.docs[0];
            let thisUser = doc.id;
            console.log("this user: ", thisUser);

            //  if they don't reply yes, change their name. 
            // Let's start building the new Textador, we now have a user, so we won't check to newuser.empty any more
            db.collection('users').doc(thisUser).update({
                handle: messageBody
            }).then(ref => {
                // Let's confirm address and get photo
                var twiml = new MessagingResponse();
                smsCount = 103
                req.session.counter = smsCount + 1;
                message = 'Now send a PHOTO. Guidlines:\n\n1) Taken in the last 10 minutes.\n2) Your FACE should be visible.\n3)No Nudity, Symbols or Text.';
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
                console.log("FIRST DATABSE SAVE: ", req.session.counter) 
            }).catch (err => {
                console.log(err.errors[0].message);
            });
        })
    }
    // finding the RING NUMBER PIN for a new USER
    if (smsCount >= 100 && smsCount <= 102) {
        thisRing = users.where("mySystemNumber", "==", systemNumber).get().then(thisRingSnap => {
            let doc = thisRingSnap.docs[0];
            joinPin = doc.data().joinPin.toString();
            console.log("Join PIN: ", joinPin);
            // New user with invalid PIN
            if (smsCount >= 100 && smsCount <= 102 && messageBody != joinPin) {
                console.log('smsCount > 100 && smsCount <= 102 && messageBody != pin')
                var twiml = new MessagingResponse();
                // they three times with this message, then drop all they way down to the last esle here.
                req.session.counter = smsCount + 1;
                message = 'You must enter a valid PIN to join this TEXTADOR RING.';
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            }
            // New user with valid PIN
            else if (smsCount >= 100 && smsCount <= 102 && messageBody == joinPin) {
                console.log('smsCount > 100 && smsCount <= 102 && messageBody == pin')

                console.log("319 SESSION COUNTER ", req.session.counter);

                unirest.get("https://proapi.whitepages.com/3.1/phone?api_key=8c06abca696f4b28933f068e34bff006&phone="+messageNumber)
                .header("X-RapidAPI-Host", "wppro.p.rapidapi.com")
                .end(function (result) {
                    if (result.body.belongs_to.firstname) {
                        myName = result.body.belongs_to.firstname
                        message = 'WELCOME' + myName + '\nTo use this NAME, reply YES. Or send a NAME you want to use for your account.';
                    }
                    else if (result.body.belongs_to.name) {
                        myName = result.body.belongs_to.name
                        message = 'WELCOME' + myName + '\nTo use this NAME, reply YES. Or send a NAME you want to use for your account.';
                    }
                    else {
                        myName = '';
                        message = 'WELCOME\nChoose a NAME you want to use for your account.';
                    }
                    whitePagesResults = result.body;

                    db.collection('users').add({
                        myCellNumber: messageNumber,
                        myRingNumber: systemNumber,
                        createdAt: new Date(),
                        whitePages: whitePagesResults,
                        balance: 100,
                        passcode: crypto.randomBytes(2).toString('hex')
                    }).then(ref => {
                        var twiml = new MessagingResponse();
                        // they three times with this message, then drop all they way down to the last esle here.
                        smsCount = 102;
                        req.session.counter = smsCount + 1;
                        twiml.message("Send a NAME you want to use for your account.");
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                        console.log("329 REVERSE LOOKUP: ", req.session.counter)       
                    })
                });
            }
        });
    }
    // setup the workflow for POST... 
    if (req.session.counter >= 200 && req.session.counter <= 299){
        console.log("POST ++++++++++++++++++++++++")
        // Let's get the Ring Owner and Message Owner
        user = users.where("myCellNumber", "==", messageNumber).get().then(snapshot => {
            if (snapshot.empty) {
                // we don't have a user in the system.
                console.log("NO USER FOUND")
                let twiml = new MessagingResponse();
                message = 'You need to be a member of this RING to POST.\n\nPlease JOIN the RING first.';
                req.session.counter = 0;
                myPostTitle = messageBody
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'texts/xml'});
                res.end(twiml.toString());
                // we could change the session counter to CREATE USER
            }
            else {
                snapshot.forEach(doc => {
                    console.log("WE FOUND THIS USER: ", doc.id);
                    // We will use these variables for the person sending this message
                    handle = doc.data().handle.toUpperCase();
                    passcode = doc.data().passcode.toString().trim();
                    myCellNumber = doc.data().myCellNumber;
                    mySystemNumber = doc.data().mySystemNumber;
                    myTextadorImage = doc.data().textadorImage;
                    balamce = doc.data().balance;

                    if (req.session.counter >= 201 && req.session.counter <= 202 &&  messageBody === passcode){
                        console.log("Successfull Passcode")
                        console.log("Handle of person sending message: " + handle);
                        console.log("Message PASSCODE: " + messageBody);
                        console.log("Message Count: " + smsCount);
                        let twiml = new MessagingResponse();
                        req.session.counter = 203;
                        message = ('Post to ' + systemNumber + '\n\nSend the TITLE now: ');
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                        console.log("Session Counter: " + smsCount);
                    }
                    else if (req.session.counter >= 201 && req.session.counter <= 202 &&  messageBody != passcode){
                        console.log("BAD Passcode")
                        console.log("Handle of person sending message: " + handle);
                        console.log("Message PASSCODE: " + messageBody);
                        console.log("Message Count: " + smsCount);
                        let twiml = new MessagingResponse();
                        req.session.counter = smsCount + 1;
                        message = ('Sorry ' + handle + '\nBAD PASSCODE|\nSend your PASSCODE now: ');
                        twiml.message(message);
                        res.writeHead(200, {
                          'Content-Type': 'text/xml',
                        });
                        res.end(twiml.toString());
                        console.log("Session Counter: " + smsCount);
                    }
                    else if (smsCount === 203) {
                        console.log("smsCount == 203")
                        let twiml = new MessagingResponse();
                        message = 'Post TITLE is:  ' + messageBody + '\n\n Send your MESSAGE now: ';
                        req.session.counter = smsCount + 1;
                        myPostTitle = messageBody
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                        console.log("Post Builder: " + myPostTitle);
                        console.log("Session Counter: " + smsCount);
                    }
                    else if (smsCount === 204) {
                        console.log('smsCount === 204')
                        let twiml = new MessagingResponse();
                        message = 'Post MESSAGE is:  ' + messageBody + '\n\n Send a PHOTO now: ';
                        req.session.counter = smsCount + 1;
                        myPostDescription = messageBody
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                    }
                    else if (smsCount >= 205 && smsCount <= 207) {
                        // post with a photo
                        console.log('smsCount >= 205 && smsCount <= 207')
                        if (req.body.NumMedia !== '0') {
                            if (!fs.existsSync(dir)){
                                fs.mkdirSync(dir);
                            };
                            const filename = `${req.body.MessageSid}.jpg`;
                            const url = req.body.MediaUrl0;
                            let localFile = `./tmp/${req.body.MessageSid}.jpg`;                                   
                            sightengine.check(['nudity', 'type', 'wad', 'scam', 'text', 'offensive']).set_url(url).then(function(result) {
                                console.log("========image scan results=====>", result);
                                console.log("=========image scan url=====>", url);
                                // if the image passes moderation, then...
                                if (result.offensive.prob <= .1 && result.nudity.safe >= .9 && result.weapon <= .1 && result.drugs <= .1 && result.alcohol <= .1 && result.scam.prob <= .15 && result.type.illustration <= .15) {
                                    // Download the image
                                    request(url).pipe(fs.createWriteStream(localFile))
                                    .on('close', () => {
                                        console.log('Image downloaded. In new post from member');
                                        // upload image
                                        function uploadPostImage() {
                                            storage.bucket(bucketName).upload(localFile, {
                                                // Support for HTTP requests made with `Accept-Encoding: gzip`
                                                gzip: true,
                                                metadata: {
                                                // Enable long-lived HTTP caching headers
                                                // Use only if the contents of the file will never change
                                                // (If the contents will change, use cacheControl: 'no-cache')
                                                cacheControl: 'public, max-age=31536000',
                                                },
                                            }).catch (err => {
                                                console.log("ERROR: ", err);
                                            });   
                                        }
                                        // save post to database
                                        function saveOthersPostToDatabase() {
                                            db.collection('posts').add({
                                                title: myPostTitle,
                                                description: myPostDescription,
                                                image: `https://storage.googleapis.com/textadorposts/${filename}`,
                                                authorId: doc.id,
                                                authorHandle: handle,
                                                ringNumber: systemNumber,
                                                imageModeration: result,
                                                createdAt: new Date()
                                            }).then(ref => {
                                                console.log('Added document with ID: ', ref.id);
                                                // send url to the post. 
                                                let twiml = new MessagingResponse();
                                                message = 'Your POST is now live!';
                                                req.session.counter = 0;
                                                twiml.message(message);
                                                res.writeHead(200, {'Content-Type': 'text/xml'});
                                                res.end(twiml.toString());
                                                fs.unlinkSync(localFile);
                                                notifyRingNewPost();
                                            }).catch (err => {
                                                console.log(err.errors[0].message);
                                            }); 
                                            
                                        }
                                        // They made it, send them a welcome message.
                                        function notifyRingNewPost() {
                                            let imageUrl = `https://storage.googleapis.com/textadorposts/${filename}`;
                                            client.messages.create({
                                                body: 'New Post: ' + doc.data().handle + ' \njoinded today and now is a subscriber of ' + mySystemNumber + '\n\nView their profile online at:\nhttps://textador.com/users/' + doc.id,
                                                mediaUrl: imageUrl,
                                                to: ringOwnerCellNumber,
                                                from: mySystemNumber
                                            })
                                            .then(message => console.log(message.sid))
                                            .catch (err => {
                                                console.log(err.errors[0].message);
                                            });
                                        }
        
                                        //  this helps with keeping things flowing safely
                                        uploadPostImage();
                                        setTimeout(saveOthersPostToDatabase, 3000);                                        
                                    })
                                }
                                // Something is not right with the image. They get two more tries. 
                                else {
                                    message = 'Your photo did not meet our guidlines. Please do not use inapropriate images.';
                                    if (result.text.has_artificial > .1) {
                                        message = message + "\n\n The image contains artificial text. Please send a real photo of yourself";
                                    }
                                    if (result.scam.prob > .15  ) {
                                        message = message + "\n\n The image may be a scam. Please send a real photo of yourself"
                                    }
                                    if (result.drugs > .1 ) {
                                        message = message + "\n\n The image may contain drugs. Please send a real photo of yourself"
                                    }
                                    if (result.alcohol > .1   ) {
                                        message = message + "\n\n The image may contain alcohol. Please send a real photo of yourself"
                                    }
                                    if (result.weapon > .1 ) {
                                        message = message + "\n\n The image may contain weapons. Please send a real photo of yourself"
                                    }
                                    if (result.type.illustration > .15 ) {
                                        message = message + "\n\n This may not be a photograph. Please send a real photo of yourself"
                                    }
                                    if (result.offensive.prob > .1) {
                                        message = message + "\n\n The image may be offensive to some. Please send a real photo of yourself"
                                    }
                                    if (result.nudity.safe < .9) {
                                        message = message + "\n\n The image may contain nudity. Please send an appropriate image of yourself"
                                    }
                                    let twiml = new MessagingResponse();
                                    req.session.counter = smsCount + 1;
                                    twiml.message(message);
                                    res.writeHead(200, {'Content-Type': 'text/xml'});
                                    res.end(twiml.toString());
                                }
                            }).catch(function(err) {
                                // Handle error
                                console.log(err);
                                console.log("issue with image scan. Please use .jpg images");
                            });
                        }
                        // post without a photo
                        else {
                            db.collection('posts').add({
                                title: myPostTitle,
                                description: myPostDescription,
                                authorId: doc.id,
                                authorHandle: handle,
                                ringNumber: systemNumber,
                                imageModeration: result,
                                createdAt: new Date()
                            }).then(ref => {
                                console.log('Added document with ID: ', ref.id);
                                // send url to the post.                                 message = 'Your POST is now live!';
                                req.session.counter = 0;
                                twiml.message(message);
                                res.writeHead(200, {
                                  'Content-Type': 'text/xml',
                                });
                                res.end(twiml.toString());

                            }).catch (err => {
                                console.log(err.errors[0].message);
                            }); 
                        }
                    } 
                    else {
                        let twiml = new MessagingResponse();
                        req.session.counter = 0;
                        message = ('Sorry ' + handle + '\nsomething has gone wrong.\n\nPlease send list valid commands.');
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                        console.log("Session Counter: " + smsCount);
                    }
                }).catch (err => {
                    console.log(err.errors[0].message);
                });
            }
        })
    }
    // setup the workflow for READ... 
    if (req.session.counter >= 300 && req.session.counter <= 399){
        console.log("READ ++++++++++++++++++++++++")      
    }
    // setup the workflow for JOBS... 
    if (req.session.counter >= 400 && req.session.counter <= 499){
        console.log("JOBS ++++++++++++++++++++++++")      
    }
    // setup the workflow for WORK... 
    if (req.session.counter >= 500 && req.session.counter <= 599){
        console.log("(req.session.counter >= 500 && req.session.counter <= 599)")
        console.log("730 this System number: ", systemNumber);
        if (smsCount == 516) {    
            // Let's send a message to the Boss and let him take a look
            let twiml = new MessagingResponse();
            let message = twiml.message();
            req.session.counter = 0;
            message.body('Job Complete.\nThe WAGE has been added to your balance.');
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
            console.log("Session Counter: " + req.session.counter);
        }
        else {
            thisWork = db.collection('jobs').where('jobOpen', '==', true).where("systemNumber", "==", systemNumber).orderBy('createdAt', 'desc').get().then((snapshot) => {
            
                // Empty jobs
                if (snapshot.empty) {
                    console.log('Bad Request');
                    // Let's send a message to the Boss and let him take a look
                    let twiml = new MessagingResponse();
                    let message = twiml.message();
                    req.session.counter = 0;
                    message.body('Something went wrong, please send LIST for a list of valid commands.');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                    console.log("Session Counter: " + smsCount);
    
                    client.messages.create({
                        body: 'We got a message from this number: ' + systemNumber + '/n/nFrom: ' + messageNumber + '\n\nSomething looks fishy, we could not find a job or textador with that number.',
                        to: "+16786376521",
                        from: mySystemNumber
                    })
                    .then(message => console.log(message.sid))
                    .catch (err => {
                        console.log(err.errors[0].message);
                    });
    
                }
                // THIS belongs to a JOB.
                else {
                    // THIS NUMBER BELONGS TO A JOB
                    // GET A SNAPSHOT OF THE JOB INFO
    
                    let doc = snapshot.docs[0];
                    let title = doc.data().title;
                    title = title.toUpperCase();
                    let wage = doc.data().wage;
                    let startAddress = doc.data().startAddress;
    
                    thisJobId = doc.id;
                    title = doc.data().title.toUpperCase();
                    description = doc.data().description;
                    startAddress = doc.data().startAddress;
                    bossCellNumber = doc.data().jobCreatorPhoneNumber;
                    
                    user = users.where("myCellNumber", "==", messageNumber).get().then(userSnapshot => {
                        if (snapshot.empty) {
                            // we don't have a user in the system.
                            console.log("NO USER FOUND")
                            let twiml = new MessagingResponse();
                            message = 'You need to be a member of this RING.\n\nPlease JOIN the RING first.';
                            req.session.counter = 0;
                            myPostTitle = messageBody
                            twiml.message(message);
                            res.writeHead(200, {'Content-Type': 'texts/xml'});
                            res.end(twiml.toString());
                            // we could change the session counter to CREATE USER
                        }
                        else {
            
                            let thisWorker = userSnapshot.docs[0];
                            thisWorkerId = thisWorker.id;
    
                            thisWorker = db.collection('users').doc(thisWorkerId);
                            getDoc = thisWorker.get().then(jobCreator => {
                                if (!jobCreator.exists) {
                                    console.log('No such BOSS!');
                                } else {
                                    console.log("WE FOUND THIS WORKER ID: ", thisWorkerId);
                                    console.log("WE FOUND THIS JOB Creator Handle: ", jobCreator.data().handle);
                                    // We will use these variables for the person sending this message
                                    handle = jobCreator.data().handle.toUpperCase();
                                    passcode = jobCreator.data().passcode;
                                    balance = jobCreator.data().balance;
                                    console.log("Boss Cell: ", bossCellNumber)
                                
                                    // New user with invalid PIN
                                    if (smsCount > 500 && smsCount <= 502 && messageBody != passcode) {
                                        var twiml = new MessagingResponse();
                                        // they three times with this message, then drop all they way down to the last esle here.
                                        req.session.counter = smsCount + 1;
                                        message = 'You must enter a valid PIN to get started.';
                                        twiml.message(message);
                                        res.writeHead(200, {'Content-Type': 'text/xml'});
                                        res.end(twiml.toString());
                                    }
                                    // New user with valid PIN
                                    else if (smsCount >= 500 && smsCount <= 502 && messageBody === passcode) {
                                        console.log("Pin passed: ", passcode)
                                        console.log("SMS Count: ", smsCount)
                                        console.log("Job Title: ", title)
                                        if (title == 'CASH') {
                                            message = 'You are a banker. Make sure you have the right amount of cash. You are responsible for any math errors. Please follow the instructions below: \n\nFrom the boss:\n' + description + '\n\nSEND a PHOTO of you starting the job now:';
                                        }
                                        else if (title == 'RIDE') {
                                            message = 'You are giving someone a ride. Be a safe driver. Please follow the instructions below: \n\nFrom the boss:\n' + description + '\n\nSEND a PHOTO of you starting the job now:'
                                        }
                                        else if (title == 'DELIVER') {
                                            message = 'You are a delivery person. Please be careful and drive safely. Please follow the instructions below: \n\nFrom the boss:\n' + description + '\n\nSEND a PHOTO of you starting the job now:'
                                        }
                                        else if (title == 'PHOTO') {
                                            message = 'You are taking a photo. Make sure to get a great picture. Accuracy is important. Please follow the instructions below: \n\nFrom the boss:\n' + description + '\n\nSEND a PHOTO of you starting the job now:'
                                        }
                                        else if (title == 'LABOR') {
                                            message = 'You are strong, like a bull. Let\'s get ready to for a workout. Please follow the instructions below: \n\nFrom the boss:\n' + description + '\n\nSEND a PHOTO of you starting the job now:'
                                        }
                                        else if (title == 'COUNT') {
                                            message = 'You are counting things. Be sure to count twice. Accuracy is important. Please follow the instructions below: \n\nFrom the boss:\n' + description + '\n\nSEND a PHOTO of you starting the job now:'
                                        }
                                        else if (title == 'CLEAN') {
                                            message = 'You are making the world a cleaner place. Attention to detail is important. Please follow the instructions below: \n\nFrom the boss:\n' + description + '\n\nSEND a PHOTO of you starting the job now:'
                                        }
                                        else {
                                            console.log("Bad job title");
                                        }
            
                                        let twiml = new MessagingResponse();
                                        smsCount = 511
                                        req.session.counter = smsCount + 1;
                                        twiml.message(message);
                                        res.writeHead(200, {'Content-Type': 'text/xml'});
                                        res.end(twiml.toString());
                                        console.log("839 SMS COUNT: ", req.session.counter)
                                    }
                                    else if (smsCount >= 511 && smsCount <= 513) { 
                                        // got a photo
                                        console.log('smsCount >= 511 && smsCount <= 513');
                                        if (req.body.NumMedia !== '0') {
                                            if (!fs.existsSync(dir)){
                                                fs.mkdirSync(dir);
                                            }
                                            const filename = `${req.body.MessageSid}.jpg`;
                                            const url = req.body.MediaUrl0;
                                            let localFile = `./tmp/${req.body.MessageSid}.jpg`;   
                                            console.log("++++++++ Got this PHOTO: ", url)                                
                                            sightengine.check(['nudity', 'type', 'wad', 'scam', 'text', 'offensive']).set_url(url).then(function(result) {
                                                console.log('853 checking...')
                                                console.log("854 =========image scan results=====>", result.scam);
                                                console.log("855 =========image scan url=====>", url);
                                                // if the image passes moderation, then...
                                                if (result.offensive.prob <= .1 && result.nudity.safe >= .9 && result.weapon <= .1 && result.drugs <= .1 && result.alcohol <= .1 && result.scam.prob <= .1) {
                                                    // Download the image
                                                    request(url).pipe(fs.createWriteStream(localFile))
                                                    .on('close', () => {
                                                        console.log('861 - Image downloaded passed image processing');
                                                        // upload image
                                                        function uploadWorkStartImage() {
                                                            console.log('uploadWorkStartImage')
                                                            storage.bucket(bucketName).upload(localFile, {
                                                                // Support for HTTP requests made with `Accept-Encoding: gzip`
                                                                gzip: true,
                                                                metadata: {
                                                                // Enable long-lived HTTP caching headers
                                                                // Use only if the contents of the file will never change
                                                                // (If the contents will change, use cacheControl: 'no-cache')
                                                                cacheControl: 'public, max-age=31536000',
                                                                },
                                                            }).catch (err => {
                                                                console.log("ERROR: ", err);
                                                            });
                                                            saveWorkStartToDatabase();
                                                        }
                
                                                        // save post to database
                                                        function saveWorkStartToDatabase() {
                                                            console.log('saveWorkStartToDatabase')
                
                                                            db.collection('jobs').doc(thisJobId).update({
                                                                workStartPhoto: `https://storage.googleapis.com/textadorposts/${filename}`,
                                                                workStartTime: new Date(),
                                                                workerId: thisWorkerId
                                                            }).then(ref => {
                                                                console.log('889 >>>> Added document with ID: ', thisJobId);
                                                                fs.unlinkSync(localFile);
                                                                sendBossStartMessage();
                                                            }).catch(err => console.log("ERROR: ", err))
                                                        }
                
                                                        function sendBossStartMessage() {
                                                            console.log('904 notifyWorker')
            
                                                            let twiml = new MessagingResponse();
                                                            req.session.counter = 0;
                                                            messageBody = 'The BOSS says:\nGET TO WORK.\n\nSend DONE when the job is complete.';
                                                            twiml.message(messageBody);
                                                            res.writeHead(200, {'Content-Type': 'text/xml'});
                                                            res.end(twiml.toString());
                                                            console.log("912 SMS COUNT: ", smsCount)
                                                        }
                
                                                        uploadWorkStartImage();
                                                    });
                                                }
                                                // Something is not right with the image. They get two more tries. 
                                                else {
                                                    message = 'Your photo did not meet our guidlines. Please do not use inapropriate images.';
                                                    if (result.scam.prob > .15  ) {
                                                        message = message + "\n\n The image may be a scam. Please send a real photo of yourself"
                                                    }
                                                    if (result.drugs > .1 ) {
                                                        message = message + "\n\n The image may contain drugs. Please send a real photo of yourself"
                                                    }
                                                    if (result.alcohol > .1   ) {
                                                        message = message + "\n\n The image may contain alcohol. Please send a real photo of yourself"
                                                    }
                                                    if (result.weapon > .1 ) {
                                                        message = message + "\n\n The image may contain weapons. Please send a real photo of yourself"
                                                    }
                                                    if (result.offensive.prob > .1) {
                                                        message = message + "\n\n The image may be offensive to some. Please send a real photo of yourself"
                                                    }
                                                    if (result.nudity.safe < .9) {
                                                        message = message + "\n\n The image may contain nudity. Please send an appropriate image of yourself"
                                                    }
                                                    let twiml = new MessagingResponse();
                                                    req.session.counter = smsCount + 1;
                                                    twiml.message(message);
                                                    res.writeHead(200, {'Content-Type': 'text/xml'});
                                                    res.end(twiml.toString());
                                                }
                                            }).catch(function(err) {
                                                // Handle error
                                                console.log(err);
                                                console.log("issue with image scan. Please use .jpg images");
                                            });
                                        }
                                        // didn't get a photo
                                        else {
                                            let twiml = new MessagingResponse();
                                            messageBody = "This JOB requires a start photo. Please send a photo of you starting the job.";
                                            twiml.message(message);
                                            res.writeHead(200, {'Content-Type': 'text/xml'});
                                            res.end(twiml.toString());
                                        }
                                    }
                                    if (smsCount == 515) {
                                        if (messageBody == "yes") {
                                            if (title == 'BANK') {
                                                message = 'From the boss:\n\nThank you!\nPlease send a JOB rating of\n1 to 5\n\n1=Very Bad\n2=Bad\n3=Normal\n4=Good\n5=Very Good';
                                            }
                                            else if (title == 'RIDE') {
                                                message = 'From the boss:\n\nThank you!\nPlease send a JOB rating of\n1 to 5\n\n1=Very Bad\n2=Bad\n3=Normal\n4=Good\n5=Very Good';
                                            }
                                            else if (title == 'DELIVER') {
                                                message = 'From the boss:\n\nThank you!\nPlease send a JOB rating of\n1 to 5\n\n1=Very Bad\n2=Bad\n3=Normal\n4=Good\n5=Very Good';
                                            }
                                            else if (title == 'PHOTO') {
                                                message = 'From the boss:\n\nThank you!\nPlease send a JOB rating of\n1 to 5\n\n1=Very Bad\n2=Bad\n3=Normal\n4=Good\n5=Very Good';
                                            }
                                            else if (title == 'LABOR') {
                                                message = 'From the boss:\n\nThank you!\nPlease send a JOB rating of\n1 to 5\n\n1=Very Bad\n2=Bad\n3=Normal\n4=Good\n5=Very Good';
                                            }
                                            else if (title == 'COUNT') {
                                                message = 'From the boss:\n\nThank you!\nPlease send a JOB rating of\n1 to 5\n\n1=Very Bad\n2=Bad\n3=Normal\n4=Good\n5=Very Good';
                                            }
                                            else if (title == 'CLEAN') {
                                                message = 'From the boss:\n\nThank you!\nPlease send a JOB rating of\n1 to 5\n\n1=Very Bad\n2=Bad\n3=Normal\n4=Good\n5=Very Good';
                                            }
                                            else if (title == 'CASH') {
                                                message = 'From the boss:\n\nThank you!\nPlease send a JOB rating of\n1 to 5\n\n1=Very Bad\n2=Bad\n3=Normal\n4=Good\n5=Very Good';
                                            }
                                            else {
                                                console.log("Bad job title");
                                            }
            
                                            db.collection('jobs').doc(doc.id).update({
                                                workEndTime: new Date(),
                                                jobOpen: false,
                                            }).then(ref => {
                                                let twiml = new MessagingResponse();
                                                req.session.counter = 516;
                                                twiml.message(message);
                                                res.writeHead(200, {'Content-Type': 'text/xml'});
                                                res.end(twiml.toString());
                                            }).then(message => {
                                                client.messages.create({
                                                    body: handle + ' \nis DONE working on your Job:\n' + title + '\n\nDid you complete the job?:\n\n' + messageBody,
                                                    to: bossCellNumber,
                                                    from: mySystemNumber
                                                })    
                                            })
            
                                            function getPaid() {
                                                console.log("1068 BALANCE: ", balance);
                                                console.log("1069 WAGE: ", wage);
                                                let newBalance = balance + (wage + cashAmount);
                                                console.log('1071 NEW BALANCE: ', newBalance)
                                                console.log('This USER: ', handle)
            
                                                db.collection('users').doc(thisWorkerId).update({
                                                    balance: newBalance
                                                }).then(ref => {
                                                    // Send confirmation
                                                    console.log("Balance adjusted")
                                                })
                                            }
            
                                            setTimeout(getPaid, 2000);
                                            
                                        }
                                        else {
                                            workEndTime = new Date();
                                            db.collection('jobs').doc(doc.id).update({
                                                workEndTime: workEndTime,
                                                jobOpen: true,
                                                incompleteReason: messageBody
                                            }).then(ref => {
                                                let twiml = new MessagingResponse();
                                                req.session.counter = 216;
                                                twiml.message("Thanks for the update.\nYour message was sent to the boss.\n\nFrom the boss:\n\n Thank you! Please send me the JOB rating:\n\n1=Very Bad\n2=Bad\n3=Normal\n4=Good\n5=Very Good");
                                                res.writeHead(200, {'Content-Type': 'text/xml'});
                                                res.end(twiml.toString());
                                            })
                                            .then(message => {
                                                client.messages.create({
                                                    body: handle + ' \nis DONE working on your Job:\n' + title + '\n\nThey did not complete the JOB. They said: ' + messageBody,
                                                    mediaUrl: imageUrl,
                                                    to: bossCellNumber,
                                                    from: mySystemNumber
                                                })    
                                            })
                                            .catch (err => {
                                                console.log(err.errors[0].message);
                                            });
                                        }
                                    }
                                }
                            })
                            .catch(err => {
                                console.log('Error getting document', err);
                            });
    
                        }
                    })
                }
            }).catch (err => {
                console.log(err);
            });
        }
    }
    // setup the workflow for CASH... 
    if (req.session.counter >= 600 && req.session.counter <= 699){
        console.log("CASH ++++++++++++++++++++++++")    
        user = users.where("myCellNumber", "==", messageNumber).get().then(snapshot => {
            if (snapshot.empty) {
                // we don't have a user in the system.
                console.log("NO USER FOUND")
                let twiml = new MessagingResponse();
                message = 'You need to be a member of this RING.\n\nPlease JOIN the RING first.';
                req.session.counter = 0;
                myPostTitle = messageBody
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'texts/xml'});
                res.end(twiml.toString());
                // we could change the session counter to CREATE USER
            }
            else {

                let doc = snapshot.docs[0];

                console.log("WE FOUND THIS USER: ", doc.id);
                // We will use these variables for the person sending this message
                handle = doc.data().handle.toUpperCase();
                passcode = doc.data().passcode.toString().trim();
                myCellNumber = doc.data().myCellNumber;
                mySystemNumber = doc.data().mySystemNumber;
                myTextadorImage = doc.data().textadorImage;
                balance = doc.data().balance;
                myRingNumber = doc.data().myRingNumber;
                thisUser = doc.id;

                console.log("THIS BALANCE: ", balance )
                console.log("THIS HANDLE: ", handle )

                if (req.session.counter >= 601 && req.session.counter <= 602 &&  messageBody === passcode && balance >= 20){
                    // Let's create a CASH job.
                    var twiml = new MessagingResponse();
                    message = 'Hi ' + handle + '\n\nLet\'s create a CASH request.\nYou have a BALANCE of:\n' + balance + '\n\nHow much CASH do you want?\n\nSend an amount less than:\n' + Math.floor(balance * .95);
                    req.session.counter = 603;
                    twiml.message(message);
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
                else if (req.session.counter >= 601 && req.session.counter <= 602 && messageBody != passcode && balance < 20){
                    var twiml = new MessagingResponse();
                    message = 'Hi ' + handle + '\n\nYou don\'t have enough for a CASH request, or...\n\nWrong PASSCODE';
                    req.session.counter = smsCount + 1;
                    twiml.message(message);
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
                else if (smsCount === 603) {
                    console.log('(smsCount === 603)')
                    if (messageBody >= Math.floor(balance * .95)) {
                        // Set the amount desired
                        var twiml = new MessagingResponse();
                        message = 'Sorry you don\'t have that much in your account.\n\n Please send an amount less than:\n' + Math.floor(textadorBucks * .95);
                        req.session.counter = 603;
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                    }
                    else if (messageBody <= Math.floor(balance * .95)) {
                        // How much will you pay for this cash
                        cashAmount = Math.floor(messageBody);
                        wage = Math.ceil(cashAmount * .05);
                        description = 'GIVE: ' + cashAmount + '\n\nGET: ' + (cashAmount + wage);

                        db.collection('jobs').add({
                            jobCreatorPhoneNumber: messageNumber,
                            title: 'CASH',
                            description: description,
                            imageUrl: '../img/cash.jpg',
                            createdAt: new Date(),
                            wage: wage,
                            cashAmount: cashAmount,
                            startDate: new Date(),
                            jobOpen: false,
                            systemNumber: myRingNumber,
                            jobCreator: doc.id
                        }).then(ref => {
                            var twiml = new MessagingResponse();
                            message = 'You will transfer\n' + cashAmount + '\nPlus\n' + wage + '\n--------\nTotal: ' + (cashAmount + wage) + '\n\n\nEnter the ADDRESS where you would like to pickup the CASH:';
                            req.session.counter = 604;
                            twiml.message(message);
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());    
                        })
                    }
                }
                else if (smsCount === 604) {
                    // let's get the JOB Address

                    cashRequest = db.collection('jobs').where("jobCreatorPhoneNumber", "==", messageNumber).orderBy('createdAt', 'desc').get().then((cashSnapshot) => {

                        let doc = cashSnapshot.docs[0];
                        let thisJob = doc.id;
                        let title = doc.data().title;
                        title = title.toUpperCase();
                        let wage = doc.data().wage;
                        let startAddress = messageBody;
                        console.log('THIS JOB ADDRESS: ', startAddress)
                        console.log('THIS JOB TITLE: ', title)

                        db.collection('jobs').doc(thisJob).update({
                            startAddress: startAddress
                        }).then(ref => {
                            console.log('(smsCount === 604)')                             
                            // Let's confirm address
                            var twiml = new MessagingResponse();
                            message = 'CASH will be delivered to:\n' + startAddress + '\n\nTo complete this request\nsend a PHOTO of yourself now:';
                            req.session.counter = 605;
                            twiml.message(message);
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString()); 
                        })
                    })
                }
                // Let's process the image and create their account. 
                else if (smsCount >= 605 && smsCount <= 606) {
                    console.log('(smsCount >= 605 && smsCount <= 606)')
                    if(req.body.NumMedia !== '0') {
                        if (!fs.existsSync(dir)){
                            fs.mkdirSync(dir);
                        };
                        const filename = `${req.body.MessageSid}.jpg`;
                        const url = req.body.MediaUrl0;
                        let localFile = `./tmp/${req.body.MessageSid}.jpg`;                                   
                        sightengine.check(['nudity', 'type', 'wad', 'scam', 'text', 'offensive']).set_url(url).then(function(result) {
                            console.log("=========Cash scan results=====>", result);
                            console.log("=========Cash scan results=====>", url);

                            // if the image passes moderation, then...
                            if (result.offensive.prob <= .1 && result.nudity.safe >= .9 && result.weapon <= .1 && result.drugs <= .1 && result.alcohol <= .1 && result.scam.prob <= .1 && result.type.illustration <= .15) {
                                // Download the image
                                request(url).pipe(fs.createWriteStream(localFile))
                                .on('close', () => {
                                    console.log('Image downloaded. In cash request ');
                                    // upload image

                                    function uploadJobImage() {
                                        storage.bucket(bucketName).upload(localFile, {
                                            // Support for HTTP requests made with `Accept-Encoding: gzip`
                                            gzip: true,
                                            metadata: {
                                            // Enable long-lived HTTP caching headers
                                            // Use only if the contents of the file will never change
                                            // (If the contents will change, use cacheControl: 'no-cache')
                                            cacheControl: 'public, max-age=31536000',
                                            }
                                        }).catch (err => {
                                            console.log("ERROR: ", err);
                                        });
                                        console.log("Inside Upload Image Job" + `https://storage.googleapis.com/textadorposts/${filename}`)
                                    }
                                    // save post to database
                                    function saveJobToDatabase() {

                                        cashRequest = db.collection('jobs').where("jobCreatorPhoneNumber", "==", messageNumber).orderBy('createdAt', 'desc').get().then((cashSnapshot) => {

                                            let doc = cashSnapshot.docs[0];
                                            let thisJob = doc.id;
                                            let textadorImage = `https://storage.googleapis.com/textadorposts/${filename}`;
                
                                            db.collection('jobs').doc(thisJob).update({
                                                textadorImage: textadorImage,
                                                jobOpen: true
                                            }).then(ref => {
                                                // Send confirmation
                                                var twiml = new MessagingResponse();
                                                message = 'Your CASH is on the way.';
                                                req.session.counter = 0;
                                                twiml.message(message);
                                                res.writeHead(200, {'Content-Type': 'text/xml'});
                                                res.end(twiml.toString());
                                            })
                                        })
                                    }

                                    function reduceBalance() {

                                        cashRequest = db.collection('jobs').where("jobCreatorPhoneNumber", "==", messageNumber).orderBy('createdAt', 'desc').get().then((cashSnapshot) => {
                                            let doc = cashSnapshot.docs[0];
                                            let thisJob = doc.id;
                                            wage = doc.data().wage;
                                            cashAmount = doc.data().cashAmount;
                                        }).then(ref => {

                                            console.log("1277 BALANCE: ", balance);
                                            console.log("1278 WAGE: ", wage);
    
                                            let totalDebit = cashAmount + wage;
                                            let newBalance = balance - totalDebit;
                                        
                                            console.log('1284 NEW BALANCE: ', newBalance)
                                            console.log('This USER: ', handle)
    
                                            db.collection('users').doc(thisUser).update({
                                                balance: newBalance
                                            }).then(ref => {
                                                // Send confirmation
                                                console.log("Balance adjusted")
                                            })
    
                                        });                                        
                                    }

                                    //  this helps with keeping things flowing safely
                                    uploadJobImage();
                                    setTimeout(saveJobToDatabase, 3000);
                                    setTimeout(reduceBalance, 1000);
                                });
                            }
                            // Something is not right with the image. They get two more tries. 
                            else {
                                message = 'Your photo did not meet our guidlines. Please do not use inapropriate images.';
                                if (result.text.has_artificial > .1) {
                                    message = message + "\n\n The image contains artificial text. Please send a real photo of yourself";
                                }
                                if (result.scam.prob > .15  ) {
                                    message = message + "\n\n The image may be a scam. Please send a real photo of yourself"
                                }
                                if (result.drugs > .1 ) {
                                    message = message + "\n\n The image may contain drugs. Please send a real photo of yourself"
                                }
                                if (result.alcohol > .1   ) {
                                    message = message + "\n\n The image may contain alcohol. Please send a real photo of yourself"
                                }
                                if (result.weapon > .1 ) {
                                    message = message + "\n\n The image may contain weapons. Please send a real photo of yourself"
                                }
                                if (result.type.illustration > .15 ) {
                                    message = message + "\n\n This may not be a photograph. Please send a real photo of yourself"
                                }
                                if (result.offensive.prob > .1) {
                                    message = message + "\n\n The image may be offensive to some. Please send a real photo of yourself"
                                }
                                if (result.nudity.safe < .9) {
                                    message = message + "\n\n The image may contain nudity. Please send an appropriate image of yourself"
                                }
                                let twiml = new MessagingResponse();
                                req.session.counter = smsCount + 1;
                                twiml.message(message);
                                res.writeHead(200, {'Content-Type': 'text/xml'});
                                res.end(twiml.toString());
                            }

                        }).catch(function(err) {
                        // Handle error
                        console.log(err);
                        console.log("issue with image scan. Please use .jpg images");
                        });
                    }
                    else {
                        wage = messageBody;
                        message = 'Sorry you must send a photo of yourself to proceed with this CASH request.';
                        req.session.counter = smsCount + 1;
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                    }
                }
            }
        })  
    }
});

// Send every other request to the React app
// Define any API routes before this runs
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(PORT, () => {
    console.log(`🌎 ==> API server now on port ${PORT}!`);
});

