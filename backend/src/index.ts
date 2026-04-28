import { createApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Calendar Booking Service running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log(`  GET  /event-types`);
  console.log(`  POST /event-types`);
  console.log(`  GET  /event-types/:id/slots`);
  console.log(`  GET  /bookings`);
  console.log(`  POST /bookings`);
});
