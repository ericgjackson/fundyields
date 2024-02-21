// Send a backend request and return the response.
// Can send to either the production site or localhost depending on the configuration.
// Assumes JSON bodies, JSON responses.

const fetchFromServer = (endpoint: string, body: any) => {
  let fullURL;
  // For testing over local network.
  // fullURL = `http://192.168.86.235/fundyields${endpoint}`;
  if (process.env.NODE_ENV === 'production') {
    fullURL = `https://fundyields.com/fundyields${endpoint}`;
  } else {
    fullURL = `http://localhost/fundyields${endpoint}`;
  }
  return fetch(fullURL, {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
    },
    'body': JSON.stringify(body),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  });
};

export default fetchFromServer;
