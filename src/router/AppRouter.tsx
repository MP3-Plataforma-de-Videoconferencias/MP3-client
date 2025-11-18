import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@pages/HomePage'
import { AboutPage } from '@pages/AboutPage'
import { LoginPage } from '@pages/LoginPage'
import { RegisterPage } from '@pages/RegisterPage'
import { ForgotPasswordPage } from '@pages/ForgotPasswordPage'
import { SiteMapPage } from '@pages/SiteMapPage'
import { ProfilePage } from '@pages/ProfilePage'
import { ResetPasswordPage } from '@pages/ResetPasswordPage'
import { CreateMeetingPage } from '@pages/CreateMeetingPage'
import { MeetingRoomPage } from '@/pages/MeetingRoomPage'
import { MainLayout } from '@components/layout/MainLayout'

/**
 * Main application router
 * Defines all routes for the application
 * @returns {JSX.Element} Router component with all routes
 */
export function AppRouter(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="site-map" element={<SiteMapPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="meetings/create" element={<CreateMeetingPage />} />
        <Route path="meetings/" element={<MeetingRoomPage />} />
      </Route>
    </Routes>
  )
}

