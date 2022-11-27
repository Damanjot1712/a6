/* https://infinite-caverns-60557.herokuapp.com/ */
/* A4 - Solution */
/*
A4: 
Great job!

Implemented all routes. Handlebars and helpers were implemented as expected. views were created well.

site works properly.

Wonderful!

Keep up your nice work!

Sunny
*/

const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const {engine} = require("express-handlebars");

const data_service = require("./data-service.js");

const HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening
function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

/* A4 -  beginning */
// handle active route
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/") ? "/" : route.replace(/\/$/,"");
    next();
});

//setting express-handlebars
app.engine(".hbs", engine({
        extname: '.hbs',
        
        helpers:{
            navLink: function(url, options){
                return '<li' +
                        ((url == app.locals.activeRoute) ? ' class = "active" ' : '') +
                        '><a href="' + url + '">' + options.fn(this) + '</a> </li>';
            }, // helpers: navLink
           /* e.g.,
              {{#equal employee.status "Full Time" }}checked{{/equal}} */
            equal: function(lvalue, rvalue, options){
                if (arguments.length<3)
                    throw new Error ("Handlebars Helper equal needs 2 parameters.");
                if (lvalue != rvalue){
                    return options.inverse(this);
                } else{
                    return options.fn(this);
                }
            } // helpers:equal
        }, //// helpers
        defaultLayout: 'main'
    }
));
app.set("view engine", ".hbs");


/* A4 - setting  express-handlebars - ending */

//A3- define storage destination
// multer: for form with file upload 
const storage = multer.diskStorage({
     destination: "./public/images/uploaded",
     filename: function(req, file, cb){
         cb(null, Date.now()+ path.extname(file.originalname));
     }
});
var upload = multer({storage:storage});

// body-parser: for form without file upload
app.use(bodyParser.urlencoded({extended:true}));

//set up default route
app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/about", (req,res)=>{
    res.render("about");
});

//adding more routes
/*  A2 - 
app.get("/employees", (req,res)=>{
    data_service.getAllEmployees().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
    });
});
- A2 modified in A3, below */
//A3- part 4
/* query parameters are used to sort/filter resources.  
path parameters are used to identify a specific resource or resources.*/

app.get("/employees", (req,res)=>{
    if (req.query.status)
        {
            data_service.getEmployeesByStatus(req.query.status).then((data)=>{
               // res.json(data);
               res.render("employees", {employees:data});
            }).catch((reason)=>{
                res.render("employees", {message:reason});
              //  res.json({message:reason});
            });
        }
    else if (req.query.department)
            {
                data_service.getEmployeesByDepartment(req.query.department).then((data)=>{
                   // res.json(data);
                   res.render("employees", {employees:data});
                }).catch((reason)=>res.render("employees", {message:reason}));
               // res.json({message:reason}));
            }
    
    else if (req.query.manager)
        {
            data_service.getEmployeesByManager(req.query.manager).then((data)=>{
                //res.json(data);
                res.render("employees", {employees:data});
            }).catch((reason)=>res.render("employees", {message: reason}));
            //res.json({message:reason}));
        }
    else {
        data_service.getAllEmployees().then((data)=>{
           // res.json(data);
           res.render("employees", {employees:data});
        }).catch((err)=>{
            //res.json({message: err});
           res.render("employees", {message: err});
        });  
    }// if no query, response all employees
    }); // end of: app.get("/employees", (req,res)=>{

app.get("/employee/:empNum",(req,res)=>{
    data_service.getEmployeeByNum(req.params.empNum).then((data)=>{
       // res.json(data);
        res.render("employee", {employee:data});
    }).catch((reason)=>res.render("employee",{message:reason}));
    //res.json({message:reason}));
});
/* removed in A4
app.get("/managers",(req,res)=>{
    data_service.getManagers().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
    });
}); */

app.get("/departments",(req,res)=>{
    data_service.getDepartments().then((data)=>{
       // res.json(data);
       res.render("departments", {departments: data});
    }).catch((err)=>{
        console.log(err);
    });
});

/* A3 new routes - beginning */
app.get("/employees/add",(req,res)=>{
    //res.send("add employees");
    res.render("addEmployee");
});

app.get("/images/add", (req,res)=>{
    //res.send("images");
    res.render("addImage");
});

app.get("/images",(req,res)=>{
    fs.readdir("./public/images/uploaded", function(err,items){
        // this was in A3, was changed to res.render() in A4 
        //res.json({images:items}); 
       // res.render("images");
       res.render("images", {images: items});
    });
});

app.post("/images/add",upload.single("imageFile"), (req,res)=>{
    res.redirect("/images");
 });

app.post("/employees/add", (req,res)=>{
     data_service.addEmployee(req.body).then(()=>{
        res.redirect("/employees");
     });
 });

/*** A3 end ****/
//A4
app.post("/employee/update",(req,res)=>{
   // console.log(req.body);
    data_service.updateEmployee(req.body).then(()=>{
        res.redirect("/employees");
    });
});

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});

data_service.initialize().then(()=>{
    //listen on HTTP_PORT
    app.listen(HTTP_PORT, onHttpStart);
}).catch(()=>{
    console.log("Cannot open files.");
});