import { AtelierLamps } from "./AtelierLamps";
import { WinterWeather } from "./WinterWeather";
export function StudioLights({ reduced }: { reduced: boolean }) {
  return (
    <>
      <AtelierLamps />
      <WinterWeather studio running={!reduced} />
    </>
  );
}
