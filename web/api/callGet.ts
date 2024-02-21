import fetchFromServer from '@/api/fetchFromServer';

const callGet = async () => {
  try {
    const result = await fetchFromServer('/api/get', {
    })
    return result;
  } catch (error) {
    console.error('get: Error fetching data:', error);
    throw error;
  }
};

export default callGet;
