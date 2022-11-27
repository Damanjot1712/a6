//user-defined module
employees= [];
departments = [];
const fs = require("fs") 
//read file
module.exports.initialize = function()
{
    return new Promise((resolve, reject)=>{
       
        fs.readFile('./data/employees.json',(err,data)=>{
            if (err) reject("Failure to read file employees.json!");
            employees = JSON.parse(data);
            //console.log(employees);
        
        // no reject err, read employees successfully
        // then read departments
        fs.readFile('./data/departments.json',(err,data)=>{
            if (err) reject("Failure to read file department.json!");
            departments = JSON.parse(data);
           // console.log(departments);
           // both employees and departments read successfully
           resolve();
        });// read departments
        
       // resolve() here will have empty departments[]
       // it means doesn't matter readFile successful or not, it will always resolve(), which is wrong
      // resolve();
      });// readFile (... employees)
    
    }); // promise end
}//initialize

/* testing readFile to arrays
initialize().then(()=>{
    console.log(employees);
}).catch((reason)=>{
    console.log(reason);
});
*/

module.exports.getAllEmployees = function(){
    return new Promise((resolve,reject)=>{
        if (employees.length>0)
            resolve(employees);
        else
            reject("No results returned.");
    });
}// getAllEmployees

module.exports.getManagers = function(){
    return new Promise((resolve, reject)=>{
        let managers=[];
       /* for (let i=0; i<employees.length; i++)
            {
                if (employees[i].isManager)
                    managers.push(employees[i]);
            }
        */
            employees.forEach(function (employee) {
                if (employee.isManager) {
                    managers.push(employee);
                }
            });
            
        if (managers.length>0)
            resolve(managers);
        else
            reject("No results returned.");
    });
}

module.exports.getDepartments = function(){
   return new Promise((resolve,reject)=>{
        if (departments.length >0)
            resolve(departments);
        else
            reject("No results returned.");
   });
}

/* A3 beginning */
module.exports.addEmployee = function(employeeData){
    return new Promise((resolve, reject)=>{
        if (!employeeData.isManager)
            employeeData.isManager = false;
        else
            employeeData.isManager = true;
        employeeData.employeeNum = employees.length + 1;
        employees.push(employeeData);
        resolve();
    });
}

module.exports.getEmployeesByStatus = function(status){
    return new Promise((resolve, reject)=>{
        let filteredEmployees = [];
        
        employees.forEach(function(employee){
            if (employee.status.toLowerCase().trim() == status.toLowerCase().trim())
            {
                //console.log(employee.status.toLowerCase().trim()+","+status.toLowerCase().trim());
                filteredEmployees.push(employee);
            }
        }); // forEach

         if (filteredEmployees.length > 0)
            {
                resolve(filteredEmployees);
            }
        else
           {reject("No results returned!");}  
    }); //promise
}

module.exports.getEmployeesByDepartment = function(department){
    return new Promise((resolve, reject)=>{
        let filteredEmployees = [];
        employees.forEach(function(employee){
            if (employee.department == department)
                {
                    filteredEmployees.push(employee);
                }
        });// forEach
        if (filteredEmployees.length > 0)
            {
                resolve(filteredEmployees);
            }
        else
           {reject("No results returned!");} 
    });
}

module.exports.getEmployeesByManager = function (manager){
    return new Promise((resolve, reject)=>{
        let filteredEmployees = [];
        employees.forEach(function(employee){
            if (employee.employeeManagerNum == manager)
                filteredEmployees.push(employee);
        }); // forEach
        if (filteredEmployees.length > 0)
            {
                resolve(filteredEmployees);
            }
        else
           {reject("No results returned!");} 
    });// promise
}

module.exports.getEmployeeByNum = function(value){
    return new Promise((resolve, reject)=>{
        employees.forEach(function(employee){
            if (employee.employeeNum == value)
                resolve(employee);
        });
        reject("No result found!");
    });
}
/* A3 end */
/*  A4 - beginning */
module.exports.updateEmployee= function(employeeData){
    return new Promise((resolve, reject)=>{
        for (let i=0; i<employees.length; i++)
        {
            if (employees[i].employeeNum == employeeData.employeeNum)
                {
                    employees[i] = employeeData;
                    resolve();
                }
        }
    });
}
/* A4 end */