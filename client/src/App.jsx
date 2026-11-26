import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />

        {/* Auth routes — will be added in Phase 2 */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}

        {/* Protected app routes — will be added in Phase 2 */}
        {/* <Route path="/app" element={<AppLayout />}> */}
        {/*   <Route path="dashboard" element={<Dashboard />} /> */}
        {/*   <Route path="routine" element={<Routine />} /> */}
        {/*   <Route path="tasks" element={<Tasks />} /> */}
        {/*   <Route path="habits" element={<Habits />} /> */}
        {/*   <Route path="assistant" element={<AIAssistant />} /> */}
        {/*   <Route path="learning" element={<Learning />} /> */}
        {/*   <Route path="documents" element={<Documents />} /> */}
        {/*   <Route path="expenses" element={<Expenses />} /> */}
        {/*   <Route path="analytics" element={<Analytics />} /> */}
        {/*   <Route path="settings" element={<Settings />} /> */}
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
