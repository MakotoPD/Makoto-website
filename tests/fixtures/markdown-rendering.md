# Markdown Rendering Test

## Headers

### Level 3 Header
#### Level 4 Header
##### Level 5 Header
###### Level 6 Header

## Text Formatting

This is **bold text** and __also bold__.

This is *italic text* and _also italic_.

This is ***bold and italic*** and ___also works___.

This is ~~strikethrough text~~.

This is `inline code` in text.

## Lists

### Unordered List

- First item
- Second item
  - Subitem 2.1
  - Subitem 2.2
    - Nested item 2.2.1
- Third item

### Ordered List

1. First step
2. Second step
   1. Substep 2.1
   2. Substep 2.2
3. Third step

### Task List

- [x] Completed task
- [ ] Task to do
- [x] Another completed task

## Alerts

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!SUCCESS]
> Highlights information that users should take into account, even when skimming.

> [!INFO]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And multiple paragraphs.

> Nested blockquote:
>> This is a quote inside a quote.

## Links and Images

[Link to Google](https://www.google.com)

[Link with title](https://www.example.com "Link title")

## Code

### Code Blocks with Syntax Highlighting

```javascript
function greeting(name) {
  console.log(`Hello, ${name}!`);
  return true;
}

greeting("World");
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}
```

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|:--------:|---------:|
| Cell 1   | Cell 2   | Cell 3   |
| Left     | Center   | Right    |
| Data A   | Data B   | Data C   |

## Horizontal Rule

---

## Special Characters and HTML

This is text with &copy; copyright symbol.

<kbd>Ctrl</kbd> + <kbd>C</kbd>

<mark>Highlighted text</mark>

H<sub>2</sub>O (subscript)

X<sup>2</sup> (superscript)

## Escaping Characters

You can use \* asterisks \* without formatting.

Backslash: \\

## Automatic Links

https://www.example.com

email@example.com

## Emoji

Unicode: 😀 ❤️ 🚀 🇺🇸

## End of Test

This was a complete test of various Markdown elements!
