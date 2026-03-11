const express = require('express');
const http = require('http');
const { join, parse } = require('path');
const socketIO = require('socket.io');
const mysql = require('mysql');
const { name } = require('ejs');
require('dotenv').config();
const axios = require('axios');
const Flutterwave = require('flutterwave-node-v3');
const nodemailer = require('nodemailer');
//const btchaving = require('./Btchavingtracker.js')
const { createClient } = require('@supabase/supabase-js');
const { DatabaseError } = require('pg');
const { brotliCompress } = require('zlib');

const supabase = createClient(process.env.SUPABASE_URL1, process.env.SERVICE_KEY1);

let supabasercpt = createClient(process.env.SUPABASE_URL2, process.env.SERVICE_KEY2);

// const SUPABASE_URL =  'https://tvjsgpzsgorepujmwacj.supabase.co'
// const supabase = createClient(SUPABASE_URL, process.env.SERVICE_KEY1);
//const supabase = createClient(process.env.SUPABASE_URL2, process.env.SERVICE_KEY2);

//const supabasercpt = 0

const app = express()
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
  }
});



//below stop nodemon from crashing
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Handle the error and keep the process alive
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Handle the promise rejection without exiting
});//below stop nodemon from crashing


// Allow all origins manually
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all domains
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow headers
  next();
});


let ResToUsers = {}//store data to response back to user 

//handle withdrawer error 
let sendemailtoadmin = [];
let sendemailtoadmin2 = ['{default}', '{default}'];
let stoptwicewithdraw;//stop twice withdraw
let trackcatcherror = ['default']; //update catch to give signal that i have branch to status @ success in withdraw

let roomidentity = ['default'] //store room identity here, default is there that index might navigate it @ -1

//room2 
// let countroom2 = 1;
let allarrayof2 = [{ ids2: 'null', listofpeople2: ['null'], usersprofile2: [] }];
let timeElapsed2 = 0; // Initialize the time counter
let timerInterval2 = null; // Variable to store the interval

// //room3 
let timeElapsed3 = 0; // Initialize the time counter
let timerInterval3 = null; // Variable to store the interval
let allarrayof3 = [{ ids3: 'null', listofpeople3: ['null'], usersprofile3: [] }];;

// //room4 
// let countroom4 = 1;
let timeElapsed4 = 0; // Initialize the time counter
let timerInterval4 = null; // Variable to store the interval
let allarrayof4 = [{ ids4: 'null', listofpeople4: ['null'], usersprofile4: [] }];;

// //room5
let timeElapsed5 = 0; // Initialize the time counter
let timerInterval5 = null; // Variable to store the interval
let allarrayof5 = [{ ids5: 'null', listofpeople5: ['null'], usersprofile5: [] }];

//room6
let timeElapsed6 = 0; // Initialize the time counter
let timerInterval6 = null; // Variable to store the interval
let allarrayof6 = [{ ids6: 'null', listofpeople6: ['null'], usersprofile6: [] }];

//room7
let timeElapsed7 = 0; // Initialize the time counter
let timerInterval7 = null; // Variable to store the interval
let allarrayof7 = [{ ids7: 'null', listofpeople7: ['null'], usersprofile7: [] }];

let StopRunAppFromUsers = 1//when there is going to be an update from admin. End app running

let messagecount = 0;// store count message par day @ limit of 470 then reset after a day 

//bellow is the list of gmail api keys array. Max of 500 message parday for each
let listofgmailapi = [
  { expireparday: 0, countpayday: 0, usergmail: process.env.g1, apppass: process.env.p1, No: '1' },
  { expireparday: 0, countpayday: 0, usergmail: process.env.g2, apppass: process.env.p2, No: '2' },
  { expireparday: 0, countpayday: 0, usergmail: process.env.g3, apppass: process.env.p3, No: '3' },
  { expireparday: 0, countpayday: 0, usergmail: process.env.g4, apppass: process.env.p4, No: '4' },
  { expireparday: 0, countpayday: 0, usergmail: process.env.g5, apppass: process.env.p5, No: '5' }
]

// directory for files folders
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// //db connection
//  const dbConfig = {
//   host:process.env.host,
//   user:process.env.db_user,
//   port:process.env.port,
//   database:process.env.database,
//   postgres:process.env.postgres
// }


let connection

// Connection to the supabase server 
let subscription = null;

function handleDisconnect() {
  console.log("🔄 Setting up subscription...");

  subscription = supabase
    .channel('realtime:your_table')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'your_table' },
      (payload) => {
        console.log('📥 Change received:', payload);
      }
    )
    .subscribe((status) => {
      console.log("ℹ️ Subscription status:", status);

      if (status === 'SUBSCRIBED') {
        console.log("✅ Subscribed to changes.");
      }
    });

  // Reconnect logic on WebSocket close/error
  subscription.socket.onclose = () => {
    console.log("❌ WebSocket closed. Attempting to reconnect...");
    reconnectWithDelay();
  };

  subscription.socket.onerror = (error) => {
    console.error("⚠️ WebSocket error:", error);
    reconnectWithDelay();
  };
}

function reconnectWithDelay(delay = 3000) {
  setTimeout(() => {
    console.log("🔁 Reconnecting...");
    handleDisconnect();
  }, delay);
}

// Start subscription
handleDisconnect();
// Connection to the supabase server  end


//generating random number for varification
let varifycode;
function generatevarification() {
  return varifycode = Math.random().toString().slice(2, 8);

}


//generating random number for deposit
let randomd;
function generaterandomnumd() {
  return randomd = Math.random().toString().slice(2, 8);

}


//generating random number for gamebot
let gamebot

function generategamebot() {
  return gamebot = Math.round(Math.random()) + 1

}

//generate date and time for gamer to db
const timeanddate = Date.now()
const resolvtimedate = new Date(timeanddate)
const time = resolvtimedate.toUTCString().slice(16, 39)
const date = resolvtimedate.toUTCString()


