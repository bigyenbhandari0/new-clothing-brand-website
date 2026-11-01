import { WinterWeather } from "./WinterWeather";
export function StudioLights({ reduced }: { reduced: boolean }) {
  return <WinterWeather studio running={!reduced} />;
}
