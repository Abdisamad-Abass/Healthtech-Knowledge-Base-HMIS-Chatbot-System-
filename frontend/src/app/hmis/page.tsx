import ChatWidget from '@/components/ChatWidget';

export default function HMIS() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="bg-card mb-8 rounded-3xl p-8 shadow-xl">
          <h1 className="text-foreground text-4xl font-bold">HMIS Dashboard</h1>

          <p className="text-card-FOREGROUND0 mt-3">
            Healthcare Management Information System overview
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-card border-border rounded-3xl border p-8 shadow-lg transition hover:shadow-2xl">
            <div className="bg-accent flex h-16 w-16 items-center justify-center rounded-2xl text-3xl">
              👨‍⚕️
            </div>

            <h2 className="text-foreground mt-5 text-2xl font-bold">Patients</h2>

            <p className="text-card-FOREGROUND0 mt-2">Manage patient records and information</p>
          </div>

          <div className="bg-card border-border rounded-3xl border p-8 shadow-lg transition hover:shadow-2xl">
            <div className="bg-success-BG flex h-16 w-16 items-center justify-center rounded-2xl text-3xl">
              🧪
            </div>

            <h2 className="text-foreground mt-5 text-2xl font-bold">Laboratory</h2>

            <p className="text-card-FOREGROUND0 mt-2">View laboratory tests and results</p>
          </div>

          <div className="bg-card border-border rounded-3xl border p-8 shadow-lg transition hover:shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
              💊
            </div>

            <h2 className="text-foreground mt-5 text-2xl font-bold">Pharmacy</h2>

            <p className="text-card-FOREGROUND0 mt-2">Manage medicines and prescriptions</p>
          </div>
        </div>

        <div className="bg-card mt-10 rounded-3xl p-8 shadow-lg">
          <h2 className="text-foreground text-2xl font-bold">HMIS Services</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="bg-primary-soft text-foreground rounded-xl p-5">Registration</div>

            <div className="bg-success-BG text-foreground rounded-xl p-5">Records</div>

            <div className="text-foreground rounded-xl bg-purple-50 p-5">Reports</div>

            <div className="text-foreground rounded-xl bg-orange-50 p-5">Analytics</div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