//signup route     
app.post('/signup', (req, res) => {
  try {
    const { username, firstname, lastname, email, password, PhoneNumber } = req.body;
    console.log(username)
    if (StopRunAppFromUsers !== 1) {//stop app
      res.render('Stopapp/Stopapp');
      return;
    }//stop app

    //signup  starting @ below
    if (username === process.env.signup) {
      res.render('signup/signup', { resultsemail: '0', resultspass: '0', resultsuser: '0', usersname: '0', passwordv: '0', serverinfo: '0' });
      return;
    }//signup starting end


    const pass = password;//used for compare password

    var usersname = 0; //store username compare result in other to parse it to client  
    var passwordv = 0; //store password compare result in other to parse it to client 

    //arrays for varification of unique users
    var uppercase = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    var lowercase = ('abcdefghijklmnopqrstuvwxyz');
    var num = ('0123456789');
    var char = ('!@#$%^&*"`¬()_+[]{}|;:,/.>< ?');

    // convert username input to string before comfirm
    var userna = username;
    const usernams = userna.toString();// convert to string before compare 
    const checkusernam1 = Array.from(usernams).some((use) => uppercase.includes(use));
    const checkusernam2 = Array.from(usernams).some((use) => num.includes(use));
    const checkusernam3 = Array.from(usernams).some((use) => char.includes(use));

    //convert password to string before compare
    var checkp = pass;
    const str = checkp.toString();

    // compare input password to server validation password
    const checkuppercase = Array.from(str).some((s) => uppercase.includes(s));
    const checklowercase = Array.from(str).some((s) => lowercase.includes(s));
    const checknum = Array.from(str).some((s) => num.includes(s));
    const checkchar = Array.from(str).some((s) => char.includes(s));

    console.log('User updated:', checkusernam1, checkusernam3, checkusernam2, username.length, username)

    // username compare if all are not match 
    if (checkusernam1 === false || checkusernam3 === false || checkusernam2 === false || usernams.length !== 5) {

      usersname = 3;


    };

    // username compare if all are match 

    if (checkusernam1 === true && checkusernam3 === true && checkusernam2 === true && usernams.length === 5) {
      usersname = 1;

    };


    //password compare, return result if all doesn't match 
    if (checkuppercase === false || checklowercase === false || checknum === false || checkchar === false || str.length < 8) {

      passwordv = 3;

    };

    //password compare, return result if all are  match 
    if (checkuppercase === true && checklowercase === true && checknum === true && checkchar === true && str.length > 7) {
      passwordv = 1;

    };


    // check if input username, password, email are already in db before redirect to insert user details to db
    const value1 = [[username]];
    const value2 = [[email]];
    const value3 = [[password]];
    const value4 = [[firstname]];
    const value5 = [[lastname]];

    //selectsomeuser using OR
    selectsomeuser()//function async @ superbase quary
    async function selectsomeuser() {
      const { data, error } = await supabase
        .from('users')
        .select()
        .or(`UserName.eq.${username}, Email.eq.${email}, Password.eq.${password}`)
      if (error) {
        // parse to signup page server error using '3' as error-info code
        //res.json('signup/signup', {route:'signup', resultsemail: '0', resultspass: '0', resultsuser: '0', usersname: '0', passwordv: '0', serverinfo: '3' });
        res.render('signup/signup', { route: 'signup', resultsemail: '0', resultspass: '0', resultsuser: '0', usersname: '0', passwordv: '0', serverinfo: '3' });
        handleDisconnect();// re-start db if error @ connection
        return;
      }

      if (data.length > 0 || data.length < 1) {
        const result = data//re-define 'data' as result

        const resultsuser = result.some(usern => usern.UserName === username);
        const resultsemail = result.some(usere => usere.Email === email);
        const resultspass = result.some(userp => userp.Password === password);
        console.log('User updated:', result, resultsemail, resultspass, resultsuser, usersname, passwordv)
        //account checked return user back to sign up if already registed parsing information to user using true @ resultsemail 
        if (resultsemail === true || resultspass === true || resultsuser === true || passwordv === 3 || usersname === 3) {

          //res.json('signup/signup', {route:'signup', resultsemail, resultspass, resultsuser, usersname, passwordv, serverinfo: '0' });

          res.render('signup/signup', { route: 'signup', resultsemail, resultspass, resultsuser, usersname, passwordv, serverinfo: '0' });

        };

        //Go varify the user after they pass the credential compare, before insert credential to db
        if (resultsemail === false && resultspass === false && resultsuser === false && passwordv === 1 && usersname === 1) {

          // res.json('verify/verify', {route:'varify', email, username, password, lastname, firstname, PhoneNumber }); // email, username, password, lastname, password

          res.render('verify/verify', { email, username, password, lastname, firstname, PhoneNumber }); // email, username, password, lastname, password

        }

      }//end else @ async
    }//end async

  } catch (error) {//handle error end
    if (error) {
      return;
    }//if error
  }//catch error 
});



//verify route @ post, insert into db  route after varified
app.post('/verify', (req, res) => {
  try {

    // forgetpassword will be call at forget password section
    const { username, firstname, lastname, email, password, PhoneNumber, varifi, serverid } = req.body;

    if (serverid === process.env.setnewpassword) {

      let varify = varifi; // define varify code

      if (StopRunAppFromUsers !== 1) {//stop app
        res.render('Stopapp/Stopapp');
        return;
      }//stop app


      console.log('this password', varify, email)
      //array to insert in db
      const value1 = [[username]];
      const value2 = [[email]];
      const value3 = [[password]];
      const value4 = [[firstname]];
      const value5 = [[lastname]];
      const value6 = [[PhoneNumber]];

      //select a row
      selectsomeuser()//function async @ superbase quary
      async function selectsomeuser() {
        const { data, error } = await supabase
          .from('users')
          .select()
          .or(`UserName.eq.${username}, Email.eq.${email}, Password.eq.${password}`)
        if (error) {
          // parse to signup page error of db using '2' as error-info code
          //res.json( 'signup/signup', {route:'signup', resultsemail: '0', resultspass: '0', resultsuser: '0', usersname: '0', passwordv: '0', serverinfo: '2' });

          res.render('signup/signup', { resultsemail: '0', resultspass: '0', resultsuser: '0', usersname: '0', passwordv: '0', serverinfo: '2' });
          return;
        }

        if (data) {
          const result = data//re- define data as result
          console.log(' insertion', data)
          const resultcem = result.some(useemai => useemai.Email === email);// check if account not on db before insert credential
          console.log('this is true checkemailv', resultcem)
          //go tell the user there is account with email display information @ signup
          if (resultcem === true) {
            res.render('signup/signup', { resultsemail: 'true', resultspass: 'false', resultsuser: 'false', usersname: 'false', passwordv: 'false', serverinfo: '0' });

            //res.json('signup/signup', {route:'signup', resultsemail: 'true', resultspass: 'false', resultsuser: 'false', usersname: 'false', passwordv: 'false', serverinfo: '0' });
          }

          // insert into db  after varification of signup
          if (resultcem === false && varify.length > 5 && username !== 0 && firstname !== 0 && lastname !== 0 && password !== 0 && PhoneNumber !== 0) {
            console.log('start insert')
            insertUser()
            // insert to db
            async function insertUser() {
              const { data, error } = await supabase
                .from('users')
                .insert([

                  { UserName: `${username}`, Email: `${email}`, Password: `${password}`, FirstName: `${firstname}`, LastName: `${lastname}`, PhoneNumber: `${PhoneNumber}`, UsersReward: '0', BalanceNaira: '0' }
                ])
                .select(); // Optional: to return inserted row(s)

              if (error) {

                if (error.code === '53100' && StopRunAppFromUsers === 1) {
                  StopRunAppFromUsers = 0//stop app
                  sendemailtoadmin2.push({ funtiontype: 'email', Subject: 'App Stop Runing, Db got full @ users', vemail: `greatdestinyismy@gmail.com`, varyfyc: `Receipt db got full @ usersmoney. <br> Error response:${error.code} ` })//Db got full Send Message to admin

                }

                // parse to signup page error of db using '2' as error-info code
                console.log('error at insertion')
                res.render('signup/signup', { resultsemail: '0', resultspass: '0', resultsuser: '0', usersname: '0', passwordv: '0', serverinfo: '2' });

                //res.json('signup/signup', {route:'signup', resultsemail: '0', resultspass: '0', resultsuser: '0', usersname: '0', passwordv: '0', serverinfo: '2' });
                return;

              }

              if (data.length > 0) {//confirm if success insert to db

                //parse to client @ login 'successfull' when thier varification and signup is successful or completed
                res.render('login/login', { wrongepass: '0', accountnotexit: '0', serverinfo: '4' });
              } //if data.length > 0 @ insert to db end
            }//function async insert to db end

          }

        }//data.length @ asnyc end
      }//function async selectData end

    }// if equal to serverid end
  } catch (error) {//handle error end
    if (error) {
      return;
    }//if error
  }//catch error 
})



