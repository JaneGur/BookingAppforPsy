import { Mail, Phone, ExternalLink } from 'lucide-react'

// Макетные данные о терапевте
const therapist = {
    name: 'Арт-терапевт',
    specialty: 'Арт-терапевт, супервизор и преподаватель',
    imageUrl: 'https://i.pravatar.cc/300?u=a042581f4e29026704d',
    contacts: {
        email: 'email@example.com',
        phone: '+7 (XXX) XXX-XX-XX',
        vk: 'https://vk.com/arttherapy',
        telegram: 'https://t.me/arttherapy',
    },
    motto: 'Справляемся с тревогой, выгоранием и кризисами. Твоя устойчивость – наша цель.',
    experience: '12 лет практики',
    tasks: [
        'Гарантировать конфиденциальность и отсутствие оценок',
        'Создать безопасное пространство',
        'Помочь разобраться в клубке чувств и мыслей',
        'Показать, что для эффективной работы не нужно уметь рисовать',
        'Вернуть клиенту ощущение контроля над своей жизнью',
        'Научить доступным способам самопомощи',
    ],
    goals: [
        'Помочь понять что происходит: Разобраться в хаосе чувств, дать имя тому, что с тобой происходит',
        'Дать опору: Вернуть ощущение, что ты стоишь на земле, а не падаешь в пропасть',
        'Научить справляться: Освоить конкретные техники, чтоб проживать сильные эмоции (гнев, страх, тоску, обиду…) не разрушаясь',
        'Восстановление сил: Преодоление апатии и выгорания, умение снова находить радость в мелочах',
        'Улучшение отношений: Научить выстраивать границы, доносить свои мысли и прекращать конфликты, которые вытягивают последние силы',
        'Помочь найти себя: Понять чего ты хочешь на самом деле, и перестать зависеть от чужого мнения',
    ],
    principles: [
        'Безопасность. Здесь нет места осуждению, критике и непрошенным советам',
        'Доступность. Тебе не нужно уметь рисовать или иметь другие специальные навыки',
        'Комфорт. Можно выбрать и офлайн и онлайн форматы консультаций',
        'Я - проводник, а не гуру. Не учу жизни, не переделываю, а помогаю самому найти и увидеть ответы',
        'Конфиденциальность. Твои тайны останутся между нами',
        'Предсказуемость. Без давления. Мы будем идти в комфортном для тебя темпе, ты тоже контролируешь процесс',
        'Фокус на решении, а не на проблеме',
        'Принятие. Ты можешь испытывать любые чувства, без страха быть обесцененным',
    ],
    about: `Работаю в подходах арт-терапии, КПТ и майндфулнес. 
            Каждая встреча закрывает конкретный запрос и оставляет понятный план действий.
            Помогаю прожить сложные состояния и сформировать новые привычки заботы о себе.`,
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
                            <img
                                src={therapist.imageUrl}
                                alt={therapist.name}
                                className="h-40 w-40 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                            />
                            <h2 className="text-2xl font-bold text-gray-800">{therapist.name}</h2>
                            <p className="text-gray-500 mb-2">{therapist.specialty}</p>
                            <p className="text-sm text-primary-600 font-medium mb-6">{therapist.experience}</p>

                            <div className="space-y-3 text-left">
                                <a href={`mailto:${therapist.contacts.email}`}
                                   className="flex items-center gap-3 text-gray-600 hover:text-teal-600">
                                    <Mail size={18}/>
                                    <span>{therapist.contacts.email}</span>
                                </a>
                                <a href={`tel:${therapist.contacts.phone.replace(/\s/g, '')}`}
                                   className="flex items-center gap-3 text-gray-600 hover:text-teal-600">
                                    <Phone size={18}/>
                                    <span>{therapist.contacts.phone}</span>
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
                                    Задачи моей работы
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    {therapist.tasks.map((task, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-primary-500 mt-1">•</span>
                                            <span>{task}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                                    Цели нашей работы
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    {therapist.goals.map((goal, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-primary-500 mt-1">•</span>
                                            <span>{goal}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                                    Принципы моей работы
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    {therapist.principles.map((principle, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-primary-500 mt-1">•</span>
                                            <span>{principle}</span>
                                        </li>
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