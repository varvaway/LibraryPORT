import React, { useEffect } from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  margin: 20px 0;
  border-radius: 12px;
  overflow: hidden;
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.mahogany};
  font-size: 2.2rem;
  text-align: center;
  margin-bottom: 20px;
`;

export default function MapPlaceholder() {
  useEffect(() => {
    if (window.ymaps) {
      window.ymaps.ready(() => {
        const map = new window.ymaps.Map('map', {
          center: [59.954912, 30.294030],
          zoom: 16,
          controls: ['zoomControl']
        });

        const placemark = new window.ymaps.Placemark([59.954912, 30.294030], {
          balloonContent: 'Библиотека им. А. П. Гайдара'
        }, {
          preset: 'islands#redBookIcon'
        });

        map.geoObjects.add(placemark);
        map.behaviors.disable('scrollZoom');
      });
    }
  }, []);

  return (
    <div>
      <Title>Как нас найти</Title>
      <MapContainer id="map" />
    </div>
  );
}