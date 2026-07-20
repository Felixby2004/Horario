const { promises: fs } = require('fs');
const path = require('path');
const { Document, Paragraph, HeadingLevel, Packer, TextRun } = require('docx');

async function simpleConvertMarkdownToDocx(mdFilePath, outputPath) {
  try {
    console.log(`Converting ${mdFilePath}...`);
    const mdContent = await fs.readFile(mdFilePath, 'utf8');
    const lines = mdContent.split('\n');
    const children = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trimEnd();

      if (line.startsWith('#')) {
        // Heading
        let level = 0;
        while (line.startsWith('#')) {
          level++;
          line = line.slice(1);
        }
        line = line.trim();
        if (line) {
          children.push(new Paragraph({
            text: line,
            heading: HeadingLevel[`HEADING_${level}`],
            spacing: { after: 200 }
          }));
        }
      } else if (line.startsWith('```')) {
        // Code block
        i++;
        let code = '';
        while (i < lines.length && !lines[i].startsWith('```')) {
          code += lines[i] + '\n';
          i++;
        }
        if (code) {
          children.push(new Paragraph({
            children: [new TextRun({ text: code, font: 'Courier New' })],
            shading: { type: 'solid', color: 'F0F0F0' },
            spacing: { after: 100 }
          }));
        }
      } else if (line.startsWith('---') || line.startsWith('***') || line.startsWith('___')) {
        // Horizontal rule
        children.push(new Paragraph({
          border: { bottom: { color: '000000', space: 1, style: 'single', size: 6 } },
          spacing: { before: 100, after: 100 }
        }));
      } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
        // Bullet list
        children.push(new Paragraph({
          text: line.slice(2),
          bullet: { level: 0 },
          spacing: { after: 50 }
        }));
      } else if (line.match(/^\d+\.\s/)) {
        // Ordered list
        children.push(new Paragraph({
          text: line.replace(/^\d+\.\s/, ''),
          spacing: { after: 50 }
        }));
      } else if (line.trim() === '') {
        // Empty line
        children.push(new Paragraph(''));
      } else {
        // Paragraph
        children.push(new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 100 }
        }));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
    console.log(`✓ Successfully converted to ${outputPath}`);
  } catch (error) {
    console.error('❌ Error converting file:', error);
  }
}

async function main() {
  const filesToConvert = [
    {
      input: path.join(__dirname, '../DIAGRAMA/6-manual-instalacion.md'),
      output: path.join(__dirname, '../DIAGRAMA/6-manual-instalacion.docx')
    },
    {
      input: path.join(__dirname, '../DIAGRAMA/7-manual-usuario.md'),
      output: path.join(__dirname, '../DIAGRAMA/7-manual-usuario.docx')
    }
  ];

  console.log('Starting conversion of Markdown files to DOCX...\n');

  for (const file of filesToConvert) {
    await simpleConvertMarkdownToDocx(file.input, file.output);
  }

  console.log('\n✅ All conversions completed!');
}

main().catch(console.error);
