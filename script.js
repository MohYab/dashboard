// -------- (1) Klocka och datum --------
function updateClockAndDate() {
    const now = new Date();
    const clockEl = document.getElementById("clock");
    const dateEl = document.getElementById("date");
  
    // Klocka (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  
    // Datum (t.ex. 1 april 2024)
    // Du kan skräddarsy formateringen som du vill.
    const day = now.getDate();
    const month = now.toLocaleString("sv-SE", { month: "long" });
    const year = now.getFullYear();
    dateEl.textContent = `${day} ${month} ${year}`;
  }
  
  setInterval(updateClockAndDate, 1000);
  updateClockAndDate(); // Kör direkt vid sidladdning
  
  // -------- (2) Redigerbar rubrik --------
  const dashboardTitle = document.getElementById("dashboard-title");
  
  // Hämta sparad rubrik från LocalStorage
  dashboardTitle.textContent = localStorage.getItem("dashboardTitle") || "Din Dashboard";
  
  // Gör rubriken klickbar och redigerbar
  dashboardTitle.addEventListener("click", () => {
    dashboardTitle.contentEditable = "true";
    dashboardTitle.focus();
  });
  
  // När man klickar utanför eller trycker Enter – spara texten
  dashboardTitle.addEventListener("blur", () => {
    dashboardTitle.contentEditable = "false";
    localStorage.setItem("dashboardTitle", dashboardTitle.textContent);
  });
  
  // Valfritt: Spara även om man trycker Enter
  dashboardTitle.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      dashboardTitle.blur(); 
    }
  });
  
  // -------- (3) Länksamling --------
let links = JSON.parse(localStorage.getItem("links")) || [];

const linkList = document.getElementById("link-list");
const toggleAddLinkBtn = document.getElementById("toggle-add-link-btn");
const addLinkContainer = document.getElementById("add-link-container");
const addLinkBtn = document.getElementById("add-link-btn");
const newLinkTitle = document.getElementById("new-link-title");
const newLinkUrl = document.getElementById("new-link-url");

// Toggle formuläret när plus-knappen klickas
toggleAddLinkBtn.addEventListener("click", () => {
  if (addLinkContainer.style.display === "none") {
    addLinkContainer.style.display = "block";
    newLinkTitle.focus();
  } else {
    addLinkContainer.style.display = "none";
  }
});


// Funktion byt backgrund
function bytBakgrund(bildUrl) {
  document.body.style.backgroundImage = `url('${bildUrl}')`;
  localStorage.setItem('valdBakgrund', bildUrl); // Spara bakgrund i webbläsaren
}
// Ladda sparad bakgrund (om den finns)
const sparadBakgrund = localStorage.getItem('valdBakgrund');
if (sparadBakgrund) {
  document.body.style.backgroundImage = `url('${sparadBakgrund}')`;
}
// Hämta bakgrundsbilder från data.json
fetch('/bilder.json')
  .then(res => res.json())
  .then(bilder => {
    const container = document.querySelector('.bg-selector');
    bilder.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.onclick = () => bytBakgrund(src);
      container.appendChild(img);
    });
  });
  
  const knapp = document.getElementById('visa-bilder-btn');
  const bgSelector = document.querySelector('.bg-selector');
  
  knapp.addEventListener('click', () => {
    bgSelector.style.display = bgSelector.style.display === 'none' ? 'block' : 'none';
  });
  
// Funktion för att visa alla länkar i listan
function renderLinks() {
  linkList.innerHTML = "";
  links.forEach((link, index) => {
    const li = document.createElement("li");

    // Hämta favicon med Google-tjänsten
    const faviconUrl = `https://www.google.com/s2/favicons?sz=16&domain_url=${link.url}`;
    const faviconImg = document.createElement("img");
    faviconImg.src = faviconUrl;
    faviconImg.alt = "favicon";

    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.textContent = link.title;

    // Minus-ikon för att ta bort länk
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "−";
    removeBtn.classList.add("remove-link-btn");
    removeBtn.addEventListener("click", () => {
      removeLink(index);
    });

    // Bygg ihop listobjektet
    const leftSpan = document.createElement("span");
    leftSpan.style.display = "flex";
    leftSpan.style.alignItems = "center";
    leftSpan.appendChild(faviconImg);
    leftSpan.appendChild(a);

    li.appendChild(leftSpan);
    li.appendChild(removeBtn);

    linkList.appendChild(li);
  });
}

// Lägg till länk
function addLink() {
  const title = newLinkTitle.value.trim();
  const url = newLinkUrl.value.trim();
  if (!title || !url) return; // Avbryt om något fält är tomt

  // Lägg till i arrayen
  links.push({ title, url });
  // Spara i LocalStorage
  localStorage.setItem("links", JSON.stringify(links));
  // Rendera om listan
  renderLinks();
  // Nollställ formuläret och dölj det igen
  newLinkTitle.value = "";
  newLinkUrl.value = "";
  addLinkContainer.style.display = "none";
}

