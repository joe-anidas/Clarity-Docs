# Testing Multilingual Support

## Quick Test Guide for Tamil and Malayalam Documents

This guide will help you verify that Tamil and Malayalam document processing is working correctly in ClarityDocs.

## Before You Start

Ensure you have:
- ✅ Updated `/src/ai/flows/process-document-flow.ts` with language hints
- ✅ Google Cloud Document AI configured with an OCR processor
- ✅ Valid Google Cloud credentials in your `.env` file
- ✅ Genkit AI server running (`npm run genkit:dev`)
- ✅ Next.js dev server running (`npm run dev`)

## Test Scenarios

### Test 1: Pure Tamil Document 📄

**Sample Tamil Text (Rental Agreement Excerpt):**
```
குத்தகை ஒப்பந்தம்

இந்த ஒப்பந்தம் இன்று தேதியிட்டது.

குத்தகைதாரர் மாதம் ரூ. 15,000 வாடகையை செலுத்த வேண்டும். 
வாடகை ஒவ்வொரு மாதமும் 5-ம் தேதிக்குள் செலுத்தப்பட வேண்டும்.

குத்தகை காலம்: 11 மாதங்கள்
முன்னறிவிப்பு காலம்: 3 மாதங்கள்
```

**Steps:**
1. Go to `http://localhost:9002/clarity`
2. Click "Upload Document" or paste the Tamil text above
3. Verify that text is extracted correctly
4. Check that AI generates a summary (may be in English or Tamil)
5. Review the Do's and Don'ts list

**Expected Results:**
- ✅ Tamil text extracted without errors
- ✅ Key information identified (rent amount, dates)
- ✅ Summary generated successfully
- ✅ Lock-in period and notice period extracted

---

### Test 2: Pure Malayalam Document 📄

**Sample Malayalam Text (Loan Agreement Excerpt):**
```
വായ്പാ കരാർ

ഈ കരാർ ഇന്ന് തീയതിയിട്ടത്.

വായ്പ തുക: രൂപ 5,00,000
പലിശ നിരക്ക്: 9.5% പ്രതിവർഷം
തിരിച്ചടവ് കാലാവധി: 60 മാസം

പ്രതിമാസ ഗഡു (EMI): രൂപ 10,500
കാലതാമസ ഫീസ്: 2% പ്രതിദിനം
```

**Steps:**
1. Go to `http://localhost:9002/clarity`
2. Select "Loan Agreement" from the agreement type dropdown
3. Paste the Malayalam text above or upload a Malayalam PDF
4. Click "Simplify Pasted Text"
5. Wait for processing to complete

**Expected Results:**
- ✅ Malayalam text extracted correctly
- ✅ Loan details identified (amount, interest rate, EMI)
- ✅ Risk score calculated
- ✅ Timeline extracted with repayment schedule

---

### Test 3: Mixed Language Document (English + Tamil) 📄

**Sample Mixed Text:**
```
RENTAL AGREEMENT / குத்தகை ஒப்பந்தம்

This agreement is made on 15th January, 2024
இந்த ஒப்பந்தம் ஜனவரி 15, 2024 அன்று செய்யப்பட்டது

Monthly Rent: Rs. 15,000
மாதாந்திர வாடகை: ரூ. 15,000

Lock-in Period: 11 months / பூட்டு காலம்: 11 மாதங்கள்
Notice Period: 3 months / முன்னறிவிப்பு: 3 மாதங்கள்

Terms and Conditions / விதிமுறைகள்:
1. The tenant shall pay rent on or before the 5th of every month
   குத்தகைதாரர் ஒவ்வொரு மாதமும் 5-ம் தேதிக்குள் வாடகை செலுத்த வேண்டும்
```

**Steps:**
1. Upload or paste the mixed language text
2. Select appropriate agreement type
3. Generate summary

**Expected Results:**
- ✅ Both English and Tamil text extracted
- ✅ Key dates and amounts from both languages identified
- ✅ Coherent summary generated
- ✅ No garbled or corrupted text

---

### Test 4: Scanned Document (Image OCR) 📸

**Preparation:**
1. Create a simple document in Tamil or Malayalam
2. Take a photo or screenshot (JPEG/PNG format)
3. Ensure good lighting and clarity (minimum 300 DPI recommended)

**Steps:**
1. Click "Upload Document (PDF, JPG, PNG, etc.)"
2. Select your Tamil/Malayalam image file
3. Wait for OCR processing
4. Review extracted text quality

**Expected Results:**
- ✅ Document AI processes the image
- ✅ Text extracted from image accurately
- ✅ Special characters (Tamil/Malayalam script) rendered correctly
- ✅ Summary generated from OCR text

---

## Troubleshooting

### Problem: Text Not Extracted Correctly

**Symptoms:**
- Garbled characters
- Missing text
- Wrong language detected

**Solutions:**
1. **Check image quality**
   ```bash
   # For scanned images, ensure minimum 300 DPI
   # Use image editing tools to enhance contrast if needed
   ```

