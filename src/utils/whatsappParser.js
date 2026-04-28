exports.cleanWhatsAppChat = (rawTextString) => {
  if (!rawTextString) return '';

  // 1. Remove standard WhatsApp timestamps (e.g., [12/04/24, 10:30:00 AM] or 12/04/2024, 10:30 - )
  let cleanedText = rawTextString.replace(/\[?\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}[,\]]?\s*\d{1,2}:\d{2}(:\d{2})?\s*([aApP][mM])?\]?\s*[-:]?\s*/g, '');

  // 2. Remove Media tags
  cleanedText = cleanedText.replace(/<Media omitted>/gi, '[Image/Video Shared]');
  cleanedText = cleanedText.replace(/image omitted/gi, '[Image Shared]');

  // 3. Remove empty lines and trim whitespace
  cleanedText = cleanedText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  // 4. Token safeguard: Slice to maximum roughly 3000 words to ensure it fits in AI context limits
  const words = cleanedText.split(' ');
  if (words.length > 3000) {
    return words.slice(words.length - 3000).join(' '); // Keep the most recent 3000 words!
  }

  return cleanedText;
};