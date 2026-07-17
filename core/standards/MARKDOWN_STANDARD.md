# Markdown Standard

## Purpose
Defines the single standard for all Markdown documentation in Storynaram. Every .md file must conform to these rules.

## File Extension
- .md only â€” never .markdown, .mdown, .mdwn

## Encoding
- UTF-8 without BOM â€” same as JSON standard

## Headings
- Use ATX-style headings: #, ##, ###, ####, #####, ######
- No Setext-style headings (underlined with === or ---)
- First line of every document should be a level-1 heading
- No space between # and text: # Title (correct), NOT #Title
- Heading hierarchy must not skip levels (no # H1 followed by ### H3)
- Maximum heading depth: ###### (level 6)

## Paragraphs
- Separate paragraphs by a single blank line
- No indentation of paragraph text
- No trailing whitespace on any line
- Line length: aim for under 100 characters per line, but no hard limit

## Formatting
- **Bold**: **text** â€” two asterisks, not underscore
- *Italic*: *text* â€” single asterisk, not underscore
- ***Bold Italic***: ***text***
- Inline code: backticks â€” ` code `
- ~~Strikethrough~~: ~~text~~
- Links: [text](url) â€” descriptive link text, never "click here"
- Images: ![alt text](url) â€” always include alt text

## Lists
### Unordered
- Use - for list items â€” not * or +
- Sub-lists: indent 2 spaces
- Blank line before and after lists

### Ordered
- Use 1. for all items (Markdown auto-numbers)
- Sub-lists: indent 3 spaces
- Blank line before and after ordered lists

## Code Blocks
- Use fenced code blocks with language specifier:
  `json
  { "key": "value" }
  `
- Indented code blocks (4 spaces) are not permitted
- Always specify the language â€” if unknown, use 	ext
- No trailing content after the opening fence

## Tables
- Use pipes and dashes:
  `markdown
  | Header 1 | Header 2 |
  |----------|----------|
  | Cell 1   | Cell 2   |
  `
- Alignment: left-align by default â€” no colons needed
- Tables must have a header row and separator row
- No empty cells â€” use â€” (em dash) if not applicable

## Blockquotes
- Use > for blockquotes
- Continuation lines: > at start of each line
- Nested blockquotes: >>

## Horizontal Rules
- Use --- â€” three dashes
- Blank line before and after
- No more than one per document section

## Links
- Reference-style links preferred for repeated references: [text][ref] then [ref]: url
- Inline links for one-time references: [text](url)
- Anchor links: [section](#section-name) â€” lowercase, hyphenated
- All URLs must use HTTPS where available

## Front Matter
- YAML front matter between --- delimiters for document metadata
- Supported fields: 	itle, description, ersion, status, created, updated, uthor
- Front matter is optional for content files, required for formal documents

## File Organization
- One blank line at end of every .md file
- Sections separated by horizontal rules or two blank lines
- Table of contents at top for documents over 100 lines
- Use anchor links in table of contents

## Reserved Words in Headings
- "Purpose" â€” every document should have a Purpose section
- "See Also" â€” for cross-references at document end
- "Examples" â€” for example sections
- "Rules" â€” for rule enumerations
