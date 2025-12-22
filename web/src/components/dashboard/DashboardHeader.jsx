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

import { Button } from '@douyinfe/semi-ui';
import { RefreshCw, Search } from 'lucide-react';

const DashboardHeader = ({
  getGreeting,
  greetingVisible,
  showSearchModal,
  refresh,
  loading,
  t,
}) => {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div>
        <h2
          className='text-2xl font-semibold transition-opacity duration-1000 ease-in-out'
          style={{ 
            opacity: greetingVisible ? 1 : 0,
            color: '#1f2937'
          }}
        >
          {getGreeting}
        </h2>
        <p className='text-gray-500 text-sm mt-1'>{t('数据看板')}</p>
      </div>
      <div className='flex gap-2'>
        <Button
          icon={<Search size={16} />}
          onClick={showSearchModal}
          theme='light'
          style={{ borderRadius: '8px' }}
        />
        <Button
          icon={<RefreshCw size={16} />}
          onClick={refresh}
          loading={loading}
          theme='solid'
          style={{ 
            background: '#10b981',
            borderRadius: '8px'
          }}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
