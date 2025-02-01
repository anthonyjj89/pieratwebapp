'use client';

import { useState } from 'react';

export const metadata = {
  title: 'Settings - PieRat',
  description: 'Configure your organization settings',
};

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [discordNotifications, setDiscordNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
    console.log('Profile update:', { orgName, orgDescription });
  };

  const handleNotificationSave = () => {
    // TODO: Implement notification settings update
    console.log('Notification settings:', { discordNotifications, emailNotifications });
  };

  const handleDeleteOrg = () => {
    // TODO: Implement organization deletion
    if (confirm('Are you sure you want to delete your organization? This action cannot be undone.')) {
      console.log('Deleting organization...');
    }
  };

  return (
    <div className="p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your organization settings and preferences.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* Organization Profile */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Organization Profile</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Update your organization&apos;s basic information.</p>
            </div>
              <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <input
                  type="text"
                  name="org-name"
                  id="org-name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Your organization name"
                />
              </div>
              <div>
                <label htmlFor="org-description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="org-description"
                  name="org-description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  placeholder="Brief description of your organization"
                />
              </div>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Configure how you want to receive notifications.</p>
            </div>
            <div className="mt-5 space-y-4">
              <div className="relative flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="discord-notifications"
                    name="discord-notifications"
                    type="checkbox"
                    checked={discordNotifications}
                    onChange={(e) => setDiscordNotifications(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="discord-notifications" className="font-medium text-gray-700">
                    Discord Notifications
                  </label>
                  <p className="text-gray-500">Receive notifications in your Discord server.</p>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="email-notifications"
                    name="email-notifications"
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email-notifications" className="font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="text-gray-500">Receive email notifications for important updates.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNotificationSave}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Danger Zone</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Permanently delete your organization and all its data.</p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleDeleteOrg}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Organization
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
