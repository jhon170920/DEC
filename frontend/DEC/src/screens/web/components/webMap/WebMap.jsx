import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// Solucionar el problema de los iconos de Leaflet en web
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const WebMap = ({ geoJsonUrl, points, radiusScale, colorScale, heatRadius }) => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar el GeoJSON desde R2
  useEffect(() => {
    if (!geoJsonUrl) {
      setLoading(false);
      return;
    }

    fetch(geoJsonUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando GeoJSON:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [geoJsonUrl]);

  // Estilo de los polígonos de las veredas
  const veredaStyle = {
    weight: 1,
    color: '#475569',
    fillColor: '#cbd5e1',
    fillOpacity: 0.5,
  };

  // Centro de Colombia (aprox)
  const center = [4.5709, -74.2973];
  const zoom = 6;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text>Cargando mapa de veredas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error cargando GeoJSON: {error}</Text>
        <Text>Verifica la URL en Cloudflare R2</Text>
      </View>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Capa de veredas (GeoJSON) */}
      {geoJsonData && <GeoJSON data={geoJsonData} style={veredaStyle} />}

      {/* Puntos de calor (detecciones) */}
      {points.map((point, idx) => {
        const radius = radiusScale(point.intensity) * (heatRadius / 25);
        const color = colorScale(point.intensity);
        return (
          <CircleMarker
            key={idx}
            center={[point.lat, point.lng]}
            radius={radius}
            fillColor={color}
            color="#fff"
            weight={1.5}
            fillOpacity={0.7}
          >
            <Tooltip sticky>
              <span>Intensidad: {Math.round(point.intensity * 100)}%</span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
};

export default WebMap;