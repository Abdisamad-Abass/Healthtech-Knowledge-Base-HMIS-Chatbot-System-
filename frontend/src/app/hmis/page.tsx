import ChatWidget from '@/components/ChatWidget';

export default function HMIS() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-gray-800">HMIS Dashboard</h1>

          <p className="mt-3 text-gray-500">Healthcare Management Information System overview</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition hover:shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              👨‍⚕️
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-800">Patients</h2>

            <p className="mt-2 text-gray-500">Manage patient records and information</p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition hover:shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
              🧪
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-800">Laboratory</h2>

            <p className="mt-2 text-gray-500">View laboratory tests and results</p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition hover:shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
              💊
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-800">Pharmacy</h2>

            <p className="mt-2 text-gray-500">Manage medicines and prescriptions</p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800">HMIS Services</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-blue-50 p-5 text-gray-800">Registration</div>

            <div className="rounded-xl bg-green-50 p-5 text-gray-800">Records</div>

            <div className="rounded-xl bg-purple-50 p-5 text-gray-800">Reports</div>

            <div className="rounded-xl bg-orange-50 p-5 text-gray-800">Analytics</div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
