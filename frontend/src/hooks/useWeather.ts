import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { getWeather, getWeatherDescription, getWeatherIcon } from '../services/weatherService';

interface WeatherState {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  city: string;
  loading: boolean;
  error: string | null;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherState>({
    temperature: 0,
    humidity: 0,
    windSpeed: 0,
    description: '',
    icon: 'cloud-outline',
    city: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchWeather() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setWeather(prev => ({
            ...prev,
            loading: false,
            error: 'Permissão de localização negada. Ative a localização nas configurações.',
          }));
          return;
        }

        let latitude: number;
        let longitude: number;

        try {
          const locationPromise = Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Lowest,
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout ao obter localização')), 10000)
          );

          const location = (await Promise.race([
            locationPromise,
            timeoutPromise,
          ])) as Location.LocationObject;
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
        } catch (locationError) {
          latitude = -23.5505;
          longitude = -46.6333;
        }

        const weatherData = await getWeather(latitude, longitude);

        setWeather({
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          description: getWeatherDescription(weatherData.weatherCode),
          icon: getWeatherIcon(weatherData.weatherCode),
          city: weatherData.city,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        let errorMessage = 'Erro ao buscar dados de clima';

        if (error?.message?.includes('location') || error?.message?.includes('unavailable')) {
          errorMessage = 'Serviços de localização indisponíveis';
        } else if (error?.message?.includes('Network')) {
          errorMessage = 'Erro de conexão';
        }

        setWeather(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    }

    fetchWeather();
  }, []);

  return weather;
}
