import { IOTerm, highlight } from 'ioterm';

document.getElementById('seResizeBtn').addEventListener('click', (event) => {
    var element = document.getElementById('term');
    element.style.width = element.offsetWidth + 50 + 'px';
    element.style.height = element.offsetHeight + 10 + 'px';
});

// Create a IOTerm and tell it who is its parent element.
var term = new IOTerm(document.getElementById('term'));

term.setPrefix(
    highlight('(base) ') +
    highlight('admin@Puter', 'color: #8ae234') +
    highlight(':') +
    highlight('~', 'color: #729fcf') +
    highlight('$ ')
);

// Here we just write the command back three times if there is no command running. Otherwise, just print the command on console.
var isRunning = false;
term.setCommandHandler((command) => {
    if (!isRunning) {
        isRunning = true;
        command = command.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        var i = 0;
        var timer = setInterval(() => {
            term.write(highlight(i++ + 'Hello, ' + command + '\n'));
            if (i === 3) {
                clearInterval(timer);
                isRunning = false;
                term.end();
            }
        }, 1000);
    } else {
        console.log(command);
    }
});

term.setTabHandler((inputText, position) => {
    if (inputText) {
        return [
            '<span style="color: #729fcf;">.</span>',
            '<span style="color: #729fcf;">..</span>',
            inputText,
            position,
            '你好',
            'Hello'
        ];
    } else {
        return [];
    }
});

var text1 = 'Welcome to IOTerm. IOTerm is a simple front-end terminal component but not as same as a terminal. It is just in charge of <b>Input</b> and <b>Output</b> but do not care about what is the input, what is the output and how the input will be precessed. To make full use of a web page, there are some differences between IOTerm and the terminal we use in a Linux distribution. ';
var text2 = 'If a newline is wanted, please add a line feed "\\n" rather than "\\r\\n", "\\r" or HTML tag "<br>".\n';

term.write(
    highlight(text1) + highlight(text2, 'color: red; font-weight: 600;'));
term.end();
