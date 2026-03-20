const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY ?? "";
const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface WeatherCondition {
  readonly id: number;
  readonly main: string;
  readonly description: string;
  readonly icon: string;
}

export interface WeatherData {
  readonly temp: number;
  readonly feelsLike: number;
  readonly humidity: number;
  readonly windSpeed: number;
  readonly conditions: readonly WeatherCondition[];
  readonly isOutdoorFriendly: boolean;
  readonly summary: string;
  readonly fetchedAt: string;
}

export interface WeatherForecast {
  readonly date: string;
  readonly high: number;
  readonly low: number;
  readonly conditions: readonly WeatherCondition[];
  readonly precipitationChance: number;
  readonly isOutdoorFriendly: boolean;
}

// Simple in-memory cache
const weatherCache = new Map<string, { readonly data: WeatherData; readonly timestamp: number }>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

function isOutdoorSafe(conditions: readonly WeatherCondition[], windSpeed: number): boolean {
  const badWeatherIds = new Set([200, 201, 202, 210, 211, 212, 221, 230, 231, 232, 502, 503, 504, 511, 602, 622]);
  const hasBadWeather = conditions.some((c) => badWeatherIds.has(c.id));
  return !hasBadWeather && windSpeed < 40;
}

export async function fetchWeatherForLocation(
  lat: number,
  lng: number,
): Promise<{ readonly success: boolean; readonly data?: WeatherData; readonly error?: string }> {
  if (!OPENWEATHER_API_KEY) {
    return { success: false, error: "OPENWEATHER_API_KEY not configured" };
  }

  // Check cache
  const key = cacheKey(lat, lng);
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL_MS) {
    return { success: true, data: cached.data };
  }

  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("appid", OPENWEATHER_API_KEY);
    url.searchParams.set("units", "imperial");

    const response = await fetch(url.toString());
    if (!response.ok) {
      const text = await response.text();
      console.error("[weather] API error:", text);
      return { success: false, error: "Weather API request failed" };
    }

    const raw = await response.json();
    const conditions: WeatherCondition[] = (raw.weather ?? []).map((w: Record<string, unknown>) => ({
      id: w.id as number,
      main: w.main as string,
      description: w.description as string,
      icon: w.icon as string,
    }));

    const weather: WeatherData = {
      temp: raw.main?.temp ?? 0,
      feelsLike: raw.main?.feels_like ?? 0,
      humidity: raw.main?.humidity ?? 0,
      windSpeed: raw.wind?.speed ?? 0,
      conditions,
      isOutdoorFriendly: isOutdoorSafe(conditions, raw.wind?.speed ?? 0),
      summary: conditions.map((c) => c.description).join(", ") || "Unknown",
      fetchedAt: new Date().toISOString(),
    };

    weatherCache.set(key, { data: weather, timestamp: Date.now() });
    return { success: true, data: weather };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[weather] Fetch error:", message);
    return { success: false, error: message };
  }
}

export async function fetchForecastForLocation(
  lat: number,
  lng: number,
  days: number = 5,
): Promise<{ readonly success: boolean; readonly forecasts?: readonly WeatherForecast[]; readonly error?: string }> {
  if (!OPENWEATHER_API_KEY) {
    return { success: false, error: "OPENWEATHER_API_KEY not configured" };
  }

  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("appid", OPENWEATHER_API_KEY);
    url.searchParams.set("units", "imperial");
    url.searchParams.set("cnt", String(days * 8)); // 3-hour intervals

    const response = await fetch(url.toString());
    if (!response.ok) {
      return { success: false, error: "Forecast API request failed" };
    }

    const raw = await response.json();
    const dailyMap = new Map<string, { temps: number[]; conditions: WeatherCondition[]; pop: number[] }>();

    for (const entry of raw.list ?? []) {
      const date = (entry.dt_txt as string).split(" ")[0];
      const existing = dailyMap.get(date) ?? { temps: [], conditions: [], pop: [] };
      existing.temps.push(entry.main?.temp ?? 0);
      existing.pop.push(entry.pop ?? 0);
      for (const w of entry.weather ?? []) {
        existing.conditions.push({
          id: w.id,
          main: w.main,
          description: w.description,
          icon: w.icon,
        });
      }
      dailyMap.set(date, existing);
    }

    const forecasts: WeatherForecast[] = Array.from(dailyMap.entries())
      .slice(0, days)
      .map(([date, day]) => ({
        date,
        high: Math.max(...day.temps),
        low: Math.min(...day.temps),
        conditions: day.conditions.slice(0, 3),
        precipitationChance: Math.max(...day.pop) * 100,
        isOutdoorFriendly: isOutdoorSafe(day.conditions, 0),
      }));

    return { success: true, forecasts };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[weather] Forecast error:", message);
    return { success: false, error: message };
  }
}

export async function fetchWeatherForJob(
  jobId: string,
  lat: number,
  lng: number,
): Promise<{ readonly success: boolean; readonly data?: WeatherData; readonly error?: string }> {
  const result = await fetchWeatherForLocation(lat, lng);

  if (result.success && result.data) {
    console.log(`[weather] Job ${jobId}: ${result.data.summary}, ${result.data.temp}°F, outdoor-friendly: ${result.data.isOutdoorFriendly}`);
  }

  return result;
}
