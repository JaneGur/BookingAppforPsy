// emails/ResetPasswordEmail.tsx
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Link,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
    userName: string;
    resetUrl: string;
}

const ResetPasswordEmail = ({
                                       userName = 'Анна',
                                       resetUrl = 'https://booking-app-for-psy.vercel.app/reset-password',
                                   }: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Восстановление пароля для вашего аккаунта 🌿</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Логотип/Иконка */}
                    <Section style={logoSection}>
                        <Text style={logo}>🌿</Text>
                    </Section>

                    {/* Приветствие */}
                    <Heading style={h1}>Здравствуйте, {userName}!</Heading>

                    <Text style={text}>
                        Вы запросили восстановление пароля для вашего аккаунта.
                    </Text>

                    {/* Кнопка восстановления */}
                    <Section style={buttonSection}>
                        <Button style={button} href={resetUrl}>
                            Восстановить пароль
                        </Button>
                    </Section>

                    {/* Альтернативная ссылка */}
                    <Text style={textSmall}>
                        Если кнопка не работает, скопируйте ссылку в браузер:
                        <br />
                        <Link href={resetUrl} style={link}>
                            {resetUrl}
                        </Link>
                    </Text>

                    <Text style={textSmall}>
                        Ссылка действительна 1 час. Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
                    </Text>

                    {/* Контакты */}
                    <Section style={contactSection}>
                        <Text style={contactTitle}>Нужна помощь?</Text>
                        <Text style={contactText}>
                            Напишите нам: <Link href="mailto:spokludi@yandex.ru" style={link}>spokludi@yandex.ru</Link>
                        </Text>
                        <Text style={contactText}>
                            Telegram: <Link href="https://t.me/arts_psi" style={link}>@arts_psi</Link>
                        </Text>
                    </Section>

                    {/* Футер */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            С уважением,<br />
                            Анна
                        </Text>
                        <Text style={footerTextSmall}>
                            Это автоматическое письмо. Пожалуйста, не отвечайте на него.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default ResetPasswordEmail;

// === Стили (те же, что и для WelcomeEmail, можно переиспользовать) ===

const main = {
    backgroundColor: '#f9fbfa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
    margin: 0,
    padding: '20px 0',
    width: '100%',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '0 0 40px',
    maxWidth: '600px',
    width: '100%',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
};

const logoSection = {
    backgroundColor: '#f0f9f7',
    padding: '32px 0 24px',
    textAlign: 'center' as const,
};

const logo = {
    fontSize: '48px',
    margin: 0,
    lineHeight: '1',
};

const h1 = {
    color: '#1e5c52',
    fontSize: '26px',
    fontWeight: 'bold',
    margin: '32px 40px 16px',
    padding: 0,
    textAlign: 'center' as const,
    lineHeight: '1.4',
};

const text = {
    color: '#444',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 40px 24px',
    padding: 0,
    textAlign: 'center' as const,
};

const textSmall = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 40px 16px',
    padding: 0,
    textAlign: 'center' as const,
};

const buttonSection = {
    padding: '0 40px 32px',
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#4fa893',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    width: 'auto',
    padding: '16px 32px',
    margin: '0 auto',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
};

const contactSection = {
    backgroundColor: '#f8fcfb',
    borderRadius: '12px',
    padding: '24px',
    margin: '0 40px 32px',
    border: '1px solid #e8f5f2',
};

const contactTitle = {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#1e5c52',
    margin: '0 0 16px',
    padding: 0,
    textAlign: 'center' as const,
};

const contactText = {
    fontSize: '15px',
    color: '#555',
    margin: '10px 0',
    padding: 0,
    textAlign: 'center' as const,
    lineHeight: '1.5',
};

const link = {
    color: '#4fa893',
    textDecoration: 'none',
    fontWeight: '500' as const,
};

const footer = {
    padding: '0 40px',
    margin: '0',
    textAlign: 'center' as const,
    borderTop: '1px solid #eee',
    paddingTop: '24px',
};

const footerText = {
    fontSize: '15px',
    color: '#666',
    lineHeight: '1.6',
    margin: '0 0 12px',
    padding: 0,
};

const footerTextSmall = {
    fontSize: '13px',
    color: '#999',
    margin: '0',
    padding: 0,
    lineHeight: '1.5',
};

