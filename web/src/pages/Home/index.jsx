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
  const systemName = statusState?.status?.system_name || 'NailongAPI';

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
    <>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)',
          padding: isMobile ? '20px 16px' : '40px 24px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h1 style={{
                fontSize: isMobile ? '32px' : '48px',
                fontWeight: 700,
                color: '#166534',
                marginBottom: '12px'
              }}>
                {systemName}
              </h1>
              <p style={{
                fontSize: isMobile ? '16px' : '20px',
                color: '#15803d',
                marginBottom: '32px'
              }}>
                {t('强大的 AI 模型聚合平台')}
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/console">
                  <Button theme="solid" type="primary" size="large" icon={<IconPlay />}>
                    {t('获取密钥')}
                  </Button>
                </Link>
                {docsLink && (
                  <Button size="large" icon={<IconFile />} onClick={() => window.open(docsLink, '_blank')}>
                    {t('文档')}
                  </Button>
                )}
              </div>
            </div>

            {/* Feature Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '48px'
            }}>
              <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Bot size={24} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>50+ AI {t('模型')}</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>GPT-4 / Claude / Gemini</div>
                  </div>
                </div>
              </Card>

              <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Palette size={24} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>{t('绘画模型')}</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Midjourney / DALL-E / SD</div>
                  </div>
                </div>
              </Card>

              <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Music size={24} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>{t('音频模型')}</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Suno / TTS / Whisper</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stats Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '48px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}>
                <Zap size={28} color="#22c55e" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>99.9%</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{t('可用性')}</div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}>
                <Clock size={28} color="#22c55e" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>&lt;100ms</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{t('响应延迟')}</div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}>
                <Shield size={28} color="#22c55e" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>7x24</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{t('技术支持')}</div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}>
                <Sparkles size={28} color="#22c55e" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{t('超低')}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{t('价格')}</div>
              </div>
            </div>

            {/* API URL Section */}
            <Card style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                    {t('开始使用 API')}
                  </div>
                  <div
                    onClick={handleCopyURL}
                    style={{
                      fontSize: '14px',
                      opacity: 0.9,
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      background: 'rgba(255,255,255,0.15)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}
                  >
                    {serverAddress}
                  </div>
                </div>
                <Link to="/console">
                  <Button
                    theme="solid"
                    style={{ background: 'white', color: '#166534' }}
                    icon={<IconPlay />}
                  >
                    {t('获取密钥')}
                  </Button>
                </Link>
              </div>
            </Card>
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
    </>
  );
};

export default Home;
