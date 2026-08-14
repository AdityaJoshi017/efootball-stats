// Imgur API integration for image uploads
const IMGUR_CLIENT_ID = process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID || 'your-imgur-client-id';

export async function uploadToImgur(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.data?.error || 'Failed to upload image to Imgur');
  }

  const data = await response.json();
  return data.data.link;
}

export function getImgurUploadUrl(): string {
  return 'https://api.imgur.com/3/image';
}