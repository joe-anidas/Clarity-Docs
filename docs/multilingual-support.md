# Multilingual Support in ClarityDocs

## Overview

ClarityDocs now supports **multilingual document processing** using Google Cloud Document AI. Documents can be uploaded and processed in **English, Tamil, and Malayalam**.

## Currently Supported Languages

| Language   | Language Code | Native Script | Status |
|------------|---------------|---------------|--------|
| English    | `en`          | English       | ✅ Supported |
| Hindi      | `hi`          | हिन्दी         | ✅ Supported |
| Tamil      | `ta`          | தமிழ்          | ✅ Supported |
| Telugu     | `te`          | తెలుగు        | ✅ Supported |
| Kannada    | `kn`          | ಕನ್ನಡ         | ✅ Supported |
| Malayalam  | `ml`          | മലയാളം        | ✅ Supported |

## How It Works

### Document Processing Flow

1. **Upload**: User uploads a document (PDF, DOCX, or text file)
2. **OCR Processing**: Google Cloud Document AI extracts text using OCR
   - Language hints (`en`, `ta`, `ml`) guide the OCR engine
   - Auto-detection identifies the actual language(s) in the document
3. **Text Extraction**: Extracted text is processed regardless of language
4. **AI Analysis**: Gemini AI analyzes the extracted text and generates summaries

### Language Hints Configuration

The language hints are configured in `/src/ai/flows/process-document-flow.ts`:

```typescript
processOptions: {
  ocrConfig: {
    languageHints: ['en', 'hi', 'ta', 'te', 'kn', 'ml'], // English, Hindi, Tamil, Telugu, Kannada, Malayalam
    enableNativePdfParsing: true,
  },
}
```

**What are language hints?**
- They tell Document AI which languages to prioritize during OCR
- They improve accuracy for the specified languages
- Document AI can still detect other languages, but these get priority

## Adding More Languages

To add support for additional languages (e.g., Hindi, Kannada, Telugu):

### Step 1: Update the Language Hints

Edit `/src/ai/flows/process-document-flow.ts` and add the language code to the `languageHints` array:

```typescript
languageHints: ['en', 'ta', 'ml', 'hi', 'kn', 'te'], // Added Hindi, Kannada, Telugu
```

### Step 2: Common Indian Language Codes

| Language  | Code | Status in Document AI |
|-----------|------|-----------------------|
| English   | `en` | ✅ Fully Supported     |
| Hindi     | `hi` | ✅ Fully Supported     |
| Tamil     | `ta` | ✅ Fully Supported     |
| Malayalam | `ml` | ✅ Fully Supported     |
| Telugu    | `te` | ✅ Fully Supported     |
| Kannada   | `kn` | ✅ Fully Supported     |
| Bengali   | `bn` | ✅ Fully Supported     |
| Marathi   | `mr` | ✅ Fully Supported     |
| Gujarati  | `gu` | ✅ Fully Supported     |
| Punjabi   | `pa` | ✅ Fully Supported     |

### Step 3: Test the Changes

1. Upload a document in the new language
2. Verify that text is extracted correctly
3. Check that the AI summary is generated properly

## Technical Details

### Google Cloud Document AI

- **Service**: OCR Processor (General)
- **Supported Languages**: 200+ languages including all major Indian languages
- **API Documentation**: [Document AI OCR](https://cloud.google.com/document-ai/docs/languages)

### Configuration Location

The Document AI configuration is in:
- **File**: `/src/ai/flows/process-document-flow.ts`
- **Function**: `processDocumentFlow`
- **Environment Variables**: `.env` file
  - `GCLOUD_PROJECT`: Your GCP project ID
  - `DOCAI_PROCESSOR_ID`: OCR processor ID
  - `DOCAI_LOCATION`: Processor location (e.g., 'us', 'eu')

### AI Summary Generation

After text extraction, Gemini AI generates the summary. Gemini supports multiple languages natively, so:
- Tamil and Malayalam text will be analyzed correctly
- Summaries can be generated in the same language as the input
- Translation capabilities are built-in to Gemini

## Limitations & Considerations

### 1. **OCR Accuracy**
- Accuracy depends on document quality (scan resolution, clarity)
- Handwritten text has lower accuracy than printed text
- Mixed-language documents are supported but may need testing

### 2. **AI Understanding**
- Gemini AI is trained on multilingual data
- Legal terminology accuracy may vary by language
- English legal terms have the most training data

### 3. **UI Language**
- Currently, the UI is in English
- Document content can be in Tamil/Malayalam
- Consider adding UI translations for better UX

## Testing with Tamil/Malayalam Documents

### Test Scenarios

1. **Pure Tamil Document**: Upload a rental agreement in Tamil
2. **Pure Malayalam Document**: Upload a loan agreement in Malayalam
3. **Mixed Language**: Document with both English and Tamil/Malayalam
4. **Scanned vs Digital**: Test both scanned PDFs and digital documents

### Expected Behavior

- ✅ Text should be extracted accurately
- ✅ AI should identify key clauses regardless of language
- ✅ Summary generation should work (may be in English or source language)
- ✅ Translation features should handle the extracted text

## Troubleshooting

### Text Not Extracted Correctly

**Problem**: OCR fails or extracts garbled text

**Solutions**:
1. Ensure document quality is good (min 300 DPI for scans)
2. Verify language code is correct in `languageHints`
3. Check Document AI quota in Google Cloud Console
4. Review Document AI processor logs

### Summary Generation Issues

**Problem**: AI summary is incorrect or incomplete

**Solutions**:
1. Check if text was extracted correctly (review extracted text)
2. Ensure Gemini API has multilingual capabilities enabled
3. Consider fine-tuning prompts for non-English content
4. Test with smaller document sections first

## Future Enhancements

- [ ] Add UI language selector (i18n)
- [ ] Support for more regional languages
- [ ] Language-specific legal term dictionaries
- [ ] Automatic language detection display
- [ ] Per-user language preferences
- [ ] Real-time translation in summaries

## Resources

- [Google Cloud Document AI Documentation](https://cloud.google.com/document-ai/docs)
- [Supported Languages List](https://cloud.google.com/document-ai/docs/languages)
- [Gemini API Multilingual Support](https://ai.google.dev/docs/gemini_api_overview)
- [BCP 47 Language Codes](https://en.wikipedia.org/wiki/IETF_language_tag)

---

**Last Updated**: November 28, 2025  
**Version**: 1.0.0
