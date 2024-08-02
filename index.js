const express = require('express');
const mysql = require('./sqlConnection').con;
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const { con } = require('./sqlConnection');
const { getMaxListeners } = require('process');
const bcrypt = require('bcrypt');
dotenv.config();

const alert = require('alert'); 
    
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

app.get('/home', (req, res) =>{
    res.render("home");
}); 

//home Page
app.get('/', (req, res) =>{ 
    res.render("home");
});  

app.get('/login', (req, res) =>{ 
    res.render("login");
}); 
app.post('/admin_dashboard', (req, res) =>{ 
    res.render("admin_dashboard");
});  
app.get('/admin_dashboard', (req, res) =>{ 
    res.render("admin_dashboard");
});  
app.get('/add_student', (req, res) =>{ 
    res.render("add_student");
}); 
app.get('/newAdmin', (req, res) =>{ 
    res.render("newAdmin");
}); 
// retrive achievements
// Route handler to render the user dashboard with achievements based on rollNumber
app.get('/user-dashboard/:rollNumber', (req, res) => {
    const rollNumber = req.params.rollNumber;
  
    // Query to fetch achievements based on rollNumber
    const query = 'SELECT * FROM achievement WHERE ROLL = ?';
  
    // Execute the query to fetch achievements based on rollNumber
    con.query(query, rollNumber, (error, results) => {
      if (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).send('Error fetching achievements');
        return;
      }
      // Render the user dashboard EJS template and pass the achievements data
      res.render('user_dashboard', { achievements: results ,imp:rollNumber });
    });
  });
