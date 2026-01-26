// emails/WelcomeEmail.tsx
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
    userName: string;
    userEmail: string;
    loginUrl: string;
}

export const WelcomeEmail = ({
                                 userName = 'Анна',
                                 userEmail = 'example@mail.com',
                                 loginUrl = 'https://booking-app-for-psy.vercel.app/login',
                             }: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Добро пожаловать! Ваш аккаунт успешно создан 🌿</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Логотип/Иконка */}
                    <Section style={logoSection}>
                        <Text style={logo}>🌿</Text>
                    </Section>

                    {/* Приветствие */}
                    <Heading style={h1}>Добро пожаловать, {userName}!</Heading>

                    <Text style={text}>
                        Ваш аккаунт успешно создан. Теперь вы можете записываться на консультации
                        в удобное для вас время.
                    </Text>

                    {/* Данные для входа */}
                    <Section style={infoBox}>
                        <Text style={infoTitle}>📧 Ваши данные для входа:</Text>
                        <Text style={infoText}>
                            <strong>Email:</strong> {userEmail}
                        </Text>
                        <Text style={infoText}>
                            Пароль вы указали при регистрации
                        </Text>
                    </Section>

                    {/* Кнопка входа */}
                    <Section style={buttonSection}>
                        <Button style={button} href={loginUrl}>
                            Войти в личный кабинет
                        </Button>
                    </Section>

                    {/* Что дальше */}
                    <Section style={featuresSection}>
                        <Heading style={h2}>Что вы можете сделать:</Heading>
                        <ul style={featureList}>
                            <li style={featureItem}>Записаться на консультацию онлайн</li>
                            <li style={featureItem}>Управлять своими записями</li>
                            <li style={featureItem}>Получать напоминания о консультациях</li>
                            <li style={featureItem}>Связаться с терапевтом напрямую</li>
                        </ul>
                    </Section>

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

export default WelcomeEmail;

// Обновленные стили
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

const h2 = {
    color: '#1e5c52',
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 16px',
    padding: 0,
};

const text = {
    color: '#444',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 40px 24px',
    padding: 0,
    textAlign: 'center' as const,
};

const infoBox = {
    backgroundColor: '#f8fdfc',
    borderRadius: '12px',
    padding: '20px',
    margin: '0 40px 32px',
    border: '1px solid #d8efe9',
};

const infoTitle = {
    fontSize: '15px',
    fontWeight: '600' as const,
    color: '#1e5c52',
    margin: '0 0 12px',
    padding: 0,
};

const infoText = {
    fontSize: '15px',
    color: '#555',
    margin: '8px 0',
    padding: 0,
    lineHeight: '1.5',
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

const featuresSection = {
    padding: '0 40px 32px',
    margin: 0,
};

const featureList = {
    margin: '0',
    padding: '0 0 0 20px',
};

const featureItem = {
    fontSize: '15px',
    color: '#555',
    margin: '0 0 10px',
    padding: '0',
    lineHeight: '1.5',
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