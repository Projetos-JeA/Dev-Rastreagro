import * as Location from 'expo-location';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  city: string;
}

interface WeatherResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

export async function getWeather(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erro ao buscar dados de clima');
    }

    const data: WeatherResponse = await response.json();

    // Busca o nome da cidade usando geocodificação reversa
    let city = 'Localização atual';
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode && geocode.length > 0) {
        const location = geocode[0];
        city = location.city || location.subregion || location.region || 'Localização atual';
      }
    } catch (geocodeError) {
      console.log('Erro ao buscar nome da cidade:', geocodeError);
    }

    return {
      temperature: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      weatherCode: data.current.weather_code,
      city,
    };
  } catch (error) {
    console.error('Erro ao buscar clima:', error);
    throw error;
  }
}

export function getWeatherDescription(code: number): string {
  if (code === 0) return 'Céu limpo';
  if (code <= 3) return 'Parcialmente nublado';
  if (code <= 48) return 'Nublado';
  if (code <= 67) return 'Chuva';
  if (code <= 77) return 'Neve';
  if (code <= 99) return 'Tempestade';
  return 'Desconhecido';
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return 'sunny-outline';
  if (code <= 3) return 'partly-sunny-outline';
  if (code <= 48) return 'cloud-outline';
  if (code <= 67) return 'rainy-outline';
  if (code <= 77) return 'snow-outline';
  if (code <= 99) return 'thunderstorm-outline';
  return 'cloud-outline';
}
