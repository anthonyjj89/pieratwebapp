export default function SettingsPage() {
    return (
        <div className="space-y-8">
            {/* Organization Settings */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Organization Settings</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                        <h3 className="font-semibold mb-4">Organization Details</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Organization Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter organization name"
                                    className="w-full px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    placeholder="Enter organization description"
                                    className="w-full h-24 px-3 py-2 bg-black/20 backdrop-blur-sm border rounded resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>

                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                        <h3 className="font-semibold mb-4">Profit Sharing</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Default Share Percentage</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="Enter percentage"
                                        className="w-32 px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                                    />
                                    <span>%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Distribution Method</label>
                                <select className="w-full px-3 py-2 bg-black/20 backdrop-blur-sm border rounded">
                                    <option value="equal">Equal Split</option>
                                    <option value="role">Role Based</option>
                                    <option value="contribution">By Contribution</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>

                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                        <h3 className="font-semibold mb-4">Roles & Permissions</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-2 bg-black/10 rounded">
                                <div>
                                    <p className="font-medium">Admin</p>
                                    <p className="text-sm opacity-75">Full access to all features</p>
                                </div>
                                <button className="text-blue-400 hover:text-blue-300">Edit</button>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-black/10 rounded">
                                <div>
                                    <p className="font-medium">Member</p>
                                    <p className="text-sm opacity-75">Basic access to reports and analytics</p>
                                </div>
                                <button className="text-blue-400 hover:text-blue-300">Edit</button>
                            </div>
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                                Add New Role
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                        <h3 className="font-semibold text-red-500 mb-4">Danger Zone</h3>
                        <div className="space-y-4">
                            <button className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">
                                Delete Organization
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
