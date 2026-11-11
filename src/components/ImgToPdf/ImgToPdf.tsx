import jsPDF from "jspdf";

export const compressImage = (
  file: File,
  quality = 0.6
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0);

      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
  });
};

export const rotateImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.height;
        canvas.height = img.width;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create a canvas context to rotate the image."));
          return;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load the image for rotation."));
    img.src = src;
  });
};

export const generatePDF = async (
  images: string[],
  orientation: "p" | "l"
) => {
  const pdf = new jsPDF(orientation, "mm", "a4");

  const pdfWidth = orientation === "p" ? 210 : 297;
  const pdfHeight = orientation === "p" ? 297 : 210;

  for (let i = 0; i < images.length; i++) {
    const img = new Image();
    img.src = images[i];

    await new Promise((resolve) => {
      img.onload = () => {
        const ratio = Math.min(
          pdfWidth / img.width,
          pdfHeight / img.height
        );

        const width = img.width * ratio;
        const height = img.height * ratio;

        const x = (pdfWidth - width) / 2;
        const y = (pdfHeight - height) / 2;

        if (i !== 0) pdf.addPage();

        pdf.addImage(img, "JPEG", x, y, width, height);
        resolve(true);
      };
    });
  }

  pdf.save("final.pdf");
};