// login route @ post
app.post('/login', (req, res) => {
  try {
    let resultlog;//store
    let proveroomid;//store room id

    // login detail received &  room loger detail received
    const { email, password, rooms, roomsid, sendidloging } = req.body; // login detail received &  room loger detail received

    if (StopRunAppFromUsers !== 1) {//stop app
      res.render('Stopapp/Stopapp');
      return;
    }//stop app


    //const sendidloging = req.body;
    if (email === process.env.login) {//starting login @ post 
      res.render('login/login', { wrongepass: '0', accountnotexit: '0', serverinfo: '0' })
      return;
    }//starting login @ post end
    console.log('login email', sendidloging)

    if (sendidloging === '75092343296175092342354917509234') {//lock login when not this value 

      let setbotgame = 0;//set bot game
      let setselfgame = 0;  //set self game

      const value8 = [[email]];
      console.log('rooms', rooms)

      const withdrawid = Date.now(); //an id to forward to client 


      //start password and email db confirmation
      //select a row
      selectsomeuser()//function async @ superbase quary
      async function selectsomeuser() {
        const { data, error } = await supabase
          .from('users')
          .select()
          .or(`Email.eq.${email}`)
        if (error) {
          res.render('login/login', { wrongepass: '0', accountnotexit: '0', serverinfo: '3' })
          // parse to client @ login when db failed to connect using '3'as error code
          //  res.json({route:'login', wrongepass: '0', accountnotexit: '0', serverinfo: '3' })
          handleDisconnect(); //re-connect db if fail to connect

          return;
        }
        if (data) {
          console.log('User updated:', data.length)

          resultlog = data //re-define data as resultlog


          //account not exit when notting is found from db @ login client
          if (resultlog.length < 1 && rooms !== 'logout') {

            //res.json( {route:'login', wrongepass: '0', accountnotexit: '3', serverinfo: '0' });

            res.render('login/login', { wrongepass: '0', accountnotexit: '3', serverinfo: '0' });
            return;
          }
          // account exist but 'wrongepass', or password not match.
          const passlog = resultlog.some(log => log.Password === password); // compare input password with db password
          if (passlog === false && rooms === undefined) {
            console.log('rooms', rooms)
            // res.json( {route:'login', wrongepass: '3', accountnotexit: '0', serverinfo: '0' });// parse result to client using 
            res.render('login/login', { wrongepass: '3', accountnotexit: '0', serverinfo: '0' });// parse result to client using 

            return;
          }
          //when password is compare and it correct || when game just finish and want to navigate to home page
          const readynewgame = resultlog.some(r => r.Email === email && r.Roomid === roomsid && r.UserName === password)
          console.log('readynewgame', readynewgame)
          if (passlog === true || readynewgame === true) {

            //check if room id as alraedy been set in the array
            const findarrayemail = roomidentity.some(ar => ar.emails === email) //confirm if the user room detail as been already set or not

            if (findarrayemail === false || findarrayemail === true) { //make sure detail pushed are not more than one it only one 

              roomidentity.push({ emails: email, roomsid: withdrawid }) // set a new room id details for new logger user
              const approverooms = roomidentity.find(r => r.emails === email) //get from the array user detail for rom loger
              const sendprove = approverooms.roomsid  //copy id for the user room id
              const UserName = resultlog[0].UserName  //update room username;

              const Email = resultlog[0].Email
              const selfgameu = resultlog[0].GameSelfSelectionN
              const botgameu = resultlog[0].GameBotSelectionN
              //  botgameu !== 1744700028554 && selfgameu !== 1744700081637 &&
              console.log('bot & self ', botgameu, selfgameu, Email)

              if (botgameu >= 1 || selfgameu >= 1) { //update for db to perform its update
                setbotgame = botgameu
                setselfgame = selfgameu
                console.log('bot & self db update')
              }//update for db to perform its update end

              //always update roomid to db before home page and gaming process
              //update
              updateData()
              async function updateData() {
                const { data, error } = await supabase
                  .from('users') // replace with your actual table name if different
                  .update({ Roomid: `${sendprove}`, GameSelfSelectionN: `${setselfgame}`, GameBotSelectionN: `${setbotgame}` }) // assuming balance is a number
                  .eq('Email', `${email}`) //where
                  .select()

                // error from db if not connected in time
                if (error) {

                  if (error.code === '53100' && StopRunAppFromUsers === 1) {
                    StopRunAppFromUsers = 0//stop app
                    sendemailtoadmin2.push({ funtiontype: 'email', Subject: 'App Stop Runing, Db got full @ users', vemail: `greatdestinyismy@gmail.com`, varyfyc: `Receipt db got full @ usersmoney. <br> Error response:${error.code} ` })//Db got full Send Message to admin

                  }

                  res.render('login/login', { wrongepass: '0', accountnotexit: '0', serverinfo: '3' })
                  // parse to client @ login when db failed to connect using '3'as error code
                  //res.json( {route:'login', wrongepass: '0', accountnotexit: '0', serverinfo: '3' })
                  handleDisconnect(); //re-connect db if fail to connect
                  return;

                } //if error

                if (data.length > 0) {    //if room id successfuly set
                  proveroomid = sendprove
                  const bal = resultlog[0].BalanceNaira

                  console.log('self & bot', selfgameu, botgameu)
                  res.render('Home/Home', { Reward: resultlog[0].UsersReward, UserName, Email, withdrawid: UserName + randomd, sendproveid: proveroomid, bal, playbyself: setselfgame, playbybot: setbotgame }); //home page renderd
                  setbotgame = 0;//set bot game reset
                  setselfgame = 0;  //set self game reset
                  generaterandomnumd(); //this will generate withdraw id using random number
                  console.log('balance', bal)
                  // res.json( {route:'home', UserName, Email, withdrawid:UserName+randomd, sendproveid:proveroomid , bal, playbyself:setselfgame, playbybot:setbotgame }); //home page renderd

                  const renewuserloger = roomidentity.indexOf(approverooms) // remove the form detail for new one

                  roomidentity.splice(renewuserloger, 1) //remove old room user loger detail before push new one 

                  console.log('room', roomidentity)

                  return;
                } //if room id successfuly set


              }//async function  updateData end
            }//if data.lenght > 0 @ update rooms quary data

          }//if data.lenght > 0 @ user login confirmed and rooms route end here //login if pasword is true

        } //check if room id as alraedy been set in the array end here

        // //below are rooms router
        const roomids = parseInt(roomsid) //parse roomsid selected to integer
        const roomdetailistrue = resultlog.some(ro => parseInt(ro.Roomid) === roomids) //confirm if the client room detail come from the home page  
        const amountselected = parseInt(rooms) //parse amount selected to integer

        const amount = resultlog.some(ro => parseInt(ro.BalanceNaira) >= amountselected)// compare amount selected with db bal

        console.log('roomlog', roomdetailistrue, amountselected, amount)

        if (roomdetailistrue === true && amount === true) {  // confirm if the array include current use at first login  
          const UserNames = resultlog[0].UserName  //update room username;

          const confirmfundarr = sendemailtoadmin.some(a => a.profile6 === UserNames)//confirm if this current user have no waiting payment
          console.log('roomlog', roomdetailistrue, amountselected, amount, confirmfundarr)
          if (confirmfundarr === true) {//confirm if this current user have no waiting payment
            return;
          }//confirm if this current user have no waiting payment end

          const bot = resultlog[0].GameSelfSelectionN
          const self = resultlog[0].GameBotSelectionN
          const Email = resultlog[0].Email
          rooms.toString() //parse to string

          // res.json( {route:'room', email, UserName:UserNames, uniqueidroom:roomsid, amount:rooms, bot, self});
          res.render('room/room', { Email, UserName: UserNames, uniqueidroom: roomsid, amount: rooms, bot, self });
          return;

        }   // confirm if the array include current use at first login  and amount is currect


        //when user account login in another place 
        if (roomdetailistrue === false && amountselected >= 100) { //when user id not match maybe account open some where

          //when user account login in another place 
          res.render('Home/Home', { Reward: 'error', UserName: 'Something went wrong. Re-loging', Email: '0', withdrawid: '0', sendproveid: '0', bal: 'Error', playbyself: setselfgame, playbybot: setbotgame }); //home page renderd
        } //when user account login in another place 
        console.log('amount', amount)
        if (rooms === "logout") { //logout

          //res.json({route:'login', wrongepass: '0', accountnotexit: '0', serverinfo: '0' })

          res.render('login/login', { wrongepass: '0', accountnotexit: '0', serverinfo: '0' })

        } //logout


      }//async function login confirm and rooms route end here

    }//lock login when not value end
  } catch (error) {//handle error end
    if (error) {
      return;
    }//if error
  }//catch error 
}) //longin home page rooms route end here




