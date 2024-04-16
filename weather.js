/*Shashank Pandey
Student Id: 2408414 */
const apiKey = "f1e32b83ca13f5d5ac6bbe001d9d095c";
const historicalWeatherDiv = document.querySelector('.historical-weather');
const form = document.querySelector("form");
const searchBox = document.querySelector(".search-bar");

let weather = {
    fetchAndUpdateWeather: function (city) {
        fetch(
            `weather2.php?q=${city}`
        )
            .then((response) => response.json())
            .then((data) => {
                localStorage.setItem(city.toLowerCase(), JSON.stringify(data));
                this.displayWeather(data);
              })
        
            .catch((error) => this.showError(error))
    },
    fetchWeather: function(city) {
        const cachedData = localStorage.getItem(city.toLowerCase());
        if (cachedData) {

            const data = JSON.parse(cachedData);
            const currentDate = new Date().toLocaleDateString(); 
    
            // Check if there is any data for today
            const todayData = data.find(day => new Date(day.date).toLocaleDateString() === currentDate);
    
            if (todayData) {
                this.displayWeather(data);
            } else {
                this.fetchAndUpdateWeather(city);
            }
            
        } else {
          // No cached data found, fetch new data
          this.fetchAndUpdateWeather(city);
        }
    },

    displayWeather: function (data) {
        console.log(data);
        document.querySelector('.weather').style.display = 'block';
        document.querySelector('.error').style.display = 'none';

        const today = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            weekday: 'short',
        });

        const todayData = data.find(day => new Date(day.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            weekday: 'short',
        }) === today);

        if (todayData) {
            document.querySelector(".city").innerText = todayData.city;
            document.querySelector(".icon").src = `http://openweathermap.org/img/wn/${todayData.icon}.png`;
            document.querySelector(".description").innerText = todayData.weather_description;
            document.querySelector(".temp").innerText = todayData.temperature + "°C";
            document.querySelector(".humidity").innerText = "Humidity: " + todayData.humidity + "%";
            document.querySelector(".windspeed").innerText = "Speed: " + todayData.wind_speed + "km/hr";
            document.querySelector(".pressure").innerText = "Pressure: " + todayData.pressure + "Pa";
            document.body.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${todayData.city}')`;
            let dateTime = new Date(todayData.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
            document.querySelector(".datetime").innerHTML = `${dateTime}`;
            document.querySelector(".weather").classList.remove("loading");
        } else {
            document.querySelector('.weather').style.display = 'none';
        }

        if (todayData.city.toLowerCase() === 'dibrugarh') {
            historicalWeatherDiv.style.display = 'block';
            historicalWeatherDiv.innerHTML = '';

            historicalWeatherDiv.innerHTML = `
                <h3 style="margin: .7em 0;"><strong>Weather in <span style="text-transform: capitalize;">${data[0].city}</span> in last 7 days</strong></h3>
                <div class="historical-item">
                    <p class="historical-day"><strong>Date</strong></p>
                    <p class="historical-temp"><strong>Temp</strong></p>
                    <p class="historical-humidity"><strong>Humidity</strong></p>
                    <p class="historical-pressure"><strong>Pressure</strong></p>
                    <p class="historical-windspeed"><strong>Wind Speed</strong></p>
                </div>`;

            const sortedHistoricalData = data.slice(1).sort((a, b) => new Date(a.date) - new Date(b.date));

            
            const historicalDataToShow = sortedHistoricalData.slice(0, 7);

            for (let i = 0; i < historicalDataToShow.length; i++) {
                const dayData = historicalDataToShow[i];
                const historicalItem = document.createElement('div');
                historicalItem.classList.add('historical-item');

                const historicalDate = new Date(dayData.date);
                const historicalDateTime = historicalDate.toLocaleDateString(
                    "en-US", {
                        day: 'numeric',
                        month: 'short',
                    }
                );

                function getDayOfWeek(date) {
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                }

                historicalItem.innerHTML = `
                    <p class="historical-day">${getDayOfWeek(historicalDate)}, ${historicalDateTime}</p>
                    <p class="historical-temp" style="display: flex;justify-content:center;">
                        <img src="http://openweathermap.org/img/wn/${dayData.icon}.png" alt="" class="icon" width="28px" height="28px" />
                        ${Math.round(dayData.temperature)}°C
                    </p>
                    <p class="historical-humidity">${dayData.humidity}%</p>
                    <p class="historical-pressure">${dayData.pressure}Pa</p>
                    <p class="historical-windspeed">${dayData.wind_speed}km/h</p>
                `;

                historicalWeatherDiv.appendChild(historicalItem);
            };
        } else {
            historicalWeatherDiv.style.display = 'none';
        }
    },

    search: function () {
        this.fetchWeather(document.querySelector(".search-bar").value);
    },

    showError: function (error) {
        document.querySelector('.weather').style.display = 'none';
        document.querySelector('.error').style.display = 'block';
        document.querySelector('.historical-weather').style.display = "none";
    }
};

document.querySelector(".search button").addEventListener("click", function () {
    weather.search();
});

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
    weather.search();
    }
});

async function saveInDatabase(city) {
    const response = await fetch(`weather2.php?q=${city}`);
    const data = await response.json();
    console.log(data);
}

weather.fetchWeather('Dibrugarh');

form.addEventListener("submit", function (event) {
    event.preventDefault();
    saveInDatabase(searchBox.value);
});
