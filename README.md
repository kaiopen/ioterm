IOTerm 不是运行于前端的终端，而是一个”不忠诚“的前端模拟终端组件。IOTerm 提供并保证正常的输入（I）和正确的显示（O）。

[English](https://github.com/kaiopen/IOTerm/blob/master/README-EN.md)

### 定位和声明
IOTerm 参考了 [XTerm.js](https://github.com/xtermjs/xterm.js) 和 [简诗](https://github.com/moyuer1992/-jianshi)，感谢这些优秀项目的开源。若需性能好、功能完备前端终端，请使用 [XTerm.js](https://github.com/xtermjs/xterm.js)。

### ”不忠诚“的模拟终端
* IOTerm 不处理任何数据，但提供输入与输出的接口供使用者完成数据处理功能。
* IOTerm 仅支持单行输入的交互功能，而不支持如 vim 等复杂交互功能。建议结合 Web 的特性专门处理 vim 等命令，如提供额外的富文本编辑框。
* IOTerm 需使用者实现相应规则的接口以完善自动补全功能。结合 Web 特性，补全形式将有所不同。
* 复制与粘贴功能存在差异。

## 特性
* **自动换行** 理所应当的功能。
* **模拟光标** 支持光标显示、闪烁以及键盘左右键控制光标移动。
* **支持滚动** 包括类似于终端的自动滚动和不滚动。
* **支持高亮** 插入 HTML 标签，以实现高亮。
* **输入法跟随** 输入时获得良好的视觉和输入体验。
* **简单的交互** 命令运行时，用户也可以输入。
* **自定义配色** 颜色随心搭配，怎么舒服怎么来！
* **复制和粘贴** 换行符会被替换为空格。
* **历史记录** 用法与真实的终端完全一样，还是熟悉的操作。
* **自动补全** 因地制宜地补全方式，使输入更加快捷！

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
* Tab 键补全：在用户目录下维护用户常用路径文件
* 动态调整大小时，更新自动换行

### 协议
MIT License
