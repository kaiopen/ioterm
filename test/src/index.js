import { IOTerm, escapeText } from '../../lib/ioterm';

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
