import React, { useState, useEffect } from 'react';

const API_KEY = 'e89d23eb';
const API_URL = 'https://www.omdbapi.com/';

const MovieSlider = () => {
    const movieTitles = [
        "The Godfather",
        "Salaar",
        "Devara Part 1",
        "Leo",
        "Vikram",
        "Kaithi",
        "Manjummel Boys",
        "Minnal Murali",
        "K.G.F: Chapter 2",
        "Dangal",
        "Interstellar",
        "The Dark Knight Rises",
        "Titanic",
        "The Wolf of Wall Street",
        "Oppenheimer",
        "Jawan",
        "Avengers",
        "Deadpool Wolverine",
        "Mufasa The Lion King",
    ];

    const [movies, setMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Fetch movies from the API
    useEffect(() => {
        const fetchMovies = async () => {
            const moviePromises = movieTitles.map(title =>
                fetch(`${API_URL}?t=${encodeURIComponent(title)}&apikey=${API_KEY}`)
                    .then(response => response.json())
            );
            const movieData = await Promise.all(moviePromises);
            setMovies(movieData);
        };

        fetchMovies();
    }, []);

    // Handle visibility based on localStorage
    useEffect(() => {
        const searched = localStorage.getItem('searched');
        if (searched) {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        if (!isVisible) {
            localStorage.setItem('searched', 'true');
        } else {
            localStorage.removeItem('searched');
        }
    }, [isVisible]);

    // Auto slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval); // Clear interval on unmount
    }, [movies.length]);

    return (
        isVisible && (
            <div className="relative mx-auto p-5 overflow-hidden">
                <h2 className="font-bold mb-4 text-white animate-scrolling">Search Your Top Movies and Enjoy Watching Your Favourite Movies and Series And Search Seamlessly Which Gives Best Results</h2>
                <div className="flex transition-transform duration-500 ease-in-out"
                     style={{ transform: `translateX(-${currentIndex * 220}px)` }}>
                    {movies.map((movie, index) => (
                        <div key={index} className={`flex flex-col items-center justify-center min-w-[200px] m-2 transition-all duration-300 ${index === currentIndex ? 'w-[500px]' : 'w-[200px]'} bg-gradient-to-tl from-black to-purple-800 rounded-lg shadow-2xl`}>
                            {movie.Response === "True" ? (
                                <div className={`flex ${index === currentIndex ? 'h-80' : 'h-60'}`}>
                                    <img src={movie.Poster} alt={movie.Title} className={`h-full object-contain rounded-md transition-transform duration-300 ${index === currentIndex ? 'scale-70' : ''}`} />
                                    {index === currentIndex && (
                                        <div className="ml-4 text-left h-full">
                                            <h3 className="font-semibold text-white text-2xl">{movie.Title} ({movie.Year})</h3>
                                            <p className="text-gray-400">IMDB: {movie.imdbRating}</p>
                                            <p className="text-white mt-3 font-medium">{movie.Plot}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-red-500">Movie not found</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )
    );
};

export default MovieSlider;
