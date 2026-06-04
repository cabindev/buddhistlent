export default function DashboardOrganizationLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              <div className="w-20 h-6 bg-gray-200 rounded" />
              <div className="w-28 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
            <div className="h-52 bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
