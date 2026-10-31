import axios from 'axios';

export async function uploadImage(file: File, folder: string, baseName: string): Promise<string> {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('baseName', baseName);

  const res = await axios.post('/api/images/upload', formData);

  return res.data.imageUrl;
}

export async function deleteImage(imagePath: string): Promise<void> {
  await axios.post('/api/images/delete', {
    imagePath,
  });
}
