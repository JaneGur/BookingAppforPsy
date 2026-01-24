import { ExternalLink, Mail } from 'lucide-react'
import Image from 'next/image'
import img from '../../../assets/anna.jpg'

// Макетные данные о терапевте
const therapist = {
    name: 'Анна',
    specialty: 'Арт-терапевт',
    imageUrl: img,
    contacts: {
        email: 'spokludi@yandex.ru',
        vk: 'https://vk.com/clubtsvetroom',
        telegram: 'https://t.me/arts_psi',
    },
    motto: 'Ваш путь к гармонии и осознанности начинается здесь.',
    goals: [
        'Помочь вам найти внутренние ресурсы для преодоления трудностей.',
        'Научить эффективным стратегиям управления стрессом и эмоциями.',
        'Создать безопасное пространство для самопознания и роста.',
    ],
    about: `Арт-терапевт`,
}

export default function TherapistProfilePage() {
    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-800">Ваш психолог</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Левая колонка с фото и контактами */}
                    <aside className="md:col-span-1">
                        <div className="info-panel p-6 text-center">
                            <div className="h-40 w-40 mx-auto mb-4 relative">
                                <Image
                                    src={img}
                                    alt={therapist.name}
                                    width={160}
                                    height={160}
                                    className="rounded-full object-cover border-4 border-white shadow-lg"
                                    priority
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">{therapist.name}</h2>
                            <p className="text-gray-500 mb-6">{therapist.specialty}</p>

                            <div className="space-y-3 text-left">
                                <a href={`mailto:${therapist.contacts.email}`}
                                   className="flex items-center gap-3 text-gray-600 hover:text-teal-600">
                                    <Mail size={18}/>
                                    <span>{therapist.contacts.email}</span>
                                </a>
                                <a href={therapist.contacts.vk} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center gap-3 text-gray-600 hover:text-teal-600">
                                    <ExternalLink size={18}/>
                                    <span>ВКонтакте</span>
                                </a>
                                <a href={therapist.contacts.telegram} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center gap-3 text-gray-600 hover:text-teal-600">
                                    <ExternalLink size={18}/>
                                    <span>Telegram</span>
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Правая колонка с информацией */}
                    <main className="md:col-span-2">
                        <div className="booking-card p-8">
                            <section className="mb-8">
                                <p className="text-xl italic text-gray-600 text-center">
                                    &ldquo;{therapist.motto}&rdquo;
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                                    Цели нашей работы
                                </h3>
                                <ul className="space-y-2 list-disc list-inside text-gray-600">
                                    {therapist.goals.map((goal, index) => (
                                        <li key={index}>{goal}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                                    Обо мне
                                </h3>
                                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                                    {therapist.about}
                                </p>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}