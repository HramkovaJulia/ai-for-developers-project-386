import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { EventTypesPage } from '@/pages/EventTypesPage';
import { EventTypeDetailPage } from '@/pages/EventTypeDetailPage';
import { BookingsPage } from '@/pages/BookingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<EventTypesPage />} />
          <Route path="/event-types/:eventTypeId" element={<EventTypeDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
