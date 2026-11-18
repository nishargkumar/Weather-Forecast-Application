
// ==========================================
// WEATHER FORECAST APPLICATION
// ==========================================

// API KEY
const API_KEY = "c666b9c09ff1e2eaae0df9bda551d2c9";

// APPLICATION STATE
let temperatureUnit = "C";
let latestWeatherData = null;
let latestForecastData = null;
let latestCity = "";
let latestCountry = "";

// HTML ELEMENTS
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const message = document.getElementById("message");

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");


// ==========================================
// 1. SEARCH CITY
// ==========================================

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (!city) {
        message.innerText = "Please enter a city name!";
        return;
    }

    getWeather(city);

});

cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchBtn.click();
    }

});


// ==========================================
// 2. GET WEATHER DATA
// ==========================================

async function getWeather(city) {

    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        message.innerText = "Please add your API key.";
        return;
    }

    setLoading(true);
    message.innerText = "Loading weather information...";

    try {

        // CITY GEOCODING

        const geoURL = new URL(
            "https://api.openweathermap.org/geo/1.0/direct"
        );

        geoURL.search = new URLSearchParams({
            q: city,
            limit: 1,
            appid: API_KEY
        });

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to find the city.");
        }

        const locations = await geoResponse.json();

        if (!locations.length) {
            throw new Error("City not found!");
        }

        const { lat, lon, name, country } = locations[0];

        // CURRENT WEATHER

        const weatherURL = new URL(
            "https://api.openweathermap.org/data/2.5/weather"
        );

        weatherURL.search = new URLSearchParams({
            lat,
            lon,
            appid: API_KEY,
            units: "metric"
        });

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch current weather.");
        }

        const weatherData = await weatherResponse.json();

        // FIVE DAY FORECAST

        const forecastURL = new URL(
            "https://api.openweathermap.org/data/2.5/forecast"
        );

        forecastURL.search = new URLSearchParams({
            lat,
            lon,
            appid: API_KEY,
            units: "metric"
        });

        const forecastResponse = await fetch(forecastURL);

        if (!forecastResponse.ok) {
            throw new Error("Unable to fetch forecast.");
        }

        const forecastData = await forecastResponse.json();

        // STORE DATA

        latestWeatherData = weatherData;
        latestForecastData = forecastData;

        latestCity = name;
        latestCountry = country;

        // DISPLAY DATA

        updateWeatherDisplay();

        message.innerText = "";

    } catch (error) {

        message.innerText = error.message;

        console.error("Weather Error:", error);

    } finally {

        setLoading(false);

    }

}


// ==========================================
// 3. LOADING STATE
// ==========================================

function setLoading(isLoading) {

    searchBtn.disabled = isLoading;
    locationBtn.disabled = isLoading;

    document.querySelector(".container")
        .classList.toggle("loading", isLoading);

}


// ==========================================
// 4. TEMPERATURE CONVERSION
// ==========================================

function convertTemperature(celsius) {

    if (temperatureUnit === "F") {
        return (celsius * 9 / 5) + 32;
    }

    return celsius;

}

function formatTemperature(celsius) {

    return `${Math.round(convertTemperature(celsius))}°${temperatureUnit}`;

}


// ==========================================
// 5. UPDATE COMPLETE DASHBOARD
// ==========================================

function updateWeatherDisplay() {

    if (!latestWeatherData || !latestForecastData) {
        return;
    }

    displayWeather(
        latestWeatherData,
        latestCity,
        latestCountry
    );

    displayForecast(latestForecastData);

}


// ==========================================
// 6. DISPLAY CURRENT WEATHER
// ==========================================

