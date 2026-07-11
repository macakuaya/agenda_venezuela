// Resizes/compresses an image file in the browser before upload, so event
// images stay light on mobile (the source flyers are often several MB).
export async function resizeImage(
  file: File,
  maxSize = 1200,
  quality = 0.8,
): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Imagen inválida.'))
    image.src = dataUrl
  })

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo procesar la imagen.')
  ctx.drawImage(img, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  )
  if (!blob) throw new Error('No se pudo comprimir la imagen.')
  return blob
}
