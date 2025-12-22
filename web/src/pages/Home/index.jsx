/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import { useState } from 'react';
import '../../styles/smart-home.css';

const Home = () => {
  const [activeRoom, setActiveRoom] = useState('Living Room');
  const [acEnabled, setAcEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const acTemp = 19;

  const rooms = ['Living Room', 'Bed Room 1', 'Bed Room 2', 'Kitchen', 'Bed Room 3', 'Gym'];

  return (
    <div className="smart-home">
      {/* Header */}
      <div className="smart-header">
        <div className="header-left">
          <div 
            className={`toggle-switch ${acEnabled ? 'active' : ''}`}
            onClick={() => setAcEnabled(!acEnabled)}
          >
            <div className="toggle-knob"></div>
          </div>
        </div>
        <div className="header-right">
          {/* Music Player Mini */}
          <div className="music-player-mini">
            <div className="music-info">
              <div className="music-title">Still I'm Sure We'll Love Again</div>
              <div className="music-artist">Olivia M</div>
              <div className="music-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '30%' }}></div>
                </div>
                <div className="progress-time">
                  <span>2:40</span>
                  <span>4:20</span>
                </div>
              </div>
              <div className="music-controls">
                <button className="control-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>
                <button className="control-btn play-btn" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <button className="control-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="music-cover">
              <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" alt="Album Cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="smart-content">
        {/* Left Section */}
        <div className="content-left">
          {/* Weather & Greeting */}
          <div className="weather-greeting">
            <div className="weather-info">
              <span className="weather-icon">☀️</span>
              <span className="weather-temp">0°C</span>
              <span className="weather-humidity">59°</span>
            </div>
            <button className="mic-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
          </div>

          <div className="greeting">
            <h1>Hi Isabella,</h1>
            <h2>Have a great day</h2>
          </div>

          {/* Room Tabs */}
          <div className="room-tabs">
            {rooms.map((room) => (
              <button
                key={room}
                className={`room-tab ${activeRoom === room ? 'active' : ''}`}
                onClick={() => setActiveRoom(room)}
              >
                {room}
              </button>
            ))}
          </div>

          {/* Device Cards Grid */}
          <div className="device-grid">
            {/* Temperature Card */}
            <div className="device-card temp-card">
              <div className="card-header">
                <div className="device-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-2V5z"/>
                  </svg>
                </div>
              </div>
              <div className="temp-display">
                <span className="temp-value">19</span>
                <span className="temp-unit">°</span>
              </div>
              <div className="music-mini-player">
                <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=40&h=40&fit=crop" alt="" className="mini-cover" />
                <span className="mini-title">Still I'm Sure We'll L...</span>
              </div>
            </div>

            {/* Air Conditioner Card */}
            <div className="device-card ac-card">
              <div className="card-header">
                <div className="device-icon ac-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z"/>
                  </svg>
                </div>
                <span className="card-title">Air Conditioner</span>
              </div>
              <div className="card-status">Cooling to 19°</div>
            </div>

            {/* Air Quality Card */}
            <div className="device-card quality-card">
              <div className="quality-badge">Good Air Quality</div>
              <div className="quality-stats">
                <div className="stat-item">
                  <div className="stat-icon devices-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">6</span>
                    <span className="stat-label">Devices</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon aqi-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">10</span>
                    <span className="stat-label">AQI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Heart With Card */}
            <div className="device-card heart-card">
              <div className="card-header">
                <div className="device-icon heart-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span className="card-title">Heart With</span>
              </div>
            </div>

            {/* Nest Wifi Card */}
            <div className="device-card wifi-card">
              <div className="card-header">
                <div className="device-icon wifi-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                  </svg>
                </div>
                <span className="card-title">Nest Wifi</span>
              </div>
            </div>

            {/* Air Purifier Card */}
            <div className="device-card purifier-card">
              <div className="card-header">
                <div className="device-icon purifier-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  </svg>
                </div>
                <span className="card-title">Air Purifier</span>
              </div>
            </div>

            {/* Food Door Card */}
            <div className="device-card door-card">
              <div className="card-header">
                <div className="device-icon door-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                  </svg>
                </div>
                <span className="card-title">Food Door</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Air Conditioner Control */}
        <div className="content-right">
          {/* AC Header */}
          <div className="ac-header">
            <h3>Air Conditioner</h3>
            <div className="ac-device">
              <span>Samsung ARIO WindFree</span>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
          </div>

          {/* AC Temperature Display */}
          <div className="ac-temp-display">
            <div className="ac-temp-circle">
              <svg className="temp-progress" viewBox="0 0 120 120">
                <circle className="temp-bg" cx="60" cy="60" r="54" />
                <circle className="temp-fill" cx="60" cy="60" r="54" strokeDasharray="339.3" strokeDashoffset="85" />
              </svg>
              <div className="temp-content">
                <span className="temp-number">{acTemp}</span>
                <span className="temp-degree">°</span>
              </div>
            </div>
            <div className="humidity-indicator">
              <span>48%</span>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
              </svg>
            </div>
          </div>

          {/* AC Controls */}
          <div className="ac-controls">
            <button className="ac-control-btn active">
              <span className="control-label">Auto</span>
            </button>
            <button className="ac-control-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
              </svg>
              <span className="control-label">Swing</span>
            </button>
            <button className="ac-control-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <span className="control-label">Timer</span>
            </button>
          </div>

          {/* Power Usage */}
          <div className="power-usage">
            <div className="power-value">600 W</div>
            <div className="power-label">Automation Ener save</div>
          </div>

          {/* Volume Slider */}
          <div className="volume-slider">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <div className="slider-track">
              <div className="slider-fill" style={{ height: '48%' }}></div>
              <div className="slider-thumb" style={{ bottom: '48%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
