export const dynamic = 'force-dynamic';

export default async function BrowsePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Browse Page Test</h1>
        <p className="text-gray-600">If you see this, the page loads correctly.</p>
        <p className="text-gray-400 mt-4">Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  );
}
