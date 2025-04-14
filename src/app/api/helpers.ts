const isProduction = process.env.NODE_ENV === "production";

export const hawkBaseURL = isProduction
  ? process.env.NEXT_HAWK_BASE_URL
  : process.env.NEXT_PUBLIC_HAWK_BASE_URL;

export const hawkInitialParams = isProduction
  ? process.env.NEXT_HAWK_INITIAL_PARAMS
  : process.env.NEXT_PUBLIC_HAWK_INITIAL_PARAMS;

export const hawkEndParams = isProduction
  ? process.env.NEXT_HAWK_END_PARAMS
  : process.env.NEXT_PUBLIC_HAWK_END_PARAMS;

  export const googleMapsApiKey = isProduction
  ? process.env.NEXT_GOOGLE_MAPS_API_KEY
  : process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
