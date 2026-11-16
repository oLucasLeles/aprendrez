import { BrowserRouter, Route, Routes } from 'react-router'
import DevBoardScreen from './screens/DevBoardScreen'
import ConclusionScreen from './screens/ConclusionScreen'
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
      <Route path="/abertura/:id/conclusao" element={<ConclusionScreen />} />
      {/* Página de testes do tabuleiro: só existe no servidor de desenvolvimento */}
      {import.meta.env.DEV && <Route path="/dev/tabuleiro" element={<DevBoardScreen />} />}
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
