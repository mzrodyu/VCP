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

import { IconMinus, IconPlus } from '@douyinfe/semi-icons';
import {
    IllustrationConstruction,
    IllustrationConstructionDark,
} from '@douyinfe/semi-illustrations';
import { Card, Collapse, Empty } from '@douyinfe/semi-ui';
import { HelpCircle } from 'lucide-react';
import { marked } from 'marked';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const FaqPanel = ({
  faqData,
  CARD_PROPS,
  FLEX_CENTER_GAP2,
  ILLUSTRATION_SIZE,
  t,
}) => {
  return (
    <Card
      {...CARD_PROPS}
      className='!rounded-xl lg:col-span-1'
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
      title={
        <div className={FLEX_CENTER_GAP2} style={{ color: '#374151', fontWeight: 600 }}>
          <HelpCircle size={16} style={{ color: '#10b981' }} />
          {t('常见问答')}
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <ScrollableContainer maxHeight='24rem'>
        {faqData.length > 0 ? (
          <Collapse
            accordion
            expandIcon={<IconPlus />}
            collapseIcon={<IconMinus />}
          >
            {faqData.map((item, index) => (
              <Collapse.Panel
                key={index}
                header={item.question}
                itemKey={index.toString()}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(item.answer || ''),
                  }}
                />
              </Collapse.Panel>
            ))}
          </Collapse>
        ) : (
          <div className='flex justify-center items-center py-8'>
            <Empty
              image={<IllustrationConstruction style={ILLUSTRATION_SIZE} />}
              darkModeImage={
                <IllustrationConstructionDark style={ILLUSTRATION_SIZE} />
              }
              title={t('暂无常见问答')}
              description={t('请联系管理员在系统设置中配置常见问答')}
            />
          </div>
        )}
      </ScrollableContainer>
    </Card>
  );
};

export default FaqPanel;
