export default function SoberCheersLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 lg:p-6">
      <div className="max-w-8xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-3 animate-pulse">
          <div className="h-10 w-80 bg-amber-200 rounded-lg mx-auto" />
          <div className="h-4 w-96 bg-amber-100 rounded mx-auto" />
          <div className="h-1 w-24 bg-amber-300 rounded-full mx-auto" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                  <div className="h-8 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
                <div className="w-14 h-14 bg-gray-200 rounded-xl" />
              </div>
              <div className="mt-4 bg-gray-100 rounded-full h-1.5" />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse">
            <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
          <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse">
            <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
        </div>

        {/* Full width chart skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse">
            <div className="h-5 w-48 bg-gray-200 rounded mb-4" />
            <div className="h-48 bg-gray-100 rounded-xl" />
          </div>
        ))}

        {/* 2-column charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse">
              <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
              <div className="h-40 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
