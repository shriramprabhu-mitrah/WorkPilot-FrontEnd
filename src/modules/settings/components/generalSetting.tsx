"use client";

export default function GeneralSettings() {
    return (
        <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
                Organization Details
            </h2>

            <div className="mt-6 space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Organization Name
                    </label>

                    <input
                        type="text"
                        defaultValue="Acme Corp"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Organization URL
                    </label>

                    <div className="flex overflow-hidden rounded-lg border border-gray-200">
                        <span className="flex items-center bg-gray-50 px-4 text-sm text-gray-400">
                            trackr.app/
                        </span>

                        <input
                            type="text"
                            // defaultValue="acme-corp"
                            className="flex-1 px-4 py-2.5 text-sm outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Industry
                    </label>

                    <select
                        defaultValue="Technology"
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Retail">Retail</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Organization Logo
                    </label>

                    <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-4 py-5 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500">
                        <input
                            type="file"
                            className="hidden"
                            accept=".png,.svg"
                        />

                        <span>↑ Upload logo — PNG, SVG up to 2 MB</span>
                    </label>
                </div>

                <div className="border-t border-gray-200 pt-5">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}