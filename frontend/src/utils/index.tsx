// Fetch data for locations, Statuses, and categories in parallel
export const fetchMetadata = async (baseUrl: string, endpoint: string, key: string) =>
    await fetch(`${baseUrl}/${endpoint}?query=${key}`, {
      headers: { Authorization: localStorage.getItem("token") as string },
    }).then((res) =>
      res.ok
        ? res.json()
        : Promise.reject(`Error fetching ${endpoint}: ${key}`)
    );