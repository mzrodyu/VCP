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

import { TabPane, Tabs } from '@douyinfe/semi-ui';
import { FileText, Image, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import MjLogsTable from '../../components/table/mj-logs';
import TaskLogsTable from '../../components/table/task-logs';
import UsageLogsTable from '../../components/table/usage-logs';

const Log = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('usage');

  // 检查功能是否启用
  const enableDrawing = localStorage.getItem('enable_drawing') === 'true';
  const enableTask = localStorage.getItem('enable_task') === 'true';

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const onChangeTab = (key) => {
    setActiveTab(key);
    navigate(`?tab=${key}`);
  };

  return (
    <div className='mt-[60px] px-2'>
      <Tabs
        type='card'
        activeKey={activeTab}
        onChange={onChangeTab}
      >
        <TabPane
          tab={
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FileText size={16} />
              {t('使用日志')}
            </span>
          }
          itemKey='usage'
        >
          {activeTab === 'usage' && <UsageLogsTable />}
        </TabPane>

        {enableDrawing && (
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Image size={16} />
                {t('绘图日志')}
              </span>
            }
            itemKey='drawing'
          >
            {activeTab === 'drawing' && <MjLogsTable />}
          </TabPane>
        )}

        {enableTask && (
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ListTodo size={16} />
                {t('任务日志')}
              </span>
            }
            itemKey='task'
          >
            {activeTab === 'task' && <TaskLogsTable />}
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default Log;
