export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      
      <div className="space-y-8">
        {/* Organization Settings */}
        <div className="bg-gray-900 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-white">Organization Settings</h2>
            <p className="mt-1 text-sm text-gray-400">
              Manage your organization&apos;s profile and preferences
            </p>
          </div>
          <div className="border-t border-gray-800 px-4 py-5 sm:px-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Organization Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter organization name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    rows={3}
                    className="block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter organization description"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discord Integration */}
        <div className="bg-gray-900 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-white">Discord Integration</h2>
            <p className="mt-1 text-sm text-gray-400">
              Configure Discord bot settings and notifications
            </p>
          </div>
          <div className="border-t border-gray-800 px-4 py-5 sm:px-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Bot Status</p>
                  <p className="text-sm text-gray-400">Connected to Discord server</p>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-green-900 text-green-300">
                  Active
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Notification Channel
                </label>
                <select className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option>#general</option>
                  <option>#notifications</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-gray-900 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-white">Preferences</h2>
            <p className="mt-1 text-sm text-gray-400">
              Customize your dashboard experience
            </p>
          </div>
          <div className="border-t border-gray-800 px-4 py-5 sm:px-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Email Notifications</p>
                  <p className="text-sm text-gray-400">Receive email updates for important events</p>
                </div>
                <button
                  type="button"
                  className="bg-gray-800 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  role="switch"
                  aria-checked="false"
                >
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-gray-500 shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Discord Notifications</p>
                  <p className="text-sm text-gray-400">Receive Discord DMs for important events</p>
                </div>
                <button
                  type="button"
                  className="bg-indigo-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  role="switch"
                  aria-checked="true"
                >
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
