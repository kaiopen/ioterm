import { IOTerm, escapeText } from '../../lib/ioterm';

function updatePrefix({ env, user, server, pwd }) {
    if (env === void 0) {
        env = 'base';
    }
    if (user === void 0) {
        user = 'admin';
    }
    if (server === void 0) {
        server = 'Puter';
    }
    if (pwd === void 0) {
        pwd = '~';
    }
    return '(' + env + ') <span style="color: #8ae234">' +
           user + '@' + server +
           '</span>:<span style="color: #729fcf">' + pwd + '</span>$ ';
}

document.getElementById('seResizeBtn').addEventListener('click', (event) => {
    var element = document.getElementById('term');
    element.style.width = element.offsetWidth + 50 + 'px';
    element.style.height = element.offsetHeight + 10 + 'px';
    term.resize();
});

var term = new IOTerm(document.getElementById('term'));
term.setPadding({
    left: '5px'
});
term.setColor({
    text: '#fff86f',
    background: 'black'
});
term.setFont({
    size: '12px'
});
// Remember to refresh the IOTerm after setting the font via function `term.refresh()`, especially there are some words shown.

term.setPrefix(updatePrefix({}));
term.setCommandHandler((command) => {
    // Replace line feed '\r\n' and '\r' with '\n'.
    command = command.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Escape '<', '>' and '&' to '&lt;', '&gt;' and '&amp;'.
    // Pay attention to the order between highlighting and escaping.
    command = escapeText(command);

    var i = 0;
    var timer = setInterval(() => {
        term.write(i++ + 'Hello, ' + command + '\n');
        if (i === 3) {
            clearInterval(timer);
            term.end();
        }
    }, 1000);
});

var welcome = 'Welcome to IOTerm. Please use escape characters "&amp;amp;", "&amp;lt;" and "&amp;gt;" instead of "&amp;", "&lt;" and "&gt;", if an ampersand, less-than sign or greater-than sign is needed to be shown. <span style="color: red">HTML tag &lt;span&gt; can be used for special style.</span> If a newline is wanted, please add line feed "\\n" rather than "\\r\\n" or HTML tag &lt;br&gt;.\n';

term.write(welcome);
term.end();
