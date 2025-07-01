'use client'
import Image from "next/image";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

const categories = [
  {
    id: 1,
    title: "Ôn tập đọc",
    subtitle: "Đọc từ tiếng việt và chuyển sang tiếng anh",
    link: '../practiceVE'
  },
  {
    id: 2,
    title: "Ôn tập nghe",
    subtitle: "Nghe và viết lại từ tiếng anh",
    link: '../practiceLE'
  },
  {
    id: 3,
    title: "Flash Card",
    subtitle: "Xem FlashCard đoán và ôn lại từ",
    link: '../flashcard'
  },
  {
    id: 4,
    title: "COMING SOON",
    subtitle: "Đang cập nhật....",
    disable: true
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="p-0 min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex flex-col items-center justify-start font-sans">
        {/* Header */}
        <div className="relative w-fit mx-auto mt-10 mb-6 px-12 py-5 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-3xl text-3xl font-extrabold text-center text-indigo-900 shadow-xl drop-shadow-lg tracking-wide border-2 border-yellow-200">
          Ôn Tập Từ Vựng
          <div className="absolute -right-5 bottom-0 w-10 h-10 bg-orange-400 rounded-br-3xl"></div>
        </div>

        {/* Start Here bubble */}
        <div className="w-fit mx-auto mb-8 bg-gradient-to-r from-pink-400 to-indigo-400 px-6 py-2 rounded-full font-bold text-lg shadow-lg text-white tracking-wider border border-pink-200 animate-bounce">
          LET'S START
        </div>

        {/* Category list */}
        <div className="flex flex-col gap-6 max-w-2xl w-full mx-auto">
          {categories.map((cat) => {
            const isDisabled = cat.disable || !cat.link;

            return (
              <a
                key={cat.id}
                href={isDisabled ? undefined : cat.link}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                }}
                className={`flex items-center p-6 rounded-3xl shadow-xl border-2 transition-all duration-300
                  ${isDisabled
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                    : 'bg-white border-yellow-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-yellow-100 cursor-pointer'}
                `}
              >
                <div className={`flex items-center justify-center w-16 h-16 rounded-full mr-6 shadow-lg ${isDisabled ? 'bg-gray-200' : 'bg-gradient-to-br from-yellow-300 to-pink-200'}`}>
                  <Image
                    src={'/icons/study.svg'}
                    alt={cat.title}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-indigo-800 mb-1">{cat.title}</h3>
                  <p className="text-base text-gray-700">
                    {cat.id}. {cat.subtitle}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}