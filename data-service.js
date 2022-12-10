/* A5 - Solution */
//user-defined module

const Sequelize = require("sequelize");

// fill in your db information 
/* var seq = new Sequelize('database','user', 'password',{
    host: 'host',
    dialect: 'postgres',
    port: 5432,
    dialiectOptions: {ssl: true},
});
 */
var sequelize = new Sequelize("db96fsme0mg6hg", "mljegrpiakpknp", "afe27c1ee7eec900b9a6292dff888ea99280eec4ac4f73fcc02b9906d66a1f2e", 
{   host: "ec2-54-166-114-48.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
   // dialectOptions:{ssl: true} //SequelizeConnectionError: self signed certificate
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // <<<<<<< YOU NEED THIS
          //https://github.com/brianc/node-postgres/issues/2009 
        }
      },
});

sequelize.authenticate().then(()=> console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err));
//create database models
var Employee = sequelize.define("Employee", {
    employeeNum:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.STRING,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define("Department",{
    departmentId:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

module.exports.initialize = function()
{
    return new Promise((resolve, reject)=>{
       sequelize.sync().then(()=>{
           resolve();
       }).catch(()=>{
            reject("Unable to sync DB.");
       });
    }); // promise end
}//initialize


module.exports.getAllEmployees = function(){
    return new Promise((resolve,reject)=>{
        Employee.findAll().then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("No results returned.");
        });//catch
    });// promise
}// getAllEmployees

module.exports.getEmployeesByStatus = function(status_query){
    return new Promise((resolve, reject)=>{
        Employee.findAll({
            where:{status:status_query}
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("No query results.");
        });//catch
    }); //promise
}

module.exports.getEmployeesByDepartment = function(department_query){
    return new Promise((resolve, reject)=>{
        Employee.findAll({
            where: {department: department_query}
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("No query results.")
        }); //catch
    });// promise
}

module.exports.getEmployeesByManager = function (manager_query){
    return new Promise((resolve, reject)=>{
        Employee.findAll({
            where:{employeeManagerNum: manager_query}
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("No results returned!");
        });//catch
    });// promise
}

module.exports.getEmployeeByNum = function(value){
    return new Promise((resolve, reject)=>{
        Employee.findAll({
            where:{employeeNum: value}
        }).then((data)=>{
            resolve(data[0]);
        }).catch((err)=>{
            reject("No result.")
        });
    });
}

module.exports.addEmployee = function(employeeData){
    return new Promise((resolve, reject)=>{
         // object employeeData is from user's input (req.query.body)
        employeeData.isManager = (employeeData.isManager)?true:false;        
        for (let prop in employeeData)
            {
                if (employeeData[prop]=="")
                    employeeData[prop] = null;
            }// set '' to null for object property values
        // object employeeData is ready to be created (added) to table (model) Employee
        Employee.create(employeeData).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("Cannot add employee.");
        });
    });
}

module.exports.updateEmployee= function(employeeData){
    return new Promise((resolve, reject)=>{
        employeeData.isManager= employeeData.isManager?true:false;
        for (let prop in employeeData)
            {
                if (employeeData[prop]=="")
                    employeeData[prop]=null;
            }
        Employee.update(employeeData,
            {where: {employeeNum: employeeData.employeeNum}}
        ).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("cannot update.");
        });  
    });
}

module.exports.deleteEmployeeByNum = function(empNum){
    return new Promise((resolve, reject)=>{
        Employee.destroy({
                        where: {employeeNum: empNum}
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("Unable to delete employee.");
        });
    })
}

//department
module.exports.getDepartments = function(){
    return new Promise((resolve,reject)=>{
        Department.findAll().then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("No results.")
        }); //catch
    }); // promise
 }

 module.exports.addDepartment= function(departmentData){
     return new Promise((resolve, reject)=>{
        for (let prop in departmentData)
            {
                if (departmentData[prop]=="")
                    departmentData[prop] = null;
            }
        Department.create(departmentData).then(()=>{
            resolve();
        }).catch((err)=>{ 
            reject("Cannot add department");
        });// catch
     });// promise
 }

 module.exports.updateDepartment=function(departmentData){
     return new Promise((resolve, reject)=>{
         for (let prop in departmentData)
            {
                if (departmentData[prop]=="")
                    {
                        departmentData[prop] = null;
                    }
            }
        Department.update(departmentData,
        {where: {departmentId: departmentData.departmentId}})
        .then(()=>{
            resolve();
        }).catch((err)=>{
            reject("Cannot update Department.");
        });// catch
     });// promise
 }

 module.exports.getDepartmentById=function(id){
     return new Promise((resolve, reject)=>{
         Department.findAll(
             {where: {departmentId: id}})
             .then((data)=>{
                 resolve(data[0]);
             }).catch((err)=>{
                 reject("Cannot find the department by Id.");
             });// catch
     });// promise
 }