//forget password need email check from db route @ post
app.post('/forgetpassword', (req, res) => {
  try {
    const { email, id, phonenumber } = req.body;

    if (StopRunAppFromUsers !== 1) {//stop app
      res.render('Stopapp/Stopapp');
      return;
    }//stop app


    if (email === process.env.forgetpassword) {//user starting forgetpassword
      res.render('forgetpassword/forgetpassword', { serverinfo: '0', valee: '0' });
      return;
    }//user starting forgetpassword end

    console.log(email, id, phonenumber)
    const idpassword = id;
    const valuee = [[email]];


    if (idpassword.length > 10) {  // confirm an id send from the forget password client side

      console.log(valuee)
      console.log(email)


      //select a row
      selectsomeuser()//function async @ superbase quary
      async function selectsomeuser() {
        const { data, error } = await supabase
          .from('users')
          .select()
          .or(`Email.eq.${email}`)
        if (error) {

          //    res.json('forgetpassword/forgetpassword', {route:'forgetpassword', serverinfo: '1', valee: `${email}` });

          res.render('forgetpassword/forgetpassword', { serverinfo: '1', valee: `${email}` });
          handleDisconnect(); //re-connect db if fail to connect
          return;
        }

        if (data) {
          const result = data//re-define result as data
          //if !error @ db. And email exist in db, go virify the user email
          const resultsemail = result.some(usere => usere.Email === email);
          if (resultsemail === true) {//Step one @ forgetpassword
            //Only use email to send varify code @ rendering below
            res.render('verify/verify', { email, username: '0', password: '0', lastname: '0', firstname: '0', PhoneNumber: phonenumber });// go virify the user email
          }//if !error @ db. And email exist in db, go virify the user email end

          // when the email is not on db @ below
          if (resultsemail === false) {
            //res.json('forgetpassword/forgetpassword', {route:'forgetpassword', serverinfo: '2', valee: `${email}` });// when the email is not on db
            res.render('forgetpassword/forgetpassword', { serverinfo: '2', valee: `${email}` });// when the email is not on db

          }

        }
      }//function async select users
    }
  } catch (error) {//handle error end
    if (error) {
      return;
    }//if error
  }//catch error 
})




//resetpasswordnow route @ post 
app.post('/setnewpassword', (req, res) => {
  try {

    const { email, password, varifi, PhoneNumber, serverid } = req.body;
    // console.log(email, password, varifi, PhoneNumber, serverid)

    console.log(serverid)

    if (serverid === process.env.setnewpassword) {

      if (StopRunAppFromUsers !== 1) {//stop app
        res.render('Stopapp/Stopapp');
        console.log('stop app running')
        return;
      }//stop app

      var checkp = password;
      const str = checkp.toString();

      const isvarifycodecorrect = sendemailtoadmin2.filter(v => v.vemail === email)//bring the match one
      const confirmv = isvarifycodecorrect.some(s => s.varyfyc === varifi)//is it correct with the one send in
      console.log('resetpassword', email, password, varifi, PhoneNumber, confirmv)

      //  const pass = password;//used for compare password

      //arrays for varification of unique users
      var uppercase = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      var lowercase = ('abcdefghijklmnopqrstuvwxyz');
      var num = ('0123456789');
      var char = ('!@#$%^&*"`¬()_+[]{}|;:,/.>< ?');

      // compare input password to server validation password 
      const checkuppercase = Array.from(str).some((s) => uppercase.includes(s));
      const checklowercase = Array.from(str).some((s) => lowercase.includes(s));
      const checknum = Array.from(str).some((s) => num.includes(s));
      const checkchar = Array.from(str).some((s) => char.includes(s));

      //select a row
      selectsomeuser()//function async @ superbase quary
      async function selectsomeuser() {
        const { data, error } = await supabase
          .from('users')
          .select()
          .or(`Email.eq.${email}`)
        if (error) {
          //res.json('forgetpassword/forgetpassword', {route:'forgetpassword', serverinfo: '1', valee: `${email}` });

          res.render('forgetpassword/forgetpassword', { serverinfo: '1', valee: `${email}` });
          return;
        }
        const result = data//re-define data result
        // when varification code checked from the array and it matched with what user enter from their email box
        if (confirmv === true && result.length > 0) {
          console.log('confirmv', confirmv)
          //res.json('resetpasswordnow/resetpasswordnow', {route:'resetpasswordnow', serverinfo: '2', email, PhoneNumber });
          res.render('resetpassword/resetpassword', { serverinfo: '0', email, PhoneNumber });
          return;
        }// when varification code checked from the array and it matched with what user enter from their email box end


        const resultforgetpass = result.some(userp => userp.Password === password);//when new pasword match the old one
        //password compared, return result if all or any doesn't match 
        if (resultforgetpass === true || checkuppercase === false || checklowercase === false || checknum === false || checkchar === false || str.length < 8) {

          if (confirmv === true && password === 0) {//signal to now info recieved to confirm below is from /setnewpassword
            return
          } //signal to now info recieved to confirm below is from /setnewpassword end

          if (resultforgetpass === true) {//The password user enter is one of your password
            res.render('resetpassword/resetpassword', { serverinfo: '2', email, PhoneNumber });//render back the password user enter is one of your password
            return
          } //The password user enter is one of your password end

          else {//any different from the statement in above the password not accepted 
            res.render('resetpassword/resetpassword', { serverinfo: '4', email, PhoneNumber });//render back password you enter is too weak'

          }
          return;
        };


        //password compared, Store new password and return result if all are  match 
        if (result.length > 0 && checkuppercase === true && checklowercase === true && checknum === true && checkchar === true && str.length > 7) {

          // change the password render login parser password change successful when password format is accepted

          //update
          updateData()
          async function updateData() {
            const { data, error } = await supabase
              .from('users') // replace with your actual table name if different
              .update({ Password: `${password}`, PhoneNumber: `${PhoneNumber}` }) // assuming balance is a number
              .eq('Email', `${email}`) //where
              .select()

            if (error) {
              //res.json('resetpasswordnow/resetpasswordnow', {route:'resetpasswordnow', serverinfo: '1', email, PhoneNumber });
              if (error.code === '53100' && StopRunAppFromUsers === 1) {
                StopRunAppFromUsers = 0//stop app
                sendemailtoadmin2.push({ funtiontype: 'email', Subject: 'App Stop Runing, Db got full @ users', vemail: `greatdestinyismy@gmail.com`, varyfyc: `Receipt db got full @ usersmoney. <br> Error response:${error.code} ` })//Db got full Send Message to admin

              }
              res.render('resetpassword/resetpassword', { serverinfo: '1', email, PhoneNumber });
              handleDisconnect(); //re-connect db if fail to connect
              return;
            }
            if (data.length > 0) {//Step Two @ Forget password

              // parse to client @ login when password successfuly changed using 5 as code
              res.render('login/login', { wrongepass: '0', accountnotexit: '0', serverinfo: '5' })//password change successfully
              return;
            }
          }//function async updateData end

        }

      }//function async selection end

    }//end serverid
  } catch (error) {//handle error end
    if (error) {
      return;
    }//if error
  }//catch error 
})





