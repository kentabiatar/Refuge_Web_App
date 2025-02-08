import Layout from './components/layout/Layout.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx'
import SignUpPage from './pages/auth/SignUpPage.jsx'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from './lib/axios.js';
function App() {

  const {data: authUser, isLoading} = useQuery({
    queryKey: ['authUser'],
    queryFn: async() => {
      try {
        const res = await axiosClient.get('/auth/me')
        return res.data
      } catch (error) {
        if(error.response && error.response.status === 401){
          return null
        }
        toast.error(error.response.data.msg || "something went wrong")
      }
    }
  })

  if(isLoading){
    return null
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to={"/login"} />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}  />
      </Routes>
      <Toaster />
    </Layout>
  );
}

export default App
