function getScrollWidth() {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.width = '100px';
    container.style.overflow = 'scroll';

    const content = document.createElement('div');
    content.style.width = '100%';

    document.body.append(container);
    container.append(content);
    const scrollWidth = container.offsetWidth - content.offsetWidth;
    content.remove();
    container.remove();
    return scrollWidth;
}

function highlightChar(char: string, style?: string) {
    if (style === void 0) {
        return '<span>' + char + '</span>';
    } else {
        return '<span style="' + style + '">' + char + '</span>';
    }
}

function highlight(text: string, style?: string) {
    let html = '';
    let char: string;
    for (let i = 0; i < text.length;) {
        char = text.charAt(i);
        switch (char) {
        case ' ':
            html += highlightChar('&nbsp;', style);
            i++;
            break;
        case '<':
            html += highlightChar('&lt;', style);
            i++;
            break;
        case '>':
            html += highlightChar('&gt;', style);
            i++;
            break;
        case '&':
            html += highlightChar('&amp;', style);
            i++;
            break;
        case '\n':
            html += '\n';
            i++;
            break;
        default:
            html += highlightChar(char, style);
            i++;
        }
    }
    return html;
}

export { getScrollWidth, highlight };
