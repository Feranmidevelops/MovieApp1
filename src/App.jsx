import { useEffect, useState } from "react";
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";


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

  const [trendingMovies, setTrendingMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);


  const fetchMovies = async (query = '') => {

    setIsLoading(true);
    setErrorMessage(null);

    try {

      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :
       `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

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

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error('Error fetching movies:', error);

      setErrorMessage('Error fetching movies. Please try again later.');
    } finally{
      setIsLoading(false);
    }
  }


  const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies();
      console.log('Trending movies:', movies);
      setTrendingMovies(movies);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      //setErrorMessage('Error fetching trending movies. Please try again later.');
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
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

    {trendingMovies.length > 0 && (
      <section className="trending">
      <h2>Trending movies</h2>

      <ul>
        {trendingMovies.map((movie, index) => (
          <li key={movie.$id}>
            <p>{index + 1}</p>
            <img src={movie.poster_url} alt={movie.title} />
            
           
          </li>
        ))}
      </ul>
      </section>
    )}

    <section className="all-movies">

      <h2>All Movies</h2>

      {isLoading ? (

        <Spinner />

        ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : (
        <ul>
          {movieList.map((movie) => (
            <li key={movie.id}>
              <MovieCard movie={movie} />
            </li>
          ))}
        </ul>
      )}

      </section>
      </div>
    </main>
  )
}

export default App;