import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

async function getQuizzes() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "map.json");
    const fileContents = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading map.json:", error);
    return [];
  }
}

export default async function Home() {
  const quizzes = await getQuizzes();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-xl p-12 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Psikologji Kuiz
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Zgjidhni një kuiz dhe testoni njohuritë tuaja!
        </p>

        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.slug}
              href={`/${quiz.slug}`}
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-300 text-left"
            >
              <div className="text-lg font-bold">{quiz.title}</div>
              {quiz.subtitle && (
                <div className="text-sm font-normal text-blue-100 mt-1">
                  {quiz.subtitle}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* <div className="text-sm text-gray-500 mt-8">
          <p>💡 Dy mënyra loje: Interactive dhe Show</p>
          <p>📱 Interactive: Klikoni përgjigjet dhe kaloni kur dëshironi</p>
          <p>📺 Show: Pyetjet ndryshojnë automatikisht me kohëmatës</p>
        </div> */}
      </div>
    </div>
  );
}
