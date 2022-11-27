/*********************************************************************************
* WEB322 – Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: ___Damanjot Singh___________________ Student ID: _148285216____ Date: _27/11/2022______
*
* Online (Heroku Cyclic) Link: ______https://agreeable-sheath-dress-frog.cyclic.app__________________________________________________
*
********************************************************************************/\
const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const {engine} = require("express-handlebars");

const data_service = require("./data-service.js");

const HTTP_PORT = process.env.PORT || 8080;


function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/") ? "/" : route.replace(/\/$/,"");
    next();
});


app.engine(".hbs", engine({
        extname: '.hbs',
        
        helpers:{
            navLink: function(url, options){
                return '<li' +
                        ((url == app.locals.activeRoute) ? ' class = "active" ' : '') +
                        '><a href="' + url + '">' + options.fn(this) + '</a> </li>';
            }, 
            equal: function(lvalue, rvalue, options){
                if (arguments.length<3)
                    throw new Error ("Handlebars Helper equal needs 2 parameters.");
                if (lvalue != rvalue){
                    return options.inverse(this);
                } else{
                    return options.fn(this);
                }
            } 
        },
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


app.use(bodyParser.urlencoded({extended:true}));


app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/about", (req,res)=>{
    res.render("about");
});


app.get("/employees", (req,res)=>{
    if (req.query.status) {
        dataservice.getEmployeeByStatus(req.query.status)
        .then(data => res.render("employees", { employees: data }))
        .catch(err => res.status(404).send('no results'))
    }
    else if (req.query.department) {
        dataservice.getEmployeesByDepartment(req.query.department)
        .then(data => res.render("employees", { employees: data }))
        .catch(err => res.status(404).send('no results'))
    }
    else if (req.query.manager) {
        dataservice.getEmployeesByManager(req.query.manager)
        .then(data => res.render("employees", { employees: data }))
        .catch(err => res.status(404).send('no results'))
    }
    else {
        dataservice.getAllEmployees()
        .then(data => res.render("employees", { employees: data }))
        .catch(err => res.status(404).send('no results'))
    }
});

app.get('/employees/delete/:empNum', (req,res) => {
    dataservice.deleteEmployeeByNum(req.params.value)
    .then(res.redirect("/employees"))
    .catch(err => res.status(500).send("Unable to Remove Employee / Employee not found"))
});


app.get("/departments", (req, res) => {
    dataservice.getDepartments()
    .then(data => res.render("departments", { departments: data }))
    .catch(err => res.status(404).send('departments not found'))
});


app.get("/departments/add", (req,res) => {
    res.render(path.join(__dirname + "/views/addDepartment.hbs"));
});

app.post("/departments/add", (req,res) => {
    dataservice.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    })
});

app.post("/department/update", (req,res) => {
    dataservice.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    })
});

app.get("/department/:departmentId", (req, res) =>{
    dataservice.getDepartmentById(req.params.departmentId)
    .then((data) => {res.render("department", { department: data })})
    .catch(err => res.status(404).send("department not found"))
});
    

app.get('/departments/delete/:value', (req,res) => {
    dataservice.deleteDepartmentByNum(req.params.value)
    .then(res.redirect("/departments"))
    .catch(err => res.status(500).send("Unable to Remove Department / Department not found"))
});


app.get("/employees/add",(req,res)=>{
    res.render("addEmployee");
});

app.get("/images/add", (req,res)=>{

    res.render("addImage");
});

app.get("/images",(req,res)=>{
    fs.readdir("./public/images/uploaded", function(err,items){
       res.render("images", {images: items});
    });
});

app.post("/images/add",upload.single("imageFile"), (req,res)=>{
    res.redirect("/images");
 });

 app.get("/managers", (req, res) => {
    dataservice.getManagers()
    .then(data => res.render("employees", {employees: data}))
    .catch(err => res.status(404).send("managers data not found"))
});

app.post("/employees/add", (req,res)=>{
     data_service.addEmployee(req.body).then(()=>{
        res.redirect("/employees");
     });
 });


app.post("/employee/update",(req,res)=>{
    data_service.updateEmployee(req.body).then(()=>{
        res.redirect("/employees");
    });
});

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});

data_service.initialize().then(()=>{
    app.listen(HTTP_PORT, onHttpStart);
}).catch(()=>{
    console.log("Cannot open files.");
});