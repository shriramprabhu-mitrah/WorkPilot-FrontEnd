import { X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { MessageEditor } from '../richtext-editor';

interface ContactSalesModalProps {
  children: ReactNode;
}

const ContactSalesModal = ({ children }: ContactSalesModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div className="fixed inset-0 top-45 z-50 flex items-center justify-end">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-5 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                    Contact Sales
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
                    Send us a message and our team will get back to you.
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <X size={18} className="text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5 px-6 py-6">
              {/* From */}
              <div>
                <label className="mb-2 block text-start text-sm font-medium text-gray-700 dark:text-slate-100">
                  From
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                />
              </div>

              {/* To */}
              <div>
                <label className="mb-2 block text-start text-sm font-medium text-gray-700 dark:text-slate-100">
                  To
                </label>

                <input
                  type="email"
                  value="support@workpilot.com"
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-start text-sm font-medium text-gray-700 dark:text-slate-100">
                  Message
                </label>

                <MessageEditor />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactSalesModal;