//Deposit route @ post
app.post('/Deposit', (req, res,) => {
  try {
    const { email, amount, roomsid, sendid } = req.body;//this recieved from deposit form 

    if (StopRunAppFromUsers !== 1) {//stop app
      res.render('Stopapp/Stopapp');
      return;
    }//stop app


    if (sendid === process.env.deposit) {

      //select a row
      selectsomeuser()//function async @ superbase quary
      async function selectsomeuser() {
        const { data, error } = await supabase
          .from('users')
          .select()
          .or(`Email.eq.${email}`)
        if (error) {
          return;
        }
        const result = data//re-define data as result
        //console.log('hi', result)
        const results = result.some(e => e.Email === email && e.Roomid === roomsid);

        if (results === true && amount >= 1000) {
          const firstname = result[0].FirstName
          const lastname = result[0].LastName
          const email = result[0].Email
          const phone = result[0].PhoneNumber
          const username = result[0].UserName
          console.log('deposit', results, amount)
          res.render('deposit/deposit', { username, sendproveid: roomsid, gam6: firstname, gam7: lastname, gam4: email, gam5: phone, gam8: amount })
        }
        if (results === false || amount < 1000) {
          res.render('login/login', { wrongepass: '0', accountnotexit: '0', serverinfo: '0' })

        }
      }//async function deposit route end

    }//end sendid
  } catch (error) {//handle error end
    if (error) {
      console.log('deposit err')
      return;
    }//if error
  }//catch error 
});



