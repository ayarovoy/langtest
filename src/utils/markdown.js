const escapeHtml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const applyInlineMarkdown = (value) => {
    return value
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
};
export const renderMarkdown = (markdown) => {
    const lines = markdown.split('\n');
    const blocks = [];
    let paragraph = [];
    let listItems = [];
    const flushParagraph = () => {
        if (!paragraph.length)
            return;
        blocks.push(`<p>${paragraph.join('<br />')}</p>`);
        paragraph = [];
    };
    const flushList = () => {
        if (!listItems.length)
            return;
        blocks.push(`<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`);
        listItems = [];
    };
    for (const rawLine of lines) {
        const line = applyInlineMarkdown(escapeHtml(rawLine.trim()));
        if (!line) {
            flushParagraph();
            flushList();
            continue;
        }
        if (line.startsWith('### ')) {
            flushParagraph();
            flushList();
            blocks.push(`<h5>${line.slice(4)}</h5>`);
            continue;
        }
        if (line.startsWith('## ')) {
            flushParagraph();
            flushList();
            blocks.push(`<h4>${line.slice(3)}</h4>`);
            continue;
        }
        if (line.startsWith('# ')) {
            flushParagraph();
            flushList();
            blocks.push(`<h3>${line.slice(2)}</h3>`);
            continue;
        }
        if (line.startsWith('- ')) {
            flushParagraph();
            listItems.push(line.slice(2));
            continue;
        }
        flushList();
        paragraph.push(line);
    }
    flushParagraph();
    flushList();
    return blocks.join('');
};
