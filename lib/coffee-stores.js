import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
})

const getUrlForCoffeeStores = (latLong, query, limit) => {
  return `https://api.foursquare.com/v3/places/search?query=${query}&ll=${latLong}&limit=${limit}`;

}

const getListOfCoffeeStorePhotos = async() => {
  const photos = await unsplash.search.getPhotos({
    query: "coffee shop",
    page: 1,
    perPage: 40,
  });
  return photos.response.results.map(result => result.urls['small']);
}

export const fetchCoffeeStores = async(latLong = '45.49281002246819,-73.55660355204078', limit = 6) => {
  const photos = await getListOfCoffeeStorePhotos();
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY,
    }
  };

  const response = await fetch(
    getUrlForCoffeeStores(latLong, 'coffee', limit), 
    options
  );
  const data = await response.json();

  return data.results.map((result, index) => {
    const neighborhood = result.location.neighborhood; 
    return {
      id: result.fsq_id,
      name: result.name,
      address: result.location.address,
      neighborhood: neighborhood?.length > 0 ? neighborhood[0] : "",
      imgUrl: photos.length > 0 ? photos[index] : null,
    }
  });
}