//Take Lost route 
app.post('/UserRewordTakeLost', (req, res) => {
  try {
    //Take Lost using api by admin and req details @ below
    const data = req.body;


    const username = data.username;
    const password = data.password
    const lose = data.lose
    const gain = data.gain
    const requesttype = data.requesttype
    const requestid = data.requestid
    //Take Lost using api by admin and req details @ below end
    var d;//store
    let Allusedquary; //store
    let superbasetype;
    if (requestid === process.env.takelose) {//encapsulate all request by varify route id :- 'Api key'
      console.log('data', data.username, data.password)
      // console.log(username,  password, lose, gain, requesttype,data.requestid, requestid)   
      //@ below interswitch of quaries due to requesttype 
      // console.log(username, password, lost, gain, requesttype, requestid)    
      if (requesttype === 'SigningTakeLost') {
        Allusedquary = `users`
        superbasetype = supabase
      }

      if (requesttype === 'CheckTotalLost') {
        Allusedquary = `usersmoney`
        superbasetype = supabasercpt
      }

      //@ below interswitch of quaries due to requesttype end `UserName`date, 'win', time,  'win' 
      console.log(Allusedquary, username, requesttype)
      //when it is 'CheckTotalLost' 'SigningTakeLost'
      if (requesttype === 'SigningTakeLost' || requesttype === 'CheckTotalLost') { //Two Db Quary is used here when request is 'SigningTakeLost' it switch quary to `Users`, when it is 'CheckTotalLost' switch to `Usersmoney`
        //select a row
        console.log(Allusedquary, username, requesttype)
        selectsomeuser()//function async @ superbase quary${Allusedquary}
        async function selectsomeuser() {
          const { data, error } = await superbasetype
            .from(`${Allusedquary}`)
            .select()
            .or(`UserName.eq.${username}`)
          if (error) {

            res.json({ responsestatus: 'error', Responseprove: `error`, password: 'pass', lost: 'lost', gain: 'gain', requesttype: 'check total play', routeid: 'req id' })
            // Start the connection for the first time
            //handleDisconnect();
            return;
          }

          if (StopRunAppFromUsers !== 1) {//stop app
            res.json({ responsestatus: 'error', Responseprove: `error`, password: 'pass', lost: 'lost', gain: 'gain', requesttype: 'check total play', routeid: 'req id' })
            // Start the connection for the first time
            //handleDisconnect();
            return;
          }//stop app
          const Takelostresult = data
          const Rewordresults = Takelostresult.some(e => e.Password === password && e.UserName === username);

          console.log(Rewordresults)
          if (Rewordresults === true && requesttype === 'SigningTakeLost') {//'SigningTakeLost' 

            const username = Takelostresult[0].UserName
            const email = Takelostresult[0].Email
            generatevarification()//check varify code
            console.log('varifycode', varifycode)
            sendemailtoadmin2.push({ TakeLostVarify: `${Date.now()}`, TakeLostUsername: `${username}`, email: `${email}`, varyfyc: `${varifycode}`, gain: '0', lose: '0', profile6: `${username}` })//if none create a new one
            const p = sendemailtoadmin2.find(f => f.TakeLostUsername === username)
            res.json({ responsestatus: 'Loginissuccess', Responseprove: `${p.TakeLostVarify}`, username, UserBalanceNaira: Takelostresult[0].BalanceNaira })
            return;
          }//'SigningTakeLost'  end2


          if (Rewordresults === false && requesttype === 'SigningTakeLost') {//@ 'SigningTakeLost' but don't register 
            res.json({ responsestatus: 'UserNotRegister', Responseprove: `error`, password: 'pass', lost: 'lost', gain: 'gain', requesttype: 'check total play', routeid: 'req id' })
            //handleDisconnect(); // Start the connection for the first time
            return;
          }//@ 'SigningTakeLost' but don't register end


          // 'CheckTotalLost' @ below
          const checkprovefromarr = sendemailtoadmin2.some(f => f.TakeLostVarify === password)
          if (requesttype === 'CheckTotalLost' && checkprovefromarr === true) {
            const CalTotalLost = Takelostresult.filter(f => f.RsponseStatus === 'lose').reduce((amt, sum) => parseInt(amt) + parseInt(sum.AmountNaira), 0)//total lose cal
            const CalTotalWin = Takelostresult.filter(f => f.RsponseStatus === 'win').reduce((amt, sum) => parseInt(amt) + parseInt(sum.AmountNaira), 0)//total win cal

            const l = sendemailtoadmin2.find(f => f.TakeLostVarify === password)
            l.gain = `${CalTotalWin}`
            l.lose = `${CalTotalLost}`

            console.log('Gain:', CalTotalWin, 'Lose:', CalTotalLost, 'sendlogintakeloseprove:', l)
            res.json({ responsestatus: 'CheckTotalLostsuccess', Responseprove: `${l.TakeLostVarify}`, TotalWin: `${CalTotalWin}`, TotalLost: `${CalTotalLost}` })
            return;
          }//'CheckTotalLost' end

          if (requesttype === 'CheckTotalLost' && checkprovefromarr === false) {//when checkprovefromarr not found in the array @ 'CheckTotalLost'
            res.json({ responsestatus: 'error', Responseprove: `error` })
            return;
          }//when checkprovefromarr not found in the array @ 'CheckTotalLost' end

        }//async function Quary of 'SigningTakeLost' 'CheckTotalLost' end

        return;
      }//when it is 'SigningTakeLost' 'CheckTotalLost' end





      const checkuserprovefromarr = sendemailtoadmin2.some(f => f.TakeLostVarify === password)

      if (requesttype === 'AboutToTakeLost' && checkuserprovefromarr === false) {///user about to take Lost prove not found in array
        console.log(' error')
        res.json({ responsestatus: 'error', Responseprove: `error` })
        return;
      }///user about to take Lost prove not found in array end


      if (requesttype === 'AboutToTakeLost' && checkuserprovefromarr === true) {//if requesttype === 'AboutToTakeLost'

        const c = sendemailtoadmin2.find(f => f.TakeLostVarify === password)//Date.now() generated @ the starting process will be used as password at this time
        console.log('checkuserprovefromarr', c, c.gain, c.lose)

        if (parseInt(c.lose) > parseInt(c.gain) || parseInt(c.gain) > parseInt(c.lose)) {//when user to takelose 

          res.json({ responsestatus: 'EnterVarificationCode', Responseprove: `${c.TakeLostVarify}`, TotalWin: `${c.gain}`, TotalLost: `${c.lose}` })
          sendemailtoadmin2.push({ funtiontype: 'email', varyfyc: c.varyfyc, vemail: `${c.email}`, varyfyc: `varification code:${c.varyfyc}. It will expire in 5mins time`, Subject: `Take Back Lost` })
          return;
        }//when user to takelose end


      }//checkuserprovefromarr === true ///user about to take Lost prove found in array





      //when it is 'TakeTotalLost'  'EndTotalLost'  confirm
      const provesentv = sendemailtoadmin2.some(f => f.varyfyc === password)//here the varification code send to user email is parse as password
      console.log('provesent, requesttype', provesentv)
      if (provesentv === false) {
        return
      }


      if (provesentv === true) {
        d = sendemailtoadmin2.find(f => f.varyfyc === password)//here the varification code send to user email is parse as password
      }


      //when it is 'EndTotalLost' 
      if (provesentv === true && requesttype === 'EndTotalLost' && parseInt(d.lose) - parseInt(d.gain) >= 5000) {//when it is 'TakeTotalLost' 'EndTotalLost'
        //update
        updateData()
        async function updateData() {
          const { data, error } = await supabasercpt
            .from(`usersmoney`) // replace with your actual table name if different
            .update({ Date: date, Time: time, RsponseStatus: `LostTaked` })// assuming balance is a number
            .eq('UserName', `${d.TakeLostUsername}`) //where
            .select()

          if (error) {

            if (error.code === '53100' && StopRunAppFromUsers === 1) {
              StopRunAppFromUsers = 0//stop app
              sendemailtoadmin2.push({ funtiontype: 'email', Subject: 'App Stop Runing, Db got full @ usersmoney', vemail: `greatdestinyismy@gmail.com`, varyfyc: `Receipt db got full @ usersmoney. <br> Error response:${error.code} ` })//Db got full Send Message to admin

            }


            res.json({ responsestatus: 'error', Responseprove: `error`, password: 'pass', lost: 'lost', gain: 'gain', requesttype: 'check total play', routeid: 'req id' })
            console.log('User Lose rcpt error', amount, date, time)
            return;
          }
          if (data.length > 0) {//when user want to let go off the takelose as in, not meet up with the  takelose list. 'EndTotalLost'. here don't add to bal
            d.TakeLostVarify = `${Date.now()}`//change the time and don't send it to user as response, to disactivate the completed process
            d.varyfyc = `${Date.now()}`//change the varyfyc and don't send it to user as response, to disactivate the completed process
            res.json({ responsestatus: 'Process Done', Responseprove: `EndTotalLost Process Done`, password: 'pass', requesttype: 'check total paid', routeid: 'req id' })
            console.log('User Lose Ended')
            return;
          }//when user want to let go off the takelose as in, not meet up with the  takelose list. 'EndTotalLost'. here don't add to bal. End
        }
      }//when it is 'EndTotalLost' end



      //when it is 'TakeTotalLost'
      console.log('tak lose', provesentv, requesttype, parseInt(d.lose) - parseInt(d.gain) < 5000)
      if (provesentv === true && requesttype === 'TakeTotalLost' && parseInt(d.lose) - parseInt(d.gain) < 5000 && parseInt(d.lose) - parseInt(d.gain) > 0) {//confirm user request details

        //if(parseInt(d.gain) <  parseInt(d.lose)){//when user to takelose @ final process
        let amount = parseInt(d.lose) - parseInt(d.gain)
        console.log('come to user tak lose', amount)


        //generate date and time for gamer to db
        const timeanddate = Date.now()
        const resolvtimedate = new Date(timeanddate)
        const time = resolvtimedate.toUTCString().slice(16, 39)
        const date = resolvtimedate.toUTCString()

        const confirmfundarr = sendemailtoadmin.some(a => a.profile6 === d.TakeLostUsername)//confirm if this current user have no waiting payment

        if (confirmfundarr === true) {
          return
        }
        //select a row
        selectsomeuser()//function async @ superbase quary
        async function selectsomeuser() {
          const { data, error } = await supabase
            .from('users')
            .select()
            .or(`UserName.eq.${d.TakeLostUsername}`)


          if (error) {
            res.json({ responsestatus: 'error', Responseprove: `error` })
            console.log('User Lose crdt error', amount, d.TakeLostUsername)
            return;
          }
          if (data.length > 0 && confirmfundarr === false) {

            const AddToBalance = parseInt(data[0].UsersReward) + parseInt(amount)
            const Rewardusername = data[0].UserName
            const Userbal = data[0].BalanceNaira
            const RewardEmail = data[0].Email
            //update
            updateData()
            async function updateData() {
              const { data, error } = await supabasercpt
                .from(`usersmoney`) // replace with your actual table name if different
                .update({ Date: date, Time: time, RsponseStatus: `LostTaked` }) // assuming balance is a number
                .eq('UserName', `${d.TakeLostUsername}`) //where
                .select()

              if (error) {

                if (error.code === '53100' && StopRunAppFromUsers === 1) {
                  StopRunAppFromUsers = 0//stop app
                  sendemailtoadmin2.push({ funtiontype: 'email', Subject: 'App Stop Runing, Db got full @ usersmoney', vemail: `greatdestinyismy@gmail.com`, varyfyc: `Receipt db got full @ usersmoney. <br> Error response:${error.code} ` })//Db got full Send Message to admin

                }


                res.json({ responsestatus: 'error', Responseprove: `error`, password: 'pass', lost: 'lost', gain: 'gain', requesttype: 'check total play', routeid: 'req id' })
                console.log('User Lose rcpt error', amount, date, time)
                return;
              }

              if (data.length > 0 && confirmfundarr === false) {//Clear Lost Taked Out from db changing win & lose to `LostTaked`

                sendemailtoadmin.push({ funtiontype: 'Resolvedeposit', profile1: `${Userbal}`, profile2: `reward`, profile3: `reward`, profile4: `reward`, profile5: `reward`, profile6: `${Rewardusername}`, profile11: `${AddToBalance}`, profile12: `reward`, profile13: `Deposit`, profile14: 'stop', email: `${RewardEmail}` })

                d.TakeLostVarify = 'done'//change the time and don't send it to user as response, to disactivate the completed process
                d.varyfyc = `${Date.now()}`//change the varyfyc and don't send it to user as response, to disactivate the completed process
                res.json({ responsestatus: 'Process Done', Responseprove: `Done End Process`, password: 'pass', Amount: `${amount}`, requesttype: 'check total play', routeid: 'req id' })
                console.log('User Lose Taked', amount)
                return
              }////Clear Lost Taked Out from db changing win & lose to `LostTaked` end
            }//async Clear Lost Taked Out from db changing win & lose to `LostTaked` end


          }//data.length > 0 @ select a row end

        }//async select a row credit the user BalanceNaira end





      }//when it is 'TakeTotalLost' end








    }//encapsulate all request by varify route id :- 'Api key' end


  } catch (err) {
    if (err) {
      return;
    }
  }
})//Take Lost route @ end



//Contact Admin route @ post

