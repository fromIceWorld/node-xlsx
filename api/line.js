const fs = require('fs'),
    xlsx = require('node-xlsx');
let json = fs.readFileSync(`${__dirname}/json-xlsx/app.properties`),
    menus = JSON.parse(json).navs;
console.log(menus);
