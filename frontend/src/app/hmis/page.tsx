import ChatWidget from "@/components/ChatWidget";

export default function HMIS() {
  return (
    <div
      className="
      min-h-screen
      bg-gradient-to-br
      from-blue-50
      via-white
      to-blue-100
      p-8
      "
    >
      <div className="max-w-6xl mx-auto">
        <div
          className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
          mb-8
          "
        >
          <h1
            className="
            text-4xl
            font-bold
            text-gray-800
            "
          >
            HMIS Dashboard
          </h1>

          <p
            className="
            mt-3
            text-gray-500
            "
          >
            Healthcare Management Information System overview
          </p>
        </div>

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
          "
        >
          <div
            className="
            bg-white
            rounded-3xl
            shadow-lg
            p-8
            hover:shadow-2xl
            transition
            border
            border-gray-100
            "
          >
            <div
              className="
              w-16
              h-16
              rounded-2xl
              bg-blue-100
              flex
              items-center
              justify-center
              text-3xl
              "
            >
              👨‍⚕️
            </div>

            <h2
              className="
              mt-5
              text-2xl
              font-bold
              text-gray-800
              "
            >
              Patients
            </h2>

            <p
              className="
              mt-2
              text-gray-500
              "
            >
              Manage patient records and information
            </p>
          </div>

          <div
            className="
            bg-white
            rounded-3xl
            shadow-lg
            p-8
            hover:shadow-2xl
            transition
            border
            border-gray-100
            "
          >
            <div
              className="
              w-16
              h-16
              rounded-2xl
              bg-green-100
              flex
              items-center
              justify-center
              text-3xl
              "
            >
              🧪
            </div>

            <h2
              className="
              mt-5
              text-2xl
              font-bold
              text-gray-800
              "
            >
              Laboratory
            </h2>

            <p
              className="
              mt-2
              text-gray-500
              "
            >
              View laboratory tests and results
            </p>
          </div>

          <div
            className="
            bg-white
            rounded-3xl
            shadow-lg
            p-8
            hover:shadow-2xl
            transition
            border
            border-gray-100
            "
          >
            <div
              className="
              w-16
              h-16
              rounded-2xl
              bg-purple-100
              flex
              items-center
              justify-center
              text-3xl
              "
            >
              💊
            </div>

            <h2
              className="
              mt-5
              text-2xl
              font-bold
              text-gray-800
              "
            >
              Pharmacy
            </h2>

            <p
              className="
              mt-2
              text-gray-500
              "
            >
              Manage medicines and prescriptions
            </p>
          </div>
        </div>

        <div
          className="
          mt-10
          bg-white
          rounded-3xl
          shadow-lg
          p-8
          "
        >
          <h2
            className="
            text-2xl
            font-bold
            text-gray-800
            "
          >
            HMIS Services
          </h2>

          <div
            className="
            grid
            md:grid-cols-4
            gap-4
            mt-6
            "
          >
            <div className="bg-blue-50 rounded-xl p-5 text-gray-800">
              Registration
            </div>

            <div className="bg-green-50 rounded-xl p-5 text-gray-800">
              Records
            </div>

            <div className="bg-purple-50 rounded-xl p-5 text-gray-800">
              Reports
            </div>

            <div className="bg-orange-50 rounded-xl p-5 text-gray-800">
              Analytics
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
