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
    IconPlay,
    IconServer,
    IconSetting
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

  // 右侧功能卡片
  const sideFeatures = [
    {
      icon: <IconBolt className="text-blue-500" style={{ fontSize: 20 }} />,
      title: t('实时响应'),
      desc: t('健康度与负载状态动态切换，保证最优表现。')
    },
    {
      icon: <IconActivity className="text-blue-500" style={{ fontSize: 20 }} />,
      title: t('统一监控'),
      desc: t('调用、费用、并发一站式AI观测，获取完整运行状态。')
    },
    {
      icon: <IconSetting className="text-blue-500" style={{ fontSize: 20 }} />,
      title: t('智能调度'),
      desc: t('多维策略控制核心业务优先级，避免突发异常情况。')
    }
  ];

  // 核心价值卡片
  const features = [
    {
      icon: <IconGlobe className="text-blue-500" style={{ fontSize: 24 }} />,
      title: t('统一入口，极速连通'),
      desc: t('以单一接口和地址快速接入全部大模型渠道资源，智能自动切换保障业务不中断。')
    },
    {
      icon: <IconActivity className="text-blue-500" style={{ fontSize: 24 }} />,
      title: t('全栈可观测与风控'),
      desc: t('实时监控使用量、模型成本与效用，一站配置限额、审计与安全策略。')
    },
    {
      icon: <IconServer className="text-blue-500" style={{ fontSize: 24 }} />,
      title: t('按需扩容与成本优化'),
      desc: t('多云混合部署，智能选择与批量自动处理，灵活适配成本与产出能力。')
    },
    {
      icon: <IconTerminal className="text-blue-500" style={{ fontSize: 24 }} />,
      title: t('开发者友好体验'),
      desc: t('兼容 OpenAI 接口协议，提供 SDK、示例与 Web Playground，轻松集成上线。')
    }
  ];

  // 工作流程步骤
  const steps = [
    {
      icon: <IconSetting className="text-blue-500" style={{ fontSize: 24 }} />,
      num: '01',
      title: t('接入配置'),
      desc: t('在控制台创建渠道，设置密钥与限额，导入模型列表。')
    },
    {
      icon: <IconBolt className="text-blue-500" style={{ fontSize: 24 }} />,
      num: '02',
      title: t('智能调度'),
      desc: t('根据业务请求，结合负载与价格自动选择最优大模型渠道，内置故障切换。')
    },
    {
      icon: <IconActivity className="text-blue-500" style={{ fontSize: 24 }} />,
      num: '03',
      title: t('持续洞察'),
      desc: t('通过仪表板监控用量趋势、消耗与失败率，实现预警确保 SLO。')
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
        <div className='w-full packy-home'>
          {/* Hero Section - PackyAPI 风格 */}
          <section className='packy-hero'>
            <div className='packy-hero-container'>
              {/* 左侧内容 */}
              <div className='packy-hero-left'>
                {/* 徽章 */}
                <div className='packy-badge'>
                  <span>{t('面向企业的 AI 生产力基座')}</span>
                </div>
                
                {/* 主标题 */}
                <h1 className='packy-hero-title'>
                  {t('统一的大模型接口网关')}
                  <br />
                  <span className='packy-hero-highlight'>{t('链')}</span>{t('接全球 AI 能力')}
                </h1>
                
                {/* 副标题 */}
                <p className='packy-hero-desc'>
                  {t('以一套接口、密钥与风控策略连接全球大模型资源，保险可观测、可拓展、可控。')}
                </p>

                {/* API URL Box */}
                <div className='packy-url-box'>
                  <div className='packy-url-label'>{t('将该基础 URL 引入接入')}</div>
                  <div className='packy-url-input'>
                    <code>{serverAddress}</code>
                    <div className='packy-url-actions'>
                      <ScrollList
                        bodyHeight={24}
                        className="packy-endpoint-scroll"
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
                      <button className='packy-copy-btn' onClick={handleCopyBaseURL}>
                        <IconCopy style={{ fontSize: 14 }} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* CTA 按钮 */}
                <div className='packy-cta-group'>
                  <Link to='/console'>
                    <button className='packy-btn packy-btn-primary'>
                      <IconPlay style={{ fontSize: 16 }} />
                      <span>{t('前往控制台')}</span>
                    </button>
                  </Link>
                  {docsLink && (
                    <button className='packy-btn packy-btn-outline' onClick={() => window.open(docsLink, '_blank')}>
                      <IconFile style={{ fontSize: 16 }} />
                      <span>{t('文档')}</span>
                    </button>
                  )}
                </div>

                {/* 统计数据 */}
                <div className='packy-stats'>
                  <div className='packy-stat-item'>
                    <span className='packy-stat-value'>30+</span>
                    <span className='packy-stat-label'>{t('可用渠道数')}</span>
                  </div>
                  <div className='packy-stat-item'>
                    <span className='packy-stat-value'>99.9%</span>
                    <span className='packy-stat-label'>{t('SLA 可用性')}</span>
                  </div>
                  <div className='packy-stat-item'>
                    <span className='packy-stat-value'>7</span>
                    <span className='packy-stat-label'>{t('多区域节点')}</span>
                  </div>
                </div>
              </div>

              {/* 右侧功能卡片 */}
              <div className='packy-hero-right'>
                {sideFeatures.map((item, index) => (
                  <div key={index} className='packy-side-card'>
                    <div className='packy-side-icon'>{item.icon}</div>
                    <div className='packy-side-content'>
                      <h4 className='packy-side-title'>{item.title}</h4>
                      <p className='packy-side-desc'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section - 核心价值 */}
          <section className='packy-features'>
            <div className='packy-section-container'>
              <div className='packy-section-header'>
                <span className='packy-section-tag'>{t('核心价值')}</span>
                <h2 className='packy-section-title'>{t('让团队稳定使用大模型，更快落地 AI 创新')}</h2>
                <p className='packy-section-desc'>{t('从可用性控制、成本可视化到全局调度，为企业级供应构建的 AI 基础设施能力。')}</p>
              </div>
              
              <div className='packy-features-grid'>
                {features.map((feature, index) => (
                  <div key={index} className='packy-feature-card'>
                    <div className='packy-feature-icon'>{feature.icon}</div>
                    <h3 className='packy-feature-title'>{feature.title}</h3>
                    <p className='packy-feature-desc'>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps Section - 工作流程 */}
          <section className='packy-steps'>
            <div className='packy-section-container'>
              <div className='packy-section-header'>
                <span className='packy-section-tag'>{t('工作流')}</span>
                <h2 className='packy-section-title'>{t('用 3 个步骤构建你的 AI 控制平面')}</h2>
              </div>
              
              <div className='packy-steps-grid'>
                {steps.map((step, index) => (
                  <div key={index} className='packy-step-card'>
                    <div className='packy-step-icon'>{step.icon}</div>
                    <span className='packy-step-num'>{step.num}</span>
                    <h3 className='packy-step-title'>{step.title}</h3>
                    <p className='packy-step-desc'>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Providers Section - 供应商 */}
          <section className='packy-providers'>
            <div className='packy-section-container'>
              <div className='packy-section-header'>
                <span className='packy-section-tag'>{t('生态伙伴')}</span>
                <h2 className='packy-section-title'>{t('与主流模型供应商深度对接')}</h2>
                <p className='packy-section-desc'>{t('保持统一协议，快速切换与扩展模型能力，随时接入最新生态。')}</p>
              </div>
              
              <div className='packy-providers-grid'>
                {[OpenAI, Claude, Gemini, Midjourney, Qwen, DeepSeek, Zhipu].map((Provider, i) => (
                  <div key={i} className='packy-provider-card'>
                    {Provider.Color ? <Provider.Color size={36} /> : <Provider size={36} />}
                  </div>
                ))}
                {[Moonshot, Spark, Wenxin, Minimax, Volcengine, Cohere, XAI].map((Provider, i) => (
                  <div key={i + 7} className='packy-provider-card'>
                    {Provider.Color ? <Provider.Color size={36} /> : <Provider size={36} />}
                  </div>
                ))}
                {[Grok, AzureAI, Hunyuan, Xinference, Suno].map((Provider, i) => (
                  <div key={i + 14} className='packy-provider-card'>
                    {Provider.Color ? <Provider.Color size={36} /> : <Provider size={36} />}
                  </div>
                ))}
                <div className='packy-provider-card packy-provider-more'>
                  <span>30+</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section - 底部号召 */}
          <section className='packy-cta-section'>
            <div className='packy-cta-container'>
              <h2 className='packy-cta-title'>{t('将大模型能力真正落地到业务流程')}</h2>
              <p className='packy-cta-desc'>{t('立即接入，统一控制访问凭据与调用成本，为产品带来增长，可扩展的智能体验。')}</p>
              <div className='packy-cta-buttons'>
                <Link to='/console'>
                  <button className='packy-btn packy-btn-primary'>
                    <IconPlay style={{ fontSize: 16 }} />
                    <span>{t('立即开始')}</span>
                  </button>
                </Link>
                {docsLink && (
                  <button className='packy-btn packy-btn-outline-dark' onClick={() => window.open(docsLink, '_blank')}>
                    <IconFile style={{ fontSize: 16 }} />
                    <span>{t('查看文档')}</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className='packy-footer'>
            <div className='packy-footer-links'>
              <a href='#'>{t('文档')}</a>
              <a href='#'>{t('关于')}</a>
              <a href='#'>{t('服务条款')}</a>
              <a href='#'>{t('使用政策')}</a>
              <a href='#'>{t('支持的国家和地区')}</a>
              <a href='#'>{t('服务稳定状态')}</a>
            </div>
            <div className='packy-footer-bottom'>
              <Text type="tertiary" size="small">© {new Date().getFullYear()} New API. {t('版权所有')}</Text>
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
