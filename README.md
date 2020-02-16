IOTerm 是一个简单的前端终端模拟组件，但为了充分利用可视化页面的特性并且减小组件的大小，提高运行效率，IOTerm 与常用的终端存在些许差异。简单地说，IOTerm 只保证正常的输入（I）和正确的显示（O）。

[English](https://github.com/kaiopen/IOTerm/blob/master/README-EN.md)

### 不同
* IOTerm 不处理任何数据，你需要完成处理函数的定义。
* IOTerm 仅支持单行输入的交互功能，而不支持如 vim 等复杂交互功能。建议结合 Web 的特性专门处理 vim 等命令，如提供额外的富文本编辑框。
* IOTerm 提供了补全与提示功能，但在形式上有所不同。
* 粘贴多行文本时， IOTerm 不会自动地逐行运行命令，而是将文本中的换行符处理为空格。

## 特性
* **自动换行**
* **模拟光标** 支持光标显示、闪烁以及键盘左右键控制光标移动。
* **输入法跟随** 输入时获得良好的输入体验。
* **复制和粘贴**
* **支持高亮**
* **支持滚动** 包括类似于终端的自动滚动和不滚动。
* **简单的交互** 命令运行时，用户也可以输入。
* **历史记录** 用法与真实的终端完全一样，还是熟悉的操作。
* **自动补全** 因地制宜地补全方式，使输入更加快捷！
* **自定义配色和字体**

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

3. [样例](https://github.com/kaiopen/IOTerm/tree/master/demo)。

### 后续工作
* 替换浏览器自有的滚动条，或提供自定义滚动条的接口，使 IOTerm 更好看。

### 方法
1. `end()`
当命令运行结束时，需调用该方法，告知 IOTerm 当前的状态，并且 IOTerm 会打印前缀。

2. `setColor({text, background}: {text?: string, background?: string})`
设置文本颜色或背景颜色。

3. `setCommandHandler(commandHandler: Function)`
设置命令处理函数。该函数有一个输入参数，为用户输入的字符串。它可能是正确的命令，例如“ls”、“cd ~/Documents”或者“python hello.py”，也可能是没有意义的字符串，例如“ ”， “！”或者“Hello World”。它还可能是命令运行时用户触发回车所输入的内容（可以用以实现交互）。

4. `setFont({family, size}: {family?: string, size?: string})`
设置字体或字号。

5. `setPrefix(html: string)`
设置前缀，可以包括虚拟环境、用户名、主机名、当前工作路径或指示器。`html`必须是`highlight`函数处理过的字符串。

6. `setTabHandler(tabHandler: Function)`
设置用于补全和提示的处理函数。该函数有两个输入参数，一是用户输入的内容，二是当前输入光标的位置。返回值必须是字符串数组，或者空数组。

7. `write(html: string)`
向 IOTerm 写入内容，并显示。`html`必须是`highlight`函数处理过的字符串。请勿使用“\\r\\n”、“\\r”或者 HTML 标签“<br>”作为换行符，而是使用“\\n”。

### 函数
1. `highlight(text: string, style?: string)`
高亮`text`字符串，可通过`style`定义字符串高亮样式。

### 协议
MIT License