addLinkBtn.addEventListener("click", addLink);

// Ta bort länk
function removeLink(index) {
  links.splice(index, 1);
  localStorage.setItem("links", JSON.stringify(links));
  renderLinks();
}

// Rendera länkar direkt vid sidladdning
renderLinks();
  
  // -------- Hjälpfunktion: Formatera datum och tid --------
function formatLocalTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}  ${hours}:${minutes}`;
}

// -------- Funktion för att hämta platsnamn via omvänd geokodning --------
function fetchLocationName(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  return fetch(url, { headers: { "User-Agent": "DashboardApp" } })
    .then(response => response.json())
    .then(data => {
      // Försök använda address-komponenterna: "city", "town", "village" eller "county", samt land
      const address = data.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        "Okänd plats";
      const country = address.country || "";
      return `${city}, ${country}`;
    })
    .catch(err => {
      console.error("Fel vid hämtning av platsdata:", err);
      return "Okänd plats";
    });
}

// -------- (4) Väderinfo med Open-Meteo API och platsnamn --------
const weatherInfo = document.getElementById("weather-info");

function fetchWeather(lat, lon) {
  // Skapa URL med inbäddade latitud- och longitudparametrar
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;

  // Gör två samtidiga anrop: ett till vädertjänsten och ett för platsnamn
  Promise.all([
    fetch(url).then(response => response.json()),
    fetchLocationName(lat, lon)
  ])
    .then(([weatherData, locationName]) => {
      if (weatherData.current) {
        // Extrahera data från "current"
        const { time, temperature_2m, wind_speed_10m } = weatherData.current;
        // Konvertera API:ets tid till lokal tid
        // Här skapar vi istället ett Date-objekt för aktuell tid.
        const localTime = formatLocalTime(new Date());
        // Uppdatera gränssnittet
        weatherInfo.innerHTML = `
          <p>Plats: ${locationName}</p>
          <p>Lokal tid: ${localTime}</p>
          <p>Temperatur: ${temperature_2m.toFixed(1)}°C</p>
          <p>Vindhastighet: ${wind_speed_10m.toFixed(1)} m/s</p>
        `;
      } else {
        weatherInfo.innerHTML = "<p>Kunde inte hämta väderdata.</p>";
      }
    })
    .catch(err => {
      console.error("Fel vid hämtning av väderdata:", err);
      weatherInfo.innerHTML = "<p>Fel vid hämtning av väder.</p>";
    });
}

// Kontrollera att geolocation stöds och hämta position
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeather(latitude, longitude);
    },
    (error) => {
      console.error("Geolocation error:", error);
      weatherInfo.innerHTML = "<p>Kan inte hämta din position.</p>";
    }
  );
} else {
  weatherInfo.innerHTML = "<p>Geolocation stöds inte av din webbläsare.</p>";
}


  
  // -------- (5) Externt API (GDELT 2.0) --------
  const extraApiContent = document.getElementById("extra-api-content");

  function fetchExternalData() {
    const query = document.getElementById("gdelt-query").value || "Syria";
    extraApiContent.innerHTML = "<p>Laddar nyheter...</p>";

    const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=5&format=json`;

    fetch(gdeltUrl)
      .then(response => response.json())
      .then(data => {
        const articles = data.articles || data.articles?.length ? data.articles : [];
        if (articles.length > 0) {
          extraApiContent.innerHTML = "";
          articles.forEach(article => {
            const articleEl = document.createElement("div");
            articleEl.classList.add("gdelt-article");
            articleEl.innerHTML = `
              <h4><a href="${article.url}" target="_blank">${article.title}</a></h4>
              <p><strong>Källa:</strong> ${article.sourcecountry || "Okänd"}</p>
              <p><em>${new Date(article.seendate).toLocaleString()}</em></p>
            `;
            extraApiContent.appendChild(articleEl);
          });
        } else {
          extraApiContent.innerHTML = "<p>Inga nyheter hittades för det valda ämnet.</p>";
        }
      })
      .catch(err => {
        console.error("Fel vid hämtning från GDELT:", err);
        extraApiContent.innerHTML = "<p>Fel vid hämtning av data. Kontrollera ämnet eller försök igen senare.</p>";
      });
  }

  // Kör första sökningen direkt (Syria)
  fetchExternalData();

  // -------- (6) Anteckningar --------
  const notesArea = document.getElementById("notes-area");
  
  // Hämta sparade anteckningar
  notesArea.value = localStorage.getItem("notes") || "";
  
  // Spara anteckningar vid varje inmatning
  notesArea.addEventListener("input", () => {
    localStorage.setItem("notes", notesArea.value);
  });