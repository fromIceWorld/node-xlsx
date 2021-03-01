const fs = require('fs'),
    xlsx = require('node-xlsx');

const roles = {
    超级管理员: '',
    用户管理员: ['系统管理/用户管理'],
    态势查看管理员: ['安全总览/首页、安全报告、内网态势'],
    事件查看管理员: [
        '安全总览/首页、安全报告、内网态势',
        'UEBA/用户画像、员工风险、设备风险、观察表',
    ],
    操作管理员: [
        'UEBA/用户画像、员工风险、设备风险、观察表',
        '事件调查/数据检索、告警事件、智能响应、专题分析、行为审计',
        '智能分析/模型管理、关联分析、行为分析、深度分析',
        '知识情报/知识情报、配置管理、知识情报检索、威胁情报',
        '系统管理/风险评分、审计管理、资产管理、数据采集',
    ],
    系统管理员: [
        '安全总览/首页、安全报告、内网态势',
        'UEBA/用户画像、员工风险、设备风险、观察表',
        '事件调查/数据检索、告警事件、智能响应、专题分析、行为审计',
        '智能分析/模型管理、关联分析、行为分析、深度分析',
        '知识情报/知识情报、配置管理、知识情报检索、威胁情报',
        '系统管理/风险评分、审计管理、资产管理、数据采集',
    ],
};

let json = fs.readFileSync(`${__dirname}/json-xlsx/app.properties`),
    menus = JSON.parse(json).navs,
    output = [['角色信息', '一级菜单', '二级菜单', '三级菜单', '操作']],
    outputRealUri = [['角色信息', '一级菜单', '二级菜单', '三级菜单', '操作']];
menus.forEach((first, index) => {
    if (index >= 4) {
        first.children.forEach((secend, index2) => {
            if (secend.children) {
                secend.children.forEach((third, index3) => {
                    if (index3 == 0) {
                        output.push([
                            '',
                            first.label + '(' + first.uri + ')',
                            secend.label + '(' + secend.uri + ')',
                            third.label + '(' + third.uri + ')',
                        ]);
                        outputRealUri.push([
                            '',
                            first.realUri,
                            secend.realUri,
                            third.realUri,
                        ]);
                    } else {
                        output.push([
                            '',
                            '',
                            '',
                            third.label + '(' + third.uri + ')',
                        ]);
                        outputRealUri.push(['', '', '', third.realUri]);
                    }
                });
            } else {
                if (index2 == 0) {
                    output.push([
                        '',
                        first.label + '(' + first.uri + ')',
                        secend.label + '(' + secend.uri + ')',
                    ]);
                    outputRealUri.push(['', first.realUri, secend.realUri]);
                } else {
                    output.push([
                        '',
                        '',
                        secend.label + '(' + secend.uri + ')',
                    ]);
                    outputRealUri.push(['', '', secend.realUri]);
                }
            }
        });
    }
});
//消除重复的一级菜单
let map = new Set();
output.forEach((menu) => {
    if (map.has(menu[1])) {
        menu[1] = '';
    } else {
        map.add(menu[1]);
    }
});
//添加角色名称
output[1][0] = '超级管理员';
//合并单元格
const range0 = { s: { c: 0, r: 1 }, e: { c: 0, r: output.length - 1 } },
    options = { '!merges': [range0] };

// 读取接口文档名称
let nameToContent = new Map();
fs.readdir(`${__dirname}/api`, function (err, files) {
    files.forEach((file) => {
        let content = fs.readFileSync(`${__dirname}/api/${file}`);
        nameToContent.set(file.split('.')[0], content);
    });
    //添加api操作
    outputRealUri.forEach((col, index) => {
        if (index > 0) {
            if (
                col[3] &&
                nameToContent.has(col[3].split('/')[0] || col[3].split('/')[1])
            ) {
                output[index][4] = nameToContent
                    .get(col[3].split('/')[0] || col[3].split('/')[1])
                    .toString();
            } else if (
                col[2] &&
                nameToContent.has(col[2].split('/')[0] || col[2].split('/')[1])
            ) {
                output[index][4] = nameToContent
                    .get(col[2].split('/')[0])
                    .toString();
            }
        }
    });
    //根据权限生成多sheet
    let result = [];
    Object.keys(roles).forEach((key) => {
        if (typeof roles[key] !== 'object') {
            result.push({ name: key, data: output });
        } else {
            let out = filterJurisdiction(key, output);
            result.push({ name: key, data: out });
        }
    });

    fs.writeFileSync(
        `${__dirname}/json-xlsx/menu.xlsx`,
        xlsx.build(result, options),
        'binary'
    );
});

function filterJurisdiction(key, out) {
    let copy = JSON.parse(JSON.stringify(out)),
        role = roles[key],
        cache = [],
        menus = [];
    role.forEach((menu) => {
        let split = menu.split('/'),
            first = split[0],
            secend = split[1].split('、');
        //存储菜单
        menus.push(first, ...secend);
    });
    //对比 记录不存在的菜单的col
    copy.forEach((col, index) => {
        let has = false;
        col.forEach((word, index2) => {
            if (index2 <= 3) {
                if (menus.includes(word && word.split('(')[0])) {
                    has = true;
                }
            }
        });
        if (!has) {
            cache.push(index);
        }
    });
    //删除被过滤的菜单
    for (let len = cache.length - 1; len > 0; len--) {
        copy.splice(cache[len], 1);
    }

    //更改角色名称
    copy[1][0] = key;
    return copy;
}
