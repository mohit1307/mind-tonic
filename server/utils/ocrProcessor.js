const path = require('path');
const fs = require('fs');

/**
 * Intelligent OCR & Receipt Data Extraction Engine
 * Uses Tesseract.js for text recognition with regex heuristic parsing
 * to automatically capture amounts, merchant/college names, dates, and categories.
 */
class OCRProcessor {
  /**
   * Parse structured receipt/bill fields from raw text
   *
   * @param {string} text - Raw OCR text
   * @returns {Object} Structured data: { amount, currency, vendor, date, detectedCategory, confidence, lineItems }
   */
  extractStructuredData(text) {
    if (!text || typeof text !== 'string') {
      return {
        amount: null,
        currency: 'INR',
        vendor: '',
        date: null,
        detectedCategory: 'other',
        confidence: 0,
        lineItems: [],
      };
    }

    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let amount = null;
    let currency = 'INR';
    let vendor = '';
    let extractedDate = null;
    let detectedCategory = 'other';
    const lineItems = [];

    // Currency detection
    if (/[$]|usd/i.test(text)) currency = 'USD';
    else if (/€|eur/i.test(text)) currency = 'EUR';
    else if (/£|gbp/i.test(text)) currency = 'GBP';
    else currency = 'INR';

    // 1. Amount Extraction (Prioritize lines with "total", "grand total", "net payable", "amount paid", "fees paid")
    const totalRegex = /(?:grand\s*total|net\s*payable|total\s*amount|amount\s*paid|fees?\s*paid|total|balance\s*due|paid)[:\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;

    for (const line of lines) {
      const match = line.match(totalRegex);
      if (match && match[1]) {
        const cleaned = match[1].replace(/,/g, '');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed > 0) {
          amount = parsed;
          break;
        }
      }
    }

    // Fallback: If no explicit "total" line found, find the largest monetary number in the document
    if (!amount) {
      const anyPriceRegex = /[₹$€£]?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]{2,6}(?:\.[0-9]{2})?)/g;
      let maxPrice = 0;
      let match;
      while ((match = anyPriceRegex.exec(text)) !== null) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(val) && val > maxPrice && val < 10000000) {
          maxPrice = val;
        }
      }
      if (maxPrice > 0) amount = maxPrice;
    }

    // 2. Vendor / Institution Extraction
    // Top 3 lines usually contain the merchant, store, or college name
    for (let i = 0; i < Math.min(4, lines.length); i++) {
      const candidate = lines[i];
      // Skip lines that look like dates, phone numbers, or pure numbers
      if (
        !/^[0-9\W]+$/.test(candidate) &&
        !/\b(?:invoice|receipt|tax|bill|date|tel|phone|gst|gstin|pan)\b/i.test(candidate) &&
        candidate.length > 2
      ) {
        vendor = candidate;
        break;
      }
    }

    // Keyword detection for vendor if still empty
    if (!vendor) {
      for (const line of lines) {
        if (/\b(?:college|university|institute|school|academy|store|mart|cafe|hospital|ltd|pvt)\b/i.test(line)) {
          vendor = line;
          break;
        }
      }
    }

    // 3. Date Extraction
    const datePatterns = [
      // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
      /\b([0-3]?[0-9])[/\-.]([0-1]?[0-9])[/\-.](20\d{2}|\d{2})\b/,
      // YYYY-MM-DD
      /\b(20\d{2})[/\-.]([0-1]?[0-9])[/\-.]([0-3]?[0-9])\b/,
      // DD Mon YYYY (e.g. 15 Oct 2026, 05-Nov-2026)
      /\b([0-3]?[0-9])[\s\-]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-]+(20\d{2})\b/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const parsed = new Date(match[0]);
          if (!isNaN(parsed.getTime())) {
            extractedDate = parsed;
            break;
          }
        } catch {
          // Continue to next pattern
        }
      }
    }

    // 4. Category Classification from Keywords
    const lower = text.toLowerCase();
    if (
      lower.includes('tuition') ||
      lower.includes('semester fee') ||
      lower.includes('college fee') ||
      lower.includes('exam fee') ||
      lower.includes('admission fee') ||
      lower.includes('university') ||
      lower.includes('challan')
    ) {
      detectedCategory = 'college_fee';
    } else if (
      lower.includes('book') ||
      lower.includes('stationery') ||
      lower.includes('pen') ||
      lower.includes('notebook') ||
      lower.includes('xerox') ||
      lower.includes('print') ||
      lower.includes('photocopy')
    ) {
      detectedCategory = 'books_stationery';
    } else if (
      lower.includes('restaurant') ||
      lower.includes('cafe') ||
      lower.includes('food') ||
      lower.includes('canteen') ||
      lower.includes('mess') ||
      lower.includes('burger') ||
      lower.includes('pizza') ||
      lower.includes('coffee') ||
      lower.includes('swiggy') ||
      lower.includes('zomato')
    ) {
      detectedCategory = 'food';
    } else if (
      lower.includes('uber') ||
      lower.includes('ola') ||
      lower.includes('metro') ||
      lower.includes('railway') ||
      lower.includes('bus') ||
      lower.includes('auto') ||
      lower.includes('fuel') ||
      lower.includes('petrol')
    ) {
      detectedCategory = 'transport';
    } else if (
      lower.includes('rent') ||
      lower.includes('hostel') ||
      lower.includes('pg') ||
      lower.includes('maintenance')
    ) {
      detectedCategory = 'housing_rent';
    } else if (
      lower.includes('electricity') ||
      lower.includes('wifi') ||
      lower.includes('broadband') ||
      lower.includes('recharge') ||
      lower.includes('airtel') ||
      lower.includes('jio')
    ) {
      detectedCategory = 'utilities';
    }

    // Line items (lines that have text and a number)
    lines.forEach((line) => {
      if (/\d+/.test(line) && line.length > 5 && line.length < 80) {
        lineItems.push(line);
      }
    });

    let confidence = 0.5;
    if (amount) confidence += 0.25;
    if (vendor) confidence += 0.15;
    if (extractedDate) confidence += 0.1;

    return {
      amount,
      currency,
      vendor: vendor.slice(0, 80),
      date: extractedDate || new Date(),
      detectedCategory,
      confidence: Number(confidence.toFixed(2)),
      lineItems: lineItems.slice(0, 10),
    };
  }

  /**
   * Process an uploaded file using Tesseract.js (or fallback for mock/unsupported files)
   *
   * @param {string} filePath - Absolute path to uploaded image/pdf
   * @param {string} fileType - MIME type
   * @returns {Promise<Object>} { ocrText, ocrData }
   */
  async processFile(filePath, fileType) {
    // Only process images with Tesseract (PDFs require pdf-parse or rendered canvases)
    const isImage = fileType.startsWith('image/');

    if (!isImage) {
      return {
        ocrText: 'Non-image document (PDF/binary). Text extraction skipped.',
        ocrData: {
          amount: null,
          currency: 'INR',
          vendor: '',
          date: new Date(),
          detectedCategory: 'other',
          confidence: 0,
          lineItems: [],
        },
      };
    }

    try {
      const Tesseract = require('tesseract.js');
      const { data } = await Tesseract.recognize(filePath, 'eng', {
        logger: () => {}, // suppress verbose progress in tests
      });

      const ocrText = data.text || '';
      const ocrData = this.extractStructuredData(ocrText);

      return {
        ocrText,
        ocrData,
      };
    } catch (error) {
      console.warn('Tesseract OCR recognition error, falling back to file heuristics:', error.message);
      return {
        ocrText: `OCR processing failed: ${error.message}`,
        ocrData: {
          amount: null,
          currency: 'INR',
          vendor: '',
          date: new Date(),
          detectedCategory: 'other',
          confidence: 0,
          lineItems: [],
        },
      };
    }
  }
}

module.exports = new OCRProcessor();
