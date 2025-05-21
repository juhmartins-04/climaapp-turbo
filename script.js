const apiKey = "a6b2d39d69a48e96547016839982b4f7";

document.getElementById("searchBtn").addEventListener("click", getWeather);

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const resultDiv = document.getElementById("weatherResult");

  resultDiv.innerHTML = "Carregando...";

  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) throw new Error("Cidade não encontrada");

    const { lat, lon } = geoData[0];

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`
    );
    const weatherData = await weatherRes.json();

    const temp = weatherData.current.temp;
    const desc = weatherData.current.weather[0].description;
    const icon = weatherData.current.weather[0].icon;

    resultDiv.innerHTML = `
      <h2>${city}</h2>
      <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
      <p>Temperatura: ${temp}°C</p>
      <p>${desc}</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = error.message;
  }
}
