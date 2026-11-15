import { BrowserRouter, Route, Routes } from 'react-router'
import HomeScreen from './screens/HomeScreen'
import LessonScreen from './screens/LessonScreen'
import NotFoundScreen from './screens/NotFoundScreen'

// A tabela de rotas: qual tela aparece para cada endereço.
// Fica separada do BrowserRouter para os testes poderem usar um roteador de mentira.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/abertura/:id" element={<LessonScreen />} />
      {/* "*" pega qualquer endereço que não bateu com as rotas acima */}
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  )
}

// O BrowserRouter liga as rotas ao endereço que aparece na barra do navegador.
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
