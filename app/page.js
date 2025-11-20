import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-xl p-12 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Kuiz Show</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Mirë se vini në shfaqjen interaktive të kuizit! Zgjidhni një kuiz për
          të filluar.
        </p>

        <div className="space-y-4">
          <Link
            href="/pfa1"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-300 text-lg"
          >
            Fillo Kuizin PFA1
          </Link>

          <div className="text-sm text-gray-500 mt-6">
            <p>Pyetjet ndryshojnë çdo 15 sekonda</p>
            <p>Përgjigjet e sakta shfaqen për 5 sekonda</p>
          </div>
        </div>
      </div>
    </div>
  );
}
