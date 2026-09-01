'use client';

import { CircleAlert } from 'lucide-react';
import { loginActivity } from '../data/notificationData';

export const SecuritySetting = () => {
  return (
    <div className="space-y-5">
      {/* future purpose
      <div className="w-2xl rounded-xl border border-gray-100 bg-white px-5 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-gray-900">Two-factor authentication</h3>
            <p className="mt-1 text-xs font-normal text-gray-400">
              Add an extra layer of security to your account.
            </p>
            <p className="text-xs font-normal text-gray-400">
              Once enabled, you will be asked for a 6-digit code when signing in.
            </p>
          </div>
          <WpButton
            type="button"
            onClick={handleTwoFactorToggle}
            className={`relative h-5 w-9 rounded-full p-0 ${
              twoFactorEnabled ? '!bg-blue-600' : '!bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                twoFactorEnabled ? 'left-4' : 'left-0.5'
              }`}
            />
          </WpButton>
        </div>

        {twoFactorEnabled && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <h4 className="text-sm font-medium text-gray-800">Set up two-factor authentication</h4>
            <div className="mt-5 flex justify-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-gray-900">
                <span className="text-xs text-white">QR CODE</span>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-400">Or enter this key manually</p>
              <p className="mt-2 text-sm font-semibold tracking-widest text-gray-800">
                JBSW Y3DP EHPK 3PXP
              </p>
            </div>
            <div className="mt-5 flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Verify 6-digit code
                </label>

                <WpInput id="verificationCode" type="text" placeholder="000000" maxLength={6} />
              </div>
              <WpButton type="button" variant="primary" size="md" className="h-10 px-5 text-sm">
                Verify & Enable
              </WpButton>
            </div>
          </div>
        )}
      </div> */}
      {/* <div className="w-2xl rounded-xl border border-gray-100 bg-white px-5 py-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock3 size={15} className="text-gray-500" />
            <h3 className="text-xs font-semibold text-gray-900">Active sessions</h3>
          </div>
          <WpButton
            type="button"
            onClick={() => setShowRevokeModal(true)}
            className="!bg-transparent !p-0 text-xs font-medium !text-red-500 hover:!bg-transparent hover:!text-red-500"
          >
            Revoke all other sessions
          </WpButton>
        </div>

        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    session.isCurrent ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <CircleUserRound
                    size={16}
                    className={session.isCurrent ? 'text-green-500' : 'text-gray-400'}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-800">{session.device}</p>

                    {session.isCurrent && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-500">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-gray-400">
                    {session.location} · {session.time}
                    {session.isCurrent && ' · current session'}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <WpButton
                  type="button"
                  onClick={() => handleRevoke(session.id)}
                  className="!bg-transparent !p-0 text-xs font-medium !text-red-500 hover:!bg-transparent hover:!text-red-500"
                >
                  Revoke
                </WpButton>
              )}
            </div>
          ))}
        </div>
      </div> */}
      {/* <div className="w-2xl rounded-xl border border-gray-100 bg-white px-5 py-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock3 size={15} className="text-gray-500" />
          <h3 className="text-xs font-semibold text-gray-900">Auto sign-out</h3>
        </div>
        <p className="mt-1 text-xs font-normal text-gray-400">
          Automatically sign out after a period of inactivity to protect your account.
        </p>
        <div className="mt-4">
          <label className="mb-2 block text-xs font-medium text-gray-700">Inactivity timeout</label>
          <select
            value={timeout}
            onChange={(event) => setTimeoutValue(event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-500"
          >
            {inactivityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div> */}
      <div className="w-2xl rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CircleAlert size={15} className="text-gray-500 dark:text-slate-400" />
          <h3 className="text-xs font-semibold text-gray-900 dark:text-slate-100">
            Recent login activity
          </h3>
        </div>

        <div>
          {loginActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 py-3 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 rounded-full ${
                    activity.success ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <div>
                  <p className="text-xs font-medium text-gray-800 dark:text-slate-200">
                    {activity.device}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                    {activity.location}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-gray-500 dark:text-slate-400">{activity.date}</p>
                <p
                  className={`mt-1 text-[10px] font-medium ${activity.success ? 'text-green-500' : 'text-red-500'}`}
                >
                  {activity.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* furuture purpose
       <div className="flex w-2xl justify-end">
        <WpButton type="button" variant="primary" size="md" className="px-5 py-2.5 text-xs">
          Save changes
        </WpButton>
      </div> */}
      {/* {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRevokeModal(false)}
          />

          <div className="relative z-10 w-full max-w-[330px] rounded-xl bg-white px-5 py-5 shadow-2xl">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-red-500">
                <span className="text-[11px] font-bold text-red-500">!</span>
              </div>
            </div>
            <h3 className="mt-4 text-center text-base font-semibold text-gray-900">
              Revoke all sessions?
            </h3>
            <p className="mt-2 text-center text-xs leading-5 text-gray-400">
              All other devices will be signed out immediately. Your current session will remain
              active.
            </p>
            <div className="mt-5 flex gap-2.5">
              <WpButton
                type="button"
                size="sm"
                onClick={() => setShowRevokeModal(false)}
                className="h-9 flex-1"
              >
                Cancel
              </WpButton>
              <WpButton
                type="button"
                variant="danger"
                size="sm"
                onClick={handleRevokeAll}
                className="h-9 flex-1"
              >
                Revoke all
              </WpButton>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};
