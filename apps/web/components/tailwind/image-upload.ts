import ky from "ky";
import { createImageUpload } from "novel/plugins";
import { toast } from "sonner";

const onUpload = async (file: File) => {
  const fetchUrl = `https://test-api2.proxy302.com/gpt/api/upload/gpt/image`;
  // const fetchUrl = process.env.NEXT_PUBLIC_IMAGE_FETCH_UR;
  const formData = new FormData();
  formData.append('file', file)
  return new Promise((resolve, reject) => {
    toast.promise(
      ky(fetchUrl, { method: 'POST', body: formData, timeout: false }).then(async (res) => {
        if (res.ok) {
          const result: any = await res.json();
          const image = new Image();
          image.src = result.data.url;
          image.onload = () => {
            resolve(result.data.url);
          };
        } else if (res.status === 401) {
          resolve(file);
          throw new Error("`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead.");
          // Unknown error
        } else {
          throw new Error("Error uploading image. Please try again.");
        }
      }),
      {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        error: (e) => {
          reject(e);
          return e.message;
        },
      },
    )
  })
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("File size too big (max 20MB).");
      return false;
    }
    return true;
  },
});
