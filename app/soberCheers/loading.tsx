export default function SoberCheersPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div className="h-8 w-48 bg-amber-200 rounded" />
          <div className="h-9 w-32 bg-amber-300 rounded-lg" />
        </div>
        {/* Search bar */}
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
        {/* Table rows */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-12 bg-gray-100 border-b border-gray-200" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100">
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 flex-1 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
