IOTerm 是一个简单、需继续定制化开发的前端终端模拟组件。除了仅 500 行代码，包含十分之一的注释之外，简单更体现在 IOTerm 只保证正常的输入（I）和正确的显示（O），而将更多功能以接口的方式留给使用者继续定制化开发。

[English](https://github.com/kaiopen/IOTerm/blob/master/README-EN.md)

### 定位和声明
* IOTerm 仅提供终端页面的显示和保证正常的输入和正确的显示，具体的输入数据处理、命令执行、网络传输等功能由使用者决定。
* IOTerm 参考了 [XTerm.js](https://github.com/xtermjs/xterm.js) 和 [简诗](https://github.com/moyuer1992/-jianshi)，感谢这些优秀项目的开源。
* IOTerm 没有使用 &lt;canvas&gt; 标签的主要原因是本人对 &lt;canvas&gt; 标签不是很熟悉，而选用了能够满足徐需求的 &lt;pre&gt; 标签。
* IOTerm 不支持具有多行输入与交互功能的 vim 和 tmux 等，而只能在最后一行进行输入。它更像是一个只能在最后输入数据的文本框。

## 特性
* **自动换行** 
* **模拟光标** 支持光标显示、闪烁以及键盘左右键控制光标移动
* **支持滚动** 包括类似于终端的自动滚动和不滚动
* **支持高亮** 插入 HTML 标签，以实现高亮
* **输入法跟随** 输入时获得良好的视觉和输入体验
* **简单的交互** 命令运行时，用户也可以输入
* **自定义配色** 颜色随心搭配，怎么舒服怎么来

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
* 复制：去除复制的内容中由换行符 &lt;br&gt; 导致的空格
* 粘贴：处理粘贴的内容中的换行符
* 历史功能
* Tab 键补全
* 动态调整大小时，更新自动换行

### 协议
MIT License
