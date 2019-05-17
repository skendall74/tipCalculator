const router = require("express").Router();


// create a GET route
router.get('/', (req, res) => {
    console.log('connected');
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
  });

router.post('/', (req, res) => {
    var mediaUrl = 'https://s3.amazonaws.com/dfc_attachments/images/3537147/textadorLogoWhiteSmall.jpg';
    var smsCount = req.session.counter || 0;
    var messageBody = req.body.Body.trim().toLowerCase();
    var messageNumber = req.body.From;
    var systemNumber = req.body.To;

    console.log("Incoming from: " + messageNumber);
    console.log("System to: " + systemNumber);
    console.log("Message: " + messageBody);
    console.log("Message Count: " + smsCount);

    console.log("Textador: " + systemNumber);
    console.log("Converstation Counter: " + smsCount);

    // Let's see who is texting
    db.User.findOne({
        where: {
            mySystemNumber: systemNumber
        }
    }).then(user => {
        // Make sure user exists before trying to use it or app crashes
        if (!user) {
            return res.status(422).json("No user found with that number");
        }

        // if the from number this persons cell, then they are the textador
        console.log("After DB Count: " + smsCount);
        console.log("Username: " + user.name);
        if (user.myCellNumber == messageNumber && user.mySystemNumber == systemNumber) {
            if (messageBody == "post") {
                req.session.counter = smsCount + 1;
                var twiml = new MessagingResponse();
                var message = "";
                message = ('Ready to create a new post?\n\nSend the TITLE now: ');
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
                db.Post.create({
                    UserId: user.id
                    }).then(response => {
                        console.log("Message ID success: " + JSON.stringify(response.id));
                    }).catch (err => {
                        console.log(err.errors[0].message);
                });

            }
            else if (smsCount == 1) {
                console.log("get post userid: " + user.id)
                db.Post.findOne({
                    where: {
                        UserId: user.id
                    },
                    order: [
                        ["updatedAt", "DESC"]
                    ]
                }).then(function (record) {
                    return record.update({title: messageBody});
                  })
                    .then(response => {
                        message = 'Post TITLE is:  ' + messageBody + '\n\n Send the DESCRIPTION now: ';
                        req.session.counter = smsCount + 1;
                        var twiml = new MessagingResponse();
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());        
                    }).catch (err => {
                        console.log(err.errors[0].message);
                });
            }
            else if (smsCount == 2) {
                console.log('the DESCRIPTION is: '+ messageBody);
                db.Post.findOne({
                    where: {
                        UserId: user.id
                    },
                    order: [
                        ["updatedAt", "DESC"]
                    ]
                }).then(function (record) {
                    return record.update({body: messageBody});
                  })
                    .then(response => {
                        message = 'Post BODY is:  ' + messageBody + '\n\n Send the PRICE now: \nUse NUMBERS only.\nSend 0 if it\'s free.';
                        req.session.counter = smsCount + 1;
                        var twiml = new MessagingResponse();
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());        
                    }).catch (err => {
                        console.log(err.errors[0].message);
                });
            }
            else if (smsCount == 3) {
                console.log('the PRICE is: '+ messageBody);
                db.Post.findOne({
                    where: {
                        UserId: user.id
                    },
                    order: [
                        ["updatedAt", "DESC"]
                    ]
                }).then(function (record) {
                    return record.update({amount: messageBody});
                  })
                    .then(response => {
                        if (messageBody === 0){
                            message = 'Free or for reservation. Send the PHOTO now: ';
                        }
                        else {
                            message = 'Post PRICE is:  ' + messageBody + '\n\n Send the PHOTO now: ';
                        }
    
                        req.session.counter = smsCount + 1;
                        var twiml = new MessagingResponse();
                        twiml.message(message);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
      
                    }).catch (err => {
                        console.log(err.errors[0].message);
                });
                // We need to get all subs and then do something like this:
            }
            else if (smsCount >= 4) {
                if(req.body.NumMedia !== '0') {
                    var url = `${req.body.MediaUrl0}`;
                    console.log("media: URL " + url);
                    var extension = `${req.body.MediaContentType0}`;
                    console.log("media content type: " + extension);
                    var extension = extension.substr(6);
                    console.log("media ext: " + extension);
                    if (extension = "jpeg") {
                        extension = ".jpg"
                    };
                    console.log("media: URL " + url);

                    console.log("req body mediaUrl: " + url);
                    db.Post.findOne({
                        where: {
                            UserId: user.id
                        },
                        order: [
                            ["updatedAt", "DESC"]
                        ]
                    }).then(function (record) {
                        return record.update({mediaUrl: url});
                      })
                        .then(response => {
                            // We need to get all subs and then do something like this:
                            message = 'Your POST is now live!';
                            var postId = response.id;
                            var postTitle = response.title;
                            var postDescription = response.body;
                            var postAmount = response.amount;
                            var postImage = response.mediaUrl;

                            photos.createPostPhoto(user, postId, url).then(photo => {
                                console.log("Reply from createPostPhoto: " + JSON.stringify(photo));
                            }).catch(err => {
                                console.log(JSON.stringify(err));
                            });

                            req.session.counter = 0;
                            var twiml = new MessagingResponse();
                            twiml.message(`${message}\n\n${postImage}`);
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());

                            db.Subscriber.findAll({
                                where: {
                                    UserId: user.id
                                }
                            }).then(function (records) {
                                var i;
                                for (i = 0; i < records.length; i++) {
                                    if(postAmount === 0){
                                        message = user.name + " has a new post.\n\n" +  postTitle + '\n\n' + postDescription + '\n\n' + 'There is no cost to reserve this.\nCheck it out here: \n' + postImage;
                                    }
                                    else {
                                        message = user.name + " has a new post.\n\n" +  postTitle + '\n\n' + postDescription + '\n\n' + 'This can be yours for $' + postAmount + '\nCheck it out here: \n' + postImage;
                                    }
                                    client.messages.create({
                                        body: message,
                                        from: systemNumber,
                                        to: records[i].subscriberID
                                    })
                                    .then(message => console.log(message.sid));
                                }
                  
                                }).catch (err => {
                                    console.log(err.errors[0].message);
                            });


                        }).catch (err => {
                            console.log(err.errors[0].message);
                    });
                } else {
                    twiml.message("Try sending a picture message. You can send it now:");
                }
            }
            else if (messageBody == "subs"){
                console.log('Message body: '+ messageBody);

                req.session.counter = 0;
                db.Subscriber.findAll({
                    where: {
                        UserId: user.id
                    }
                }).then(function (record) {
                    var subscribersNumber = record.length
                    message = 'You have ' + subscribersNumber + ' subscribers';
                    console.log(message);

                    req.session.counter = 0;
                    var twiml = new MessagingResponse();
                    twiml.message(message);
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
      
                    }).catch (err => {
                        console.log(err.errors[0].message);
                });

            }
            else if (messageBody == "balance"){
                console.log('Message body: '+ messageBody);
                // We need to get all subs and then do something like this:
                message = 'You\'ve got a balance of: \n$' + user.balance;
                console.log(message);

                req.session.counter = 0;
                var twiml = new MessagingResponse();
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());

            }
            else {
                console.log('Message body: '+ messageBody);
                // We need to get all subs and then do something like this:
                message = 'Hi ' + user.name + ' ~ \nValid commands are:\n\nBalance\nSubs\nPost\n';
                console.log(message);

                req.session.counter = 0;
                var twiml = new MessagingResponse();
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            }

        // We have a TEXTADOR with this System Number, but the message is not from them.  So let's help them get what they want from this TEXTADOR
        } else if (user.myCellNumber) {
            if (messageBody == "read") {
                db.Post.findOne({
                    where: {
                        UserId: user.id
                    },
                    order: [
                        ["updatedAt", "DESC"]
                    ]
                }).then(function (record) {
                    req.session.counter = 0;
                    var title = record.title.charAt(0).toUpperCase() + record.title.slice(1);
                    var body = record.body.charAt(0).toUpperCase() + record.body.slice(1);
                    var amount = record.amount;
                    var image = record.mediaUrl
                    console.log(amount)
                    if (amount !== 0) {
                        message = user.name + 
                        '\'s most recent post:\n\n' + 
                        title + 
                        "\n\n" + 
                        body + 
                        "\n===========\n Available for: $" +  
                        amount + 
                        "\n\nView image here:\n" + 
                        image +
                        "\n\nReply: BUY to reserve this.";
                    }
                    else {
                        message = user.name + 
                        '\'s most recent post:\n\n' + 
                        title + 
                        "\n\n" + 
                        body + 
                        "\n===========\n " + 
                        "View image here:" + 
                        image +
                        "\n\nReply: BUY to purchase this.";
                    }   
                    req.session.counter = 0;
                    var twiml = new MessagingResponse();
                    twiml.message(message);
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                });
            }
            else if (messageBody == "buy") {
                db.Post.findOne({
                    where: {
                        UserId: user.id
                    },
                    order: [
                        ["updatedAt", "DESC"]
                    ]
                }).then(function (record) {
                    var title = record.title.charAt(0).toUpperCase() + record.title.slice(1);
                    var amount = record.amount;
                    console.log(amount);
                    if (amount !== 0) {
                        message = 'Reply \'YES\' to purchase:\n\n' + 
                        title + 
                        "\n\n You'll owe " +
                        user.name +
                        " $" +
                        amount
                    }
                    else {
                        message = 'Reply \'YES\' to reserve:\n\n' + title
                    }
                    req.session.counter = 1;
                    smsCount = 1;
                    var twiml = new MessagingResponse();
                    twiml.message(message);
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                    console.log("SMS Count: " + smsCount);
                });
            }
            else if (messageBody === "yes" && smsCount === 1) {
                console.log("SMS Count: " + smsCount);
                db.Post.findOne({
                    where: {
                        UserId: user.id
                    },
                    order: [
                        ["updatedAt", "DESC"]
                    ]
                }).then(function (record) {
                    req.session.counter = 0;
                    var title = record.title.charAt(0).toUpperCase() + record.title.slice(1);
                    var amount = record.amount;
                    if (amount !== 0) {
                        message = 'You just purchased:\n\n' + 
                        title + 
                        "\n\n" +
                        "Please pay " + user.name + " $" + amount + "\n\nA confirmation message has been sent to " + user.name
                    }
                    else {
                        message = 'You just reserved:\n\n' + 
                        title + 
                        "\n\n" +
                        "Please see " + user.name + ".\n\nA confirmation message has been sent to " + user.name
                    }   
                    var twiml = new MessagingResponse();
                    twiml.message(message);
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());

                    if (amount !== 0) {
                        sellerMessage = 'SOLD:\n\n' + 
                        title + 
                        "\n\n" +
                        "Buyer: " + messageNumber;
                    }
                    else {
                        sellerMessage = 'You just reserved:\n\n' + 
                        title + 
                        "\n\n" +
                        "A confirmation message has been sent to " + user.name
                    }
                    client.messages.create({
                        body: sellerMessage,
                        to: user.myCellNumber,  // Text this number
                        from: user.mySystemNumber // From a valid Twilio number
                    })
                    .then((message) => console.log(message.sid));
                    // create a transaction 
                    console.log("Seller: " + user.id);
                    console.log("Buyer: " + messageNumber);
                    console.log("Amount: " + amount);
                    console.log("Date: " + Date.now());
                    db.Transaction.create({
                        sellerID: user.id,
                        buyerID: messageNumber,
                        amount: amount
                        }).then(response => {
                            console.log("Subscriber was added: " + JSON.stringify(response.id));
                        }).catch (err => {
                            console.log(err.errors[0].message);
                    });
                    smsCount = 0;
                });
            }
            else if (messageBody == "join") {
                // let's see if this person is already a TEXTADOR. We don't want to let them create more than one account per myCellNumber
                db.User.findOne({
                    where: {
                        myCellNumber: messageNumber
                    }
                }).then(user => {
                if (user) {
                    client.messages.create({
                        body: 'Hello TEXTADOR.\nOnly one account per cell phone.',
                        to: messageNumber,  // Text this number
                        mediaUrl: mediaUrl,
                        from: systemNumber // From a valid Twilio number
                    })
                    .then((message) => {
                        console.log("They already have an account.")
                    });
                }
                else {
                    var newTextadorNumber = ""
                    var messageNumberAreaCode = messageNumber.substring(2, 5);
                    console.log("Area Code:",messageNumberAreaCode);
                    var getNumberLike = messageNumberAreaCode + "*******";
                    console.log("Get Like:",getNumberLike);
                    client.availablePhoneNumbers('US')
                    .local.list({
                        contains: getNumberLike
                    }).then(data => {
                        const number = data[0];
                        console.log("Available Number:",number);
                        return client.incomingPhoneNumbers.create({
                            phoneNumber: number.phoneNumber,
                        });
                    }).then(purchasedNumber => {
                        newTextadorNumber = purchasedNumber.phoneNumber
                        message = 'Hi, you\'re at TEXTADOR at:\n\n' + purchasedNumber.phoneNumber + '\n==============\nIt takes between 20 and 30 minutes for you number of be configured. Once complete You\'ll get a Text message from your TEXTADOR number. See you soon.';
                        
                        client.messages.create({
                            body: message,
                            to: messageNumber,  // Text this number
                            mediaUrl: mediaUrl,
                            from: systemNumber // From a valid Twilio number
                        }).then((message) => {
                            console.log("Welcome message: " + JSON.stringify(message.body));  
                        });
                    }).then(message => {
                        // Let's setup a User in the database. This way when they text their number, they'll be recognized as the TEXTADOR
                        var message = 'NEW TEXTADOR!!!\n=============\n' + newTextadorNumber;
                        client.messages.create({
                            body: message,
                            to: '+16786376521',  // Text this number
                            mediaUrl: mediaUrl,
                            from: systemNumber // From a valid Twilio number
                        }).then((message) => console.log(message.sid)); 
                    });
                }});
            }
            else {
                console.log("SMS Count: " + smsCount);
                // We need to get all subs and then do something like this:
                message = 'Hi, you\'ve reached:\n' + user.name + '\'s\nTEXTADOR account.\n\nWhat can I help with?\nValid commands:\n\nRead ~ my stuff\nBuy ~ what you like\nJoin ~ Become a TEXTADOR\n\nYou will get updates from ' + user.name + '\nSend: STOP to unsubscribe.';
                console.log(message);

                req.session.counter = 0;
                var twiml = new MessagingResponse();
                twiml.message(message);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
  
                console.log("This message is to user ID: " + user.id);
                console.log("This message is from #: " + messageNumber);
            }
            // Let's create a new subscriber for this message if they aren't already one
            db.Subscriber.findOne({
                where: {
                    subscriberID: messageNumber,
                    UserId: user.id
                }
            }).then(function (record) {
                if (!record) {
                    db.Subscriber.create({
                        UserId: user.id,
                        subscriberID: messageNumber
                        }).then(response => {
                            console.log("Subscriber was added: " + JSON.stringify(response.id));
                        }).catch (err => {
                            console.log(err.errors[0].message);
                    });
                }
            });
        }
        else {
            console.log("This message from: " + fromNumber);
            client.messages.create({
                body: 'Sorry please contact TEXTADOR support at 1-888-959-5959.',
                to: messageNumber,  // Text this number
                mediaUrl: mediaUrl,
                from: systemNumber // From a valid Twilio number
            })
            .then((message) => console.log(message.sid));    
        }
    })
    .catch (err => {
        res.status(422).json(err.errors[0].message);
    });

});

module.exports = router;