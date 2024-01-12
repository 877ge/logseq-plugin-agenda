import { CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Input, Tooltip, message } from 'antd'
import copy from 'copy-to-clipboard'
import { useTranslation } from 'react-i18next'

import useSettings from '@/Agenda3/hooks/useSettings'
import type { Filter } from '@/Agenda3/models/settings'

const ShareAgendaForm = () => {
  const { t } = useTranslation()
  const { settings, setSettings } = useSettings()
  const icsUrl = `https://agenda-ics.haydenhayden.com?repo=${settings.ics?.repo}&token=${settings.ics?.token}`

  const onChange = (key: string, value: string | boolean | undefined | Filter[] | string[]) => {
    setSettings(key, value)
  }
  const onClickCopyIcsUrl = () => {
    copy(icsUrl)
    message.success('🎉 Copied!')
  }

  return (
    <>
      <div className="flex h-14 items-center border-b pl-4 text-lg font-semibold">{t('ICS File Setting')}</div>
      <div className="mt-4 px-4 pb-8">
        <div className="mt-4">
          <div className="text-gray-500">{t('Github Repo')}</div>
          <Input
            className="w-[300px]"
            placeholder="username/repo"
            value={settings.ics?.repo}
            onChange={(e) => onChange('ics.repo', e.target.value?.trim())}
          />
        </div>
        <div className="mt-4">
          <div className="text-gray-500">Github Access Token</div>
          <Input.Password
            className="w-[300px]"
            placeholder="github access token"
            value={settings.ics?.token}
            onChange={(e) => onChange('ics.token', e.target.value?.trim())}
          />
        </div>
        {settings.ics?.repo && settings.ics?.token ? (
          <div className="mt-4">
            <div className="text-gray-500">
              Public URL To Your Agenda{' '}
              <Tooltip title="Use this url to access your agenda from other applications">
                <QuestionCircleOutlined />{' '}
              </Tooltip>
            </div>
            <Input.Password
              value={icsUrl}
              className="w-[300px]"
              addonAfter={<CopyOutlined onClick={onClickCopyIcsUrl} />}
            />
          </div>
        ) : null}
      </div>
    </>
  )
}

export default ShareAgendaForm
