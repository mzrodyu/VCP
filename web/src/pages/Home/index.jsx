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

import { IconFile, IconPlay } from '@douyinfe/semi-icons';
import { Button } from '@douyinfe/semi-ui';
import { marked } from 'marked';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { API, copy, showError, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import '../../styles/smart-home.css';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress = statusState?.status?.server_address || `${window.location.origin}`;

  const [activeRoom, setActiveRoom] = useState('Living Room');
  const [isPlaying, setIsPlaying] = useState(false);
  const [acMode, setAcMode] = useState('Cooling');

  const rooms = ['Living Room', 'Bed Room 1', 'Bed Room 2', 'Kitchen', 'Bed Room 3', 'Garage'];

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) showSuccess(t('已复制到剪切板'));
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };
    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  return (
    <div className="smart-home-wrapper">
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className="smart-home">
          {/* Header */}
          <div className="smart-header">
            <div className="header-left">
              <div className="toggle-switch active">
                <div className="toggle-knob"></div>
              </div>
            </div>
            <div className="header-right">
              {/* Music Player */}
              <div className="music-player-card">
                <div className="music-info">
                  <div className="music-title">Still I'm Sure We'll Love Again</div>
                  <div className="music-artist">Dewa 19</div>
                  <div className="music-progress">
                    <span>0:48</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '20%' }}></div>
                    </div>
                    <span>3:56</span>
                  </div>
                  <div className="music-controls">
                    <button className="ctrl-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                      </svg>
                    </button>
                    <button className="ctrl-btn play-btn" onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                    <button className="ctrl-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="music-cover">
                  <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop" alt="Album" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="smart-content">
            {/* Left Panel */}
            <div className="content-left">
              <div className="weather-row">
                <div className="weather-info">
                  <span className="weather-icon">☀</span>
                  <span className="weather-val">51%</span>
                  <span className="weather-icon">🌡</span>
                  <span className="weather-val">22°</span>
                </div>
                <div className="user-avatar">
                  <img src="https://i.pravatar.cc/40" alt="User" />
                </div>
              </div>

              <div className="greeting-section">
                <h1 className="greeting-title">Hi Isabella,</h1>
                <h2 className="greeting-subtitle">Have a great day</h2>
              </div>

              {/* Room Tabs */}
              <div className="room-tabs">
                <button className="add-room-btn">+</button>
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

              {/* Device Cards */}
              <div className="device-grid">
                {/* Main Light Card */}
                <div className="device-card light-card">
                  <div className="light-visual">
                    <div className="light-bar orange"></div>
                    <div className="light-bar blue"></div>
                  </div>
                  <div className="light-control">
                    <div className="brightness-icon">☀</div>
                    <div className="brightness-slider"></div>
                  </div>
                  <div className="card-footer">
                    <div className="card-info">
                      <span className="card-name">Main light</span>
                      <span className="card-sub">4 Devices</span>
                    </div>
                    <button className="power-btn">⏻</button>
                  </div>
                </div>

                {/* AC Card */}
                <div className="device-card ac-card">
                  <div className="ac-temp-control">
                    <button className="temp-btn">−</button>
                    <span className="temp-display">19<sup>°C</sup></span>
                    <button className="temp-btn">+</button>
                  </div>
                  <div className="card-footer">
                    <div className="card-info">
                      <span className="card-name">Air Conditioner</span>
                      <span className="card-sub">Cooling to 19°</span>
                    </div>
                    <button className="power-btn active">⏻</button>
                  </div>
                </div>

                {/* Speaker Card */}
                <div className="device-card speaker-card">
                  <div className="speaker-info">
                    <div className="now-playing">in - Still I'm Sure We'll Love...</div>
                    <div className="speaker-artist">Dewa 19</div>
                  </div>
                  <div className="speaker-controls">
                    <button className="sp-btn">◀◀</button>
                    <button className="sp-btn play">▶</button>
                    <button className="sp-btn">▶▶</button>
                  </div>
                  <div className="card-footer">
                    <div className="card-info">
                      <span className="card-name">Speaker</span>
                      <span className="card-sub">Paused</span>
                    </div>
                    <div className="spotify-icon">🎵</div>
                  </div>
                </div>

                {/* Nest Wifi Card */}
                <div className="device-card wifi-card">
                  <div className="wifi-stats">
                    <div className="wifi-stat">
                      <span className="stat-icon up">↑</span>
                      <span>2.4 MB/sec</span>
                    </div>
                    <div className="wifi-stat">
                      <span className="stat-icon down">↓</span>
                      <span>3.1 MB/sec</span>
                    </div>
                  </div>
                  <div className="wifi-icon-big">📶</div>
                  <div className="card-footer">
                    <div className="card-info">
                      <span className="card-name">Nest Wifi</span>
                      <span className="card-sub">Online</span>
                    </div>
                    <span className="device-count">6 Devices</span>
                  </div>
                </div>

                {/* Air Quality Card */}
                <div className="device-card quality-card">
                  <div className="quality-badge">Good Air Quality</div>
                  <div className="quality-metrics">
                    <div className="metric">
                      <span className="metric-label">PM 2.5</span>
                      <span className="metric-value">10</span>
                      <span className="metric-unit">μg/m2</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="card-info">
                      <span className="card-name">Air Purifier</span>
                      <span className="card-sub">Auto</span>
                    </div>
                    <button className="power-btn">⏻</button>
                  </div>
                </div>

                {/* Front Door Card */}
                <div className="device-card door-card">
                  <div className="door-icon">🚪</div>
                  <div className="door-status">
                    <span className="status-label">Front Door</span>
                    <span className="status-time">Last opened on 07:21 am</span>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="cta-section">
                <div className="cta-text">
                  <h3>{t('开始使用 API')}</h3>
                  <p className="api-url" onClick={handleCopyURL}>{serverAddress}</p>
                </div>
                <div className="cta-buttons">
                  <Link to="/console">
                    <Button theme="solid" type="primary" icon={<IconPlay />} className="cta-btn">
                      {t('获取密钥')}
                    </Button>
                  </Link>
                  {docsLink && (
                    <Button icon={<IconFile />} onClick={() => window.open(docsLink, '_blank')} className="cta-btn-outline">
                      {t('文档')}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - AC Control */}
            <div className="content-right">
              <div className="ac-panel">
                <div className="ac-panel-header">
                  <h3>Air Conditioner</h3>
                  <div className="ac-device-select">
                    <span>Samsung AR10 WindFree</span>
                    <span className="dropdown-arrow">▾</span>
                  </div>
                  <div className="power-toggle active">
                    <span className="toggle-dot"></span>
                  </div>
                </div>

                <div className="ac-display">
                  <div className="ac-temp-ring">
                    <svg viewBox="0 0 120 120" className="temp-ring-svg">
                      <circle cx="60" cy="60" r="54" className="ring-bg" />
                      <circle cx="60" cy="60" r="54" className="ring-fill" strokeDasharray="339" strokeDashoffset="100" />
                    </svg>
                    <div className="temp-value">
                      <span className="snowflake">❄</span>
                      <span className="big-temp">19</span>
                      <span className="temp-unit">°C</span>
                    </div>
                  </div>
                  <div className="humidity-badge">
                    <span>48%</span>
                    <span className="humidity-icon">💧</span>
                  </div>
                </div>

                <div className="ac-modes">
                  {['Wind', 'Cooling', 'Dry'].map((mode) => (
                    <button
                      key={mode}
                      className={`mode-btn ${acMode === mode ? 'active' : ''}`}
                      onClick={() => setAcMode(mode)}
                    >
                      <span className="mode-icon">
                        {mode === 'Wind' && '🌀'}
                        {mode === 'Cooling' && '❄'}
                        {mode === 'Dry' && '💨'}
                      </span>
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="ac-actions">
                  <button className="action-btn">
                    <span>🔄</span> Auto
                  </button>
                  <button className="action-btn active">
                    <span>↔</span> Swing
                  </button>
                  <button className="action-btn">
                    <span>⏱</span> Timer
                  </button>
                </div>

                <div className="ac-power-info">
                  <div className="power-stat">
                    <span className="bolt">⚡</span>
                    <span className="power-val">600 W</span>
                  </div>
                  <span className="power-label">Active since 2 hour ago</span>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="volume-control">
                <span className="vol-icon">🔊</span>
                <div className="vol-slider">
                  <div className="vol-fill" style={{ height: '48%' }}></div>
                  <div className="vol-thumb" style={{ bottom: '48%' }}></div>
                </div>
                <span className="vol-percent">48%</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="custom-content">
          {homePageContent.startsWith('https://') ? (
            <iframe src={homePageContent} className="content-iframe" title="Home" />
          ) : (
            <div className="html-content" dangerouslySetInnerHTML={{ __html: homePageContent }} />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
