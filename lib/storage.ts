import { supabase } from './supabase'

export async function uploadImage(file: File, category: 'vehicles' | 'batteries' | 'parts'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${category}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    const path = imageUrl.split('/product-images/')[1]
    if (!path) return false

    const { error } = await supabase.storage
      .from('product-images')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}

export async function updateImage(
  oldImageUrl: string | null,
  newFile: File,
  category: 'vehicles' | 'batteries' | 'parts'
): Promise<string | null> {
  if (oldImageUrl) {
    await deleteImage(oldImageUrl)
  }

  return uploadImage(newFile, category)
}
