export default function FormReturnLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-lg" />
            </div>
          ))}
          <div className="h-12 w-full bg-amber-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
