# Fix for Tamil PDF OCR Issue

## Problem

The Tamil PDF is not being extracted properly because:
1. Your current Document AI processor is a **"SUMMARY_PROCESSOR"**
2. Summary processors don't support OCR configuration options
3. Tamil text in PDFs requires proper OCR processing

## Solution: Create an OCR Processor

### Step 1: Create OCR Processor in Google Cloud

1. Go to [Google Cloud Console → Document AI](https://console.cloud.google.com/ai/document-ai)

2. Click **"CREATE PROCESSOR"**

3. Select **"Document OCR"** (NOT Summary Processor)
   - This processor type supports:
     - ✅ 200+ languages including Tamil, Hindi, Telugu, Kannada, Malayalam
     - ✅ Language hints configuration
     - ✅ Native PDF parsing
     - ✅ Image OCR

4. Set up the processor:
   - **Processor name**: `multilingual-ocr` (or any name you prefer)
   - **Region**: Choose `us` or `eu` (match your DOCAI_LOCATION)
   - Click **"CREATE"**

5. Note the **Processor ID** (you'll see it in the URL or on the processor page)
   - Format: `abc123def456...`

### Step 2: Update Your Environment Variables

Edit your `.env` file:

```env
# Replace with your NEW OCR processor ID
DOCAI_PROCESSOR_ID=your_new_ocr_processor_id_here

# Keep the same location
DOCAI_LOCATION=us
```

### Step 3: Update the Code to Use Language Hints

Now that you have an OCR processor, we can add ba ck the language hints!

Edit `/src/ai/flows/process-document-flow.ts`:

```typescript
const request = {
  name,
  rawDocument: {
    content: b64part,
    mimeType: mimePart,
  },
  // NOW we can use OCR config with an OCR processor!
  processOptions: {
    ocrConfig: {
      languageHints: ['en', 'hi', 'ta', 'te', 'kn', 'ml'],
      enableNativePdfParsing: true,
    },
  },
};
```

### Step 4: Restart and Test

```bash
# Stop your dev server (Ctrl+C)
# Restart with new environment variables
npm run dev
```

Now upload your Tamil PDF again - it should extract the text properly!

---

## Alternative Solution: Try Different PDF Processing

If you can't create a new processor, try this workaround:

### Check if the PDF has selectable text

1. Open your Tamil PDF in a PDF viewer
2. Try to select the Tamil text with your mouse
3. **If you CAN select text**: The PDF has embedded text (good!)
4. **If you CANNOT select text**: The PDF is a scanned image (needs OCR)

### For PDFs with embedded text:

The Summary Processor should extract it. If it's not working, the issue might be:
- PDF encoding issues
- Font embedding problems
- The processor not recognizing Tamil Unicode

### For scanned PDFs:

You MUST use an OCR processor. The Summary Processor won't work for images.

---

## Why This Happened

| Processor Type | OCR Support | Language Hints | Tamil PDFs (Scanned) | Tamil PDFs (Text) |
|----------------|-------------|----------------|----------------------|-------------------|
| **OCR Processor** | ✅ Full | ✅ Yes | ✅ Works | ✅ Works |
| **Summary Processor** | ⚠️ Limited | ❌ No | ❌ Fails | ⚠️ Maybe |

Your current setup uses a Summary Processor, which:
- ✅ Can extract embedded text from PDFs
- ❌ Cannot do OCR on scanned images
- ❌ Doesn't support language hints
- ⚠️ May not handle Tamil Unicode properly

---

## Quick Test Commands

After creating the OCR processor, test with:

```bash
# Test with the new processor
# Upload a Tamil PDF through the UI
# Check the console for any errors
```

---

## Expected Behavior After Fix

✅ Tamil text extracted from PDFs
✅ Numbers AND Tamil characters visible
✅ All 6 languages (English, Hindi, Tamil, Telugu, Kannada, Malayalam) work
✅ Both scanned and text PDFs supported

---

## Need More Help?

**Check your current processor type:**

1. Go to [Document AI Console](https://console.cloud.google.com/ai/document-ai)
2. Find your processor (using the ID from your `.env`)
3. Check the "Type" field
4. If it says "SUMMARY_PROCESSOR" → You need to create an OCR processor
5. If it says "DOCUMENT_OCR" → The processor is correct, check other issues

---

**Date**: November 28, 2025  
**Issue**: Tamil PDF OCR not working  
**Root Cause**: Using SUMMARY_PROCESSOR instead of OCR_PROCESSOR  
**Solution**: Create Document OCR processor in Google Cloud