app.post('/ErrorGetToSee', (req, res) => {
  try {

    const { sendAdminID } = req.body;
    if (sendAdminID === process.env.admin) {
      res.render('Admin-page/admin')
    }
  } catch (err) {
    if (err) {
      return;
    }
  }
})//Contact Admin route @ post end



app.post('/CurrencyExchange', (req, res) => {
  try {
    const request = req.body
    console.log(request)
    let i = 1000;//for loop
    let highestprice = 0;
    let maxhighprice4yrs;//store 
    let max;//store
    var maxyr//store
    var detmax//store

    let latestyrsprice = [];//store latest years price
    const options = { method: 'GET', headers: { accept: 'application/json' } };

    fetch('https://api-pub.bitfinex.com/v2/candles/trade%3A1M%3AtBTCUSD/hist', options)
      .then(res => res.json())
      .then(res => {
        console.log('res')
        if (res.length > 15) {//success fetch data

          const a = res.map(a => a[0])//select all timestamp of each mouth High prices within  4yrs

          a.forEach(latestHP => {

            if (latestHP > 2) {// don't include syntax or any text in the array
              max = Math.max(...a) //detect the maximum year as in current year, 'this yrs' using timestamp

              detmax = new Date(max).toISOString();//Convert timestamp to Date object

              maxyr = Number(detmax.split('-')[0]);//Get the latest year of traded

              const date = new Date(latestHP).toISOString();//Convert timestamp to Date object -

              const year = Number(date.split('-')[0]);// Get the year of each traded
              const sub = maxyr - year//to detect yrs near to each other from current yr to 4 year ago

              if (sub < 4) {//from 0 to 3 as in sort latest four yrs out of the array

                const fi = res.filter(f => f.some(s => s === latestHP))//extract and keep each latest four yrs price

                const bc = fi.map(a => a[3])//select each mouth High prices within the latest 4yrs ago
                const b = parseInt(bc)
                const getTheTimestamp = fi.map(T => T[0])// get Their Timestamp
                const getTheLowPrice = fi.map(L => L[4])// get Their Low Price
                const getTheClosePrice = fi.map(C => C[2])// get Their Close Price
                const getTheOpenPrice = fi.map(C => C[1])// get Their Open Price

                //below select max high price from the four years ago
                const filterStoredPrice = latestyrsprice.some(pr => maxyr - pr.yearprice > 3)//detect the expired in the array or wrong years

                switch (filterStoredPrice) {//filter 4yrs ago from now

                  case true:

                    const index = latestyrsprice.findIndex(pr => maxyr - pr.yearprice > 3); //check the expired value stored and del
                    latestyrsprice.splice(index, 1);//delete it 

                    break;
                  case false:
                    //since it is stored then No need to store when below is true
                    const itAlreadyStored = latestyrsprice.some(stored => stored.price === b && stored.yearprice === year)

                    if (itAlreadyStored === false) {

                      //go ahead and perform the awaiting forEach option
                      latestyrsprice.push({ yearprice: year, HighestPrices: b, timestamp: parseInt(getTheTimestamp), lowprice: parseInt(getTheLowPrice), closep: parseInt(getTheClosePrice), Openp: parseInt(getTheOpenPrice) })//push in latest detected
                    }
                    break;

                  default:
                    //since that i have stored this value go to the next forEach checking
                    let gotothenextvalue = 'Next'//return


                }


              }//from 0 to 3 as in sort current four yrs out of the array end


            }// don't include syntax or any text in the array end


          })//end forEach to locate four yers ago


          //Below @ last 4Yrs HighestPrice  
          const findHighestPriceinArr = Math.max(...latestyrsprice.map(h => h.HighestPrices))//detect the maximum  High prices stored that are within current 4yrs ago
          highestprice = latestyrsprice.find(f => f.HighestPrices === findHighestPriceinArr)


          //below select close price as in Buy price and low price
          const UseLatestDate = latestyrsprice.find(f => f.timestamp === max)//get the current lowest array price using latest timestamp of the foursyrsago ago 
          const lowp = UseLatestDate.lowprice//get the current low price
          const addcommalowp = Number(lowp).toLocaleString()//low price to buy add comma
          const addcommahighp = Number(findHighestPriceinArr).toLocaleString()//add comma to higtest price 
          const splitfirstNum1 = addcommalowp.split(',')[0]//split first value in the low price
          const splitfirstNum2 = addcommahighp.split(',')[0]//split first value in the high price

          const BTC = splitfirstNum2 - splitfirstNum1//detect next to buy price


          //select a row
          selectsomeuser()//function async @ superbase quary
          async function selectsomeuser() {
            const { data, error } = await supabase
              .from('users')
              .select()
              .or(`UserName.eq.AbC@1`)
            if (error) {
              console.log('error1')
              return;
            }
            if (data) {
              console.log('data',data)
              
              
              const GetlatestPriceMouth = Number(detmax.split('-')[1]);//Latest Mouth of Btc Having Year

              //Turn On Selling btc At Last High Low Price. 
              if (UseLatestDate.HighestPrices >= data[0].Formal4yrsHighestLowPrice) {//compare formal hightest price mouth low price with current hightest 

                //console.log('Turn On Selling btc ')

              }//compare formal hightest price mouth low price with current hightest 
              //Turn On Selling btc At Last High Low Price. 


              //Auto Sell Off at all time high or Open price. While auto sell off btn still Turn on   
              if (UseLatestDate.HighestPrices > data[0].Formal4yrsHighestOpenPrice) {//generate auto sell off price using last having highest Open price 




              }
              //Auto Sell Off at all time high or Open price . While auto sell off btn still Turn on end 



              //Buying Not Recommended At This Time But Check Still Time Dec May Going To Drop
              if (UseLatestDate.yearprice - data[0].BtcHavingFormalYearEnded === 3 && GetlatestPriceMouth >= 1 && GetlatestPriceMouth < 9) {//Buying Input Turned On, Display Buying For Next Having is Not Recommended At This Time  
                //console.log('buying not recormen', BTC)


              }//Buying Input Turned On, Display Buying For Next Having is Not Recommended At This Time  
              //Buying Not Recommended At This Time But Check Still Time Dec May Going To Drop end




              //Buy But Please Check First
              if (BTC >= 50 && UseLatestDate.yearprice - data[0].BtcHavingFormalYearEnded === 3) {//Display to the users That (Check) Btc, Buy Buying It For Next Having  



                //console.log('buy btc check',BTC)
              }//Display to the users That (Check) Btc, Buy Buying It For Next Hav ing  
              //Buy But Please Check First end



              //If Btc Is Octomber, November or December  Of Year Having Ended Check And Buy For Next Having
              if (UseLatestDate.yearprice - data[0].BtcHavingFormalYearEnded === 0 && GetlatestPriceMouth > 9) {//Display to the users That (Check) Btc, Buy Buying It For Next Having  

                //console.log('mouth check and buy')
              }//Display to the users That (Check) Btc, Buy Buying It For Next Having  
              //If Btc Is Octomber, November or December  Of Year Having Ended Check And Buy For Next Having end



              //below Update Db BTC trading Years And It Year Counting
              const BtcHavingYearCount = UseLatestDate.yearprice - 2023
              //data[0].BtcHavingFormalYearEnded//cal BTC Having Traded Year  
              const parseintmaxYr = parseInt(max) //convert to Intiger
              //Below @ last 4yrs Lowest price
              const findLowestPriceinArr = latestyrsprice.filter(f => f.yearprice === maxyr)
     
              const lowestpriceOfCompletedHaving = Math.min(...findLowestPriceinArr.map(h => h.lowprice))//detect the maximum  High prices stored that are within current 4yrs ago
                       var Last4yrsLowestPr = latestyrsprice.find(f => f.lowprice === lowestpriceOfCompletedHaving)//bring out the array that have it
              //console.log('1st yrs', BtcHavingYearCount)

    //            LastLowestTrade: 60100,
    // LastHighestTrade: 126110,
    // Formal4yrsHighestOpenPrice: 114030,
    // BTC: 2023,
    // BtcTradedHighestPriceTimestamp: 1769904000000,
    // Formal4yrsHighestLowPrice: 103310,
    // FormalHavingBtcHighPriceYear: null,
    // FormalHavingBtcLowestPriceYear: null,
    // BtcTradedLowestPriceTimestamp: null,
    // SOL:null
 //  BtcHavingFormalYearEnded:`2023`
const nowHavingHigh = latestyrsprice.filter(f => f.timestamp >= data[0].BtcTradedLowestPriceTimestamp)
const NowMaxHigh = Math.max(...nowHavingHigh.map(h => h.HighestPrices))
//console.log('now high',NowMaxHigh)  
ResToUsers = { username:data[0].UserName, lasthaving:data[0].BtcHavingFormalYearEnded, currentyear:UseLatestDate.yearprice, countbtcyrsofhaving:BtcHavingYearCount, sellOfPrice2:data[0].LastHighestTrade, sellofPrice1:data[0].Formal4yrsHighestLowPrice, LastLowestprice:data[0].LastLowestTrade, BtcJustIncreaseTo:NowMaxHigh, BtcJustIncreaselowprice:highestprice.lowprice, Formal4yrsHighestpriceYrs:data[0].FormalHavingBtcHighPriceYear, Formal4yrslowestpriceYrs:data[0].FormalHavingBtcLowestPriceYear}//store data to response back to user 
              //console.log('rep',ResToUsers)
            

              switch (BtcHavingYearCount) {//Track 4yrs BTC circle complete and it droping 

                case 0://Eg 2023 January. Btc is Prepared And Start New Having.
                  //console.log('1st yrs', BtcHavingYearCount)
                  if (Last4yrsLowestPr < data[0].LastLowestTrade) {//maybe Btc Still Drop More Lowest

                    //update   ${Last4yrsLowestPr}
                    updateData()
                    async function updateData() {
                      const { data, error } = await supabase
                        .from('users') // replace with your actual table name if different
                        .update({ LastHighestTrade: `${findHighestPriceinArr}`, LastLowestTrade: `${Last4yrsLowestPr.lowprice}`, BtcTradedHighestPriceTimestamp:`${parseintmaxYr}`, Formal4yrsHighestOpenPrice: `${highestprice.Openp}`, Formal4yrsHighestLowPrice:`${highestprice.lowprice}` }) // assuming balance is a number
                        .eq('UserName', `AbC@1`) //where
                        .select()
                      // error from db if not connected in time
                      if (error) {
                        console.log('error2')
                        if (error.code === '53100' && StopRunAppFromUsers === 1) {
                          StopRunAppFromUsers = 0//stop app
                          sendemailtoadmin2.push({ funtiontype: 'email', Subject: 'App Stop Runing, Db got full @ users', vemail: `greatdestinyismy@gmail.com`, varyfyc: `Receipt db got full @ usersmoney. <br> Error response:${error.code} ` })//Db got full Send Message to admin

                        }
                        return;
                      }

                      if (data) {
                        //console.log(data)
                        const sayUpdated = 'db success'
                      }
                    }
                  }//maybe Btc Still Drop More Lowest end

                  break;//Eg 2023. Btc is Prepared And Start New Having. end


                case 1://eg 2024.

                  console.log('2nd yrs', BtcHavingYearCount)
                  break;

                case 2://eg 2025.
                  console.log('3rd years', BtcHavingYearCount)

                  break;
                case 3://eg 2026. Having Ended Prepared to Reset @ the years end. December To Januray  
                  console.log('4th year', maxyr, BtcHavingYearCount)

                  //update
                  updatePricesOnly()
                  async function updatePricesOnly() {
                    const { data, error } = await supabase
                      .from('users') // replace with your actual table name if different
                      .update({FormalHavingBtcHighPriceYear:highestprice.yearprice, FormalHavingBtcLowestPriceYear:Last4yrsLowestPr.yearprice,  BtcTradedHighestPriceTimestamp:highestprice.timestamp, BtcTradedLowestPriceTimestamp:Last4yrsLowestPr.timestamp, LastHighestTrade:`${highestprice.HighestPrices}`, LastLowestTrade:`${Last4yrsLowestPr.lowprice}`, FormalHavingBtcLowestPriceYear:`${Last4yrsLowestPr.yearprice}`, Formal4yrsHighestOpenPrice:`${highestprice.Openp}`, Formal4yrsHighestLowPrice:`${highestprice.lowprice}` }) // assuming balance is a number
                      .eq('UserName', `AbC@1`) //where
                      .select()
                    // error from db if not connected in time
                    if (error) {
                      console.log('error2')
                      if (error.code === '53100' && StopRunAppFromUsers === 1) {
                        StopRunAppFromUsers = 0//stop app
                        sendemailtoadmin2.push({ funtiontype: 'email', Subject: 'App Stop Runing, Db got full @ users', vemail: `greatdestinyismy@gmail.com`, varyfyc: `Receipt db got full @ usersmoney. <br> Error response:${error.code} ` })//Db got full Send Message to admin

                      }
                      return;
                    }

                    if (data) {
                      //console.log(data)
                      const sayUpdated = 'db success'
                    }
                  }

                  break;

                //@ below when entered 4, then reset the year counting
                case 4://Eg It Reset @ 2023 january and it Happen in Having 2019 to 2022 Dec end, 1st Btc Having December ending. Back to Zero @ counting. Reset And Update DB past Having Detailng 
                  console.log('reset back new having to zero', BtcHavingYearCount)
                  //update
                  updateOnlyYearCount()
                  async function updateOnlyYearCount() {
                    const { data, error } = await supabase
                      .from('users') // replace with your actual table name if different
                      .update({ BtcHavingFormalYearEnded:maxyr}) // assuming balance is a number
                      .eq('UserName', `AbC@1`) //where
                      .select()
                    // error from db if not connected in time
                    if (error) {
                      console.log('error2')
                      if (error.code === '53100' && StopRunAppFromUsers === 1) {
                        StopRunAppFromUsers = 0//stop app
                        sendemailtoadmin2.push({ funtiontype: 'email', Subject: 'App Stop Runing, Db got full @ users', vemail: `greatdestinyismy@gmail.com`, varyfyc: `Receipt db got full @ usersmoney. <br> Error response:${error.code} ` })//Db got full Send Message to admin


                      }
                      return;
                    }

                    if (data) {
                      //console.log(data)
                      const sayUpdated = 'db success'
                    }
                  }

                  break;//Reset All BTC Having After completed its 4yrs end

                default:

              }//Track 4yrs BTC circle complete and it droping end


            }//else @ select superbase
          }//select function @ superbase end

        }// if success fetch data

      }

      ).catch(err => {
        console.log('api err')
        return;
      });






    //console.log('u',request, ResToUsers)
    //@ below send response to client in details packed        
    // const ConfirmUsers = ResToUsers.some(u =>{ u.username === request.username})
    // console.log('lm',ConfirmUsers)

    if (ResToUsers.username === request.username) {
      //console.log('re',ResToUsers)
      res.json({ ResToUsers })

    }
    //@ below send response to client end



  } catch (err) {
    if (err) {
      return;
    }
  }
}
)//end exchange route



//below is the listing port
server.listen(3000, () => {
  // console.log(process.env.FLW_SECRET_KEY)
  console.log('Server is running on port 3000');
});

