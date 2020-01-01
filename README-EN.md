IOTerm is a simple front-end terminal component that just has 500 lines of code including about ten percent of comment. It just provides <b>Input</b> and <b>Output</b> and some interface for expansion and customization.

[中文版](https://github.com/kaiopen/IOTerm/blob/master/README.md)

### What IOTerm Is
* IOTerm provides a terminal interface with user-friendly input and output. But other functions such as processing of input data, command execution and network transmission need to be implemented by you.
* Thanks for [XTerm.js](https://github.com/xtermjs/xterm.js) and [jianshi](https://github.com/moyuer1992/-jianshi). I have learned a lot from them.
* But IOTerm does not use HTTML tag &lt;canvas&gt; because &lt;pre&gt; is able to meet the needs.
* IOTerm cannot work with multiline interaction functions such as vim, tmux. It more like a textarea that only last can be edited.

### Features
* auto wrap
* flash input cursor and move input cursor via keyborad
* scroll as same as a real terminal
* highlight text by inserting HTML tags.
* input method follows input cursor.

### Getting Start
1. Installation
```
npm install --save ioterm
```

2. Importing and instantiation
```
import { IOTerm } from 'ioterm';

var ioterm = IOTerm(parentElement);

```

3. Examples
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

[Here](https://github.com/kaiopen/IOTerm/tree/master/demo) for more examples.

### TODO
* Remove white space added by line feeds &lt;br&gt; when copying.
* Handle line feeds when pasting.
* History.
* Automatic completion and prompt.
* Set color scheme.
* Simple interaction so that output will not conflict with input at the same time.

# License
MIT License