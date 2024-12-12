export const displayImage = (imageUrl: string, id: string, nameFolder: string = "images") =>
  imageUrl
    ? `${import.meta.env.VITE_API_ENDPOINT}/${nameFolder}/${id}/${imageUrl}`
    : "https://placehold.co/400";
