const pdfParse = require('pdf-parse');

async function extractText(buffer) {
  const { text } = await pdfParse(buffer);
  return text.trim();
}

module.exports = { extractText };