function displayWeather(data, city, country) {

    document.getElementById("cityName").innerText =
        `${city}, ${country}`;

    document.getElementById("temperature").innerText =
        formatTemperature(data.main.temp);

    document.getElementById("weatherCondition").innerText =
        data.weather[0].description;

    document.getElementById("humidity").innerText =
        `${data.main.humidity}%`;

    document.getElementById("windSpeed").innerText =
        `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

    document.getElementById("feelsLike").innerText =
        formatTemperature(data.main.feels_like);

    document.getElementById("weatherIcon").innerText =
        getWeatherEmoji(data.weather[0].main);

    updateBackground(data.weather[0].main);

}


// ==========================================
// 7. WEATHER EMOJI
// ==========================================

function getWeatherEmoji(condition) {

    const icons = {
        Clear: "☀️",
        Clouds: "☁️",
        Rain: "🌧️",
        Drizzle: "🌦️",
        Thunderstorm: "⛈️",
        Snow: "❄️",
        Mist: "🌫️",
        Fog: "🌫️",
        Haze: "🌫️",
        Smoke: "🌫️",
        Dust: "🌪️",
        Sand: "🌪️"
    };

    return icons[condition] || "🌤️";

}


// ==========================================
// 8. DYNAMIC WEATHER BACKGROUND
// ==========================================

function updateBackground(condition) {

    const card = document.querySelector(".weather-card");

    card.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "snowy",
        "stormy",
        "misty"
    );

    const backgrounds = {
        Clear: "sunny",
        Clouds: "cloudy",
        Rain: "rainy",
        Drizzle: "rainy",
        Snow: "snowy",
        Thunderstorm: "stormy",
        Mist: "misty",
        Fog: "misty",
        Haze: "misty"
    };

    card.classList.add(
        backgrounds[condition] || "cloudy"
    );

}


// ==========================================
// 9. FIVE DAY FORECAST
// ==========================================

function displayForecast(data) {

    const forecastContainer =
        document.getElementById("forecastContainer");

    const dailyForecast = {};

    data.list.forEach(item => {

        const date = item.dt_txt.split(" ")[0];

        if (!dailyForecast[date]) {
            dailyForecast[date] = [];
        }

        dailyForecast[date].push(item);

    });

    const days = Object.values(dailyForecast)
        .map(entries => {

            return entries.reduce((best, item) => {

                const hour = Number(
                    item.dt_txt.slice(11, 13)
                );

                const bestHour = Number(
                    best.dt_txt.slice(11, 13)
                );

                return Math.abs(hour - 12) <
                    Math.abs(bestHour - 12) ? item : best;

            });

        })
        .slice(0, 5);

    forecastContainer.innerHTML = "";

    days.forEach(item => {

        const date = new Date(
            item.dt_txt.replace(" ", "T") + "Z"
        );

        const dayName = date.toLocaleDateString(
            "en-US",
            { weekday: "short", timeZone: "UTC" }
        );

        const emoji = getWeatherEmoji(
            item.weather[0].main
        );

        const card = document.createElement("div");

        card.className = "forecast-card";

        const heading = document.createElement("h3");
        heading.textContent = dayName;

        const icon = document.createElement("p");
        icon.textContent = emoji;

        const temperature = document.createElement("p");
        temperature.textContent =
            formatTemperature(item.main.temp);

        const description = document.createElement("p");
        description.className = "forecast-description";
        description.textContent =
            item.weather[0].description;

        card.append(
            heading,
            icon,
            temperature,
            description
        );

        forecastContainer.appendChild(card);

    });

}


// ==========================================
// 10. CELSIUS BUTTON
// ==========================================

celsiusBtn.addEventListener("click", () => {

    temperatureUnit = "C";

    celsiusBtn.classList.add("active");
    fahrenheitBtn.classList.remove("active");

    updateWeatherDisplay();

});


// ==========================================
// 11. FAHRENHEIT BUTTON
// ==========================================

fahrenheitBtn.addEventListener("click", () => {

    temperatureUnit = "F";

    fahrenheitBtn.classList.add("active");
    celsiusBtn.classList.remove("active");

    updateWeatherDisplay();

});


// ==========================================
// 12. CURRENT LOCATION
// ==========================================

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {

        message.innerText =
            "Geolocation is not supported by your browser.";

        return;

    }

    message.innerText = "Detecting your location...";

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {

                const reverseURL = new URL(
                    "https://api.openweathermap.org/geo/1.0/reverse"
                );

                reverseURL.search = new URLSearchParams({
                    lat: latitude,
                    lon: longitude,
                    limit: 1,
                    appid: API_KEY
                });

                const response = await fetch(reverseURL);

                if (!response.ok) {
                    throw new Error("Unable to detect your city.");
                }

                const locations = await response.json();

                if (!locations.length) {
                    throw new Error("Location not found.");
                }

                await getWeather(locations[0].name);

            } catch (error) {

                message.innerText = error.message;

            }

        },

        (error) => {

            const errors = {
                1: "Please allow location permission.",
                2: "Your location is unavailable.",
                3: "Location request timed out."
            };

            message.innerText =
                errors[error.code] || "Unable to detect location.";

        },

        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000
        }

    );

});


// ==========================================
// 13. INITIAL WEATHER
// ==========================================

getWeather("Ahmedabad");
