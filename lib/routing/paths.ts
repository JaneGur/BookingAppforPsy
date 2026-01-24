export const Path = {
  // Public routes
  Main: '/',
  Booking: '/booking',
  
  // Auth routes
  Login: '/login',
  Register: '/register',
  ResetPassword: '/reset-password',
  
  // Client routes
  ClientDashboard: '/dashboard',
  ClientBookings: '/bookings',
  ClientProfile: '/profile',
  ClientNotifications: '/notifications',
  ClientPayment: (bookingId: string | number) => `/payment/${bookingId}`,
  ClientTherapist: '/therapist',
  
  // Admin routes
  AdminDashboard: '/admin/dashboard',
  AdminBookings: '/admin/bookings',
  AdminBookingDetail: (id: string | number) => `/admin/bookings/${id}`,
  AdminClients: '/admin/clients',
  AdminClientDetail: (id: string | number) => `/admin/clients/${id}`,
  AdminProducts: '/admin/products',
  AdminBlocking: '/admin/blocking',
  AdminAnalytics: '/admin/analytics',
  AdminSettings: '/admin/settings',
  AdminLogin: '/admin/login',
  
  // API routes
  Api: {
    Auth: {
      Register: '/api/auth/register',
      ChangePassword: '/api/auth/change-password',
    },
    Bookings: {
      List: '/api/bookings',
      Detail: (id: string | number) => `/api/bookings/${id}`,
      Pending: '/api/bookings/pending',
      Upcoming: '/api/bookings/upcoming',
      Cancel: (id: string | number) => `/api/bookings/${id}/cancel`,
    },
    Slots: {
      Available: '/api/slots/available',
    },
    Products: {
      List: '/api/products',
      Featured: '/api/products/featured',
    },
    Admin: {
      Products: '/api/admin/products',
      Clients: '/api/admin/clients',
      ClientDetail: (id: string | number) => `/api/admin/clients/${id}`,
      Bookings: '/api/admin/bookings',
      Settings: '/api/admin/settings',
    },
    Profile: '/api/profile',
    Telegram: {
      Webhook: '/api/telegram/webhook',
      SendNotification: '/api/telegram/send-notification',
    },
    Cron: {
      CheckReminders: '/api/cron/check-reminders',
    },
  },
} as const

// Helper type для проверки путей
export type AppPath = typeof Path
