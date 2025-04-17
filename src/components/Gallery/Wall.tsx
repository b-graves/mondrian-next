'use client';

import React from 'react';
import SavedPainting from '../../types/SavedPainting';
import Canvas from '../Canvas/Canvas';

interface WallProps {
  rooms: Room[];
  userPaintings: SavedPainting[];
}

interface Room {
  paintings: SavedPainting[];
}

const Wall: React.FC<WallProps> = ({ rooms, userPaintings }) => {
  return (
    <div id="gallery__wall" className="gallery__wall">
      {/* User's recent paintings shown first */}
      {userPaintings.map((painting, index) => (
        <div key={`user-${index}`} className="gallery__hanging">
          <Canvas gallery={true} painting={painting.painting} />
          <div className="hanging__label">
            <div className="handing__artist">{painting.details.artist}</div>
            <div className="handing__title">{painting.details.title}</div>
            <div className="handing__year">{painting.details.year}</div>
          </div>
        </div>
      ))}
      
      {/* Other paintings from all rooms */}
      {rooms.map((room, roomIndex) => 
        room.paintings.map((painting, paintingIndex) => 
          painting !== null ? (
            <div key={`room-${roomIndex}-painting-${paintingIndex}`} className="gallery__hanging">
              <Canvas gallery={true} painting={painting.painting} />
              <div className="hanging__label">
                <div className="handing__artist">{painting.details.artist}</div>
                <div className="handing__title">{painting.details.title}</div>
                <div className="handing__year">{painting.details.year}</div>
              </div>
            </div>
          ) : null
        )
      )}
      
      <div className="gallery__continue--wall">
        Exhibition continues this way →
      </div>
    </div>
  );
};

export default Wall; 