app.get('/add_achievement/:rollNumber',(req,res)=>{
    const rollNumber=req.params.rollNumber;
    res.render('add_achievement',{r:rollNumber});
})  
// Route to add a new achievement
app.post('/add-achievement/:rollNumber', (req, res) => {
    const achievementData = req.body; // Assuming achievement data is sent in the request body
    const rollNumber = req.params.rollNumber;
    
    // Extracting achievement data from the request body
    const { eventName, eventDate, eventCategory, eventDescription, learningOutcomes, certificateDocument } = achievementData;

    // SQL query to insert achievement details into the 'achievement' table
    const query = `
        INSERT INTO achievement (ROLL, eventName, eventDate, eventCategory, eventDescription, learningOutcomes, certificateDocument)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the query
    con.query(query, [rollNumber, eventName, eventDate, eventCategory, eventDescription, learningOutcomes, certificateDocument], (error, result) => {
        if (error) {
            console.error('Error adding achievement:', error);
            res.status(500).send('Error adding achievement');
        } else {
            alert('Achievement added successfully');
            res.redirect(`/user-dashboard/${rollNumber}`);
        }
    });
    
});

app.get('/display-achievement/:rollNumber/:eventName', (req, res) => {
    const rollNumber = req.params.rollNumber;
    const eventName = req.params.eventName;

    // SQL query to fetch achievement details based on rollNumber and eventName
    const query = `
        SELECT * FROM achievement 
        WHERE ROLL = ? AND eventName = ?
    `;

    // Execute the query
    con.query(query, [rollNumber, eventName], (error, results) => {
        if (error) {
            console.error('Error fetching achievement details:', error);
            res.status(500).send('Error fetching achievement details');
        } else {
            // Render the achievement details EJS template and pass the achievement data
            res.render('display_achieve', { achievements: results}); // Assuming only one achievement is found
        } 
    }); 
});

app.get('/certificate/:id', (req, res) => {
    const achievementId = req.params.id;
    const query = 'SELECT certificateDocument FROM achievement WHERE id = ?';

    con.query(query, [achievementId], (error, results) => {
        if (error) {
            console.error('Error retrieving certificate:', error);
            res.status(500).send('Error retrieving certificate');
        } else {
            if (results.length > 0) {
                const certificateData = results[0].certificateDocument;
                res.setHeader('Content-Type', 'image/png'); // Adjust content type based on your file type
                res.send(certificateData);
            } else {
                res.status(404).send('Certificate not found');
            }
        }
    });
});

app.get('/mandy', (req, res) =>{
    res.render('mandy');
})

app.post('/generate-report/:month/:year', (req, res) => {
    const month = req.body.month;
    const year = req.body.year;
  
    // Construct the SQL query to retrieve achievements for the specified month and year
    const query = `
      SELECT 
        u.ROLL,
        a.eventName,
        a.submissionDate,
        a.eventDate
      FROM 
        achievement a
      INNER JOIN 
        user u ON a.ROLL = u.ROLL
      WHERE 
        MONTH(a.submissionDate) = ? AND YEAR(a.submissionDate) = ?
      ORDER BY 
        u.ROLL, a.submissionDate`;
  
    // Execute the query
    con.query(query, [month, year], (err, results) => {
      if (err) {
        console.error('Error generating report:', err);
        res.status(500).send('Error generating report');
      } else {
        console.log('Generated report:', month,year);
        // Render the report using a template engine like EJS and send it as a response
        res.render('report', { report: results });
      }
    });
  });
  
//Admin Registration Page
 app.get('/admin_dashboard', (req, res) =>{
         res.render('admin_dashboard');
 })
 const session = require('express-session');
 // Use express-session middleware
 app.use(session({
     secret: 'your-secret-key', // Change this to a random string
     resave: false,
     saveUninitialized: true
 }));
 
 // Your existing route
 app.post('/addStudent', (req, res) => {
     let fname = req.body.firstName;
     let lname = req.body.lastName;
     let roll = req.body.roll;
     let password;
     if (req.body.password == req.body.confirmPassword) {
         password = req.body.password;
     }
     let userEmail = req.body.userEmail;
     let sql1 = "INSERT INTO USER(ROLL,PASSWORD, FNAME,LNAME, USER_EMAIL) VALUES ?";
     let values1 = [
         [roll, password, fname, lname, userEmail]
     ];
 
     con.query(sql1, [values1], function (error, result) {
         if (error) throw error;
 
         // Set session data if user registration is successful
         req.session.userId = roll; // or whatever unique identifier you have for the user
         req.session.loggedIn = true;
 
         res.redirect('/admin_dashboard');
     });
 });
 
 app.get('/addStudent', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/admin_dashboard');
    } else {
        // Render your submission page here if needed
        // res.render('submissionPage');
        res.render('/newAdmin');
    }
});
// admin login
// admin login
app.post('/login', (req, res) =>{
    const adminEmail = req.body.email;
    const password = req.body.password;
    
    // Check if both email and password are provided
    if (!adminEmail || !password) {
        res.status(400).send('Please provide both email and password');
        return; // Exit early if email or password is missing
    }
    
    // Proceed with authentication
    var query = "SELECT * FROM Admin WHERE email = ?";
    var data = [adminEmail];
    
    mysql.query(query, data, (error, result) => {
        if (error) {
            // Handle error appropriately
            console.error(error);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        if (result.length === 0 || result[0].password !== password) {
             alert('Invalid Admin Credentials');
            return;
        }
        
        res.redirect('/admin_dashboard');
    });
});

//logout
app.get('/logout', (req, res) => {
    // Clear session data
    req.session.destroy(err => {
        if (err) {
            console.log("Error destroying session:", err);
            return res.status(500).send("Internal Server Error");
        }
        // Redirect user to login page
        res.redirect("/login"); // Assuming your login page route is "/login"
    });
});

//userlogout
app.get('/logout1', (req, res) => {
    // Clear session data
    req.session.destroy(err => {
        if (err) {
            console.log("Error destroying session:", err);
            return res.status(500).send("Internal Server Error");
        }
        // Redirect user to login page
        res.redirect("/login"); // Assuming your login page route is "/login"
    });
});
//userlogin
app.post('/userlogin', (req, res) =>{
    const userEmail = req.body.email;
    const password = req.body.password;
    const rollNumber = req.body.rollNumber; // Retrieve roll number from request body
    
    // Check if all required fields are provided
    if (!userEmail || !password || !rollNumber) {
        // Use console.log for server-side alerts
        alert('Please provide email, password, and roll number');
        res.redirect('/');
        return; // Exit early if any field is missing
    }
    
    // Proceed with authentication
    var query = "SELECT * FROM USER WHERE USER_EMAIL = ? AND ROLL = ?"; // Modify query to include roll number
    var data = [userEmail, rollNumber]; // Include roll number in data array
    
    mysql.query(query, data, (error, result) => {
        if (error) {
            // Handle error appropriately
            console.error(error);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        if (result.length === 0 || result[0].PASSWORD !== password) {
            alert('Invalid User Credentials');
            res.redirect('/');
            return;
        }
        res.redirect(`/user-dashboard/${rollNumber}`); 
    });
});

    //User Login
    app.get('/userLogin',(req,res)=>{
    res.render("userlogin");
    })
  
const port = process.env.PORT||3000;
app.listen(port, ()=>{
    console.log(`http://localhost:${port}`);
});

//css 
app.use(express.static("public")); 
