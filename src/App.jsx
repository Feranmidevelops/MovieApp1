import { useEffect, useState } from "react";

import Search from './components/Search.jsx'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  console.error('API key is missing! Make sure VITE_TMDB_API_KEY is set in your .env file');
}

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};


 
const App = () => {

  const [searchTerm, setSearchTerm] = useState('');

  const [errorMessage, setErrorMessage] = useState(null);

  const [movieList, setMovieList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);


  const fetchMovies = async () => {

    setIsLoading(true);
    setErrorMessage(null);

    try {

      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies')
      }

      const data = await response.json();

      if(data.Response === "False") {
        setErrorMessage(data.error || 'Failed to fetch Movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || [] );

    } catch (error) {
      console.error('Error fetching movies:', error);

      setErrorMessage('Error fetching movies. Please try again later.');
    } finally{
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
  }, []);


  return (
    <main>

      <div className="pattern"> </div>
      <div className="wrapper" >
 
<header>

  <img src="./hero-img.png" alt="Hero Banner" />
  <h1>Find <span className="text-gradient">Movies</span> you'll enjoy</h1>

   <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

</header>

    <section className="all-movies">
      <h2>All Movies</h2>

      {isLoading ? (
        <p className="text-white">Loading movies...</p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      )

    </section>

      </div>
    </main>
  )
}

export default App;