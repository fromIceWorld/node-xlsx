const fs = require("fs"),
  xlsx = require("node-xlsx");

let json = fs.readFileSync(`${__dirname}/json-xlsx/app.properties`),
  menus = JSON.parse(json).navs,
  output = [["角色信息", "一级菜单", "二级菜单", "三级菜单", "操作"]],
  outputRealUri = [["角色信息", "一级菜单", "二级菜单", "三级菜单", "操作"]];
menus.forEach((first, index) => {
  if (index >= 4) {
    first.children.forEach((secend, index2) => {
      if (secend.children) {
        secend.children.forEach((third, index3) => {
          if (index3 == 0) {
            output.push([
              "",
              first.label + "(" + first.uri + ")",
              secend.label + "(" + secend.uri + ")",
              third.label + "(" + third.uri + ")",
            ]);
            outputRealUri.push([
              "",
              first.realUri,
              secend.realUri,
              third.realUri,
            ]);
          } else {
            output.push(["", "", "", third.label + "(" + third.uri + ")"]);
            outputRealUri.push(["", "", "", third.realUri]);
          }
        });
      } else {
        if (index2 == 0) {
          output.push([
            "",
            first.label + "(" + first.uri + ")",
            secend.label + "(" + secend.uri + ")",
          ]);
          output.push(["", first.realUri, secend.realUri]);
        } else {
          output.push(["", "", secend.label + "(" + secend.uri + ")"]);
          output.push(["", "", secend.realUri]);
        }
      }
    });
  }
});
//消除重复的一级菜单
let map = new Set();
output.forEach((menu) => {
  if (map.has(menu[1])) {
    menu[1] = "";
  } else {
    map.add(menu[1]);
  }
});
//添加角色名称
output[1][0] = "超级管理员";
//合并单元格
const range0 = { s: { c: 0, r: 1 }, e: { c: 0, r: output.length - 1 } },
  options = { "!merges": [range0] };

// 读取接口文档名称
let nameToContent = new Map();
fs.readdir(`${__dirname}/api`, function (err, files) {
  files.forEach((file) => {
    console.log(file, file.split(".")[0]);
    let content = fs.readFileSync(`${__dirname}/api/${file}`);
    nameToContent.set(file.split(".")[0], content);
  });
  console.log(nameToContent);
});
//添加操作
outputRealUri.forEach((row, index) => {
  if (index > 0) {
  }
});

fs.writeFileSync(
  `${__dirname}/json-xlsx/menu.xlsx`,
  xlsx.build([{ name: "超级管理员", data: output }], options),
  "binary"
);
