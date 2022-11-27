const fs = require("fs");

let employees = [];
let departments = []


var initialize = function () {
    return new Promise( (resolve, reject) => {
        fs.readFile('./data/departments.json', (err, data) => {
            if (err) {
                reject(err);
            }

            departments = JSON.parse(data);

            fs.readFile('./data/employees.json', (err, data) => {
                if (err) {
                    reject(err);
                }

                employees = JSON.parse(data);
                resolve();
            });
        });
    });
}

initialize().then(()=>{
    console.log(departments);
});