2. **Verify language hints are configured**
   ```bash
   # View the process-document-flow.ts file
   cat src/ai/flows/process-document-flow.ts | grep -A 5 "languageHints"
   ```
   Should show: `languageHints: ['en', 'ta', 'ml']`

3. **Check Document AI logs**
   - Go to Google Cloud Console
   - Navigate to Document AI → Processors
   - Check processing logs for errors

4. **Test with English first**
   - Upload a simple English document
   - If English works but Tamil/Malayalam doesn't, check language configuration

---

### Problem: Summary Not Generated

**Symptoms:**
- Text extracted successfully
- But summary fails or is incomplete

**Solutions:**
1. **Check Genkit server is running**
   ```bash
   # Should be running on port 4000
   lsof -i :4000
   ```

2. **Review Genkit logs**
   - Check the terminal running `npm run genkit:dev`
   - Look for error messages about Gemini API

3. **Verify Gemini API key**
   ```bash
   # Check .env file
   grep GEMINI_API_KEY .env
   ```

4. **Gemini API multilingual support**
   - Gemini 2.5 Flash natively supports Tamil and Malayalam
   - The summary may be in English even if the source is Tamil/Malayalam
   - This is normal behavior

---

### Problem: Wrong Language Detected

**Symptoms:**
- Document says it's in English but contains Tamil
- Or vice versa

**Solutions:**
1. **Language hints priority**
   - Document AI uses hints as suggestions, not requirements
   - It will detect the actual language, but hints improve accuracy
   
2. **Adjust language hints order**
   ```typescript
   // In process-document-flow.ts
   // Put most common language first
   languageHints: ['ta', 'en', 'ml'], // If Tamil is primary
   ```

3. **Add more language hints**
   ```typescript
   // Support more Indian languages
   languageHints: ['en', 'ta', 'ml', 'hi', 'kn', 'te'],
   ```

---

## Validation Checklist

Before marking the feature as complete, verify:

- [ ] **English documents** process correctly (baseline test)
- [ ] **Pure Tamil documents** extract and summarize successfully
- [ ] **Pure Malayalam documents** extract and summarize successfully
- [ ] **Mixed language documents** (English + Tamil/Malayalam) work
- [ ] **Scanned images** with Tamil/Malayalam text are OCR'd correctly
- [ ] **PDF documents** in Tamil/Malayalam are processed
- [ ] **UI displays** Tamil/Malayalam characters without corruption
- [ ] **Special characters** (Tamil/Malayalam unicode) render properly
- [ ] **Risk scores** generate for non-English documents
- [ ] **Timeline extraction** works with Tamil/Malayalam dates
- [ ] **Document history** displays Tamil/Malayalam content correctly
- [ ] **Edit feature** preserves Tamil/Malayalam text

---

## Performance Benchmarks

Expected processing times (approximate):

| Document Type | Size | Language | Expected Time |
|---------------|------|----------|---------------|
| Text (pasted) | 1-5 pages | Any | 3-10 seconds |
| PDF | 1-5 pages | English | 10-20 seconds |
| PDF | 1-5 pages | Tamil/Malayalam | 15-25 seconds |
| Image (JPG/PNG) | Clear scan | English | 15-30 seconds |
| Image (JPG/PNG) | Clear scan | Tamil/Malayalam | 20-35 seconds |

**Note:** First-time processing may take longer due to cold starts.

---

## Example Test Documents

### Where to Find Test Documents

1. **Create your own:**
   - Write a simple rental agreement in Tamil/Malayalam
   - Use Google Docs with Tamil/Malayalam keyboard
   - Export as PDF or take a screenshot

2. **Use online templates:**
   - Search for "Tamil rental agreement sample"
   - Search for "Malayalam loan agreement template"

3. **Generate with AI:**
   - Ask ChatGPT or Gemini to generate a sample document in Tamil/Malayalam
   - Use prompts like: "Create a simple rental agreement in Tamil"

---

## Continuous Testing

### Automated Testing (Future Enhancement)

Consider creating automated tests:

```typescript
// Example test case structure
describe('Multilingual Document Processing', () => {
  test('should extract Tamil text correctly', async () => {
    const tamilText = "குத்தகை ஒப்பந்தம்...";
    const result = await processDocumentAction({ fileDataUri: /* ... */ });
    expect(result.documentText).toContain("குத்தகை");
  });

  test('should extract Malayalam text correctly', async () => {
    const malayalamText = "വായ്പാ കരാർ...";
    const result = await processDocumentAction({ fileDataUri: /* ... */ });
    expect(result.documentText).toContain("വായ്പാ");
  });
});
```

---

## Support Resources

- **Google Cloud Document AI Languages**: https://cloud.google.com/document-ai/docs/languages
- **Gemini API Multilingual**: https://ai.google.dev/gemini-api/docs
- **Tamil Unicode**: U+0B80 to U+0BFF
- **Malayalam Unicode**: U+0D00 to U+0D7F

---

**Last Updated**: November 28, 2025  
**Version**: 1.0.0
