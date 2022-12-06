import onstreetBusSvg from "./svg/bus-withoutBox.svg";
import onstreetTramSvg from "./svg/tram-withoutBox.svg";
import railStationSvg from "./svg/rail-withoutBox.svg";
import metroStationSvg from "./svg/subway-withoutBox.svg";
import busStationSvg from "./svg/busstation-withoutBox.svg";
import ferryStopSvg from "./svg/ferry-withoutBox.svg";
import airportSvg from "./svg/airplane-withoutBox.svg";
import harbourPortSvg from "./svg/harbour-port-withoutBox.svg";
import liftStationSvg from "./svg/lift.svg";
import noInformationSvg from "./svg/no-information.svg";

export type Category =
  | "onstreetBus"
  | "onstreetTram"
  | "railStation"
  | "metroStation"
  | "busStation"
  | "ferryStop"
  | "airport"
  | "harbourPort"
  | "liftStation"
  | "other";

export const getNSRIconForCategory = (category: Category) => {
  const categoryIcon = {
    onstreetBus: onstreetBusSvg,
    onstreetTram: onstreetTramSvg,
    railStation: railStationSvg,
    metroStation: metroStationSvg,
    busStation: busStationSvg,
    ferryStop: ferryStopSvg,
    airport: airportSvg,
    harbourPort: harbourPortSvg,
    liftStation: liftStationSvg,
    other: noInformationSvg,
  };
  return categoryIcon[category] || noInformationSvg;
};
