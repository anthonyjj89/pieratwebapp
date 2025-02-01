export default function CrewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Crew Management</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-gray-900 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Active Members
                  </dt>
                  <dd className="text-lg font-medium text-white">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Participation Rate
                  </dt>
                  <dd className="text-lg font-medium text-white">
                    0%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💎</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Average Share
                  </dt>
                  <dd className="text-lg font-medium text-white">
                    0 aUEC
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crew List */}
      <div className="bg-gray-900 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Crew Members</h2>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Add Member
          </button>
        </div>
        <div className="border-t border-gray-800">
          <div className="p-6 text-center text-gray-400">
            No crew members yet
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-gray-900 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-white">Recent Activity</h2>
        </div>
        <div className="border-t border-gray-800">
          <div className="p-6 text-center text-gray-400">
            No recent activity
          </div>
        </div>
      </div>
    </div>
  );
}
