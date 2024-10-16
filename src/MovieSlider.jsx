import React, { useState, useEffect } from 'react';


const API_KEY = 'e89d23eb';
const API_URL = 'https://www.omdbapi.com/';

const MovieSlider = () => {
    const movieTitles = [
        "The Godfather",
        "Baahubali 2: The Conclusion",
        "Leo",
        "Manjummel Boys",
        "K.G.F: Chapter 1",
        "Dangal",
        "Interstellar",
        "godzilla",
        "Titanic",
        "The Wolf of Wall Street",
        "oppenheimer",
        "jawan",
    ];

    const [movies, setMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const moveSlide = (direction) => {
        const totalCards = movies.length;
        setCurrentIndex((prevIndex) => {
            if (direction === 1) {
                return (prevIndex + 1) % totalCards;
            } else {
                return (prevIndex - 1 + totalCards) % totalCards;
            }
        });
    };

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

    useEffect(() => {
        const interval = setInterval(() => {
            moveSlide(1);
        }, 2000);

        return () => clearInterval(interval);
    }, [movies]);

    return (
        isVisible && (
            <div className="relative mx-auto p-5 overflow-hidden">
                <h2 className="text-2xl font-bold mb-4 text-white">Top Movies</h2>
                <div className="flex transition-transform duration-500 ease-in-out"
                     style={{ transform: `translateX(-${currentIndex * 220}px)` }}>
                    {movies.map((movie, index) => (
                        <div key={index} className={`flex flex-col items-center justify-center min-w-[200px] m-2 p-4 rounded-lg shadow-lg text-center transition-all duration-300 ${index === currentIndex ? 'bg-gradient-to-r from-black to-pink-600 border-2 border-violet-600' : 'bg-gray-800'}`}>
                            {movie.Response === "True" ? (
                                <>
                                    <img src={movie.Poster} alt={movie.Title} className={`mb-2 h-60 object-contain transition-transform duration-300 ${index === currentIndex ? 'scale-110' : ''}`} />
                                    <h3 className="font-semibold text-white">{movie.Title}</h3>
                                    <p className="text-gray-400">{movie.Year}</p>
                                </>
                            ) : (
                                <p className="text-red-500">Movie not found</p>
                            )}
                        </div>
                    ))}
                </div>
                <button className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow bg-black"
                        onClick={() => moveSlide(-1)}>❮</button>
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow"
                        onClick={() => moveSlide(1)}>❯</button>
            </div>
        )
    );
};

export default MovieSlider;
