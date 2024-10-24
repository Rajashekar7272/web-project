import React, { useState, useEffect } from 'react';


const API_KEY = 'e89d23eb';
const API_URL = 'https://www.omdbapi.com/';

const MovieSlider = () => {
    const movieTitles = [
        "The Godfather",
        "Pushpa The Rule - Part 2",
        "Salaar",
        "Devara Part 1",
        "Leo",
        "The Greatest of All Time",
        "Game of Thrones",
        "Breaking Bad",
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
        "saripodhaa sanivaaram",
        "Pushpa: The Rise",
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

    // Function to truncate plot
    const truncatePlot = (plot) => {
        const maxLength = 250; // Set max length for the plot
        return plot.length > maxLength ? `${plot.substring(0, maxLength)}...` : plot;
    };

    return (
        isVisible && (
            <div className="relative mx-auto p-5 overflow-hidden">
                <h2 className="font-semibold mb-4 text-white animate-scrolling">
                    Search Your Top Movies and Enjoy Watching Your Favourite Movies and Series And Search Seamlessly Which Gives Best Results
                </h2>
                <div className="flex transition-transform duration-500 ease-in-out"
                     style={{ transform: `translateX(-${currentIndex * 220 - 320}px)` }}> {/* Adjusted for left margin */}
                    {movies.map((movie, index) => (
                        <div key={index} className={`flex flex-col items-center justify-center min-w-[200px]  m-2 transition-all duration-300 ${index === currentIndex ? 'w-[500px]' : 'w-[200px]'}  rounded-lg shadow-xl shadow-black relative overflow-hidden`}>
                            <div className={`absolute inset-0 h-full w-full rounded-lg transition duration-300 transform ${index === currentIndex ? '' : ''} border-2 border-gray-900`} />
                            {movie.Response === "True" ? (
                                <div className={`flex ${index === currentIndex ? 'h-80' : 'h-60'} overflow-hidden`}>
                                    <img src={movie.Poster} alt={movie.Title} className={`h-full object-contain rounded-md transition-transform duration-300 ${index === currentIndex ? 'scale-70' : ''}`} />
                                    {index === currentIndex && (
                                        <div className="ml-4 text-left h-full">
                                            <h3 className="font-semibold text-white text-2xl">{movie.Title} ({movie.Year})</h3>
                                            <p className="text-gray-400 font-medium">IMDB: {movie.imdbRating}</p>
                                            <p className='text-gray-400'>Languages: {movie.Language}</p>
                                            <p className='text-gray-400'>Genre: {movie.Genre}</p>
                                            <p className="text-white mt-3 font-medium font-serif overflow-hidden">{truncatePlot(movie.Plot)}</p>
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
