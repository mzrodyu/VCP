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

import { Calendar, RefreshCw, Search, Sparkles } from 'lucide-react';

const DashboardHeader = ({
  getGreeting,
  greetingVisible,
  showSearchModal,
  refresh,
  loading,
  t,
}) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className='mb-8'>
      {/* 顶部欢迎区域 */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 mb-6'>
        {/* 装饰元素 */}
        <div className='absolute top-0 right-0 w-64 h-64 opacity-20'>
          <svg viewBox="0 0 200 200" className='w-full h-full'>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'white', stopOpacity:0.8}} />
                <stop offset="100%" style={{stopColor:'white', stopOpacity:0.2}} />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#grad1)" />
          </svg>
        </div>
        <div className='absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl' />
        <div className='absolute top-1/2 right-1/4 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl' />

        <div className='relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2 text-white/70 text-sm mb-2'>
              <Calendar className='w-4 h-4' />
              <span>{dateStr}</span>
            </div>
            <h1
              className='text-3xl md:text-4xl font-bold text-white flex items-center gap-3 transition-all duration-700'
              style={{ 
                opacity: greetingVisible ? 1 : 0,
                transform: greetingVisible ? 'translateY(0)' : 'translateY(10px)'
              }}
            >
              <Sparkles className='w-8 h-8 text-yellow-300' />
              {getGreeting}
            </h1>
            <p className='text-white/70 mt-2 text-lg'>
              {t('欢迎回来，这是您的数据概览')}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className='flex items-center gap-3'>
            <button
              onClick={showSearchModal}
              className='flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95'
            >
              <Search className='w-5 h-5' />
              <span className='hidden sm:inline'>{t('搜索数据')}</span>
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className='flex items-center gap-2 px-5 py-3 bg-white hover:bg-white/90 rounded-2xl text-indigo-600 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50'
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className='hidden sm:inline'>{t('刷新')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
