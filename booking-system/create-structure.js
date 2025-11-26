const fs = require("fs");
const path = require("path");

const structure = [
    "app/(auth)/login",
    "app/(auth)/register",
    "app/(auth)/reset-password",

    "app/(public)",
    "app/(public)/booking/[id]",

    "app/(client)/dashboard",
    "app/(client)/bookings/[id]",
    "app/(client)/profile",
    "app/(client)/notifications",

    "app/(admin)/dashboard",
    "app/(admin)/bookings/[id]",
    "app/(admin)/clients/[id]",
    "app/(admin)/products",
    "app/(admin)/blocking",
    "app/(admin)/analytics",
    "app/(admin)/settings",

    "app/api/auth/[...nextauth]",
    "app/api/bookings/[id]",
    "app/api/slots/available",
    "app/api/telegram/webhook",
    "app/api/telegram/send-notification",
    "app/api/cron/check-reminders",

    "components/ui",
    "components/booking",
    "components/admin",
    "components/client",
    "components/shared",

    "lib/supabase",
    "lib/telegram",
    "lib/auth",
    "lib/validations",
    "lib/utils",

    "store/slices",
    "store/api",

    "types",

    "hooks",

    "constants",

    "public/images",
    "public/icons"
];

structure.forEach((dir) => {
    const fullPath = path.join(__dirname, dir);
    fs.mkdirSync(fullPath, { recursive: true });

    // создаём пустой page.tsx если это страница
    if (dir.includes("page") === false && /(login|register|dashboard|profile|settings|booking|bookings|analytics|products)$/.test(dir)) {
        fs.writeFileSync(path.join(fullPath, "page.tsx"), "export default function Page() { return <div>TODO</div> }");
    }

    // layout.tsx для групп маршрутов
    if (/\(.*\)$/.test(dir)) {
        fs.writeFileSync(path.join(fullPath, "layout.tsx"), "export default function Layout({ children }) { return <>{children}</> }");
    }
});

console.log("Готово! Структура создана.");
