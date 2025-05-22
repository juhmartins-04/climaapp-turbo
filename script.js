const apiKey = "8f5476e78fe027196d60be067152e138";

document.getElementById("searchBtn").addEventListener("click", getWeather);

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const resultDiv = document.getElementById("weatherResult");
  const loadingDiv = document.getElementById("loading");

  if (!city) {
    resultDiv.innerHTML = "Por favor, digite uma cidade.";
    return;
  }

  resultDiv.innerHTML = "";
  loadingDiv.style.display = "block";

  try {
    // Busca coordenadas
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) throw new Error("Cidade não encontrada.");

    const { lat, lon, name, country } = geoData[0];

    // Busca clima
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`
    );
    const weatherData = await weatherRes.json();

    const temp = weatherData.current.temp;
    const desc = weatherData.current.weather[0].description;
    const icon = weatherData.current.weather[0].icon;

    let forecastHTML = "<h3>Previsão:</h3>";

    // Previsão para os próximos 5 dias (pega do daily[])
    weatherData.daily.slice(1, 6).forEach((day) => {
      const date = new Date(day.dt * 1000).toLocaleDateString("pt-BR", {
        weekday: "long",
      });
      const dayIcon = day.weather[0].icon;
      const dayDesc = day.weather[0].description;
      const dayTemp = day.temp.day;

      forecastHTML += `
        <div class="forecast">
          <strong>${date}</strong><br>
          <img src="http://openweathermap.org/img/wn/${dayIcon}.png" alt="${dayDesc}">
          <p>${dayDesc}, ${dayTemp}°C</p>
        </div>
      `;
    });

    resultDiv.innerHTML = `
      <h2>${name}, ${country}</h2>
      <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
      <p>Temperatura atual: ${temp}°C</p>
      <p>${desc}</p>
      ${forecastHTML}
    `;
  } catch (error) {
    resultDiv.innerHTML = error.message;
  } finally {
    loadingDiv.style.display = "none";
  }
}
