'use client';
import { useState } from 'react';
import {
  deliveryChannels,
  notificationEvents,
  emailFrequencyOptions,
} from '../data/notificationData';
import { WpButton } from '@/src/app/components/common/button';
type DeliveryChannel = 'email' | 'inApp' | 'browser';
type DeliveryState = Record<DeliveryChannel, boolean>;
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
  return (
    <WpButton
      type="button"
      onClick={onChange}
      aria-label={checked ? 'Turn off' : 'Turn on'}
      className={`relative h-5 w-9 shrink-0 rounded-full p-0 transition-colors duration-200 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all duration-200 ${
          checked ? 'left-[18px]' : 'left-[2px]'
        }`}
      />
    </WpButton>
  );
};
export const NotificationSettings = () => {
  const [deliveryState, setDeliveryState] = useState<DeliveryState>({
    email: true,
    inApp: true,
    browser: false,
  });
  const [eventState, setEventState] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationEvents.map((event) => [event.id, event.enabled]))
  );
  const [emailFrequency, setEmailFrequency] = useState('instant');
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const handleDeliveryToggle = (channel: DeliveryChannel) => {
    setDeliveryState((previous) => ({
      ...previous,
      [channel]: !previous[channel],
    }));
  };
  const handleEventToggle = (eventId: string) => {
    setEventState((previous) => ({
      ...previous,
      [eventId]: !previous[eventId],
    }));
  };
  const handleSave = () => {};
  return (
    <div className="w-2xl max-w-[850px] space-y-5 pb-10">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-900">Delivery channels</h2>

          <p className="mt-1 text-xs font-normal text-gray-400">
            Choose how you want to receive notifications.
          </p>
        </div>
        <div>
          {deliveryChannels.map((channel, index) => (
            <div
              key={channel.id}
              className={`flex items-center justify-between py-4 ${
                index !== deliveryChannels.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">{channel.title}</p>

                <p className="mt-0.5 text-xs text-gray-400">{channel.description}</p>
              </div>

              <Toggle
                checked={deliveryState[channel.id as DeliveryChannel]}
                onChange={() => handleDeliveryToggle(channel.id as DeliveryChannel)}
              />
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Notify me about</h2>
          <p className="mt-1 text-xs text-gray-400">Toggle individual events on or off.</p>
        </div>
        <div>
          {notificationEvents.map((event, index) => {
            const Icon = event.icon;

            return (
              <div
                key={event.id}
                className={`flex items-center justify-between py-3.5 ${
                  index !== notificationEvents.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <Icon size={14} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">{event.description}</p>
                  </div>
                </div>
                <Toggle
                  checked={eventState[event.id]}
                  onChange={() => handleEventToggle(event.id)}
                />
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Email frequency</h2>

          <p className="mt-1 text-xs text-gray-400">
            How often should we batch and send email notifications?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {emailFrequencyOptions.map((option) => {
            const active = emailFrequency === option.id;
            return (
              <WpButton
                key={option.id}
                type="button"
                variant="secondary"
                onClick={() => setEmailFrequency(option.id)}
                className={`w-full rounded-xl border p-4 text-left ${
                  active ? 'border-2 border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      active ? 'text-blue-600' : 'text-gray-800'
                    }`}
                  >
                    {option.title}
                  </p>
                  <p className="mt-1 text-xs font-normal text-gray-400">{option.description}</p>
                </div>
              </WpButton>
            );
          })}
        </div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Do Not Disturb</h2>
            <p className="mt-1 text-xs text-gray-400">
              Pause all notifications during quiet hours.
            </p>
          </div>
          <Toggle
            checked={doNotDisturb}
            onChange={() => setDoNotDisturb((previous) => !previous)}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <WpButton
          type="button"
          variant="primary"
          size="md"
          onClick={handleSave}
          className="px-6 py-2.5 text-sm shadow-sm"
        >
          Save preferences
        </WpButton>
      </div>
    </div>
  );
};
