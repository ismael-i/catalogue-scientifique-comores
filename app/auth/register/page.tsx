import { Header } from '../../../components/layout/header'
import { Footer } from '../../../components/layout/footer'
import RegisterForm from '../../../components/auth/RegisterForm'

export const metadata = {
  title: 'Créer un compte - Catalogue Scientifique',
}

export default function RegisterPage() {
  return (
    <>
      <Header />

      <main className="min-h-[70vh] flex items-center justify-center py-16 bg-gray-50">
        <div className="w-full px-4">
          <RegisterForm />
        </div>
      </main>

      <Footer />
    </>
  )
}
