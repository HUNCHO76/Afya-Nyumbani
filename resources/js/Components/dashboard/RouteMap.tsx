import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  MapPin,
  Navigation,
  Clock,
  Users,
  Loader2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  location_address: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  status: string;
  patientName?: string;
}

interface Practitioner {
  id: string;
  name: string;
  current_latitude: number | null;
  current_longitude: number | null;
  appointments: Appointment[];
}

interface RouteMapProps {
  userId?: string;
  isAdmin?: boolean;
}

export const RouteMap = ({ userId, isAdmin = false }: RouteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    fetchPractitionersWithAppointments();
  }, []);

  const fetchPractitionersWithAppointments = async () => {
    try {
      let query = supabase.from("practitioner_profiles").select("*");
      
      if (!isAdmin && userId) {
        query = query.eq("user_id", userId);
      }

      const { data: practitionersData, error } = await query;
      if (error) throw error;

      const today = format(new Date(), "yyyy-MM-dd");

      const practitionersWithAppointments = await Promise.all(
        (practitionersData || []).map(async (p) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", p.user_id)
            .single();

          const { data: appointments } = await supabase
            .from("appointments")
            .select("*")
            .eq("practitioner_id", p.id)
            .eq("appointment_date", today)
            .in("status", ["confirmed", "in_progress"])
            .order("appointment_time", { ascending: true });

          const appointmentsWithNames = await Promise.all(
            (appointments || []).map(async (apt) => {
              const { data: patient } = await supabase
                .from("patients")
                .select("user_id")
                .eq("id", apt.patient_id)
                .single();

              let patientName = "Unknown";
              if (patient) {
                const { data: patientProfile } = await supabase
                  .from("profiles")
                  .select("full_name")
                  .eq("user_id", patient.user_id)
                  .single();
                patientName = patientProfile?.full_name || "Unknown";
              }

              return { ...apt, patientName };
            })
          );

          return {
            id: p.id,
            name: profile?.full_name || "Unknown",
            current_latitude: p.current_latitude,
            current_longitude: p.current_longitude,
            appointments: appointmentsWithNames,
          };
        })
      );

      setPractitioners(practitionersWithAppointments);
      if (practitionersWithAppointments.length > 0 && !selectedPractitioner) {
        setSelectedPractitioner(practitionersWithAppointments[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeMap = async () => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      const mapboxgl = await import("mapbox-gl");
      await import("mapbox-gl/dist/mapbox-gl.css");

      mapboxgl.default.accessToken = mapboxToken;

      const map = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [39.2083, -6.7924], // Dar es Salaam
        zoom: 11,
      });

      map.addControl(new mapboxgl.default.NavigationControl(), "top-right");

      const selected = practitioners.find((p) => p.id === selectedPractitioner);
      if (!selected) return;

      // Add practitioner marker
      if (selected.current_latitude && selected.current_longitude) {
        const el = document.createElement("div");
        el.className = "practitioner-marker";
        el.style.cssText = `
          width: 40px;
          height: 40px;
          background: hsl(212, 85%, 45%);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        `;
        el.innerHTML = "P";

        new mapboxgl.default.Marker(el)
          .setLngLat([selected.current_longitude, selected.current_latitude])
          .setPopup(new mapboxgl.default.Popup().setHTML(`<strong>${selected.name}</strong><br>Current Location`))
          .addTo(map);
      }

      // Add appointment markers
      selected.appointments.forEach((apt, index) => {
        if (apt.location_latitude && apt.location_longitude) {
          const el = document.createElement("div");
          el.style.cssText = `
            width: 30px;
            height: 30px;
            background: hsl(142, 70%, 45%);
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
          `;
          el.innerHTML = String(index + 1);

          new mapboxgl.default.Marker(el)
            .setLngLat([apt.location_longitude, apt.location_latitude])
            .setPopup(
              new mapboxgl.default.Popup().setHTML(
                `<strong>${apt.patientName}</strong><br>${apt.service_type}<br>${apt.appointment_time}`
              )
            )
            .addTo(map);
        }
      });

      // Draw route line if there are multiple points
      const coordinates: [number, number][] = [];
      if (selected.current_latitude && selected.current_longitude) {
        coordinates.push([selected.current_longitude, selected.current_latitude]);
      }
      selected.appointments.forEach((apt) => {
        if (apt.location_latitude && apt.location_longitude) {
          coordinates.push([apt.location_longitude, apt.location_latitude]);
        }
      });

      if (coordinates.length >= 2) {
        map.on("load", () => {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates,
              },
            },
          });

          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "hsl(212, 85%, 45%)",
              "line-width": 4,
              "line-dasharray": [2, 2],
            },
          });

          // Fit bounds to show all markers
          const bounds = new mapboxgl.default.LngLatBounds();
          coordinates.forEach((coord) => bounds.extend(coord as [number, number]));
          map.fitBounds(bounds, { padding: 50 });
        });
      }

      setShowTokenInput(false);
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Failed to initialize map. Please check your Mapbox token.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (mapboxToken && selectedPractitioner) {
      initializeMap();
    }
  }, [mapboxToken, selectedPractitioner, practitioners]);

  const selected = practitioners.find((p) => p.id === selectedPractitioner);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Route Optimization</h2>
          <p className="text-sm text-muted-foreground">View practitioner routes for today's appointments</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPractitionersWithAppointments}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {showTokenInput && (
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label>Mapbox Public Token</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enter your Mapbox public token to enable the map. Get one at{" "}
                  <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    mapbox.com
                  </a>
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="pk.eyJ1..."
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                  />
                  <Button onClick={initializeMap} disabled={!mapboxToken}>
                    Load Map
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practitioner List */}
        {isAdmin && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Practitioners
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {practitioners.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPractitioner(p.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedPractitioner === p.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm opacity-80">
                    {p.appointments.length} appointments today
                  </p>
                </button>
              ))}
              {practitioners.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No practitioners found</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Map Container */}
        <div className={isAdmin ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div
                ref={mapContainer}
                className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center"
              >
                {!mapboxToken && (
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>Enter Mapbox token to view map</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Today's Route */}
      {selected && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              {selected.name}'s Route - {format(new Date(), "PPP")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selected.appointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No appointments scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {selected.appointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    className="flex items-start gap-4 p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-secondary text-secondary-foreground rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{apt.patientName}</p>
                        <Badge variant="outline">{apt.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{apt.service_type}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {apt.appointment_time}
                        </span>
                        {apt.location_address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {apt.location_address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
