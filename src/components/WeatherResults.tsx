import { AlertCircle } from "lucide-react";

interface WeatherResultsProps {
  data: {
    location: string;
    weather: {
      tempC: number;
      aqi: number;
      aqiLabel: string;
      humidity: number;
      condition: string;
    };
    advice: {
      likelihood: string;
      cautions: string[];
    };
  };
}

const WeatherResults = ({ data }: WeatherResultsProps) => {
  return (
    <div className="mt-8 bg-card/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-card border border-border animate-slide-up">
      <h2 className="text-3xl font-bold border-b-2 border-primary/30 pb-3 mb-6">
        Your Forecast for <span className="text-primary">{data.location}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-primary p-6 rounded-xl text-primary-foreground">
          <h3 className="text-2xl font-semibold mb-3">Weather Overview</h3>
          <div className="space-y-2 text-lg">
            <p>
              <span className="font-semibold">Temperature:</span> {data.weather.tempC}°C
            </p>
            <p>
              <span className="font-semibold">Air Quality:</span> {data.weather.aqi} ({data.weather.aqiLabel})
            </p>
            <p>
              <span className="font-semibold">Humidity:</span> {data.weather.humidity}%
            </p>
            <p>
              <span className="font-semibold">Condition:</span> {data.weather.condition}
            </p>
          </div>
        </div>

        <div className="bg-accent/20 p-6 rounded-xl border border-accent/30">
          <h3 className="text-2xl font-semibold text-accent mb-3">Personal Likelihood</h3>
          <p className="text-lg">{data.advice.likelihood}</p>
        </div>
      </div>

      <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/30">
        <h3 className="text-2xl font-semibold text-destructive mb-4">Health Cautions & Advice</h3>
        <ul className="space-y-3">
          {data.advice.cautions.map((caution, index) => (
            <li key={index} className="flex items-start gap-3 bg-card/50 p-4 rounded-lg">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <span className="text-lg">{caution}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeatherResults;
