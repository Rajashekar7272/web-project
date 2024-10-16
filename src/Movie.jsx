import React, { useState, useEffect, useRef } from 'react';
import marvelImage from './assets/Marvels.png';
import dcImage from './assets/Dc.png';
import MovieSlider from './MovieSlider';

// Define the API key and base URL
const API_KEY = 'e89d23eb';
const API_URL = 'https://www.omdbapi.com/';

const streamingPlatforms = {
    "tt0111161": "https://www.netflix.com/title/60004011", // Example for "The Shawshank Redemption"
    // Add more movie IDs and their streaming platform URLs here
};

// List of Marvel movies
const marvelMovies = [
    "Iron Man",
    "The Incredible Hulk",
    "Iron Man 2",
    "Thor",
    "Captain America: The First Avenger",
    "Marvel’s The First Avengers",
    "Iron Man 3",
    "Thor: The Dark World",
    "Captain America: The Winter Soldier",
    "Guardians of the Galaxy",
    "Avengers: Age of Ultron",
    "Ant-Man",
    "Captain America: Civil War",
    "Doctor Strange",
    "Guardians of the Galaxy Vol. 2",
    "Spider-Man: Homecoming",
    "Thor: Ragnarok",
    "Black Panther",
    "Avengers: Infinity War",
    "Ant-Man and the Wasp",
    "Captain Marvel",
    "Avengers: Endgame",
    "Spider-Man: Far From Home",
    "Black Widow",
    "Shang-Chi and the Legend of the Ten Rings",
    "Eternals",
    "Spider-Man: No Way Home",
    "Doctor Strange in the Multiverse of Madness",
    "Thor: Love and Thunder",
    "Black Panther: Wakanda Forever",
    "Ant-Man and the Wasp: Quantumania",
    "Guardians of the Galaxy Vol. 3",
    "The Marvels",
    "Deadpool & Wolverine",
    "Captain America: New World Order",
    "Thunderbolts"
];

// List of DC movies
const dcMovies = [
    "Man of Steel",
    "Batman v Superman: Dawn of Justice",
    "Suicide Squad",
    "Wonder Woman",
    "Justice League",
    "Aquaman",
    "Shazam!",
    "Joker",
    "Birds of Prey",
    "Wonder Woman 1984",
    "Zack Snyder's Justice League",
    "The Suicide Squad",
    "The Batman",
    "DC League of Super-Pets",
    "Black Adam",
    "Shazam! Fury of the Gods",
    "The Flash",
    "Blue Beetle",
    "Aquaman and the Lost Kingdom"
];

