IOTerm 是一个简单、需继续定制化开发的前端终端模拟组件。除了仅 500 行代码，包含十分之一的注释之外，简单更体现在 IOTerm 只保证正常的输入（I）和正确的显示（O），而将更多功能以接口的方式留给使用者继续定制化开发。

[English](https://github.com/kaiopen/IOTerm/blob/master/README-EN.md)

### 定位和声明
* IOTerm 仅提供终端页面的显示和保证正常的输入和正确的显示，具体的输入数据处理、命令执行、网络传输等功能由使用者决定。
* IOTerm 参考了 [XTerm.js](https://github.com/xtermjs/xterm.js) 和 [简诗](https://github.com/moyuer1992/-jianshi)，感谢这些优秀项目的开源。
* IOTerm 没有使用 &lt;canvas&gt; 标签的主要原因是本人对 &lt;canvas&gt; 标签不是很熟悉，而选用了能够满足徐需求的 &lt;pre&gt; 标签。
* IOTerm 不支持具有多行输入与交互功能的 vim 和 tmux 等，而只能在最后一行进行输入。它更像是一个只能在最后输入数据的文本框。

## 特性
* 支持自动换行
* 支持光标显示、闪烁以及键盘左右键控制光标移动
* 支持滚动，包括类似于终端的自动滚动和不滚动
* 支持 HTML 标签的插入，以实现高亮
* 输入法跟随，提高输入体验

### 使用
1. 安装 IOTerm
```
npm install --save ioterm
```

2. 导入与实例化
```
import { IOTerm } from 'ioterm';

var ioterm = IOTerm(parentElement);

```

3. 例子
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>IOTerm</title>
    <style>
    #term {
        width: 240px;
        height: 180px;
    }
    </style>
</head>
<body>

    <div id="term" ></div>

    <script src="bundle.js"></script>
</body>
</html>
```

``` javascript
import { IOTerm, escapeText } from 'ioterm';

var data = {
    env: 'base',
    user: 'admin',
    server: 'Puter',
    pwd: '~',
    prefix: '',
}

function updatePrefix({ env, user, server, pwd }) {
    if (env !== void 0) {
        data.env = env;
    }
    if (user !== void 0) {
        data.user = user;
    }
    if (server !== void 0) {
        data.server = server;
    }
    if (pwd !== void 0) {
        data.pwd = pwd;
    }
    data.prefix = '(' + data.env + ') <span style="color: #8ae234">' +
                  data.user + '@' + data.server +
                  '</span>:<span style="color: #729fcf">' + data.pwd +
                  '</span>$ ';
}

var welcome = 'Welcome to IOTerm. Please use escape characters "&amp;amp;", "&amp;lt;" and "&amp;gt;" instead of "&amp;", "&lt;" and "&gt;", if an ampersand, less-than sign or greater-than sign is needed to be shown. <span style="color: red">HTML tag &lt;span&gt; can be used for special style.</span> If a newline is wanted, please add line feed "\\n" rather than "\\r\\n" or HTML tag &lt;br&gt;.\n';

updatePrefix({});

var term = new IOTerm(document.getElementById('term'));
term.setCommandHandler((command) => {
    // Replace line feed '\r\n' and '\r' with '\n'.
    command = command.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Escape '<', '>' and '&' to '&lt;', '&gt;' and '&amp;'.
    // Pay attention to the order between highlighting and escaping.
    command = escapeText(command);
    console.log(command);
    var i = 0;
    var timer = setInterval(() => {
        term.write(i++ + 'Hello, ' + command);
        if (i === 3) {
            clearInterval(timer);
            term.write(data.prefix);
        }
    }, 500);
})
term.write(welcome);
term.write(data.prefix);

```

更多[样例](https://github.com/kaiopen/IOTerm/tree/master/demo)。

### 后续工作
* 复制：去除复制的内容中由换行符 &lt;br&gt; 导致的空格
* 粘贴：处理粘贴的内容中的换行符
* 历史功能
* Tab 键补全
* 动态调整大小时，更新自动换行
* 自定义配色
* 简单的交互（在输出时也可正常输入）

### 协议
MIT License
