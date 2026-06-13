import { Header } from '../../../components/layout/header'
import { Footer } from '../../../components/layout/footer'
import LoginForm from '../../../components/auth/LoginForm'

export const metadata = {
  title: 'Connexion - Catalogue Scientifique',
}

export default function LoginPage() {
  return (
    <>
      <Header />

      <main className="min-h-[70vh] flex items-center justify-center py-16 bg-gray-50">
        <div className="w-full px-4">
          <LoginForm />
        </div>
      </main>

      <Footer />
    </>
  )
}
