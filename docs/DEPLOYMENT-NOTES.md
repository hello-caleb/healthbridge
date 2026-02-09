# Deployment Notes

## API Key Configuration

### Current State (Development)
Using personal/Workspace API key for development and testing.

### For Hackathon Demo
⚠️ **Before submitting to hackathon**, switch back to the Gemini hackathon credits:

1. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_GEMINI_API_KEY=<hackathon-api-key>
   ```

2. If the native audio model causes 1011 errors, the model is configured in:
   - `src/hooks/use-gemini-client.ts` (line ~22, `MODEL_CONFIG`)
   
   Change `primary` to the preview model if available:
   ```typescript
   primary: "models/gemini-2.5-flash-native-audio-preview-12-2025",
   ```

### Model Options
| Model | Status | Notes |
|-------|--------|-------|
| `gemini-2.0-flash-live-001` | Stable | Current config |
| `gemini-2.5-flash-native-audio-preview-12-2025` | Preview | Better transcription, may require access |

### Vercel Environment
Remember to update Vercel environment variables too:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_GEMINI_API_KEY`
