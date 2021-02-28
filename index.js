const xlsx = require("node-xlsx"),
  fs = require("fs");
fs.readdir("./input", function (err, files) {
  files.forEach((file) => {
    let path = `${__dirname}/input/${file}`;
    let sheetList = xlsx.parse(path);
    sheetList.forEach((sheet) => {
      sheet.data.forEach((row) => {
        row.forEach((word, index) => {
          if (index >= 0 && index <= 1) {
            row[index] = word.replace("'", "");
          }
        });
      });
      let newSheet = [sheet];
      fs.writeFileSync(
        path.replace("input", "output"),
        xlsx.build(newSheet),
        "binary"
      );
    });
  });
});