const Movies = () => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [placeholder, setPlaceholder] = useState('Search for movies...');

    const resultsRef = useRef(null);
    const timeoutRef = useRef(null);
    const suggestionsCache = useRef({}); // Cache for suggestions

    // Typing effect for placeholder
    useEffect(() => {
        const phrases = ['Search for movies...', 'Search for series...', 'Find your next favorite!'];
        let index = 0;

        const typingEffect = () => {
            const phrase = phrases[index];
            let charIndex = 0;

            const type = () => {
                if (charIndex < phrase.length) {
                    setPlaceholder(phrase.substring(0, charIndex + 1));
                    charIndex++;
                    setTimeout(type, 75);
                } else {
                    setTimeout(() => {
                        index = (index + 1) % phrases.length;
                        setPlaceholder('');
                        setTimeout(typingEffect, 500);
                    }, 2000);
                }
            };

            type();
        };

        typingEffect();

        return () => clearTimeout(typingEffect);
    }, []);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (query.length > 0) {
            timeoutRef.current = setTimeout(() => {
                fetchSuggestions(query);
            }, 200); // Throttle API calls (200ms)
        } else {
            setSuggestions([]);
        }

        return () => clearTimeout(timeoutRef.current);
    }, [query]);

    const fetchSuggestions = (input) => {
        if (suggestionsCache.current[input]) {
            setSuggestions(suggestionsCache.current[input]);
            return;
        }

        fetch(`${API_URL}?s=${input}&apikey=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    suggestionsCache.current[input] = data.Search; // Cache the results
                    setSuggestions(data.Search);
                } else {
                    setSuggestions([]);
                }
            })
            .catch(() => setSuggestions([]));
    };

    const fetchMovieDetails = (title) => {
        return fetch(`${API_URL}?t=${encodeURIComponent(title)}&apikey=${API_KEY}`)
            .then(response => response.json());
    };

    const handleSearch = () => {
        setLoading(true);
        setError(null);
        setMovies([]); // Clear previous results
        setSuggestions([]); // Clear suggestions when searching
        fetchMovies(query);  // Fetch movies based on the current query
    };

    const fetchMovies = (searchQuery) => {
        fetch(`${API_URL}?s=${searchQuery}&apikey=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    const movieDetailPromises = data.Search.map(movie => fetchMovieDetails(movie.Title));
                    return Promise.all(movieDetailPromises);
                } else {
                    throw new Error(data.Error);
                }
            })
            .then(moviesWithDetails => {
                const enrichedMovies = moviesWithDetails.map(movie => ({
                    ...movie,
                    isDC: dcMovies.includes(movie.Title),
                    isMarvel: marvelMovies.includes(movie.Title) // Check if the movie is in the Marvel list
                }));
                setMovies(enrichedMovies);
                setLoading(false);
                resultsRef.current.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    };

    const handleSuggestionClick = (title) => {
        setQuery(title);
        setSuggestions([]); // Clear suggestions on selection
        fetchMovies(title);  // Fetch results based on selected suggestion
    };

    const handleUniverseClick = (universe) => {
        setLoading(true);
        setError(null);
        setMovies([]); // Clear previous movies

        const movieDetailPromises = universe === 'The Marvel Universe' 
            ? marvelMovies.map(title => fetchMovieDetails(title))
            : dcMovies.map(title => fetchMovieDetails(title));

        Promise.all(movieDetailPromises)
            .then(moviesWithDetails => {
                const enrichedMovies = moviesWithDetails.map(movie => ({
                    ...movie,
                    isDC: universe === 'The DC Movies',
                    isMarvel: universe === 'The Marvel Universe'
                }));
                setMovies(enrichedMovies);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-black to-gray-800 flex flex-col items-center overflow-hidden">
            <h2 className="text-4xl font-bold mb-6 text-red-600 fade-in animate-pulse">Movie & Series Search</h2>
            <div className="flex flex-col mb-11 relative w-full max-w-xs mx-auto mt-1">
                <div className="flex w-full">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="border-1 border-red-500 text-black font-medium rounded-md p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-red-500 text-white p-2 ml-1 rounded-md hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                        Search
                    </button>
                </div>
                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && movies.length === 0 && (
                    <div className="absolute bg-white text-black border border-gray-300 rounded-md w-full z-10 shadow-lg mt-11">
                        {suggestions.map(movie => (
                            <div
                                key={movie.imdbID}
                                className="p-2 text-sm hover:bg-gray-200 cursor-pointer transition-colors duration-200"
                                onClick={() => handleSuggestionClick(movie.Title)}
                            >
                                {movie.Title} ({movie.Year})
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Buttons for Marvel and DC */}
            <div className="flex space-x-2 mb-6">
                <button
                    className="bg-black font-bold text-white p-2 rounded-md transition duration-300 hover:bg-red-700 relative overflow-hidden flex items-center"
                    onClick={() => handleUniverseClick('The Marvel Universe')}
                >
                    <img src={marvelImage} alt="Marvel" className="h-6 mr-2" />
                    <span>The Marvel Universe</span>
                    <span className="absolute top-0 left-0 w-full h-full opacity-25 animate-pulse"></span>
                </button>
                <button
                    className="bg-black text-white font-bold p-2 rounded-md transition duration-300 hover:bg-blue-700 relative overflow-hidden flex items-center"
                    onClick={() => handleUniverseClick('The DC Movies')}
                >
                    <img src={dcImage} alt="DC" className="h-6 mr-2" />
                    <span>The DC Movies</span>
                    <span className="absolute top-0 left-0 w-full h-full opacity-25 animate-pulse"></span>
                </button>
            </div>

            {/* Loading Spinner */}
            {loading && (
                <div className="flex justify-center items-center">
                    <div className="loader"></div>
                </div>
            )}
            {error && <p className="text-red-500 text-center">Error: {error}</p>}

            {/* Movie Results */}
            <div ref={resultsRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {movies.map(movie => (
                    <div
                        className={`flex flex-col border border-gray-400 rounded-lg shadow-lg overflow-hidden 
                            ${movie.isDC ? 'bg-gradient-to-r from-black to-blue-700' : movie.isMarvel ? 'bg-gradient-to-r from-black to-red-500' : 'bg-gradient-to-r from-gray-900 to-yellow-600'} 
                            transition-transform transform hover:scale-105 cursor-pointer relative w-full`}
                        key={movie.imdbID}
                        onClick={() => window.open(`https://www.imdb.com/title/${movie.imdbID}/`, '_blank')}
                    >
                        <img
                            src={movie.Poster === "N/A" ? "https://via.placeholder.com/1080x1920" : movie.Poster}
                            alt={movie.Title}
                            className="w-full h-60 object-fit transition-transform duration-300 transform hover:scale-110"
                        />
                        <div className="p-2 flex flex-col flex-grow">
                            <h2 className="text-sm font-semibold mb-1 text-white truncate">{movie.Title} ({movie.Year})</h2>
                            <p className="text-gray-200 mb-1 text-xs"><strong>IMDb Rating:</strong> {movie.imdbRating || "N/A"}</p>
                            <p className="text-gray-200 mb-1 text-xs"><strong>Languages:</strong> {movie.Language || "N/A"}</p>

                            <div className="flex space-x-1 mt-auto">
                                <a
                                    href={streamingPlatforms[movie.imdbID] || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-yellow-400 text-white p-1 rounded-md hover:bg-yellow-500 text-xs transition duration-300"
                                >
                                    Watch Now
                                </a>
                                <button
                                    className="bg-green-500 text-white p-1 rounded-md hover:bg-green-600 text-xs transition duration-300"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://www.imdb.com/title/${movie.imdbID}/`, '_blank');
                                    }}
                                >
                                    Play
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loader and Error handling styles */}
            <style>{`
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #0a0a0a; /* Set a background color matching your design */
                    color: white; /* Change text color to ensure readability */
                }

                .loader {
                    border: 8px solid rgba(255, 255, 255, 0.3);
                    border-left: 8px solid white;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 0.5s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                .fade-in {
                    animation: fadeIn 1s ease-in-out;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                .animate-pulse {
                    animation: pulse 1.5s infinite;
                }
            `}</style>

            {/* MovieSlider Component */}
            <MovieSlider/>
        </div>
    );
};

export default Movies;
