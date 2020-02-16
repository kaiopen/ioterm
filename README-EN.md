IOTerm is a simple front-end terminal component but not as same as a terminal. It is just in charge of <b>Input</b> and <b>Output</b> but do not care about what is the input, what is the output and how the input will be precessed. To make full use of a web page, there are some differences between IOTerm and the terminal we use in a Linux distribution.

[中文版](https://github.com/kaiopen/IOTerm/blob/master/README.md)

### Differences
* IOTerm does not process any data. The handler need to be defined by you.
* Question-and-answer interaction is supported. If you need some complex interactions such as vim, it is better for you to implement a text editor with rich functions.
* We used to typing &lt;Tab&gt; for prompting. It is the same here. But the form of prompting is different.
* If you paste text including line feeds, the terminal will run the commands one by one immediately excluding the last one without a line feed. Here, IOTerm will not run the commands immediately. Like paste lines into a single line input box, line feeds will be regarded as white spaces.

### Features
* auto wraping
* input cursor with flashing and moving
* input method following
* copying and pasting
* highlighting
* scrolling as same as a real terminal
* simple interaction
* history
* prompting
* custom color and font

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

3. [Here](https://github.com/kaiopen/IOTerm/tree/master/demo) for examples.

### TODO
* Customize scrollbar or provide a interface for customizing scrollbar.

### Methods of IOTerm
1. `end()`
The method should be called when the command is finished. And the prefix will be printed.

2. `setColor({text, background}: {text?: string, background?: string})`
Set color of text or background.

3. `setCommandHandler(commandHandler: Function)`
Set a handler to handle commands. The handler has one input parameter `command`, a string input by user. It may be a correct linux command such as "ls", "cd ~/Documents", or "python hello.py". It could be something else without a clear meaning such as " ", "!", "Hello World". It also could be the input input by users when a command is processed or running.

4. `setFont({family, size}: {family?: string, size?: string})`
Set font family or size.

5. `setPrefix(html: string)`
Set the prefix we used to seeing in a terminal, including the virtual environment, the user name, the server name, the current work directory and an indicator for permissions. The `html` should be preprocessed by function `highlight`.

6. `setTabHandler(tabHandler: Function)`
Set a handler for prompting. The handler has two input paremeters, the string input by users and the position of the input cursor. The return must be an array of strings or an empty array.

7. `write(html: string)`
Write and show something. The `html` should be preprocessed by function `highlight`. If a newline is wanted, please add a line feed "\\n" rather than "\\r\\n", "\\r" or HTML tag "<br>".

### Functions
1. `highlight(text: string, style?: string)`
Highlight `text` with `style`.

# License
MIT License