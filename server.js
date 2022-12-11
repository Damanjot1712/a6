const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
//const bodyParser = require("body-parser");
const fs = require("fs");
//const exphbs = require("express-handlebars");
const {engine} = require("express-handlebars");
const data_service = require("./data-service.js");
const dataServiceAuth = require(__dirname + "/data-service-auth.js");
const clientSessions = require('client-sessions');


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
app.engine(".hbs", engine(
    {
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


const storage = multer.diskStorage({
     destination: "./public/images/uploaded",
     filename: function(req, file, cb){
         cb(null, Date.now()+ path.extname(file.originalname));
     }
});
var upload = multer({storage:storage});


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(function(req,res,next) {
    let route = req.baseUrl+req.path;
    app.locals.activeRoute = (route == "/") ? "/":route.replace(/\/$/,"");
    next();
});

app.use(clientSessions( {
    cookieName: "session",
    secret: "web322_a6",
    duration: 2*60*1000,
    activeDuration: 1000*60
}));

app.use((req,res,next) => {
    res.locals.session = req.session;
    next();
});

ensureLogin = (req,res,next) => {
    if (!(req.session.user)) {
        res.redirect("/login");
    }
    else {next(); }
};

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/about", (req,res)=>{
    res.render("about");
});

app.get("/employees",ensureLogin, (req,res)=>{
    if (req.query.status)
        {
            data_service.getEmployeesByStatus(req.query.status).then((data)=>{
              res.render("employees", data.length>0?{employees:data}:{message:"No results"});
            }).catch((reason)=>{
                res.render({message:reason});
            });
        }
    else if (req.query.department)
            {
                data_service.getEmployeesByDepartment(req.query.department).then((data)=>{
                  res.render("employees", data.length>0?{employees:data}:{message:"No results"});
                }).catch((reason)=>res.render({message:reason}));
            }
    
    else if (req.query.manager)
        {
            data_service.getEmployeesByManager(req.query.manager).then((data)=>{
                res.render("employees", data.length>0?{employees:data}:{message:"No results"});
            }).catch((reason)=>res.render({message: reason}));
        }
    else {
        data_service.getAllEmployees().then((data)=>{
          res.render("employees", data.length>0?{employees:data}:{message:"No results"});
        }).catch((err)=>{
           res.render({message: err});
        });  
    }
    });

app.get("/employee/:empNum",ensureLogin,(req,res)=>{
    let viewData={};

    data_service.getEmployeeByNum(req.params.empNum).then((data)=>{
       if (data) 
        {
            viewData.employee=data;
        }else{
            viewData.employee=null;
        }
    }).catch(()=>{
        viewData.employee=null;
    }).then(data_service.getDepartments).
        then((data)=>{ 
            viewData.departments = data;
            for (let i=0; i<viewData.departments.length; i++)
                {
                    if (viewData.departments[i].departmentId == viewData.employee.department)
                        { viewData.departments[i].selected = true;}
                }
         }).catch(()=>{
             viewData.departments=[];
         }).then(()=>{
             if (viewData.employee == null)
                { 
                    res.status(404).send("Employee Not found");
                } else{
                    res.render("employee", {viewData: viewData}); 
                }
         });
        });

app.get("/employees/delete/:empNum",ensureLogin,(req,res)=>{
    data_service.deleteEmployeeByNum(req.params.empNum).then(()=>{
        res.redirect("/employees");
    }).catch((err)=>{
        console.log(err);
        res.status(500).send("Unable to remove employee.")
    });
});

app.get("/departments",ensureLogin,(req,res)=>{
    data_service.getDepartments().then((data)=>{
        console.log(data);
       res.render("departments",data.length>0?{departments:data}:{message:"No results."})

    }).catch((err)=>{
        console.log(err);
    });
});

app.get("/employees/add",ensureLogin,(req,res)=>{
    data_service.getDepartments().then((data)=>{
        res.render("addEmployee", {departments:data});
    }).catch((err)=>{
        res.render("addEmployee",{departments:[]});
    });
    
});

app.get("/images/add",ensureLogin, (req,res)=>{

    res.render("addImage");
});

app.get("/images",ensureLogin,(req,res)=>{
    fs.readdir("./public/images/uploaded", function(err,items){
       res.render("images", {images: items});
    });
});

app.post("/images/add",upload.single("imageFile"), ensureLogin,(req,res)=>{
    res.redirect("/images");
 });

app.post("/employees/add", ensureLogin,(req,res)=>{
     data_service.addEmployee(req.body).then(()=>{
        res.redirect("/employees");
     }).catch((err)=>{
        res.render("addEmployee",{message:err});
    });
 });

app.post("/employee/update",ensureLogin,(req,res)=>{
    data_service.updateEmployee(req.body).then(()=>{
        res.redirect("/employees");
    }).catch((err)=>{
        res.render("employees, ",{message:err});
    });;
});

app.get("/departments/add",ensureLogin,(req,res)=>{
    res.render("addDepartment");
});

app.post("/departments/add", ensureLogin,(req, res)=>{
    data_service.addDepartment(req.body).then(()=>{
        res.redirect("/departments");
    }).catch((err)=>{
        res.status(500).send("Unable to add the deparmtment.");
    });
});

app.post("/department/update",ensureLogin,(req,res)=>{
    data_service.updateDepartment(req.body).then(()=>{
        res.redirect("/departments");
    }).catch((err)=>{
        res.status(500).send("Unable to update the department.");
    });
});

app.get("/department/:departmentId",ensureLogin,(req,res)=>{
    data_service.getDepartmentById(req.params.departmentId).then((data)=>{
        if (!data)
            {res.status(404).send("Department not found");}
        else
            {res.render("department",{department:data});}
    }).catch((err)=>{
        res.status(404).send("Departmen not found.");
    })
});

//A6 LOGIN and extras

app.get("/login", (req,res) => {
    res.render("login");
});

app.get("/register", (req,res) => {
    res.render("register");
});

app.post("/register", (req,res) => {
    dataServiceAuth.registerUser(req.body)
    .then(() => res.render("register", {successMessage: "User created" } ))

    .catch (err => res.render("register", {errorMessage: err, userName:req.body.userName }) )
});

app.post("/login", (req,res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    .then(user => {
        req.session.user = {
            userName:user.userName,
            email:user.email,
            loginHistory:user.loginHistory
        }
        res.redirect("/employees");
    })
    .catch(err => {
        res.render("login", {errorMessage:err, userName:req.body.userName} )
    }) 
});

app.get("/logout", (req,res) => {
    req.session.reset();
    res.redirect("/login");
});

app.get("/userHistory", ensureLogin, (req,res) => {
    res.render("userHistory", {user:req.session.user} );
});


app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});

data_service.initialize().then(()=>{
    app.listen(HTTP_PORT, onHttpStart);
}).catch(()=>{
    console.log("Cannot open files.");
});