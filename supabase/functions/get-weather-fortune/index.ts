import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, fromDate, toDate, exercises, healthConditions } = await req.json();
    
    console.log("Request:", { location, fromDate, toDate, exercises, healthConditions });

    // Get OpenWeather data
    const weatherData = await getOpenWeatherData(location);
    
    // Generate personalized advice
    const advice = generatePersonalizedAdvice(weatherData, healthConditions, exercises);

    return new Response(
      JSON.stringify({
        location: weatherData.resolvedName,
        weather: weatherData,
        advice,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getOpenWeatherData(location: string) {
  const openWeatherApiKey = "a0420880e13f0906f17ac2115d47d800";

  // Geocoding
  const geoResp = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${openWeatherApiKey}`
  );
  
  if (!geoResp.ok) throw new Error("Failed to geocode location");
  
  const geo = await geoResp.json();
  if (!Array.isArray(geo) || geo.length === 0) throw new Error("Location not found");
  
  const { lat, lon, name, country, state } = geo[0];

  // Current Weather
  const weatherResp = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
  );
  
  if (!weatherResp.ok) throw new Error("Weather fetch failed");
  
  const weather = await weatherResp.json();

  // Air Quality
  const airResp = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`
  );
  
  if (!airResp.ok) throw new Error("Air quality fetch failed");
  
  const air = await airResp.json();

  const tempC = Math.round(weather?.main?.temp ?? 0);
  const humidity = Math.round(weather?.main?.humidity ?? 0);
  const condition = weather?.weather?.[0]?.description || weather?.weather?.[0]?.main || "Clear";
  const aqi = air?.list?.[0]?.main?.aqi ?? 1;

  return {
    tempC,
    aqi,
    aqiLabel: aqiLabel(aqi),
    humidity,
    condition,
    resolvedName: [name, state, country].filter(Boolean).join(", "),
  };
}

function aqiLabel(val: number): string {
  switch (Number(val)) {
    case 1: return "Good";
    case 2: return "Fair";
    case 3: return "Moderate";
    case 4: return "Poor";
    case 5: return "Very Poor";
    default: return "Unknown";
  }
}

function generatePersonalizedAdvice(
  weather: any,
  conditions: string[],
  exercises: boolean
): { likelihood: string; cautions: string[] } {
  let likelihood = "Weather conditions seem generally comfortable.";
  const cautions = new Set<string>();

  if (weather.tempC >= 35) {
    likelihood = "High heat may cause significant discomfort and health risks.";
    cautions.add("Stay hydrated by drinking plenty of water. Avoid direct sun during peak hours (11 AM - 4 PM).");
    
    if (conditions.includes("High BP")) {
      cautions.add("Monitor your blood pressure as extreme heat can affect it. Stay in cool, air-conditioned environments.");
    }
    if (conditions.includes("Diabetes")) {
      cautions.add("Heat can affect blood sugar levels. Test them more frequently and keep your insulin cool.");
    }
    if (exercises) {
      cautions.add("Even with high fitness levels, heat stroke is a risk. Opt for indoor workouts or exercise during cooler parts of the day.");
    }
  } else if (weather.tempC <= 15) {
    likelihood = "Cool temperatures may require extra layers for comfort.";
  }

  if (weather.aqi >= 5) {
    likelihood = "Very poor air quality poses a significant health risk, especially for sensitive groups.";
    cautions.add("Limit prolonged outdoor activity and consider a well-fitted mask if going outside.");
    
    if (conditions.includes("Asthma")) {
      cautions.add("Critical: Air quality is hazardous for asthma. Keep inhaler accessible and stay indoors as much as possible.");
    }
  } else if (weather.aqi === 4) {
    if (!likelihood.toLowerCase().includes("discomfort")) {
      likelihood = "Poor air quality may affect comfort and health for many individuals.";
    }
    if (conditions.includes("Asthma")) {
      cautions.add("Air quality is unhealthy for asthma. Reduce strenuous outdoor activity and keep your inhaler ready.");
    }
  } else if (weather.aqi === 3) {
    if (!likelihood.toLowerCase().includes("discomfort")) {
      likelihood = "Moderate air pollution could affect sensitive individuals.";
    }
    if (conditions.includes("Asthma")) {
      cautions.add("Air quality may trigger symptoms. Prefer lighter outdoor activity and monitor closely.");
    }
  }

  if (cautions.size === 0) {
    cautions.add("No specific health cautions necessary based on your inputs. Enjoy your day!");
  }

  return { likelihood, cautions: Array.from(cautions) };
}
