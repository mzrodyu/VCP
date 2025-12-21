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

import {
    IconBolt,
    IconCopy,
    IconFile,
    IconGithubLogo,
    IconPlay,
    IconPriceTag,
    IconServer,
    IconShield
} from '@douyinfe/semi-icons';
import {
    ScrollItem,
    ScrollList,
    Typography
} from '@douyinfe/semi-ui';
import {
    AzureAI,
    Claude,
    Cohere,
    DeepSeek,
    Gemini,
    Grok,
    Hunyuan,
    Midjourney,
    Minimax,
    Moonshot,
    OpenAI,
    Qwen,
    Spark,
    Suno,
    Volcengine,
    Wenxin,
    XAI,
    Xinference,
    Zhipu
} from '@lobehub/icons';
import { marked } from 'marked';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { API, copy, showError, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';

const { Text, Title } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

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

      // 如果内容是 URL，则发送主题模式
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

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
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

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  const features = [
    {
      icon: <IconBolt style={{ fontSize: 24, color: 'var(--semi-color-primary)' }} />,
      title: t('极速响应'),
      desc: t('采用全球CDN加速与优化的路由算法，确保每一次API调用都能获得毫秒级的响应速度。')
    },
    {
      icon: <IconServer style={{ fontSize: 24, color: 'var(--semi-color-success)' }} />,
      title: t('稳定可靠'),
      desc: t('企业级高可用架构，自动负载均衡与故障转移机制，保障服务 99.9% 在线率。')
    },
    {
      icon: <IconPriceTag style={{ fontSize: 24, color: 'var(--semi-color-warning)' }} />,
      title: t('成本可控'),
      desc: t('透明的计费模式，实时监控额度使用情况，支持自定义限额，大幅降低运营成本。')
    },
    {
      icon: <IconShield style={{ fontSize: 24, color: 'var(--semi-color-danger)' }} />,
      title: t('安全合规'),
      desc: t('内置敏感词过滤与安全审计功能，支持令牌级权限控制，全方位守护您的数据安全。')
    }
  ];

  return (
    <div className='w-full overflow-x-hidden min-h-screen home-page'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full'>
          {/* Hero Section - 全新设计 */}
          <div className='hero-section relative w-full min-h-screen flex flex-col justify-center items-center px-4 py-20 overflow-hidden'>
            {/* 动态网格背景 */}
            <div className='hero-grid-bg' />
            
            {/* 渐变光晕 */}
            <div className='hero-glow hero-glow-1' />
            <div className='hero-glow hero-glow-2' />
            <div className='hero-glow hero-glow-3' />
            
            {/* 浮动粒子 */}
            <div className='floating-particles'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`particle particle-${i + 1}`} />
              ))}
            </div>
            
            <div className='z-10 text-center max-w-5xl mx-auto'>
              {/* 徽章 */}
              <div className='animate-fade-in-up mb-8'>
                <div className='hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full'>
                  <span className='badge-dot' />
                  <span className='text-sm font-medium'>{t('新一代 AI 接口管理平台')}</span>
                </div>
              </div>
              
              {/* 主标题 */}
              <h1 className='hero-title animate-fade-in-up mb-6'>
                <span className='hero-title-line'>{t('统一的')}</span>
                <span className='hero-title-gradient'>{t('大模型接口网关')}</span>
              </h1>
              
              {/* 副标题 */}
              <p className='hero-subtitle animate-fade-in-up delay-200 mb-12'>
                {t('一站式管理所有 AI 模型接口，提供更优的价格、更高的稳定性与企业级管理功能。')}
              </p>

              {/* API URL Box - 玻璃拟态 */}
              <div className='w-full max-w-2xl mx-auto animate-fade-in-up delay-300 mb-10'>
                <div className='api-url-box'>
                  <div className='api-url-inner'>
                    <code className='api-url-text'>{serverAddress}</code>
                    <div className='api-url-actions'>
                      <ScrollList
                        bodyHeight={28}
                        className="w-36 hidden sm:block"
                        style={{ border: 'unset', boxShadow: 'unset', background: 'transparent' }}
                      >
                        <ScrollItem
                          mode='wheel'
                          cycled={true}
                          list={endpointItems}
                          selectedIndex={endpointIndex}
                          onSelect={({ index }) => setEndpointIndex(index)}
                        />
                      </ScrollList>
                      <button className='copy-btn' onClick={handleCopyBaseURL}>
                        <IconCopy style={{ fontSize: 16 }} />
                        <span>{t('复制')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA 按钮 */}
              <div className='flex flex-wrap justify-center gap-4 animate-fade-in-up delay-300'>
                <Link to='/console'>
                  <button className='cta-btn cta-btn-primary'>
                    <IconPlay style={{ fontSize: 20 }} />
                    <span>{t('立即开始')}</span>
                    <div className='cta-btn-shine' />
                  </button>
                </Link>
                {docsLink && (
                  <button className='cta-btn cta-btn-secondary' onClick={() => window.open(docsLink, '_blank')}>
                    <IconFile style={{ fontSize: 20 }} />
                    <span>{t('开发文档')}</span>
                  </button>
                )}
                {isDemoSiteMode && statusState?.status?.version && (
                  <button className='cta-btn cta-btn-secondary' onClick={() => window.open('https://github.com/QuantumNous/new-api', '_blank')}>
                    <IconGithubLogo style={{ fontSize: 20 }} />
                    <span>GitHub</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* 向下滚动提示 */}
            <div className='scroll-indicator'>
              <div className='scroll-mouse'>
                <div className='scroll-wheel' />
              </div>
            </div>
          </div>

          {/* Features Section - 卡片重设计 */}
          <div className='features-section w-full px-4 py-24'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-16'>
                <h2 className='section-title'>{t('为什么选择我们')}</h2>
                <p className='section-subtitle'>{t('强大的功能，简洁的体验')}</p>
              </div>
              
              <div className='features-grid'>
                {features.map((feature, index) => (
                  <div key={index} className='feature-card' style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className='feature-card-glow' />
                    <div className='feature-icon-wrapper'>
                      {feature.icon}
                    </div>
                    <h3 className='feature-title'>{feature.title}</h3>
                    <p className='feature-desc'>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Providers Section - 无限滚动 */}
          <div className='providers-section w-full py-24 overflow-hidden'>
            <div className='max-w-6xl mx-auto px-4'>
              <div className='text-center mb-16'>
                <h2 className='section-title'>{t('支持众多主流大模型')}</h2>
                <p className='section-subtitle'>{t('无缝接入，一键切换，享受极致体验')}</p>
              </div>
              
              <div className='providers-marquee'>
                <div className='providers-track'>
                  {[Moonshot, OpenAI, Claude, Gemini, Midjourney, Suno, Zhipu, Qwen, DeepSeek, Spark].map((Provider, i) => (
                    <div key={i} className='provider-card'>
                      {Provider.Color ? <Provider.Color size={40} /> : <Provider size={40} />}
                    </div>
                  ))}
                  {[Wenxin, Minimax, Volcengine, Cohere, XAI, Grok, AzureAI, Hunyuan, Xinference].map((Provider, i) => (
                    <div key={i + 10} className='provider-card'>
                      {Provider.Color ? <Provider.Color size={40} /> : <Provider size={40} />}
                    </div>
                  ))}
                  <div className='provider-card provider-card-more'>
                    <span>30+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className='home-footer'>
            <div className='footer-content'>
              <Text type="tertiary" size="small">© {new Date().getFullYear()} New API. All rights reserved.</Text>
            </div>
          </footer>
        </div>
      ) : (
        <div className='w-full min-h-screen bg-[var(--semi-color-bg-0)]'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
              title="Home Content"
            />
          ) : (
            <div
              className='max-w-4xl mx-auto px-4 py-10 prose dark:prose-invert'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
