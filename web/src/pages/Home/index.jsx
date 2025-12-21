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
    IconCopy,
    IconFile,
    IconGithubLogo,
    IconPlay,
    IconPriceTag,
    IconServer,
    IconShield,
    IconThunder,
} from '@douyinfe/semi-icons';
import {
    Button,
    Card,
    Input,
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
      icon: <IconThunder style={{ fontSize: 24, color: 'var(--semi-color-primary)' }} />,
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
    <div className='w-full overflow-x-hidden bg-[var(--semi-color-bg-0)] min-h-screen'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full'>
          {/* Hero Section */}
          <div className='relative w-full min-h-[600px] flex flex-col justify-center items-center px-4 py-20 overflow-hidden'>
            {/* 动态背景装饰 */}
            <div className='blur-ball blur-ball-indigo opacity-30 animate-pulse' />
            <div className='blur-ball blur-ball-teal opacity-20 animate-pulse delay-1000' />
            
            <div className='z-10 text-center max-w-5xl mx-auto space-y-8'>
              <div className='space-y-4 animate-fade-in-up'>
                <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--semi-color-fill-0)] border border-[var(--semi-color-border)] mb-4 backdrop-blur-sm">
                  <Text type="secondary" strong className="text-sm">🚀 {t('新一代 AI 接口管理平台')}</Text>
                </div>
                <h1 className='text-5xl md:text-6xl lg:text-7xl font-extrabold text-[var(--semi-color-text-0)] leading-tight tracking-tight'>
                  {t('统一的')} <span className='shine-text'>{t('大模型接口网关')}</span>
                </h1>
                <p className='text-lg md:text-xl text-[var(--semi-color-text-1)] max-w-2xl mx-auto leading-relaxed'>
                  {t('一站式管理所有 AI 模型接口，提供更优的价格、更高的稳定性与企业级管理功能。')}
                </p>
              </div>

              {/* API URL Box */}
              <div className='w-full max-w-xl mx-auto animate-fade-in-up delay-200'>
                <div className='p-2 rounded-2xl bg-[var(--semi-color-bg-2)] border border-[var(--semi-color-border)] shadow-lg backdrop-blur-xl'>
                  <Input
                    readonly
                    value={serverAddress}
                    size='large'
                    className='!bg-transparent !border-none text-base'
                    suffix={
                      <div className='flex items-center gap-3'>
                        <div className='hidden sm:block h-6 w-[1px] bg-[var(--semi-color-border)]'></div>
                        <ScrollList
                          bodyHeight={24}
                          className="w-32 hidden sm:block"
                          style={{ border: 'unset', boxShadow: 'unset' }}
                        >
                          <ScrollItem
                            mode='wheel'
                            cycled={true}
                            list={endpointItems}
                            selectedIndex={endpointIndex}
                            onSelect={({ index }) => setEndpointIndex(index)}
                          />
                        </ScrollList>
                        <Button
                          theme='solid'
                          type='primary'
                          onClick={handleCopyBaseURL}
                          icon={<IconCopy />}
                          className='!rounded-xl !font-bold'
                        >
                          {t('复制')}
                        </Button>
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-wrap justify-center gap-4 mt-8 animate-fade-in-up delay-300'>
                <Link to='/console'>
                  <Button
                    theme='solid'
                    type='primary'
                    size='large'
                    className='!rounded-full !px-8 !py-6 !text-lg !font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all'
                    icon={<IconPlay />}
                  >
                    {t('立即开始')}
                  </Button>
                </Link>
                {docsLink && (
                  <Button
                    size='large'
                    type='tertiary'
                    className='!rounded-full !px-8 !py-6 !text-lg !font-bold !bg-[var(--semi-color-fill-0)] hover:!bg-[var(--semi-color-fill-1)] transition-all'
                    icon={<IconFile />}
                    onClick={() => window.open(docsLink, '_blank')}
                  >
                    {t('开发文档')}
                  </Button>
                )}
                {isDemoSiteMode && statusState?.status?.version && (
                   <Button
                   size='large'
                   type='tertiary'
                   className='!rounded-full !px-8 !py-6 !text-lg !font-bold !bg-[var(--semi-color-fill-0)] hover:!bg-[var(--semi-color-fill-1)] transition-all'
                   icon={<IconGithubLogo />}
                   onClick={() =>
                     window.open(
                       'https://github.com/QuantumNous/new-api',
                       '_blank',
                       )
                   }
                 >
                   GitHub
                 </Button>
                )}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className='w-full px-4 py-20 bg-[var(--semi-color-bg-1)] border-t border-[var(--semi-color-border)]'>
            <div className='max-w-6xl mx-auto'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className='!bg-[var(--semi-color-bg-2)] !border-[var(--semi-color-border)] hover:!translate-y-[-4px] transition-transform duration-300 shadow-sm hover:shadow-md'
                    bodyStyle={{ padding: '24px' }}
                  >
                    <div className='flex flex-col items-start gap-4'>
                      <div className='p-3 rounded-2xl bg-[var(--semi-color-fill-0)]'>
                        {feature.icon}
                      </div>
                      <div>
                        <Title heading={5} className='mb-2'>{feature.title}</Title>
                        <Text type="secondary" className='leading-relaxed'>{feature.desc}</Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Model Providers Section */}
          <div className='w-full px-4 py-24 overflow-hidden'>
            <div className='max-w-5xl mx-auto text-center space-y-12'>
              <div className='space-y-2'>
                <Title heading={2}>{t('支持众多主流大模型')}</Title>
                <Text type="secondary" className='text-lg'>{t('无缝接入，一键切换，享受极致体验')}</Text>
              </div>
              
              <div className='flex flex-wrap justify-center gap-6 md:gap-8 opacity-80 hover:opacity-100 transition-opacity duration-300'>
                <div className="provider-icon hover:scale-110 transition-transform"><Moonshot size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><OpenAI size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Claude.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Gemini.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Midjourney size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Suno size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Zhipu.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Qwen.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><DeepSeek.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Spark.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Wenxin.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Minimax.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Volcengine.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Cohere.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><XAI size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Grok size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><AzureAI.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Hunyuan.Color size={48} /></div>
                <div className="provider-icon hover:scale-110 transition-transform"><Xinference.Color size={48} /></div>
                <div className='flex items-center justify-center w-12 h-12 rounded-full bg-[var(--semi-color-fill-0)] text-[var(--semi-color-text-1)] font-bold text-sm border border-[var(--semi-color-border)]'>
                  30+
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="py-8 text-center border-t border-[var(--semi-color-border)]">
             <Text type="tertiary" size="small">Copyright © {new Date().getFullYear()} New API. All rights reserved.</Text>
          </div>
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
