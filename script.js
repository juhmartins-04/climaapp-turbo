const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const unitSelect = document.getElementById("unitSelect");
const weatherContainer = document.getElementById("weatherContainer");
const forecastContainer = document.getElementById("forecastContainer");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");

// Buscar pelo nome da cidade
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    errorMsg.textContent = "Digite uma cidade válida.";
    return;
  }
  fetchWeather(city, unitSelect.value);
});

// Enter no input faz a busca também
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Buscar pela localização atual
locationBtn.addEventListener("click", () => {
  fetchWeatherByLocation(unitSelect.value);
});
// API Key do OpenWeatherMap    
const apiKey = "a6b2d39d69a48e96547016839982b4f7"; // Substitua pela sua chave da API

// Função para buscar o clima por cidade
async function fetchWeather(city, units = "metric") {
  try {
    errorMsg.textContent = "";
    loading.style.display = "block";
    weatherContainer.innerHTML = "";
    forecastContainer.innerHTML = "";

    // Limpa classes antigas antes de setar nova
    document.body.className = "";

    // Busca coordenadas da cidade
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/3.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
    );
    if (!geoRes.ok) throw new Error("Erro ao buscar coordenadas da cidade");
    const geoData = await geoRes.json();
    if (!geoData.length) throw new Error("Cidade não encontrada");

    const { lat, lon, name, country } = geoData[0];

    // Busca dados do clima usando One Call API
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&lang=pt_br&appid=${apiKey}`
    );
    if (!weatherRes.ok) throw new Error("Erro ao buscar dados do clima");

    const weatherData = await weatherRes.json();

    showWeather(weatherData.current, name, country, units);
    showForecast(weatherData.daily, units);
    setDynamicBackground(weatherData.current.weather[0].description);
  } catch (error) {
    console.error(error);
    errorMsg.textContent = error.message || "Erro ao buscar informações do clima.";
  } finally {
    loading.style.display = "none";
  }
}


// Exibe o clima atual
function showWeather(current, city, country, units) {
  const temp = Math.round(current.temp);
  const description = current.weather[0].description;
  const icon = current.weather[0].icon;
  const humidity = current.humidity;
  const wind = current.wind_speed;
  const symbol = units === "imperial" ? "°F" : units === "standard" ? "K" : "°C";

  weatherContainer.innerHTML = `
    <h2>${city}${country ? ', ' + country : ''}</h2>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
    <p><strong>${temp}${symbol}</strong></p>
    <p>${description[0].toUpperCase() + description.slice(1)}</p>
    <p>Umidade: ${humidity}%</p>
    <p>Vento: ${wind} ${units === "imperial" ? "mph" : "m/s"}</p>
  `;
}

// Exibe a previsão dos próximos 7 dias
function showForecast(daily, units) {
  const symbol = units === "imperial" ? "°F" : units === "standard" ? "K" : "°C";
  forecastContainer.innerHTML = ""; // limpa antes

  // Mostra só 7 dias, ignora o dia atual (índice 0)
  daily.slice(1, 8).forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" });
    const icon = day.weather[0].icon;
    const description = day.weather[0].description;
    const min = Math.round(day.temp.min);
    const max = Math.round(day.temp.max);

    const div = document.createElement("div");
    div.classList.add("forecast-day");
    div.title = description[0].toUpperCase() + description.slice(1);
    div.innerHTML = `
      <p><strong>${dayName}</strong></p>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
      <p>${max}${symbol} / ${min}${symbol}</p>
    `;
    forecastContainer.appendChild(div);
  });
}

// Muda o background de acordo com a descrição do clima
function setDynamicBackground(desc) {
  const description = desc.toLowerCase();
  document.body.className = ""; // reset

  if (description.includes("sol") || description.includes("limpo") || description.includes("clear")) {
    document.body.classList.add("sunny");
  } else if (
    description.includes("chuva") ||
    description.includes("garoa") ||
    description.includes("pancadas") ||
    description.includes("precipitação") ||
    (description.includes("trov") && description.includes("chuva"))
  ) {
    document.body.classList.add("rainy");
  } else if (
    description.includes("trovoada") ||
    description.includes("tempestade") ||
    (description.includes("trov") && !description.includes("chuva"))
  ) {
    document.body.classList.add("stormy");
  } else if (description.includes("nublado") || description.includes("nuvens") || description.includes("cloud")) {
    document.body.classList.add("cloudy");
  } else if (description.includes("neve") || description.includes("snow")) {
    document.body.classList.add("snowy");
  } else if (
    description.includes("neblina") ||
    description.includes("névoa") ||
    description.includes("bruma") ||
    description.includes("fog") ||
    description.includes("mist")
  ) {
    document.body.classList.add("foggy");
  } else {
    document.body.classList.add("default");
  }
}

// Busca clima pela localização atual
  function fetchWeatherByLocation(units = "metric") {
  errorMsg.textContent = "";
  loading.style.display = "block";
  weatherContainer.innerHTML = "";
  forecastContainer.innerHTML = "";

  if (!navigator.geolocation) {
    errorMsg.textContent = "Geolocalização não suportada pelo navegador.";
    loading.style.display = "none";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=${units}&lang=pt_br&appid=${apiKey}`
        );
        if (!weatherRes.ok) throw new Error("Erro ao buscar dados do clima.");

        const weatherData = await weatherRes.json();

        showWeather(weatherData.current, "Sua localização", "", units);
        showForecast(weatherData.daily, units);
        setDynamicBackground(weatherData.current.weather[0].description);
      } catch (err) {
        console.error(err);
        errorMsg.textContent = "Erro ao obter dados do clima.";
      } finally {
        loading.style.display = "none";
      }
    },
    (error) => {
      console.error(error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg.textContent = "Permissão de localização negada.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg.textContent = "Localização indisponível.";
          break;
        case error.TIMEOUT:
          errorMsg.textContent = "Tempo esgotado ao tentar obter localização.";
          break;
        default:
          errorMsg.textContent = "Erro ao detectar a localização.";
      }
      loading.style.display = "none";
    }
  );
}

// Eventos
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    errorMsg.textContent = "Digite uma cidade válida.";
    return;
  }
  const units = unitSelect.value;
  fetchWeather(city, units);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

locationBtn.addEventListener("click", () => {
  const units = unitSelect.value;
  fetchWeatherByLocation(units);
});
