const fs = require('fs'),
    xlsx = require('node-xlsx'),
    json = fs.readFileSync(`${__dirname}/json-xlsx/app.properties`),
    menus = JSON.parse(json).navs,
    cache = [['菜单描述', '菜单路由', '菜单名称']];

menus.forEach((first, index) => {
    if (index >= 4) {
        cache.push([first.label, first.uri, first.label]);
        first.children.forEach((secend, index2) => {
            if (secend.children) {
                secend.children.forEach((third, index3) => {
                    cache.push([
                        third.label,
                        first.uri + '/' + secend.uri + '/' + third.uri,
                        third.label,
                    ]);
                });
            } else {
                cache.push([
                    secend.label,
                    first.uri + '/' + secend.uri,
                    secend.label,
                ]);
            }
        });
    }
});
console.log(cache);
fs.writeFileSync(
    `${__dirname}/json-xlsx/menu2.xlsx`,
    xlsx.build([{ name: 'sheet1', data: cache }]),
    'binary'
);
