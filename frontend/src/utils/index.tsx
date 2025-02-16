const baseURL = import.meta.env.VITE_API_BASE_URL;

// Fetch data for locations, Statuses, and categories in parallel
export const fetchMetadata = async (baseUrl: string, endpoint: string, key: string) =>
    await fetch(`${baseUrl}/${endpoint}?query=${key}`, {
      headers: { Authorization: localStorage.getItem("token") as string },
    }).then((res) =>
      res.ok
        ? res.json()
        : Promise.reject(`Error fetching ${endpoint}: ${key}`)
    );

  // Upload image and return URL
  export const uploadImageAndGetURL = async (
    file: File,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${baseURL}/upload`, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error uploading image");
      }
      const details = await res.json();
      return details.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };