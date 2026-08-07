import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Navigation } from "lucide-react";

interface Coordinates {
  lat: number;
  lng: number;
  label?: string;
}

interface AddressInputProps {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (val: string, coords: Coordinates | null) => void;
  lang?: "en" | "ca" | "es";
  id?: string;
}

// Highly reliable utility to extract house/street number from user's manual query
function extractHouseNumber(queryStr: string): string {
  if (!queryStr) return "";
  // Find all numeric segments that might represent a building/street number (e.g., "15", "272", "45A", "12-14")
  // We exclude 5-digit Spanish/Catalonian postcodes (starting with 08 or general 5 digits)
  const matches = queryStr.match(/\b\d+[-/]?\d*[a-zA-Z]?\b/g);
  if (!matches) return "";
  
  for (const match of matches) {
    // If it's 5 digits, it's very likely a postcode in Spain, so skip it
    if (match.length === 5 && /^\d+$/.test(match)) {
      continue;
    }
    return match;
  }
  return "";
}

export default function AddressInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
  lang = "en",
  id,
}: AddressInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [useGoogle, setUseGoogle] = useState(false);
  const [geoErrorMsg, setGeoErrorMsg] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-clear error messages after 4 seconds
  useEffect(() => {
    if (geoErrorMsg) {
      const timer = setTimeout(() => setGeoErrorMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [geoErrorMsg]);

  // Auto-detect if Google Maps Platform is loaded globally via InteractiveMap's APIProvider
  useEffect(() => {
    const checkGoogle = () => {
      if ((window as any).google?.maps?.places) {
        setUseGoogle(true);
        return true;
      }
      return false;
    };

    if (checkGoogle()) return;

    const interval = setInterval(() => {
      if (checkGoogle()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Synchronize internal query state if prop changes (e.g. from preset select)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle clicking outside our suggestion dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoErrorMsg(lang === "ca" ? "La geolocalització no és compatible amb aquest navegador." : "Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "User-Agent": "MajesticFleetSlApplet/1.0"
              }
            }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const streetName = addr.road || addr.pedestrian || addr.cycleway || addr.path || addr.suburb || addr.neighbourhood || "";
            const houseNum = addr.house_number || "";
            const city = addr.city || addr.town || addr.village || "";
            
            let formattedAddress = "";
            if (streetName) {
              formattedAddress = streetName;
              if (houseNum) {
                formattedAddress += `, ${houseNum}`;
              }
              if (city) {
                formattedAddress += `, ${city}`;
              }
            } else {
              formattedAddress = data.display_name.split(",").slice(0, 3).join(", ");
            }

            setQuery(formattedAddress);
            onChange(formattedAddress, {
              lat: latitude,
              lng: longitude,
              label: formattedAddress
            });
          } else {
            const fallbackStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            setQuery(fallbackStr);
            onChange(fallbackStr, {
              lat: latitude,
              lng: longitude,
              label: fallbackStr
            });
          }
        } catch (err) {
          console.error("Error reverse geocoding current position:", err);
          const fallbackStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setQuery(fallbackStr);
          onChange(fallbackStr, {
            lat: latitude,
            lng: longitude,
            label: fallbackStr
          });
        } finally {
          setLocating(false);
          setLoading(false);
          setIsOpen(false);
        }
      },
      (error) => {
        console.error("Error getting geolocation:", error);
        setLocating(false);
        setLoading(false);
        let errorText = "Unable to retrieve location";
        if (error.code === error.PERMISSION_DENIED) {
          errorText = lang === "ca" ? "Permís de geolocalització denegat" : "Geolocation permission denied";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorText = lang === "ca" ? "Ubicació no disponible" : "Location position unavailable";
        } else if (error.code === error.TIMEOUT) {
          errorText = lang === "ca" ? "Temps d'espera esgotat" : "Location request timed out";
        }
        setGeoErrorMsg(errorText);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Fetch Suggestions as user types (debounce / interval)
  useEffect(() => {
    if (!query || query.length < 3 || !isOpen) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);

      const fetchNominatim = async () => {
        try {
          // Query Catalunya viewbox strictly for maximum street name & number accuracy.
          // By adding &bounded=1, we restrict results strictly to Catalunya/Barcelona.
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}&countrycodes=es&viewbox=0.15,40.5,3.33,42.9&bounded=1&limit=15&addressdetails=1`,
            {
              headers: {
                "User-Agent": "MajesticFleetSlApplet/1.0"
              }
            }
          );

          if (res.ok) {
            let data = await res.json();
            
            // If no local Catalunya/Barcelona results with exact query, run fallback with Catalunya appended
            if (!data || data.length === 0) {
              const fallbackRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                  query + ", Catalunya"
                )}&countrycodes=es&viewbox=0.15,40.5,3.33,42.9&bounded=1&limit=10&addressdetails=1`,
                {
                  headers: {
                    "User-Agent": "MajesticFleetSlApplet/1.0"
                  }
                }
              );
              if (fallbackRes.ok) {
                data = await fallbackRes.json();
              }
            }

            // Strictly filter out any results that are not in Catalunya/Barcelona region
            const filteredData = (data || []).filter((item: any) => {
              const addr = item.address || {};
              const state = (addr.state || "").toLowerCase();
              const county = (addr.county || "").toLowerCase();
              const city = (addr.city || addr.town || addr.village || "").toLowerCase();
              const postcode = (addr.postcode || "").toLowerCase();
              const displayName = (item.display_name || "").toLowerCase();

              const inCatalunya =
                state.includes("catalunya") ||
                state.includes("catalonia") ||
                state.includes("cataluña") ||
                displayName.includes("catalunya") ||
                displayName.includes("catalonia") ||
                displayName.includes("cataluña") ||
                displayName.includes("barcelona") ||
                displayName.includes("girona") ||
                displayName.includes("gerona") ||
                displayName.includes("lleida") ||
                displayName.includes("lérida") ||
                displayName.includes("tarragona") ||
                city.includes("barcelona") ||
                county.includes("barcelona") ||
                // Spanish postcodes for Catalan provinces start with 08 (Barcelona), 17 (Girona), 25 (Lleida), 43 (Tarragona)
                /^(08|17|25|43)/.test(postcode);

              return inCatalunya;
            });

            setSuggestions(filteredData);
          }
        } catch (err) {
          console.error("Nominatim search query failed:", err);
        } finally {
          setLoading(false);
        }
      };

      if (useGoogle && (window as any).google?.maps?.places) {
        try {
          const google = (window as any).google;
          const autocompleteService = new google.maps.places.AutocompleteService();
          const options: any = {
            input: query,
            componentRestrictions: { country: "es" },
          };

          if (google.maps.LatLngBounds) {
            options.bounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(40.5, 0.15), // Southwest boundary
              new google.maps.LatLng(42.9, 3.33)  // Northeast boundary
            );
          }

          autocompleteService.getPlacePredictions(options, (predictions: any, status: any) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              // Strictly filter Google Places predictions client-side to Catalunya / Barcelona
              const filteredPredictions = predictions.filter((p: any) => {
                const desc = (p.description || "").toLowerCase();
                const sec = (p.structured_formatting?.secondary_text || "").toLowerCase();

                const inCatalunya =
                  desc.includes("barcelona") ||
                  desc.includes("catalunya") ||
                  desc.includes("catalonia") ||
                  desc.includes("cataluña") ||
                  desc.includes("girona") ||
                  desc.includes("gerona") ||
                  desc.includes("lleida") ||
                  desc.includes("lérida") ||
                  desc.includes("tarragona") ||
                  desc.includes("hospitalet") ||
                  desc.includes("badalona") ||
                  desc.includes("terrassa") ||
                  desc.includes("sabadell") ||
                  desc.includes("mataró") ||
                  sec.includes("barcelona") ||
                  sec.includes("catalunya") ||
                  sec.includes("catalonia") ||
                  sec.includes("cataluña") ||
                  sec.includes("girona") ||
                  sec.includes("gerona") ||
                  sec.includes("lleida") ||
                  sec.includes("lérida") ||
                  sec.includes("tarragona");

                return inCatalunya;
              });

              const formatted = filteredPredictions.map((p: any) => ({
                isGoogle: true,
                place_id: p.place_id,
                display_name: p.description,
                main_text: p.structured_formatting?.main_text || p.description,
                secondary_text: p.structured_formatting?.secondary_text || "",
              }));
              setSuggestions(formatted);
              setLoading(false);
            } else {
              fetchNominatim();
            }
          });
        } catch (error) {
          console.warn("Google Places autocomplete failed, falling back to Nominatim", error);
          fetchNominatim();
        }
      } else {
        fetchNominatim();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, isOpen, useGoogle]);

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
        {label}
      </label>
      
      <div className="relative">
        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onChange("", null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-neutral-50/90 border border-neutral-200 rounded text-xs py-2 md:py-2.5 px-3 pl-9 pr-9 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none font-medium text-neutral-800 transition-colors shadow-sm"
        />
        
        {/* Input Left Icon Decorator */}
        <div className="absolute left-3 top-2.5 md:top-3 text-neutral-400 pointer-events-none">
          {icon}
        </div>

        {/* Loading Spinner or Clear Input / Geolocation */}
        <div className="absolute right-3 top-2.5 md:top-3 flex items-center gap-2 z-10">
          {locating && (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          )}
          
          {!locating && !query && (
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              title={lang === "ca" ? "Utilitza la ubicació actual" : "Use current location"}
              className="text-neutral-400 hover:text-amber-600 transition focus:outline-none cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          )}

          {loading && !locating ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("", null);
                setSuggestions([]);
              }}
              className="text-neutral-400 hover:text-neutral-700 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Inline Non-Blocking Error Alert */}
      {geoErrorMsg && (
        <p className="text-[10px] text-red-500 font-medium leading-normal animate-pulse mt-1 pl-1">
          ⚠️ {geoErrorMsg}
        </p>
      )}

      {/* Suggestion list Overlay dropdown */}
      {isOpen && (suggestions.length > 0 || !query) && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded shadow-xl max-h-[260px] overflow-y-auto z-[2500] divide-y divide-neutral-100">
          
          {/* Current Location Quick Option */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="w-full text-left p-3 hover:bg-amber-50/50 hover:text-amber-900 transition-colors flex items-center gap-2.5 font-medium text-amber-800 text-xs cursor-pointer group"
          >
            {locating ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
            ) : (
              <Navigation className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
            )}
            <span className="font-semibold">
              {locating 
                ? (lang === "ca" ? "S'està obtenint la ubicació..." : "Retrieving location...") 
                : (lang === "ca" ? "Utilitza la meva ubicació actual" : "Use Current Location")}
            </span>
          </button>

          {suggestions.map((suggestion) => {
            let mainName = "";
            let addressDetails = "";
            let uniqueKey = suggestion.place_id || suggestion.osm_id || Math.random().toString();
            let clickHandler: () => void;

            if (suggestion.isGoogle) {
              mainName = suggestion.main_text;
              addressDetails = suggestion.secondary_text;

              clickHandler = () => {
                const google = (window as any).google;
                if (!google?.maps?.places) return;

                setLoading(true);
                const dummyDiv = document.createElement("div");
                const service = new google.maps.places.PlacesService(dummyDiv);

                service.getDetails(
                  {
                    placeId: suggestion.place_id,
                    fields: ["geometry", "formatted_address", "address_components", "name"],
                  },
                  (placeDetails: any, status: any) => {
                    setLoading(false);
                    if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails?.geometry?.location) {
                      const lat = placeDetails.geometry.location.lat();
                      const lng = placeDetails.geometry.location.lng();
                      
                      const comps = placeDetails.address_components || [];
                      let streetNumber = "";
                      let streetName = "";
                      let city = "";
                      const poiName = placeDetails.name || "";

                      comps.forEach((c: any) => {
                        const types = c.types || [];
                        if (types.includes("street_number")) {
                          streetNumber = c.long_name || c.short_name || "";
                        } else if (types.includes("route")) {
                          streetName = c.long_name || c.short_name || "";
                        } else if (types.includes("locality")) {
                          city = c.long_name || c.short_name || "";
                        }
                      });

                      // High accuracy extraction fallback
                      if (!streetNumber) {
                        streetNumber = extractHouseNumber(query);
                      }

                      let formattedAddress = "";
                      const isPoiValid = poiName && poiName !== streetName && !streetName.includes(poiName) && poiName !== city;

                      if (isPoiValid) {
                        formattedAddress = poiName;
                        if (streetName) {
                          formattedAddress += `, ${streetName}`;
                        }
                        if (streetNumber) {
                          formattedAddress += `, ${streetNumber}`;
                        }
                      } else if (streetName) {
                        formattedAddress = streetName;
                        if (streetNumber) {
                          formattedAddress += `, ${streetNumber}`;
                        }
                      } else {
                        formattedAddress = placeDetails.formatted_address || suggestion.display_name;
                      }

                      if (city && !formattedAddress.includes(city)) {
                        formattedAddress += `, ${city}`;
                      }

                      setQuery(formattedAddress);
                      setIsOpen(false);
                      onChange(formattedAddress, { lat, lng, label: formattedAddress });
                    }
                  }
                );
              };
            } else {
              // Highly robust OSM Nominatim formatting
              const addr = suggestion.address || {};
              const streetName = addr.road || addr.pedestrian || addr.cycleway || addr.path || addr.suburb || addr.neighbourhood || "";
              let houseNum = addr.house_number || "";
              const city = addr.city || addr.town || addr.village || addr.municipality || "";
              const postcode = addr.postcode || "";
              const poi = addr.amenity || addr.tourism || addr.historic || addr.leisure || addr.aeroway || addr.railway || "";

              // High accuracy extraction fallback for OSM Nominatim
              if (!houseNum) {
                houseNum = extractHouseNumber(query);
              }

              if (poi) {
                mainName = poi;
                if (streetName) {
                  mainName += ` • ${streetName}`;
                }
                if (houseNum) {
                  mainName += `, ${houseNum}`;
                }
              } else if (streetName) {
                mainName = streetName;
                if (houseNum) {
                  mainName += `, ${houseNum}`;
                }
              } else {
                mainName = suggestion.display_name.split(",")[0];
              }

              // Build secondary details description line
              const parts = [];
              if (addr.quarter) {
                parts.push(addr.quarter);
              } else if (addr.suburb) {
                parts.push(addr.suburb);
              }
              
              if (city) {
                parts.push(city);
              } else if (addr.county) {
                parts.push(addr.county);
              }

              if (postcode) {
                parts.push(postcode);
              }

              addressDetails = parts.join(", ") || suggestion.display_name.split(",").slice(1, 4).join(", ");

              // Build clean final formatted address string
              let formattedAddress = "";
              if (poi) {
                formattedAddress = poi;
                if (streetName) {
                  formattedAddress += `, ${streetName}`;
                }
                if (houseNum) {
                  formattedAddress += `, ${houseNum}`;
                }
              } else if (streetName) {
                formattedAddress = streetName;
                if (houseNum) {
                  formattedAddress += `, ${houseNum}`;
                }
              } else {
                formattedAddress = suggestion.display_name.split(",").slice(0, 3).join(", ");
              }

              if (city && !formattedAddress.includes(city)) {
                formattedAddress += `, ${city}`;
              }

              clickHandler = () => {
                const coords = {
                  lat: parseFloat(suggestion.lat),
                  lng: parseFloat(suggestion.lon),
                  label: formattedAddress,
                };
                setQuery(formattedAddress);
                setIsOpen(false);
                onChange(formattedAddress, coords);
              };
            }

            return (
              <button
                key={uniqueKey}
                type="button"
                onClick={clickHandler}
                className="w-full text-left p-3 hover:bg-amber-50/50 transition-colors flex items-start gap-2.5 group cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-amber-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-neutral-850 truncate group-hover:text-amber-900 leading-normal">
                    {mainName}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate mt-0.5 max-w-full font-light leading-normal">
                    {addressDetails}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
