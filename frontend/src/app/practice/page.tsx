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
      <main className="p-6 font-sans bg-white min-h-screen">
        {/* Header */}
        <div className="relative w-fit mx-auto mb-4 px-10 py-4 bg-yellow-400 rounded-2xl text-xl font-bold text-center shadow-md">
          Ôn Tập Từ Vựng
          <div className="absolute -right-4 bottom-0 w-8 h-8 bg-orange-400 rounded-br-2xl"></div>
        </div>

        {/* Start Here bubble */}
        <div className="w-fit mx-auto mb-6 bg-yellow-400 px-4 py-2 rounded-full font-bold text-sm shadow">
          LET'S START
        </div>

        {/* Category list */}
        <div className="flex flex-col gap-4 max-w-xl mx-auto">
          {categories.map((cat) => {
            const isDisabled = cat.disable || !cat.link;

            return (
              <a
                key={cat.id}
                href={isDisabled ? undefined : cat.link}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault(); // Ngăn click nếu bị disable
                }}
                className={`flex items-center p-4 rounded-2xl shadow-sm transition transform
                  ${isDisabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                    : 'hover:-translate-y-1 hover:shadow-md hover:bg-yellow-300 cursor-pointer'}
                `}
              >
                <Image
                  src={'/icons/study.svg'}
                  alt={cat.title}
                  width={60}
                  height={60}
                  className="rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{cat.title}</h3>
                  <p className="text-sm text-gray-700">
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