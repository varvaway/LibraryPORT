import React, { useEffect } from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 600px;
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
    let mapInstance = null; // Объявляем переменную для экземпляра карты

    if (window.ymaps) {
      window.ymaps.ready(() => {
        mapInstance = new window.ymaps.Map('map', {
          center: [59.954912, 30.294030],
          zoom: 17,
          controls: ['zoomControl']
        });

        const placemark = new window.ymaps.Placemark([59.954912, 30.294030], {
          balloonContent: 'Библиотека им. А. П. Гайдара'
        }, {
          preset: 'islands#redBookIcon'
        });

        mapInstance.geoObjects.add(placemark);
        mapInstance.behaviors.disable('scrollZoom');
      });
    }

    // Функция очистки
    return () => {
      if (mapInstance) {
        mapInstance.destroy(); // Уничтожаем экземпляр карты при демонтировании
      }
    };

  }, []);

  return (
    <div>
      <Title>Как нас найти</Title>
      <MapContainer id="map" />
    </div>
  );
}