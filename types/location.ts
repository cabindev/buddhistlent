export interface LocationData {
  district: string;
  amphoe: string;
  province: string;
  type: string;
  geocode: string;
  lat: number;
  lng: number;
  zipcode?: string;
}

export interface RegionData {
  district: string;
  amphoe: string;
  province: string;
  type: string;
  district_code: number;
  zipcode?: number;
}