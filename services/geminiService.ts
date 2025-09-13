
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getMimeType = (base64: string): string => {
  return base64.substring(base64.indexOf(":") + 1, base64.indexOf(";"));
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const extractBase64Data = (base64: string): string => {
    return base64.substring(base64.indexOf(",") + 1);
}

const extractImageFromResponse = (response: GenerateContentResponse): string | null => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const mimeType = part.inlineData.mimeType;
            const base64Data = part.inlineData.data;
            return `data:${mimeType};base64,${base64Data}`;
        }
    }
    return null;
}

export const processImageFile = async (file: File): Promise<{ original: string, noBg: string }> => {
    const originalBase64 = await fileToBase64(file);
    const mimeType = getMimeType(originalBase64);
    const imageData = extractBase64Data(originalBase64);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { inlineData: { data: imageData, mimeType: mimeType } },
                { text: 'Flawlessly remove the background of this image, leaving only the main product subject. The output must have a transparent background.' },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const noBgBase64 = extractImageFromResponse(response);

    if (!noBgBase64) {
        throw new Error("AI failed to remove background. The product might be too complex or the image quality too low.");
    }

    return { original: originalBase64, noBg: noBgBase64 };
};

export const generatePoster = async (
    base64ProductImage: string,
    prompt: string,
    aspectRatio: string
): Promise<string> => {
    const mimeType = getMimeType(base64ProductImage);
    const imageData = extractBase64Data(base64ProductImage);

    const fullPrompt = `Create a professional, catchy, and market-ready poster for the provided product image.
    The creative direction is: "${prompt}".
    The poster's aspect ratio must be exactly ${aspectRatio}.
    The product image already has a transparent background; place it dynamically and intelligently within the new scene.
    Generate a complete poster with a suitable background, typography, and graphic elements that match the creative direction. Add punchy headlines or stylish captions if appropriate.
    The final design should be a visually stunning, scroll-stopping advertisement.
    Do not add any logos or QR codes unless specifically asked.
    Output only the final image.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { inlineData: { data: imageData, mimeType: mimeType } },
                { text: fullPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    const posterBase64 = extractImageFromResponse(response);

    if (!posterBase64) {
        throw new Error("AI failed to generate a poster. Try a different prompt or product image.");
    }
    
    return posterBase64;
};


export const translateText = async (
  text: string,
  targetLanguage: 'English' | 'Arabic'
): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Translate the following text to ${targetLanguage}. Provide only the translation, without any additional comments or quotation marks: "${text}"`,
    });
    return response.text.trim();
};
