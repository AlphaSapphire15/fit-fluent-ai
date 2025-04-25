
/**
 * Converts an image to a properly formatted format for OpenAI
 */
export async function prepareImageForAnalysis(inputBase64OrFile: string | File): Promise<string> {
  // If it's already a string (base64)
  if (typeof inputBase64OrFile === "string") {
    // Check if it's already in the right format
    if (/^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(inputBase64OrFile)) {
      return inputBase64OrFile;
    } 
    
    // It's a base64 string but in an unsupported format, convert to PNG
    console.log("Converting non-standard base64 image to PNG");
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = inputBase64OrFile;
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context error");
    
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  } 
  
  // If it's a file, convert to base64
  console.log("Converting File to base64");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target?.result as string;
      
      // For non-PNG/JPEG formats, convert to PNG
      if (!base64.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
        console.log("Converting non-standard file format to PNG");
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error("Canvas context error"));
          
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = base64;
      } else {
        resolve(base64);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(inputBase64OrFile);
  });
}
